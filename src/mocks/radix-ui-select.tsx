import * as React from 'react';

// Common props for all components
interface CommonProps {
  className?: string;
  [key: string]: any;
}

// Root component props
interface RootProps extends CommonProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
}

// Basic mock components
export const Root = React.forwardRef<HTMLDivElement, RootProps>(
  ({ defaultValue, value, onValueChange, className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    );
  }
);

export const Trigger = React.forwardRef<HTMLButtonElement, CommonProps>(
  ({ className, children, ...props }, ref) => (
    <button type="button" ref={ref} className={className} {...props}>
      {children}
    </button>
  )
);

export const Value = React.forwardRef<HTMLSpanElement, CommonProps>(
  ({ className, children, placeholder, ...props }, ref) => (
    <span ref={ref} className={className} {...props}>
      {children || placeholder}
    </span>
  )
);

export const Icon = React.forwardRef<HTMLSpanElement, CommonProps>(
  ({ className, children, ...props }, ref) => (
    <span ref={ref} className={className} {...props}>
      {children}
    </span>
  )
);

export const Portal = React.forwardRef<HTMLDivElement, CommonProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  )
);

export const Content = React.forwardRef<HTMLDivElement, CommonProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  )
);

export const Viewport = React.forwardRef<HTMLDivElement, CommonProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  )
);

export const Group = React.forwardRef<HTMLDivElement, CommonProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  )
);

export const Label = React.forwardRef<HTMLDivElement, CommonProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  )
);

export const Item = React.forwardRef<HTMLDivElement, CommonProps & { value: string }>(
  ({ className, children, value, ...props }, ref) => (
    <div ref={ref} data-value={value} className={className} {...props}>
      {children}
    </div>
  )
);

export const ItemText = React.forwardRef<HTMLSpanElement, CommonProps>(
  ({ className, children, ...props }, ref) => (
    <span ref={ref} className={className} {...props}>
      {children}
    </span>
  )
);

export const ItemIndicator = React.forwardRef<HTMLSpanElement, CommonProps>(
  ({ className, children, ...props }, ref) => (
    <span ref={ref} className={className} {...props}>
      {children}
    </span>
  )
);

export const Separator = React.forwardRef<HTMLDivElement, CommonProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={className} {...props} />
  )
);

export const Arrow = React.forwardRef<HTMLDivElement, CommonProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={className} {...props} />
  )
);

export const ScrollUpButton = React.forwardRef<HTMLDivElement, CommonProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  )
);

export const ScrollDownButton = React.forwardRef<HTMLDivElement, CommonProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  )
);

// Set display names
Root.displayName = 'Select.Root';
Trigger.displayName = 'Select.Trigger';
Value.displayName = 'Select.Value';
Icon.displayName = 'Select.Icon';
Portal.displayName = 'Select.Portal';
Content.displayName = 'Select.Content';
Viewport.displayName = 'Select.Viewport';
Group.displayName = 'Select.Group';
Label.displayName = 'Select.Label';
Item.displayName = 'Select.Item';
ItemText.displayName = 'Select.ItemText';
ItemIndicator.displayName = 'Select.ItemIndicator';
Separator.displayName = 'Select.Separator';
Arrow.displayName = 'Select.Arrow';
ScrollUpButton.displayName = 'Select.ScrollUpButton';
ScrollDownButton.displayName = 'Select.ScrollDownButton';

// Export the namespace
const Select = {
  Root,
  Trigger,
  Value,
  Icon,
  Portal,
  Content,
  Viewport,
  Group,
  Label,
  Item,
  ItemText,
  ItemIndicator,
  Separator,
  Arrow,
  ScrollUpButton,
  ScrollDownButton,
};

export default Select; 