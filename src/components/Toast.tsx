// Toast 轻提示
import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}

export function Toast({ message, type = 'info', duration = 2000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  const bgMap: Record<string, string> = {
    success: 'bg-green-600',
    error:   'bg-red-600',
    warning: 'bg-amber-500',
    info:    'bg-gray-800',
  };

  return (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-5 py-2.5 rounded-full text-white text-sm font-medium shadow-xl transition-all duration-300 ${bgMap[type]} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      {message}
    </div>
  );
}

interface ToastItem {
  id: number;
  message: string;
  type?: ToastProps['type'];
  duration?: number;
}

let _counter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = (message: string, type: ToastProps['type'] = 'info', duration = 2000) => {
    const id = ++_counter;
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const remove = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  const ToastContainer = () => (
    <>
      {toasts.map(t => (
        <Toast key={t.id} message={t.message} type={t.type} duration={t.duration} onClose={() => remove(t.id)} />
      ))}
    </>
  );

  return { show, ToastContainer };
}
