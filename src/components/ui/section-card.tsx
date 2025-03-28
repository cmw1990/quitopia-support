import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "./card";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface SectionCardProps extends React.ComponentPropsWithoutRef<typeof Card> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  delay?: number;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
}

export const SectionCard = ({
  title,
  description,
  icon,
  footer,
  delay = 0,
  className,
  headerClassName,
  contentClassName,
  footerClassName,
  children,
  ...props
}: SectionCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: delay * 0.1,
        ease: [0.4, 0, 0.2, 1]
      }}
      className="h-full"
    >
      <Card className={cn("h-full border shadow-sm", className)} {...props}>
        <CardHeader className={cn("flex flex-row items-center justify-between gap-4", headerClassName)}>
          <div>
            <CardTitle className="text-lg font-medium">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {icon && (
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              {icon}
            </div>
          )}
        </CardHeader>
        <CardContent className={cn("pt-0", contentClassName)}>
          {children}
        </CardContent>
        {footer && (
          <CardFooter className={cn("pt-2", footerClassName)}>
            {footer}
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}; 