// 底部说明组件（单行 + 30字限制）
import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { Extension } from '@tiptap/core';
import { RichToolbar } from '../RichCell/RichToolbar';

const MAX_CHARS = 30;

const NoHardBreak = Extension.create({
  name: 'noHardBreak',
  addKeyboardShortcuts() {
    return {
      'Enter':       () => true,
      'Shift-Enter': () => true,
    };
  },
});

interface BottomNoteProps {
  value: string;
  onChange: (text: string) => void;
  style?: React.CSSProperties;
  className?: string;
  readOnly?: boolean;
}

export function BottomNote({ value, onChange, style, className = '', readOnly = false }: BottomNoteProps) {
  const [focused, setFocused]           = useState(false);
  const [exceededOnce, setExceededOnce] = useState(false);
  const [showHint, setShowHint]         = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hintTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, code: false, codeBlock: false, blockquote: false,
        horizontalRule: false, bulletList: false, orderedList: false, listItem: false,
        hardBreak: false,
      }),
      Underline,
      TextStyle,
      Color,
      NoHardBreak,
    ],
    content: value || '',
    editable: !readOnly,
    onUpdate: ({ editor: ed }) => {
      const text = ed.getText();
      if (text.length > MAX_CHARS) {
        // 截断超出部分
        const truncated = text.slice(0, MAX_CHARS);
        ed.commands.setContent(truncated);
        if (!exceededOnce) {
          setExceededOnce(true);
          setShowHint(true);
          if (hintTimer.current !== null) clearTimeout(hintTimer.current);
          hintTimer.current = setTimeout(() => setShowHint(false), 2000);
        }
        onChange(truncated);
      } else {
        if (text !== value) onChange(text);
      }
    },
    editorProps: {
      attributes: {
        style: 'outline: none; padding: 4px 8px; min-height: 28px; font-family: "Microsoft YaHei", "微软雅黑", -apple-system, sans-serif; font-size: 14px;',
      },
    },
  });

  const charCount = editor ? editor.getText().length : value.length;

  useEffect(() => {
    if (editor && !focused) {
      if (editor.getText() !== value) {
        editor.commands.setContent(value || '');
      }
    }
  }, [value, editor, focused]);

  return (
    <div ref={containerRef} className={`relative ${className}`} style={style}>
      {focused && !readOnly && editor && (
        <div className="absolute bottom-full left-0 z-20">
          <RichToolbar editor={editor} minimal />
        </div>
      )}
      <div
        className={`border rounded transition-all ${focused && !readOnly ? 'border-indigo-400 ring-1 ring-indigo-300' : 'border-transparent'}`}
        onFocus={() => setFocused(true)}
        onBlur={e => {
          if (!containerRef.current?.contains(e.relatedTarget as Node)) setFocused(false);
        }}
      >
        <EditorContent editor={editor} />
      </div>
      {focused && (
        <div className="absolute bottom-full right-0 mb-0.5 text-xs text-gray-400 select-none">
          {charCount}/{MAX_CHARS}
          {showHint && <span className="ml-2 text-orange-500">已达最大字数</span>}
        </div>
      )}
    </div>
  );
}
