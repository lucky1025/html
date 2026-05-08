// PNG 导出逻辑
// 字体等待、scale、下载、失败兜底

import { toPng } from 'html-to-image';
import { EXPORT_WIDTH, EXPORT_HEIGHT, EXPORT_SCALE } from '../types';

export type ExportStatus = 'idle' | 'generating' | 'success' | 'error' | 'overflow' | 'fallback';

export interface ExportResult {
  status: ExportStatus;
  message?: string;
  dataUrl?: string;
}

// 检查导出区域是否溢出
export function checkOverflow(el: HTMLElement): boolean {
  // 按渲染比例折算到导出尺寸
  const renderWidth  = el.offsetWidth;
  const renderHeight = el.offsetHeight;
  // 导出时画布固定 2560x1440，元素的实际导出高度 = renderHeight * (EXPORT_WIDTH / renderWidth)
  if (renderWidth === 0) return false;
  const exportedHeight = renderHeight * (EXPORT_WIDTH / renderWidth);
  return exportedHeight > EXPORT_HEIGHT;
}

// 触发下载
function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => document.body.removeChild(a), 1000);
}

export async function exportToPng(
  el: HTMLElement,
  filename = '报价单.png',
  onProgress?: (status: ExportStatus, msg?: string) => void,
): Promise<ExportResult> {
  // 1. 溢出检查
  if (checkOverflow(el)) {
    onProgress?.('overflow', '内容过多无法导出，请精简内容');
    return { status: 'overflow', message: '内容过多无法导出，请精简内容' };
  }

  onProgress?.('generating', '生成中…');

  // 2. 等待字体加载完成
  try {
    await document.fonts.ready;
  } catch (_) { /* ignore */ }

  // 3. 计算 scale：让导出宽度 = EXPORT_WIDTH
  const renderWidth = el.offsetWidth || 1200;
  const pixelRatio  = (EXPORT_WIDTH / renderWidth) * EXPORT_SCALE;

  try {
    const dataUrl = await toPng(el, {
      width:       renderWidth,
      height:      el.offsetHeight,
      pixelRatio,
      cacheBust:   true,
      skipFonts:   false,
      style: {
        // 清理可能残留的 outline/focus ring
        outline: 'none',
      },
    });

    // 4. 尝试下载
    try {
      downloadDataUrl(dataUrl, filename);
      onProgress?.('success', '保存成功');
      return { status: 'success', dataUrl };
    } catch (_downloadErr) {
      // iOS 或某些浏览器拦截 <a> 下载 → fallback
      onProgress?.('fallback', '请长按图片保存 / 打开新页下载');
      return { status: 'fallback', dataUrl };
    }
  } catch (err) {
    console.error('[exportToPng] error:', err);
    onProgress?.('error', String(err));
    return { status: 'error', message: String(err) };
  }
}

// 打开新标签查看图片（fallback 用）
export function openDataUrlInNewTab(dataUrl: string) {
  const w = window.open();
  if (w) {
    w.document.write(`<img src="${dataUrl}" style="max-width:100%;display:block" />`);
    w.document.title = '报价单预览';
  } else {
    // 最终兜底：用 blobURL
    const blob = dataUrlToBlob(dataUrl);
    const url  = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, body] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/png';
  const bin  = atob(body);
  const arr  = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}
