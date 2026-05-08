import React, {
  useRef, useState, useCallback, useEffect
} from 'react';
import { useAppStore } from './store/appStore';
import { FIXED_THEMES } from './templates/themes';
import type { ThemeSchema } from './templates/themes';
import type { ColAligns } from './types';
import { TemplateThumb } from './components/TemplateThumb/TemplateThumb';
import { QuoteCanvas } from './components/QuoteCanvas';
import { ExportFallback } from './components/ExportFallback';
import { useToast } from './components/Toast';
import { exportToPng, checkOverflow } from './utils/exportPng';
import type { ExportStatus } from './utils/exportPng';
import { extractThemeFromImage } from './utils/extractThemeFromImage';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

export default function App() {
  const { state, dispatch, canUndo, canRedo } = useAppStore();
  const { quoteData, theme, autoTheme, colWidths, colAligns } = state;

  const isMobile = useIsMobile();
  const { show: showToast, ToastContainer } = useToast();

  const exportRef  = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle');
  const [fallbackData, setFallbackData] = useState<string | undefined>();
  const [showFallback, setShowFallback] = useState(false);
  const [autoUploading, setAutoUploading] = useState(false);

  const allThemes = autoTheme
    ? [...FIXED_THEMES, autoTheme]
    : FIXED_THEMES;

  // ── 键盘快捷键 undo/redo ─────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === 'z' && !e.shiftKey) { e.preventDefault(); dispatch({ type: 'UNDO' }); }
      if (mod && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); dispatch({ type: 'REDO' }); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [dispatch]);

  // ── 导出 PNG ─────────────────────────────────────────────
  const handleExport = useCallback(async () => {
    if (exportStatus === 'generating') return;

    // 先 blur 所有输入/富文本
    document.querySelectorAll<HTMLElement>('[data-export-canvas] [contenteditable]').forEach(el => el.blur());
    document.querySelectorAll<HTMLElement>('[data-export-canvas] input').forEach(el => el.blur());
    // 清理富文本选区
    window.getSelection()?.removeAllRanges();

    // 溢出检查
    const el = exportRef.current;
    if (!el) return;
    if (checkOverflow(el)) {
      showToast('内容过多无法导出，请精简内容', 'warning', 3000);
      return;
    }

    setExportStatus('generating');

    // 延迟一帧确保 blur 生效
    await new Promise(r => setTimeout(r, 80));

    const result = await exportToPng(
      el,
      `报价单_${quoteData.company || ''}.png`,
      (status, msg) => {
        if (status === 'overflow') {
          showToast(msg || '内容过多', 'warning', 3000);
        }
      }
    );

    setExportStatus(result.status);

    if (result.status === 'success') {
      showToast('保存成功 ✓', 'success', 1500);
      setTimeout(() => setExportStatus('idle'), 1600);
    } else if (result.status === 'fallback') {
      setFallbackData(result.dataUrl);
      setShowFallback(true);
      setExportStatus('idle');
    } else if (result.status === 'error') {
      showToast('导出失败，请重试', 'error', 3000);
      setTimeout(() => setExportStatus('idle'), 1500);
    }
  }, [exportStatus, quoteData.company, showToast]);

  // ── Auto 提色 ─────────────────────────────────────────────
  const handleAutoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAutoUploading(true);
    try {
      const t = await extractThemeFromImage(file);
      dispatch({ type: 'SET_AUTO_THEME', payload: t });
      showToast('自定义模板已生成 ✓', 'success');
    } catch (err) {
      showToast('图片解析失败，请换一张', 'error');
    } finally {
      setAutoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [dispatch, showToast]);

  // ── 重置 ──────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    if (!window.confirm('确定恢复默认内容和模板？')) return;
    dispatch({ type: 'RESET' });
    showToast('已重置 ✓', 'info');
  }, [dispatch, showToast]);

  // ── 渲染 ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col" style={{ fontFamily: '"Microsoft YaHei", sans-serif' }}>
      <ToastContainer />

      {/* ── 顶部栏（仅操作按钮）── */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
          {/* 标题 */}
          <div className="font-bold text-gray-800 text-lg mr-2 shrink-0">📋 报价单生成器</div>

          {/* 右侧按钮组 */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {/* Auto 上传 */}
            <label
              className={`cursor-pointer px-3 py-1.5 rounded-lg text-sm border font-medium transition-all select-none ${
                autoUploading
                  ? 'bg-gray-100 text-gray-400 border-gray-200'
                  : 'bg-white text-purple-600 border-purple-300 hover:bg-purple-50'
              }`}
              title="上传图片自动提取配色生成自定义模板"
            >
              {autoUploading ? '解析中…' : '🎨 自定义模板'}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAutoUpload}
                disabled={autoUploading}
              />
            </label>

            {/* Undo / Redo */}
            <button
              className={`p-1.5 rounded-lg text-sm border transition-all ${canUndo ? 'border-gray-300 hover:bg-gray-50 text-gray-700' : 'border-gray-100 text-gray-300 cursor-not-allowed'}`}
              onClick={() => dispatch({ type: 'UNDO' })}
              disabled={!canUndo}
              title="撤销 Ctrl+Z"
            >↩</button>
            <button
              className={`p-1.5 rounded-lg text-sm border transition-all ${canRedo ? 'border-gray-300 hover:bg-gray-50 text-gray-700' : 'border-gray-100 text-gray-300 cursor-not-allowed'}`}
              onClick={() => dispatch({ type: 'REDO' })}
              disabled={!canRedo}
              title="重做 Ctrl+Y"
            >↪</button>

            {/* 重置 */}
            <button
              className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 text-gray-600 hover:bg-gray-50"
              onClick={handleReset}
              title="一键重置为默认内容"
            >
              重置
            </button>

            {/* 导出 */}
            <button
              className={`px-4 py-1.5 rounded-lg text-sm font-bold text-white shadow transition-all ${
                exportStatus === 'generating'
                  ? 'bg-indigo-400 cursor-wait'
                  : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
              }`}
              onClick={handleExport}
              disabled={exportStatus === 'generating'}
            >
              {exportStatus === 'generating' ? '生成中…' : '导出 PNG'}
            </button>
          </div>
        </div>
      </header>

      {/* ── 主内容：上方模板选择，下方所见即所得画布编辑区 ── */}
      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 py-6">
        <div className="flex flex-col gap-4">
          {/* 模板缩略图选择（紧凑行） */}
          <div className="bg-white rounded-xl shadow-sm p-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 font-medium shrink-0 whitespace-nowrap">🎨 模板风格</span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin flex-1">
                {allThemes.map(t => (
                  <div key={t.id} className="shrink-0">
                    <TemplateThumb
                      theme={t}
                      selected={theme.id === t.id}
                      onClick={() => dispatch({ type: 'SET_THEME', payload: t })}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 所见即所得画布编辑区 */}
          <div className="bg-white rounded-xl shadow-sm p-4 relative">
            {/* 提示文字 */}
            <div className="text-xs text-gray-400 mb-2 text-center">✨ 点击下方报价单各区域可直接编辑 · 导出为 2560×1440 高清 PNG</div>

            {/* 可编辑画布（带 scale 缩放适配屏幕宽度） */}
            <EditableCanvas exportRef={exportRef} quoteData={quoteData} theme={theme} colWidths={colWidths} colAligns={colAligns} isMobile={isMobile} />
          </div>
        </div>
      </main>

      {/* Fallback 弹窗 */}
      {showFallback && (
        <ExportFallback
          dataUrl={fallbackData}
          onClose={() => { setShowFallback(false); setFallbackData(undefined); }}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 可编辑画布组件 — 缩放展示 + 直接在画布上编辑
// ═══════════════════════════════════════════════════════════════

interface EditableCanvasProps {
  exportRef: React.RefObject<HTMLDivElement | null>;
  quoteData: ReturnType<typeof useAppStore>['state']['quoteData'];
  theme: ThemeSchema;
  colWidths: ReturnType<typeof useAppStore>['state']['colWidths'];
  colAligns: ColAligns;
  isMobile: boolean;
}

function EditableCanvas({ exportRef, quoteData, theme, colWidths, colAligns }: EditableCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const CANVAS_W = 1280;

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        setScale(w / CANVAS_W);
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', overflowX: 'auto' }}>
      <div
        style={{
          transformOrigin: 'top left',
          transform: `scale(${scale})`,
          width: CANVAS_W,
        }}
      >
        <QuoteCanvas
          ref={exportRef}
          quoteData={quoteData}
          theme={theme}
          colWidths={colWidths}
          colAligns={colAligns}
          exportMode={false}
          previewMode={false}
        />
      </div>
      {/* 占位高度（让容器跟随内容高度） */}
      <div style={{ height: (exportRef.current?.offsetHeight ?? 500) * scale }} />
    </div>
  );
}
