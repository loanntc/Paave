import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';
import { Toast, ToastType } from '@/src/components/ui/Toast';

interface ToastData {
  message: string;
  type: ToastType;
  id: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

let toastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastData | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    toastId += 1;
    setToast({ message, type, id: toastId });
  }, []);

  const handleDismiss = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          visible={true}
          onDismiss={handleDismiss}
        />
      )}
    </ToastContext.Provider>
  );
}
