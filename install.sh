#!/bin/bash

# Install npm dependencies
npm install

# Install additional Radix UI components
npm install @radix-ui/react-alert-dialog @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-progress \
  @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slot \
  @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-tooltip \
  @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-navigation-menu \
  @radix-ui/react-slider

# Install styling dependencies
npm install class-variance-authority clsx tailwind-merge tailwindcss-animate

# Install additional utilities
npm install cmdk date-fns sonner
