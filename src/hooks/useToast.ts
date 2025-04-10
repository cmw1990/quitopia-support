import { toast as sonnerToast } from "sonner";

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function useToast() {
  const toast = ({ 
    title, 
    description, 
    variant = "default", 
    duration, 
    action 
  }: ToastProps) => {
    const options: any = {
      duration,
    };

    if (action) {
      options.action = {
        label: action.label,
        onClick: action.onClick,
      };
    }

    if (variant === "destructive") {
      sonnerToast.error(title, {
        description,
        ...options,
      });
    } else if (variant === "success") {
      sonnerToast.success(title, {
        description,
        ...options,
      });
    } else {
      sonnerToast(title, {
        description,
        ...options,
      });
    }
  };

  return { toast };
} 