// 富文本工具栏
import { useCallback, useRef, useState, useEffect } from 'react';
import type { Editor } from '@tiptap/react';

const FONT_SIZES = ['12', '14', '16', '18', '20', '24', '28', '32'];

// 扩展颜色面板：分组展示，更大色块，支持自定义输入
const COLOR_GROUPS = [
  { name: '', colors: ['#000000', '#334155', '#64748b', '#94a3b8', '#cbd5e1', '#f1f5f9', '#ffffff'] },
  { name: '红/橙/黄', colors: ['#dc2626', '#ef4444', '#f97316', '#fb923c', '#eab308', '#facc15', '#fef08a'] },
  { name: '绿/青/蓝', colors: ['#16a34a', '#22c55e', '#4ade80', '#06b6d4', '#0ea5e9', '#3b82f6', '#60a5fa'] },
  { name: '紫/粉', colors: ['#8b5cf6', '#a78bfa', '#c084fc', '#ec4899', '#f472b6', '#db2777', '#e879f9'] },
];

interface ToolbarProps {
  editor: Editor;
  minimal?: boolean;
}

export function RichToolbar({ editor, minimal = false }: ToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorRef = useRef<HTMLDivElement>(null);
  const [customColor, setCustomColor] = useState('#000000');

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (colorRef.current && !colorRef.current.contains(e.target as Node)) {
        setShowColorPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const setFontSize = useCallback((size: string) => {
    editor.chain().focus().setMark('textStyle', { fontSize: size + 'px' }).run();
  }, [editor]);

  const setColor = useCallback((color: string) => {
    editor.chain().focus().setColor(color).run();
    setCustomColor(color);
    setShowColorPicker(false);
  }, [editor]);

  const btnClass = (active: boolean) =>
    `px-2 py-1 rounded text-xs font-medium transition-all select-none cursor-pointer border-none ${
      active ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`;

  // 当前字体颜色
  const currentColor = ((editor.getAttributes('textStyle') as { color?: string }).color || '#000000');

  return (
    <div className="flex flex-wrap items-center gap-1 p-1.5 bg-white border border-gray-200 rounded-t-md shadow-sm z-10 relative">
      <button type="button" className={btnClass(editor.isActive('bold'))}
        onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}>
        <strong>B</strong>
      </button>
      <button type="button" className={btnClass(editor.isActive('italic'))}
        onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}>
        <em>I</em>
      </button>
      <button type="button" className={btnClass(editor.isActive('underline'))}
        onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }}>
        <u>U</u>
      </button>

      <div className="w-px h-5 bg-gray-200 mx-0.5" />

      {!minimal && (
        <select className="text-xs border border-gray-200 rounded px-1 py-0.5 bg-white cursor-pointer"
          defaultValue="" onChange={e => setFontSize(e.target.value)}>
          <option value="" disabled>字号</option>
          {FONT_SIZES.map(s => <option key={s} value={s}>{s}px</option>)}
        </select>
      )}

      <div ref={colorRef} className="relative">
        <button type="button"
          className="px-2 py-1 rounded text-xs bg-gray-100 hover:bg-gray-200 cursor-pointer flex items-center gap-1.5 border-none"
          onMouseDown={e => { e.preventDefault(); setShowColorPicker(v => !v); }}
          title="选择文字颜色">
          {/* 当前颜色的 A 字母 + 下划线色条 */}
          <span className="font-bold leading-none" style={{ color: currentColor }}>A</span>
          <span className="w-3 h-[3px] rounded-full" style={{ backgroundColor: currentColor }} />
          <svg width="7" height="5" viewBox="0 0 7 5" fill="currentColor" className="opacity-50"><path d="M3.5 5L0 0h7z"/></svg>
        </button>

        {showColorPicker && (
          <div
            className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 p-3 min-w-[260px]"
            onMouseDown={e => e.stopPropagation()}
          >
            {/* 分组颜色网格 */}
            <div className="space-y-2">
              {COLOR_GROUPS.map(group => (
                group.name ? (
                  <div key={group.name}>
                    <div className="text-[10px] text-gray-400 mb-1 px-0.5">{group.name}</div>
                    <div className="grid grid-cols-7 gap-1.5">
                      {group.colors.map(c => (
                        <button key={c} type="button"
                          className={`w-7 h-7 rounded-lg cursor-pointer hover:scale-110 transition-transform border ${currentColor === c ? 'ring-2 ring-indigo-500 ring-offset-1' : 'border-gray-200'}`}
                          style={{ backgroundColor: c }}
                          onMouseDown={e => { e.preventDefault(); setColor(c); }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div key="neutral" className="grid grid-cols-7 gap-1.5">
                    {group.colors.map(c => (
                      <button key={c} type="button"
                        className={`w-7 h-7 rounded-lg cursor-pointer hover:scale-110 transition-transform border ${currentColor === c ? 'ring-2 ring-indigo-500 ring-offset-1' : 'border-gray-200'}`}
                        style={{ backgroundColor: c, ...(c === '#ffffff' ? { backgroundImage: 'linear-gradient(45deg,#ddd 25%,transparent 25%,transparent 75%,#ddd 75%),linear-gradient(45deg,#ddd 25%,transparent 25%,transparent 75%,#ddd 75%)', backgroundSize: '6px 6px', backgroundPosition: '0 0,3px 3px' } : {}) }}
                        onMouseDown={e => { e.preventDefault(); setColor(c); }}
                      />
                    ))}
                  </div>
                )
              ))}
            </div>

            {/* 自定义颜色输入 */}
            <div className="mt-3 pt-2 border-t border-gray-100 flex items-center gap-2">
              <label className="text-[10px] text-gray-400 shrink-0">自定义</label>
              <input
                type="color"
                value={customColor}
                onChange={e => setCustomColor(e.target.value)}
                className="w-6 h-6 rounded border border-gray-200 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={customColor}
                onChange={e => {
                  const v = e.target.value;
                  /^#[0-9a-fA-F]{0,6}$/.test(v) && setCustomColor(v);
                }}
                className="flex-1 text-xs border border-gray-200 rounded px-1.5 py-1 font-mono"
                maxLength={7}
              />
              <button
                type="button"
                className="text-[10px] px-2 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 cursor-pointer border-none"
                onMouseDown={e => { e.preventDefault(); setColor(customColor); }}
              >应用</button>
            </div>
          </div>
        )}
      </div>

      {!minimal && (
        <>
          <div className="w-px h-5 bg-gray-200 mx-0.5" />
          {(['left', 'center', 'right'] as const).map(align => (
            <button key={align} type="button"
              className={btnClass(editor.isActive({ textAlign: align }))}
              onMouseDown={e => { e.preventDefault(); editor.chain().focus().setTextAlign(align).run(); }}
              title={align === 'left' ? '左对齐' : align === 'center' ? '居中' : '右对齐'}>
              {align === 'left' ? '⬅' : align === 'center' ? '☰' : '➡'}
            </button>
          ))}
        </>
      )}
    </div>
  );
}
