// 主表格组件
import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { COL_WIDTH_LIMITS } from '../../types';

import type { QuoteRow, QuoteData, ColWidths, ColAligns, AlignOption } from '../../types';
import type { ThemeSchema } from '../../templates/themes';
import { RichCell } from '../RichCell/RichCell';
import { formatWithCommas, isValidNumberInput, formatNumberOnBlur } from '../../utils/numberUtils';
import { useAppStore } from '../../store/appStore';

type ColKey = keyof ColWidths;

const COLUMNS: { key: ColKey; label: string; align?: string }[] = [
  { key: 'index',         label: '序号',    align: 'center' },
  { key: 'name',          label: '名称'               },
  { key: 'originalPrice', label: '原价格',  align: 'right'  },
  { key: 'discountPrice', label: '优惠价格', align: 'right' },
  { key: 'quantity',      label: '数量',    align: 'right'  },
  { key: 'total',         label: '总计',    align: 'left'   },
  { key: 'features',      label: '内容功能'              },
];

function shadowCSS(level: ThemeSchema['cardShadow']) {
  switch (level) {
    case 'light':  return '0 1px 6px rgba(0,0,0,0.08)';
    case 'medium': return '0 4px 20px rgba(0,0,0,0.12)';
    case 'strong': return '0 8px 40px rgba(0,0,0,0.25)';
    default:       return 'none';
  }
}

