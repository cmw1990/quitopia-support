
import { ToastOptions, toast as toastFn } from "@/components/ui/toast";

export const useToast = () => {
  return {
    toast: (options: ToastOptions) => {
      toastFn(options);
    },
    toasts: [] as ToastOptions[],
  };
};

export const toast = (options: ToastOptions) => {
  toastFn(options);
};
