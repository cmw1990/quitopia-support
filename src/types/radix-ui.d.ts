declare module '@radix-ui/react-navigation-menu' {
  import React from 'react'

  export interface NavigationMenuContextValue {
    isOpen: boolean
    open: () => void
    close: () => void
    toggle: () => void
  }

  export interface NavigationMenuProps extends React.HTMLAttributes<HTMLDivElement> {
    delayDuration?: number
    skipDelayDuration?: number
    dir?: 'ltr' | 'rtl'
    orientation?: 'horizontal' | 'vertical'
  }

  export interface NavigationMenuListProps extends React.HTMLAttributes<HTMLDivElement> {
    loop?: boolean
  }

  export interface NavigationMenuTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
    disabled?: boolean
  }

  export interface NavigationMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
    alignOffset?: number
    sideOffset?: number
  }

  export const Root: React.ForwardRefExoticComponent<
    NavigationMenuProps & React.RefAttributes<HTMLDivElement>
  >

  export const List: React.ForwardRefExoticComponent<
    NavigationMenuListProps & React.RefAttributes<HTMLDivElement>
  >

  export const Item: React.ComponentType<React.HTMLAttributes<HTMLDivElement>>

  export const Trigger: React.ForwardRefExoticComponent<
    NavigationMenuTriggerProps & React.RefAttributes<HTMLButtonElement>
  >

  export const Content: React.ForwardRefExoticComponent<
    NavigationMenuContentProps & React.RefAttributes<HTMLDivElement>
  >

  export const Link: React.ComponentType<React.AnchorHTMLAttributes<HTMLAnchorElement>>

  export const Viewport: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
  >

  export const Indicator: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
  >

  export function useNavigationMenu(): NavigationMenuContextValue
} 