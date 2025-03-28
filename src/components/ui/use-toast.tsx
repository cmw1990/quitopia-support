import { toast as sonnerToast } from "sonner";

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
}

export const useToast = () => {
  return {
    toast: (options: ToastOptions) => {
      if (options.variant === "destructive") {
        sonnerToast.error(options.title, {
          description: options.description,
        });
      } else if (options.variant === "success") {
        sonnerToast.success(options.title, {
          description: options.description,
        });
      } else {
        sonnerToast(options.title, {
          description: options.description,
        });
      }
    },
    // Add direct methods for easier usage
    success: (title: string, description?: string) => {
      sonnerToast.success(title, { description });
    },
    error: (title: string, description?: string) => {
      sonnerToast.error(title, { description });
    }
  };
}; 