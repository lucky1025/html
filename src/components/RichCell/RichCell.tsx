// 富文本单元格组件
import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Extension } from '@tiptap/core';
import type { AlignOption } from '../../types';
import { RichToolbar } from './RichToolbar';

// 自定义 fontSize extension
const FontSize = Extension.create({
  name: 'fontSize',
  addGlobalAttributes() {
    return [{
      types: ['textStyle'],
      attributes: {
        fontSize: {
          default: null,
          parseHTML: (el: HTMLElement) => el.style.fontSize || null,
          renderHTML: (attrs: Record<string, unknown>) => {
            if (!attrs.fontSize) return {};
            return { style: `font-size: ${attrs.fontSize}` };
          },
        },
      },
    }];
  },
});

interface RichCellProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  minHeight?: number;
  readOnly?: boolean;
  /** 列级对齐方式（用于整列对齐切换） */
  align?: AlignOption;
  /** 切换列对齐方式的回调 */
  onAlignChange?: (align: AlignOption) => void;
}

export function RichCell({
  value,
  onChange,
  placeholder = '请输入...',
  className = '',
  style,
  minHeight = 40,
  readOnly = false,
  align,
  onAlignChange,
}: RichCellProps) {
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, code: false, codeBlock: false, blockquote: false,
        horizontalRule: false, bulletList: false, orderedList: false, listItem: false,
      }),
      Underline,
      TextStyle,
      Color,
      FontSize,
      TextAlign.configure({ types: ['paragraph'] }),
    ],
    content: value || '',
    editable: !readOnly,
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      if (html !== value) onChange(html);
    },
    editorProps: {
      attributes: {
        style: `min-height: ${minHeight}px; outline: none; padding: 6px 8px; font-family: "Microsoft YaHei", "微软雅黑", -apple-system, sans-serif; font-size: 14px;`,
      },
    },
  });

  useEffect(() => {
    if (editor && !focused) {
      const current = editor.getHTML();
      if (current !== value) {
        editor.commands.setContent(value || '', { emitUpdate: false });
      }
    }
  }, [value, editor, focused]);

  const blurEditor = useCallback(() => {
    editor?.commands.blur();
    setFocused(false);
  }, [editor]);

  useEffect(() => {
    if (containerRef.current) {
      (containerRef.current as HTMLDivElement & { __blurEditor?: () => void }).__blurEditor = blurEditor;
    }
  }, [blurEditor]);

  // ── 列级对齐选择器 ──
  const [showAlignPicker, setShowAlignPicker] = useState(false);
  const alignRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showAlignPicker) return;
    const handler = (e: MouseEvent) => { if (alignRef.current && !alignRef.current.contains(e.target as Node)) setShowAlignPicker(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showAlignPicker]);

  const ALIGN_OPTS: { v: AlignOption; icon: string; label: string }[] = [
    { v: 'left',   icon: '⬅', label: '左对齐' },
    { v: 'center', icon: '☰', label: '居中'   },
    { v: 'right',  icon: '➡', label: '右对齐' },
  ];

  const isEmpty = !value || value === '<p></p>' || value === '<p><br></p>';

  // ── 工具栏 Portal 位置（脱离父容器 overflow 裁切）──
  const [toolbarPos, setToolbarPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (focused && !readOnly && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      // 工具栏放在编辑框底部下方，避免遮挡文字
      setToolbarPos({ top: rect.bottom + 2, left: rect.left });
    } else {
      setToolbarPos(null);
    }
  }, [focused, readOnly]);

  useEffect(() => {
    const handleScroll = () => { if (focused && containerRef.current) { const r = containerRef.current.getBoundingClientRect(); setToolbarPos({ top: r.bottom + 2, left: r.left }); } };
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [focused]);

  return (
    <div ref={containerRef} className={`relative ${className}`} style={{ ...style, ...(focused && !readOnly ? { zIndex: 9999, position: 'relative' } : {}) }}>
      {!readOnly && onAlignChange && (
        <div ref={alignRef} className="absolute right-0.5 top-0.5 z-30">
          <button type="button"
            className="w-3.5 h-3.5 inline-flex items-center justify-center text-[8px] text-gray-400 hover:text-indigo-500 cursor-pointer bg-transparent border-none rounded leading-none opacity-70 hover:opacity-100"
            onMouseDown={e => { e.preventDefault(); e.stopPropagation(); setShowAlignPicker(v => !v); }}
            title="切换列对齐方式"
          >{ALIGN_OPTS.find(o => o.v === align)?.icon || '⬅'}</button>
          {showAlignPicker && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
              onMouseDown={e => e.stopPropagation()}>
              {ALIGN_OPTS.map(opt => (
                <button key={opt.v} type="button"
                  className={`flex items-center gap-1.5 w-full px-2.5 py-1 text-xs border-none cursor-pointer whitespace-nowrap ${
                    align === opt.v ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                  onMouseDown={e => { e.preventDefault(); onAlignChange(opt.v); setShowAlignPicker(false); }}>
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Portal 工具栏 — 渲染到 body，避免被 overflow 裁切 */}
      {focused && !readOnly && editor && toolbarPos && createPortal(
        <div style={{ position: 'fixed', top: toolbarPos.top, left: toolbarPos.left, zIndex: 99999 }}>
          <RichToolbar editor={editor} />
        </div>,
        document.body
      )}
      <div
        className={`rich-cell-editor rounded transition-all ${
          focused && !readOnly ? 'ring-1 ring-indigo-400' : ''
        }`}
        style={{ cursor: readOnly ? 'default' : 'text', position: 'relative' }}
        onFocus={() => setFocused(true)}
        onBlur={e => {
          if (!containerRef.current?.contains(e.relatedTarget as Node)) {
            setFocused(false);
          }
        }}
      >
        <EditorContent editor={editor} />
        {isEmpty && (
          <span className="absolute top-1.5 left-2 text-gray-400 pointer-events-none text-sm select-none"
            style={{ fontFamily: '"Microsoft YaHei", sans-serif' }}>
            {placeholder}
          </span>
        )}
      </div>
    </div>
  );
}
