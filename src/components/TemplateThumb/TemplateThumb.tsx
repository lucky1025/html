// 模板缩略图组件：真实渲染缩放生成缩略图
import React from 'react';
import type { ThemeSchema } from '../../templates/themes';
import { DEFAULT_QUOTE_DATA } from '../../templates/defaultData';
import { formatWithCommas } from '../../utils/numberUtils';

// 缩略图用固定尺寸渲染，通过 CSS transform scale 缩放
const THUMB_W = 320;
const THUMB_H = 180;
const CANVAS_W = 640;
const CANVAS_H = 360;
const SCALE = THUMB_W / CANVAS_W;

function getBg(theme: ThemeSchema): React.CSSProperties {
  if (theme.bgGradient) return { background: theme.bgGradient };
  return { background: theme.bgColor };
}

interface TemplateThumbProps {
  theme: ThemeSchema;
  selected?: boolean;
  onClick?: () => void;
}

export function TemplateThumb({ theme, selected, onClick }: TemplateThumbProps) {
  const data = DEFAULT_QUOTE_DATA;

  return (
    <div
      className={`relative cursor-pointer rounded-lg overflow-hidden transition-all ${
        selected
          ? 'ring-2 ring-indigo-500 ring-offset-2 scale-105'
          : 'hover:scale-102 hover:ring-1 hover:ring-indigo-300 ring-offset-1'
      }`}
      style={{ width: THUMB_W, height: THUMB_H, flexShrink: 0 }}
      onClick={onClick}
      title={theme.name}
    >
      {/* 实际渲染内容，通过 scale 缩小 */}
      <div
        style={{
          width:  CANVAS_W,
          height: CANVAS_H,
          transformOrigin: 'top left',
          transform: `scale(${SCALE})`,
          pointerEvents: 'none',
          ...getBg(theme),
          padding: '20px 24px',
          boxSizing: 'border-box',
          fontFamily: '"Microsoft YaHei", sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* 标题 */}
        <div style={{ textAlign: 'center', color: theme.titleColor, fontSize: 22, fontWeight: 800, marginBottom: 12 }}>
          {data.title}
        </div>
        {/* 公司 */}
        <div style={{
          background: theme.leadBg, border: `1px solid ${theme.leadBorderColor}`,
          borderRadius: theme.cardBorderRadius / 2, padding: '5px 10px',
          color: theme.leadTextColor, fontSize: 11, marginBottom: 12,
        }}>
          {data.company}
        </div>
        {/* 迷你表格 */}
        <div style={{ background: theme.cardBg, borderRadius: theme.tableRadius / 2, overflow: 'hidden' }}>
          {/* 表头 */}
          <div style={{ display: 'flex', background: theme.headerBg, color: theme.headerText, fontSize: 9, fontWeight: 700 }}>
            {['序号', '名称', '优惠价', '数量', '总计', '内容功能'].map((h, i) => (
              <div key={i} style={{ flex: i === 5 ? 2 : 1, padding: '4px 5px' }}>{h}</div>
            ))}
          </div>
          {/* 行 */}
          {data.rows.slice(0, 3).map((row, i) => (
            <div
              key={row.id}
              style={{
                display: 'flex',
                background: i % 2 === 0 ? theme.rowOddBg : theme.rowEvenBg,
                fontSize: 8,
                color: theme.bodyTextColor,
                borderBottom: `${theme.dividerWidth}px ${theme.dividerStyle} ${theme.dividerColor}`,
              }}
            >
              <div style={{ flex: 1, padding: '3px 5px', textAlign: 'center' }}>{i + 1}</div>
              <div style={{ flex: 1, padding: '3px 5px' }} dangerouslySetInnerHTML={{ __html: row.name }} />
              <div style={{ flex: 1, padding: '3px 5px', textAlign: 'right' }}>
                {row.discountPrice ? `¥${row.discountPrice}` : '-'}
              </div>
              <div style={{ flex: 1, padding: '3px 5px', textAlign: 'right' }}>{row.quantity || '-'}</div>
              <div style={{ flex: 1, padding: '3px 5px' }}>{row.total ? `¥${formatWithCommas(row.total)}` : '-'}</div>
              <div style={{ flex: 2, padding: '3px 5px' }}>
                <div dangerouslySetInnerHTML={{ __html: row.features }} style={{ overflow: 'hidden', maxHeight: 20 }} />
              </div>
            </div>
          ))}
          {/* 总计 */}
          <div style={{ display: 'flex', background: theme.totalRowBg, color: theme.totalRowText, fontSize: 9, fontWeight: 700 }}>
            <div style={{ flex: 4, padding: '4px 5px', textAlign: 'right' }}>总计</div>
            <div style={{ flex: 1, padding: '4px 5px' }}>¥4,890</div>
            <div style={{ flex: 2 }} />
          </div>
        </div>
      </div>

      {/* 模板名称遮罩 */}
      <div
        className="absolute bottom-0 left-0 right-0 text-center text-white text-xs py-1 font-medium"
        style={{
          background: 'linear-gradient(transparent, rgba(0,0,0,0.55))',
        }}
      >
        {theme.name}
      </div>

      {/* 选中标记 */}
      {selected && (
        <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
            <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          </svg>
        </div>
      )}
    </div>
  );
}
