import { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { QuoteData, QuoteRow, ColWidths, ColAligns, AlignOption } from '../types';
import type { ThemeSchema } from '../templates/themes';
import { DEFAULT_THEME } from '../templates/themes';
import { DEFAULT_QUOTE_DATA, DEFAULT_COL_WIDTHS_INIT } from '../templates/defaultData';
import { DEFAULT_COL_ALIGNS } from '../types';
import { calcTotal, genId } from '../utils/numberUtils';

// ─── State ───────────────────────────────────────────────
interface AppState {
  quoteData: QuoteData;
  colWidths: ColWidths;
  colAligns: ColAligns;
  theme: ThemeSchema;
  autoTheme: ThemeSchema | null;
  past: QuoteData[];
  future: QuoteData[];
}

const INITIAL_STATE: AppState = {
  quoteData:  DEFAULT_QUOTE_DATA,
  colWidths:  DEFAULT_COL_WIDTHS_INIT,
  colAligns:   DEFAULT_COL_ALIGNS,
  theme:      DEFAULT_THEME,
  autoTheme:  null,
  past:       [],
  future:     [],
};

// ─── Actions ─────────────────────────────────────────────
type Action =
  | { type: 'SET_TITLE';          payload: string }
  | { type: 'SET_COMPANY';        payload: string }
  | { type: 'SET_FOOTER';         payload: string }
  | { type: 'UPDATE_ROW';         payload: { id: string; field: keyof QuoteRow; value: string } }
  | { type: 'ADD_ROW' }
  | { type: 'DELETE_ROW';         payload: string }
  | { type: 'MOVE_ROW';           payload: { id: string; dir: 'up' | 'down' } }
  | { type: 'COPY_ROW';           payload: string }
  | { type: 'REORDER_ROWS';       payload: QuoteRow[] }
  | { type: 'SET_COL_WIDTH';      payload: { col: keyof ColWidths; width: number } }
  | { type: 'SET_COL_ALIGN';      payload: { col: keyof ColAligns; align: AlignOption } }
  | { type: 'SET_THEME';          payload: ThemeSchema }
  | { type: 'SET_AUTO_THEME';     payload: ThemeSchema }
  | { type: 'RESET' };

const MAX_HISTORY = 50;

function pushHistory(state: AppState): AppState {
  const past = [...state.past, state.quoteData].slice(-MAX_HISTORY);
  return { ...state, past, future: [] };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_TITLE': {
      const s = pushHistory(state);
      return { ...s, quoteData: { ...s.quoteData, title: action.payload } };
    }
    case 'SET_COMPANY': {
      const s = pushHistory(state);
      return { ...s, quoteData: { ...s.quoteData, company: action.payload } };
    }
    case 'SET_FOOTER': {
      const s = pushHistory(state);
      return { ...s, quoteData: { ...s.quoteData, footerNote: action.payload } };
    }

    case 'UPDATE_ROW': {
      const s = pushHistory(state);
      const rows = s.quoteData.rows.map(row => {
        if (row.id !== action.payload.id) return row;
        const updated: QuoteRow = { ...row, [action.payload.field]: action.payload.value };
        if (action.payload.field === 'discountPrice' || action.payload.field === 'quantity') {
          updated.total = calcTotal(
            action.payload.field === 'discountPrice' ? action.payload.value : row.discountPrice,
            action.payload.field === 'quantity'       ? action.payload.value : row.quantity,
          );
        }
        return updated;
      });
      return { ...s, quoteData: { ...s.quoteData, rows } };
    }

    case 'ADD_ROW': {
      const s = pushHistory(state);
      const newRow: QuoteRow = {
        id: genId(), name: '', originalPrice: '',
        discountPrice: '', quantity: '', total: '', features: '',
      };
      return { ...s, quoteData: { ...s.quoteData, rows: [...s.quoteData.rows, newRow] } };
    }

    case 'DELETE_ROW': {
      const s = pushHistory(state);
      return { ...s, quoteData: { ...s.quoteData, rows: s.quoteData.rows.filter(r => r.id !== action.payload) } };
    }

    case 'MOVE_ROW': {
      const s = pushHistory(state);
      const rows = [...s.quoteData.rows];
      const idx = rows.findIndex(r => r.id === action.payload.id);
      if (idx < 0) return state;
      const target = action.payload.dir === 'up' ? idx - 1 : idx + 1;
      if (target < 0 || target >= rows.length) return state;
      [rows[idx], rows[target]] = [rows[target], rows[idx]];
      return { ...s, quoteData: { ...s.quoteData, rows } };
    }

    case 'COPY_ROW': {
      const s = pushHistory(state);
      const rows = [...s.quoteData.rows];
      const idx = rows.findIndex(r => r.id === action.payload);
      if (idx < 0) return state;
      const copy: QuoteRow = { ...rows[idx], id: genId() };
      rows.splice(idx + 1, 0, copy);
      return { ...s, quoteData: { ...s.quoteData, rows } };
    }

    case 'REORDER_ROWS': {
      const s = pushHistory(state);
      return { ...s, quoteData: { ...s.quoteData, rows: action.payload } };
    }

    case 'SET_COL_WIDTH':
      return { ...state, colWidths: { ...state.colWidths, [action.payload.col]: action.payload.width } };

    case 'SET_COL_ALIGN':
      return { ...state, colAligns: { ...state.colAligns, [action.payload.col]: action.payload.align } };

    case 'SET_THEME':
      return { ...state, theme: action.payload };

    case 'SET_AUTO_THEME':
      return { ...state, autoTheme: action.payload, theme: action.payload };

    case 'RESET':
      return { ...INITIAL_STATE };

    default:
      return state;
  }
}

// 单独的 undo/redo reducer 包装
interface FullState extends AppState {}

type FullAction = Action | { type: 'UNDO' } | { type: 'REDO' };

function fullReducer(state: FullState, action: FullAction): FullState {
  if (action.type === 'UNDO') {
    if (state.past.length === 0) return state;
    const past   = [...state.past];
    const prev   = past.pop()!;
    const future = [state.quoteData, ...state.future].slice(0, MAX_HISTORY);
    return { ...state, quoteData: prev, past, future };
  }
  if (action.type === 'REDO') {
    if (state.future.length === 0) return state;
    const future = [...state.future];
    const next   = future.shift()!;
    const past   = [...state.past, state.quoteData].slice(-MAX_HISTORY);
    return { ...state, quoteData: next, past, future };
  }
  return reducer(state, action as Action);
}

// ─── Context ─────────────────────────────────────────────
interface AppContextValue {
  state: FullState;
  dispatch: React.Dispatch<FullAction>;
  canUndo: boolean;
  canRedo: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(fullReducer, INITIAL_STATE);
  const canUndo = state.past.length   > 0;
  const canRedo = state.future.length > 0;
  return (
    <AppContext.Provider value={{ state, dispatch, canUndo, canRedo }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppStore must be used within AppProvider');
  return ctx;
}
