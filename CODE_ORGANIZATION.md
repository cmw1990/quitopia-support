# Mission Fresh Code Organization

This document provides an overview of the codebase organization for the Mission Fresh project. The goal of this restructuring is to create a more maintainable and scalable codebase by organizing files in a logical and consistent manner.

## Directory Structure

```
src/
├── api/                # API clients and services
├── assets/             # Static assets (images, fonts, etc.)
├── components/         # Reusable UI components
│   ├── analytics/      # Analytics-related components
│   ├── common/         # Common components used throughout the app
│   ├── features/       # Feature-specific components
│   ├── games/          # Game components
│   ├── health/         # Health tracking components
│   ├── layouts/        # Layout components
│   ├── routing/        # Routing components
│   └── ui/             # UI components (buttons, cards, etc.)
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── pages/              # Page components
│   ├── app/            # Authenticated app pages
│   ├── auth/           # Authentication pages
│   ├── errors/         # Error pages
│   ├── health/         # Health pages
│   ├── public/         # Public pages
│   ├── tracking/       # Tracking pages
│   └── tools/          # Tools pages
├── routes/             # Route definitions
├── styles/             # Global styles
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Organization Principles

### 1. Separation of Concerns

The codebase is organized by type and responsibility, with a clear separation between:
- **Pages**: Container components that represent entire routes
- **Components**: Reusable UI elements and feature-specific components
- **API**: Data fetching and state management
- **Utils**: Helper functions and utilities

### 2. Feature Modularity

Feature-specific code is grouped together in the `components/features` directory, making it easier to:
- Find all related components for a specific feature
- Understand the relationships between components
- Add, modify, or remove features with minimal impact on the rest of the codebase

### 3. UI Component Library

Generic UI components are separated in `components/ui`, creating a reusable component library that:
- Ensures consistent styling across the application
- Reduces duplication of common UI patterns
- Makes it easier to apply design system changes

## Key Directories Explained

### Pages

Pages represent entire routes in the application and are organized by access level and functionality:

- **app/**: Authenticated application pages (dashboard, profile, etc.)
- **auth/**: Authentication-related pages (login, register, etc.)
- **errors/**: Error pages (404, unauthorized, etc.)
- **health/**: Health-tracking related pages
- **public/**: Publicly accessible pages
- **tracking/**: Tracking-related pages (cravings, consumption, etc.)
- **tools/**: Tool pages (NRT directory, guides, etc.)

### Components

Components are organized by their purpose and level of reusability:

- **common/**: Highly reusable components used throughout the app
- **features/**: Feature-specific components that implement business logic
- **layouts/**: Layout components that structure the UI
- **ui/**: Atomic UI components used as building blocks

### API & Services

All data access is centralized in the `api` directory:

- API clients for communicating with backend services
- Services for abstracting complex API interactions
- Types and utilities specific to API usage

## Navigation Guidelines

When looking for a specific piece of functionality:

1. **For pages and routes**: Check the `pages` directory first, organized by feature area.
2. **For components**: Start with `components/features` for feature-specific components, then check `components/common` and `components/ui` for more generic components.
3. **For data fetching**: Check the `api` directory for service functions and API clients.
4. **For state management**: Look in `contexts` for React context providers and `hooks` for custom hooks that provide state.

## Development Guidelines

When adding new code:

1. **New pages**: Add to the appropriate subdirectory in `pages`.
2. **New components**:
   - If it's specific to a feature, add to `components/features/{feature-name}`.
   - If it's a reusable UI element, add to `components/ui`.
   - If it's a common component used across features, add to `components/common`.
3. **New API services**: Add to `api` directory.
4. **New utilities**: Add to `utils` directory.

## Migration Timeline

This restructuring was implemented on [Date], with the following steps:

1. Created a backup of the original `src` directory as `src-backup`.
2. Created a new structure in `src-restructured`.
3. Migrated files from old structure to new structure according to the organization plan.
4. Fixed import paths to reflect the new file locations.
5. Tested the application with the new structure.
6. Switched from old structure to new structure.

## Benefits of the New Structure

1. **Reduced duplication**: Centralizing common components and utilities
2. **Better discoverability**: Clear organization makes it easier to find files
3. **Easier maintenance**: Related files are grouped together
4. **Scalability**: Structure can accommodate new features without becoming disorganized
5. **Onboarding**: New developers can quickly understand the codebase organization 