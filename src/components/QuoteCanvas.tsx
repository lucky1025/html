// 报价单完整渲染区域 — 支持直接在画布上编辑（所见即所得）
import { forwardRef, useState, useCallback } from 'react';
import type { QuoteData, ColWidths, ColAligns } from '../types';
import type { ThemeSchema } from '../templates/themes';
import { QuoteTable } from './Table/QuoteTable';
import { BottomNote } from './BottomNote/BottomNote';
import { RichCell } from './RichCell/RichCell';
import { useAppStore } from '../store/appStore';

interface QuoteCanvasProps {
  quoteData: QuoteData;
  theme: ThemeSchema;
  colWidths?: ColWidths;
  colAligns?: ColAligns;
  exportMode?: boolean;
  /** 预览模式：隐藏所有编辑控件 */
  previewMode?: boolean;
}

function getBgStyle(theme: ThemeSchema): React.CSSProperties {
  if (theme.bgGradient) return { background: theme.bgGradient };
  return { background: theme.bgColor };
}

function shadowCSS(level: ThemeSchema['cardShadow']) {
  switch (level) {
    case 'light':  return '0 1px 6px rgba(0,0,0,0.08)';
    case 'medium': return '0 4px 20px rgba(0,0,0,0.12)';
    case 'strong': return '0 8px 40px rgba(0,0,0,0.25)';
    default:       return 'none';
  }
}

export const QuoteCanvas = forwardRef<HTMLDivElement, QuoteCanvasProps>(
  function QuoteCanvas({ quoteData, theme, colWidths: propColWidths, colAligns, exportMode = false, previewMode = false }, ref) {
    const { state, dispatch } = useAppStore();
    const colWidths = propColWidths ?? state.colWidths;

    // 是否完全只读
    const readOnly = exportMode || previewMode;
    // 表格行是否只读（隐藏新增按钮等）
    const readOnlyRows = exportMode || previewMode;

    // ── 内联标题编辑 ──
    const [titleEditing, setTitleEditing] = useState(false);
    const [titleDraft, setTitleDraft] = useState(quoteData.title);

    const handleTitleCommit = useCallback(() => {
      dispatch({ type: 'SET_TITLE', payload: titleDraft });
      setTitleEditing(false);
    }, [titleDraft, dispatch]);

    return (
      <div
        ref={ref}
        data-export-canvas="true"
        style={{
          ...getBgStyle(theme),
          width:     exportMode ? 1280 : '100%',
          minHeight: exportMode ? 720  : undefined,
          padding:   exportMode ? '60px 80px' : '40px 48px',
          boxSizing: 'border-box',
          fontFamily: '"Microsoft YaHei", "微软雅黑", -apple-system, BlinkMacSystemFont, sans-serif',
        }}
      >
        {/* ── 标题（点击编辑）── */}
        {readOnly ? (
          <h1 style={{
            textAlign:    'center',
            color:        theme.titleColor,
            fontSize:     exportMode ? 48 : 32,
            fontWeight:   800,
            letterSpacing: '0.06em',
            margin:       `0 0 ${exportMode ? 36 : 24}px 0`,
          }}>
            {quoteData.title || '报价单'}
          </h1>
        ) : titleEditing ? (
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <input
              autoFocus
              value={titleDraft}
              onChange={e => setTitleDraft(e.target.value)}
              onBlur={handleTitleCommit}
              onKeyDown={e => { if (e.key === 'Enter') handleTitleCommit(); }}
              style={{
                textAlign: 'center',
                color: theme.titleColor,
                fontSize: 32,
                fontWeight: 800,
                letterSpacing: '0.06em',
                border: 'none',
                borderBottom: `2px solid ${theme.titleColor}`,
                outline: 'none',
                background: 'transparent',
                width: '80%',
                fontFamily: 'inherit',
              }}
            />
          </div>
        ) : (
          <h1
            onClick={() => { setTitleDraft(quoteData.title); setTitleEditing(true); }}
            title="点击编辑标题"
            style={{
              cursor:       'pointer',
              textAlign:    'center',
              color:        theme.titleColor,
              fontSize:     32,
              fontWeight:   800,
              letterSpacing: '0.06em',
              margin:       '0 0 24px 0',
              transition:   'filter 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.08)'}
            onMouseLeave={e => e.currentTarget.style.filter = ''}
          >
            {quoteData.title || '报价单'}
          </h1>
        )}

        {/* ── 抬头公司（RichCell 直接编辑）── */}
        <div style={{
          background:   theme.leadBg,
          border:       `1px solid ${theme.leadBorderColor}`,
          borderRadius: theme.cardBorderRadius,
          padding:      '10px 16px',
          marginBottom: 20,
          ...(readOnly ? { color: theme.leadTextColor, fontSize: 14, fontWeight: 500 } : {}),
        }}>
          {readOnly ? (
            quoteData.company
              ? <span dangerouslySetInnerHTML={{ __html: quoteData.company }} />
              : <span style={{ opacity: 0.45 }}>请输入公司名称</span>
          ) : (
            <RichCell
              value={quoteData.company}
              onChange={v => dispatch({ type: 'SET_COMPANY', payload: v })}
              placeholder="请输入公司名称"
              minHeight={32}
              style={{ color: theme.leadTextColor }}
            />
          )}
        </div>

        {/* ── 表格 ── */}
        <div style={{
          background:   theme.cardBg,
          borderRadius: theme.tableRadius,
          overflow:     (readOnly || exportMode) ? 'hidden' : 'visible',
          boxShadow:    shadowCSS(theme.cardShadow),
          marginBottom: 20,
        }}>
          <QuoteTable
            quoteData={quoteData}
            colWidths={colWidths}
            colAligns={colAligns ?? state.colAligns}
            theme={theme}
            readOnly={readOnlyRows}
            exportMode={exportMode}
          />
        </div>

        {/* ── 底部说明 ── */}
        <div style={{
          background:   theme.footerBg,
          borderRadius: theme.cardBorderRadius / 2,
          padding:      '8px 16px',
          color:        theme.footerTextColor,
          fontSize:     13,
          textAlign:    'center',
        }}>
          {readOnly ? (
            <span dangerouslySetInnerHTML={{ __html: quoteData.footerNote }} />
          ) : (
            <BottomNote
              value={quoteData.footerNote}
              onChange={(v: string) => dispatch({ type: 'SET_FOOTER', payload: v })}
              style={{ color: theme.footerTextColor }}
            />
          )}
        </div>
      </div>
    );
  }
);
