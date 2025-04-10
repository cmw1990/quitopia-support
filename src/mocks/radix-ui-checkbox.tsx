import * as React from 'react';

interface CheckboxProps {
  defaultChecked?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
  id?: string;
  [key: string]: any;
}

export const Root = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ checked, defaultChecked, onCheckedChange, disabled, required, name, value, id, ...props }, ref) => {
    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={checked ?? defaultChecked ?? false}
        disabled={disabled}
        ref={ref}
        {...props}
        onClick={() => onCheckedChange?.(!(checked ?? defaultChecked ?? false))}
      />
    );
  }
);

Root.displayName = "Checkbox.Root";

export const Indicator = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  (props, ref) => {
    return <span ref={ref} {...props} />;
  }
);

Indicator.displayName = "Checkbox.Indicator";

// Export the namespace
const Checkbox = { Root, Indicator };
export default Checkbox; 