import { Loader2, type LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps extends Partial<LucideProps> {
  size?: number;
}

export function Loader({ size = 16, className, ...props }: LoaderProps) {
  return (
    <Loader2
      className={cn("animate-spin", className)}
      size={size}
      {...props}
    />
  );
} 