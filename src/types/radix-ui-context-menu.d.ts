declare module '@radix-ui/react-context-menu' {
  import React from 'react'

  export interface ContextMenuProps extends React.HTMLAttributes<HTMLDivElement> {
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }

  export interface ContextMenuTriggerProps extends React.HTMLAttributes<HTMLDivElement> {}

  export interface ContextMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
    align?: 'start' | 'center' | 'end'
    side?: 'top' | 'right' | 'bottom' | 'left'
    sideOffset?: number
    alignOffset?: number
  }

  export interface ContextMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
    disabled?: boolean
  }

  export interface ContextMenuCheckboxItemProps extends React.HTMLAttributes<HTMLDivElement> {
    checked?: boolean
    onCheckedChange?: (checked: boolean) => void
  }

  export interface ContextMenuRadioItemProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string
  }

  export const Root: React.ComponentType<ContextMenuProps>
  export const Trigger: React.ComponentType<ContextMenuTriggerProps>
  export const Content: React.ForwardRefExoticComponent<
    ContextMenuContentProps & React.RefAttributes<HTMLDivElement>
  >
  export const Item: React.ForwardRefExoticComponent<
    ContextMenuItemProps & React.RefAttributes<HTMLDivElement>
  >
  export const CheckboxItem: React.ForwardRefExoticComponent<
    ContextMenuCheckboxItemProps & React.RefAttributes<HTMLDivElement>
  >
  export const RadioItem: React.ForwardRefExoticComponent<
    ContextMenuRadioItemProps & React.RefAttributes<HTMLDivElement>
  >
  export const Label: React.ComponentType<React.HTMLAttributes<HTMLDivElement>>
  export const Separator: React.ComponentType<React.HTMLAttributes<HTMLDivElement>>
  export const Group: React.ComponentType<React.HTMLAttributes<HTMLDivElement>>
  export const Portal: React.ComponentType<React.HTMLAttributes<HTMLDivElement>>
  export const Sub: React.ComponentType<React.HTMLAttributes<HTMLDivElement>>
  export const SubTrigger: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
  >
  export const SubContent: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
  >
} 