// ── 列宽拖拽调整手柄 ────────────────────────────────────
interface ColResizeHandleProps {
  colKey: ColKey;
  currentWidth: number;
  readOnly?: boolean;
}
function ColResizeHandle({ colKey, currentWidth, readOnly }: ColResizeHandleProps) {
  const { dispatch } = useAppStore();
  const dragging = useRef(false);
  const startX = useRef(0);
  const startW = useRef(0);

  const limits = COL_WIDTH_LIMITS[colKey];

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();
    dragging.current = true;
    startX.current = e.clientX;
    startW.current = currentWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      const delta = ev.clientX - startX.current;
      const newW = Math.max(limits.min, Math.min(limits.max, startW.current + delta));
      dispatch({ type: 'SET_COL_WIDTH', payload: { col: colKey, width: newW } });
    };
    const onUp = () => {
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [colKey, currentWidth, dispatch, limits]);

  if (readOnly) return null;
  return (
    <div
      className="absolute right-0 top-0 bottom-0 w-1.5 z-10 flex items-center justify-center cursor-col-resize group"
      onMouseDown={onMouseDown}
    >
      <div className="w-0.5 h-4 bg-gray-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

// ── 数字输入单元格（独立组件，防止每次渲染重置） ──────────
interface NumCellProps {
  value: string;
  readOnly?: boolean;
  textColor: string;
  align?: AlignOption;           // 对齐方式
  onCommit: (v: string) => void;
  onAlignChange?: (align: AlignOption) => void; // 切换对齐
}
function NumCell({ value, readOnly, textColor, align = 'right', onCommit, onAlignChange }: NumCellProps) {
  const [local, setLocal] = useState(value);
  useEffect(() => { setLocal(value); }, [value]);

  const [showAlignPicker, setShowAlignPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showAlignPicker) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowAlignPicker(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showAlignPicker]);

  const ALIGN_OPTIONS: { value: AlignOption; icon: string }[] = [
    { value: 'left',   icon: '⬅' },
    { value: 'center', icon: '☰' },
    { value: 'right',  icon: '➡' },
  ];

  return (
    <div className="relative">
      <input
        type="text"
        inputMode="decimal"
        value={local}
        readOnly={readOnly}
        className="w-full bg-transparent outline-none text-sm py-1 px-2"
        style={{ color: textColor, fontFamily: '"Microsoft YaHei", sans-serif', textAlign: align }}
        onChange={e => {
          const v = e.target.value;
          if (isValidNumberInput(v)) { setLocal(v); onCommit(v); }
        }}
        onBlur={() => {
          const fmt = formatNumberOnBlur(local);
          setLocal(fmt);
          onCommit(fmt);
        }}
        placeholder="-"
      />
      {!readOnly && onAlignChange && (
        <div ref={pickerRef} className="absolute right-0 top-1/2 -translate-y-1/2">
          <button
            type="button"
            className="w-4 h-4 flex items-center justify-center text-[9px] text-gray-400 hover:text-indigo-500 cursor-pointer bg-transparent border-none leading-none opacity-60 hover:opacity-100"
            onMouseDown={e => { e.preventDefault(); e.stopPropagation(); setShowAlignPicker(v => !v); }}
            title="切换对齐方式"
          >{ALIGN_OPTIONS.find(o => o.value === align)?.icon || '➡'}</button>
          {showAlignPicker && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden p-1 flex gap-0.5"
              onMouseDown={e => e.stopPropagation()}>
              {ALIGN_OPTIONS.map(opt => (
                <button key={opt.value} type="button"
                  className={`w-7 h-7 flex items-center justify-center text-xs border-none cursor-pointer transition-colors rounded ${
                    align === opt.value ? 'bg-indigo-500 text-white' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                  onMouseDown={e => { e.preventDefault(); onAlignChange(opt.value); setShowAlignPicker(false); }}>
                  {opt.icon}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── 可拖拽行 ──────────────────────────────────────────────
interface SortableRowProps {
  row: QuoteRow;
  index: number;
  colWidths: ColWidths;
  colAligns: ColAligns;
  theme: ThemeSchema;
  isEven: boolean;
  currency: string;
  onUpdate: (id: string, field: keyof QuoteRow, value: string) => void;
  onDelete: (id: string) => void;
  onMove:   (id: string, dir: 'up' | 'down') => void;
  onCopy:   (id: string) => void;
  isFirst: boolean;
  isLast:  boolean;
  readOnly?: boolean;
}

function SortableRow({
  row, index, colWidths, colAligns, theme, isEven, currency,
  onUpdate, onDelete, onMove, onCopy, isFirst, isLast, readOnly,
}: SortableRowProps) {
  const { dispatch } = useAppStore();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: row.id });
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const rowStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity:    isDragging ? 0.5 : 1,
    background: isEven ? theme.rowEvenBg : theme.rowOddBg,
    borderBottom: `${theme.dividerWidth}px ${theme.dividerStyle} ${theme.dividerColor}`,
  };

  return (
    <tr ref={setNodeRef} style={rowStyle}>
      {/* 序号 */}
      <td style={{ width: colWidths.index, textAlign: colAligns.index, color: theme.mutedTextColor, fontSize: 14, padding: '8px 4px' }}>
        {!readOnly && (
          <span {...attributes} {...listeners}
            style={{ cursor: 'grab', marginRight: 4, opacity: 0.4, userSelect: 'none', display: 'inline-block' }}
            title="拖拽排序">⋮⋮</span>
        )}
        {index + 1}
      </td>
      {/* 名称 */}
      <td style={{ width: colWidths.name, padding: '4px 6px', textAlign: colAligns.name }}>
        <RichCell value={row.name} onChange={v => onUpdate(row.id, 'name', v)}
          placeholder="名称" minHeight={32} readOnly={readOnly}
          style={{ color: theme.bodyTextColor }}
          align={colAligns.name}
          onAlignChange={!readOnly ? (a) => dispatch({ type: 'SET_COL_ALIGN', payload: { col: 'name', align: a } }) : undefined}
        />
      </td>
      {/* 原价格 */}
      <td style={{ width: colWidths.originalPrice, padding: '4px 2px', textAlign: colAligns.originalPrice }}>
        <NumCell value={row.originalPrice} readOnly={readOnly} textColor={theme.bodyTextColor}
          align={colAligns.originalPrice}
          onCommit={v => onUpdate(row.id, 'originalPrice', v)}
          onAlignChange={!readOnly ? (a) => dispatch({ type: 'SET_COL_ALIGN', payload: { col: 'originalPrice', align: a } }) : undefined} />
      </td>
      {/* 优惠价格 */}
      <td style={{ width: colWidths.discountPrice, padding: '4px 2px', textAlign: colAligns.discountPrice }}>
        <NumCell value={row.discountPrice} readOnly={readOnly} textColor={theme.bodyTextColor}
          align={colAligns.discountPrice}
          onCommit={v => onUpdate(row.id, 'discountPrice', v)}
          onAlignChange={!readOnly ? (a) => dispatch({ type: 'SET_COL_ALIGN', payload: { col: 'discountPrice', align: a } }) : undefined} />
      </td>
      {/* 数量 */}
      <td style={{ width: colWidths.quantity, padding: '4px 2px', textAlign: colAligns.quantity }}>
        <NumCell value={row.quantity} readOnly={readOnly} textColor={theme.bodyTextColor}
          align={colAligns.quantity}
          onCommit={v => onUpdate(row.id, 'quantity', v)}
          onAlignChange={!readOnly ? (a) => dispatch({ type: 'SET_COL_ALIGN', payload: { col: 'quantity', align: a } }) : undefined} />
      </td>
      {/* 总计 */}
      <td style={{ width: colWidths.total, textAlign: colAligns.total, padding: '8px 8px', color: theme.bodyTextColor, fontSize: 14 }}>
        {row.total ? `${currency}${formatWithCommas(row.total)}` : ''}
      </td>
      {/* 内容功能 */}
      <td style={{ padding: '4px 6px', textAlign: colAligns.features }}>
        <RichCell value={row.features} onChange={v => onUpdate(row.id, 'features', v)}
          placeholder="内容功能说明" minHeight={32} readOnly={readOnly}
          style={{ color: theme.bodyTextColor }}
          align={colAligns.features}
          onAlignChange={!readOnly ? (a) => dispatch({ type: 'SET_COL_ALIGN', payload: { col: 'features', align: a } }) : undefined}
        />
      </td>
      {/* 操作菜单 */}
      {!readOnly && (
        <td style={{ width: 32, padding: '4px 2px', textAlign: 'center' }}>
          <div ref={menuRef} className="relative">
            <button className="text-gray-400 hover:text-gray-600 text-lg leading-none px-1 bg-transparent border-none cursor-pointer"
              onClick={() => setMenuOpen(v => !v)} title="行操作">⋯</button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 text-sm min-w-[100px]">
                <button className="block w-full text-left px-3 py-1.5 hover:bg-gray-50 border-none bg-transparent cursor-pointer"
                  onClick={() => { onCopy(row.id); setMenuOpen(false); }}>复制行</button>
                {!isFirst && <button className="block w-full text-left px-3 py-1.5 hover:bg-gray-50 border-none bg-transparent cursor-pointer"
                  onClick={() => { onMove(row.id, 'up'); setMenuOpen(false); }}>上移</button>}
                {!isLast  && <button className="block w-full text-left px-3 py-1.5 hover:bg-gray-50 border-none bg-transparent cursor-pointer"
                  onClick={() => { onMove(row.id, 'down'); setMenuOpen(false); }}>下移</button>}
                <button className="block w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-500 border-none bg-transparent cursor-pointer"
                  onClick={() => { onDelete(row.id); setMenuOpen(false); }}>删除行</button>
              </div>
            )}
          </div>
        </td>
      )}
    </tr>
  );
}

// ── 主表格 ────────────────────────────────────────────────
interface QuoteTableProps {
  quoteData: QuoteData;
  colWidths: ColWidths;
  colAligns: ColAligns;
  theme: ThemeSchema;
  readOnly?: boolean;
  exportMode?: boolean;
}

export function QuoteTable({ quoteData, colWidths, colAligns, theme, readOnly = false, exportMode = false }: QuoteTableProps) {
  const { dispatch } = useAppStore();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const rows  = quoteData.rows;
    const oldIdx = rows.findIndex(r => r.id === active.id);
    const newIdx = rows.findIndex(r => r.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    dispatch({ type: 'REORDER_ROWS', payload: arrayMove(rows, oldIdx, newIdx) });
  }, [quoteData.rows, dispatch]);

  const onUpdate  = useCallback((id: string, field: keyof QuoteRow, value: string) =>
    dispatch({ type: 'UPDATE_ROW', payload: { id, field, value } }), [dispatch]);
  const onDelete  = useCallback((id: string) => dispatch({ type: 'DELETE_ROW', payload: id }), [dispatch]);
  const onMove    = useCallback((id: string, dir: 'up'|'down') => dispatch({ type: 'MOVE_ROW', payload: { id, dir } }), [dispatch]);
  const onCopy    = useCallback((id: string) => dispatch({ type: 'COPY_ROW', payload: id }), [dispatch]);

  const grandTotal = useMemo(() => {
    const sum = quoteData.rows.reduce((acc, row) => {
      const t = parseFloat(row.total);
      return acc + (isNaN(t) ? 0 : t);
    }, 0);
    return sum > 0 ? sum.toFixed(2).replace(/\.?0+$/, '') : '';
  }, [quoteData.rows]);

  const headerStyle: React.CSSProperties = {
    background:    theme.headerBg,
    color:         theme.headerText,
    padding:       '10px 8px',
    fontSize:      14,
    fontWeight:    600,
    borderBottom:  `${theme.dividerWidth}px ${theme.dividerStyle} ${theme.dividerColor}`,
    whiteSpace:    'nowrap',
    userSelect:    'none',
    position:      'relative',
  };

  // 表头对齐选择器组件
  interface HeaderAlignPickerProps { colKey: keyof ColAligns; current: AlignOption; }
  function HeaderAlignPicker({ colKey, current }: HeaderAlignPickerProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
      if (!open) return;
      const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, [open]);
    const options: { v: AlignOption; icon: string }[] = [
      { v: 'left', icon: '⬅' }, { v: 'center', icon: '☰' }, { v: 'right', icon: '➡' },
    ];
    return (
      <span ref={ref} className="inline-block relative ml-1 align-middle">
        <button type="button"
          className="w-3.5 h-3.5 inline-flex items-center justify-center text-[8px] text-gray-400 hover:text-indigo-500 cursor-pointer bg-transparent border-none rounded leading-none opacity-70 hover:opacity-100"
          onMouseDown={e => { e.preventDefault(); e.stopPropagation(); setOpen(o => !o); }}
          title="切换对齐方式"
        >{options.find(o => o.v === current)?.icon || '➡'}</button>
        {open && (
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden p-1 flex gap-0.5"
            onMouseDown={e => e.stopPropagation()}>
            {options.map(opt => (
              <button key={opt.v} type="button"
                className={`w-7 h-7 flex items-center justify-center text-[10px] border-none cursor-pointer rounded ${
                  current === opt.v ? 'bg-indigo-500 text-white' : 'hover:bg-gray-100 text-gray-600'
                }`}
                onMouseDown={e => { e.preventDefault(); dispatch({ type: 'SET_COL_ALIGN', payload: { col: colKey, align: opt.v } }); setOpen(false); }}>
                {opt.icon}
              </button>
            ))}
          </div>
        )}
      </span>
    );
  }

  // 表头所有列均支持对齐选择
  const ALL_ALIGN_COLS: (keyof ColAligns)[] = ['index', 'name', 'originalPrice', 'discountPrice', 'quantity', 'total', 'features'];
  const isAlignable = (key: string): key is keyof ColAligns => ALL_ALIGN_COLS.includes(key as keyof ColAligns);

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <div style={{ borderRadius: theme.tableRadius, overflow: (readOnly || exportMode) ? 'hidden' : 'visible', boxShadow: shadowCSS(theme.cardShadow) }}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup>
              {COLUMNS.map(col => <col key={col.key} style={{ width: colWidths[col.key] }} />)}
              {!exportMode && !readOnly && <col style={{ width: 32 }} />}
            </colgroup>
            <thead>
              <tr>
                {COLUMNS.map(col => (
                  <th key={col.key} style={{ ...headerStyle, textAlign: (colAligns[col.key] as React.CSSProperties['textAlign']) || 'left', position: 'relative' }}>
                    <span className="inline-block">{col.label}</span>
                    {!readOnly && !exportMode && isAlignable(col.key) && (
                      <HeaderAlignPicker colKey={col.key} current={colAligns[col.key]} />
                    )}
                    {!readOnly && !exportMode && (
                      <ColResizeHandle colKey={col.key} currentWidth={colWidths[col.key]} />
                    )}
                  </th>
                ))}
                {!exportMode && !readOnly && <th style={{ ...headerStyle, width: 32 }} />}
              </tr>
            </thead>
            <tbody>
              <SortableContext items={quoteData.rows.map(r => r.id)} strategy={verticalListSortingStrategy}>
                {quoteData.rows.map((row, i) => (
                  <SortableRow
                    key={row.id} row={row} index={i}
                    colWidths={colWidths} colAligns={colAligns}
                    theme={theme}
                    isEven={i % 2 === 1} currency={quoteData.currency}
                    onUpdate={onUpdate} onDelete={onDelete}
                    onMove={onMove} onCopy={onCopy}
                    isFirst={i === 0} isLast={i === quoteData.rows.length - 1}
                    readOnly={readOnly || exportMode}
                  />
                ))}
              </SortableContext>
            </tbody>
            {grandTotal && (
              <tfoot>
                <tr style={{ background: theme.totalRowBg }}>
                  <td colSpan={5} style={{ padding: '10px 8px', color: theme.totalRowText, fontWeight: 700, fontSize: 15 }} />
                  <td colSpan={2} style={{ padding: '10px 8px', color: theme.totalRowText, fontWeight: 700, fontSize: 15, textAlign: 'right' }}>
                    <span style={{ marginRight: 16 }}>总计</span>
                    {quoteData.currency}{formatWithCommas(grandTotal)}
                  </td>
                  {!exportMode && !readOnly && <td />}
                </tr>
              </tfoot>
            )}
          </table>
        </DndContext>
      </div>

      {!readOnly && !exportMode && (
        <button
          className="mt-3 w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-indigo-400 hover:text-indigo-500 transition-all text-sm bg-transparent cursor-pointer"
          onClick={() => dispatch({ type: 'ADD_ROW' })}
        >
          + 新增一行
        </button>
      )}
    </div>
  );
}
