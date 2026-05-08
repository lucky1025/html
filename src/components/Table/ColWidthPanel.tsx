// 列宽调节：手机滑条 + PC 拖拽把手
import { useState, useRef, useCallback } from 'react';
import type { ColWidths } from '../../types';
import { COL_WIDTH_LIMITS } from '../../types';
import { useAppStore } from '../../store/appStore';

type ColKey = keyof ColWidths;

const COL_LABELS: Record<ColKey, string> = {
  index:         '序号',
  name:          '名称',
  originalPrice: '原价格',
  discountPrice: '优惠价格',
  quantity:      '数量',
  total:         '总计',
  features:      '内容功能',
};

interface ColWidthPanelProps {
  colWidths: ColWidths;
  isMobile: boolean;
}

export function ColWidthPanel({ colWidths, isMobile }: ColWidthPanelProps) {
  const { dispatch } = useAppStore();
  const [panelOpen, setPanelOpen] = useState(false);

  const setWidth = useCallback((col: ColKey, width: number) => {
    const { min, max } = COL_WIDTH_LIMITS[col];
    const clamped = Math.max(min, Math.min(max, Math.round(width)));
    dispatch({ type: 'SET_COL_WIDTH', payload: { col, width: clamped } });
  }, [dispatch]);

  if (!isMobile) return null;

  return (
    <div className="mt-2">
      <button className="text-xs text-indigo-600 underline bg-transparent border-none cursor-pointer"
        onClick={() => setPanelOpen(v => !v)}>
        {panelOpen ? '收起列宽调节' : '调节列宽'}
      </button>
      {panelOpen && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg space-y-2">
          {(Object.keys(colWidths) as ColKey[]).map(col => {
            const { min, max } = COL_WIDTH_LIMITS[col];
            const val = colWidths[col];
            return (
              <div key={col} className="flex items-center gap-2">
                <span className="text-xs text-gray-600 w-16 shrink-0">{COL_LABELS[col]}</span>
                <input type="range" min={min} max={max} value={val}
                  className="flex-1 accent-indigo-600"
                  onChange={e => setWidth(col, parseInt(e.target.value))} />
                <span className="text-xs text-gray-500 w-10 text-right">{val}px</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// PC 列宽拖拽把手
interface ColResizeHandleProps {
  col: ColKey;
  currentWidth: number;
}

export function ColResizeHandle({ col, currentWidth }: ColResizeHandleProps) {
  const { dispatch } = useAppStore();
  const startX   = useRef(0);
  const startW   = useRef(currentWidth);
  const dragging = useRef(false);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragging.current = true;
    startX.current   = e.clientX;
    startW.current   = currentWidth;

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      const delta = ev.clientX - startX.current;
      const { min, max } = COL_WIDTH_LIMITS[col];
      const newW = Math.max(min, Math.min(max, startW.current + delta));
      dispatch({ type: 'SET_COL_WIDTH', payload: { col, width: Math.round(newW) } });
    };
    const onUp = () => {
      dragging.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [col, currentWidth, dispatch]);

  return (
    <span
      onMouseDown={onMouseDown}
      style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 6,
        cursor: 'col-resize', userSelect: 'none', zIndex: 10 }}
      title="拖拽调整列宽"
    />
  );
}
