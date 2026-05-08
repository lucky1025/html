// 导出失败 Fallback 弹窗
import { openDataUrlInNewTab } from '../utils/exportPng';

interface ExportFallbackProps {
  dataUrl?: string;
  onClose: () => void;
}

export function ExportFallback({ dataUrl, onClose }: ExportFallbackProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
        <h3 className="text-base font-bold text-gray-800 mb-3">保存提示</h3>
        <p className="text-sm text-gray-600 mb-4">
          当前浏览器限制自动下载。请长按下方图片保存，或点击"在新页打开"后另存为图片。
        </p>
        {dataUrl && (
          <img src={dataUrl} alt="报价单预览"
            className="w-full rounded-lg border mb-4 cursor-pointer"
            style={{ touchAction: 'manipulation' }} />
        )}
        <div className="flex gap-2">
          {dataUrl && (
            <button
              className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 cursor-pointer border-none"
              onClick={() => { openDataUrlInNewTab(dataUrl); onClose(); }}>
              在新页打开图片
            </button>
          )}
          <button
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 cursor-pointer border-none"
            onClick={onClose}>
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
