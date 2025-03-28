# Mission Fresh - Folder Restructure Plan

## Current Issues

1. **Ridiculous Nesting**: There's a redundant `micro-frontends/mission-fresh` inside `micro-frontends/mission-fresh`. This creates unnecessary depth and confusion.

2. **Mixed Responsibilities**: Components that should be pages are in the components directory and vice versa.

3. **Inconsistent Structure**: Multiple folders for the same purpose (e.g., `layouts/` and `layout/`, `contexts/` and `context/`).

4. **Monolithic Components**: Many components are too large (some over 1500 lines) and should be broken down.

5. **Poor Feature Grouping**: Related features are scattered across different directories.

## Proposed Folder Structure

```
/micro-frontends/mission-fresh/
├── src/
│   ├── assets/                    # Static assets (images, icons, etc.)
│   ├── pages/                     # Top-level page components (one per route)
│   │   ├── auth/                  # Authentication pages
│   │   ├── dashboard/             # Dashboard pages
│   │   ├── tracking/              # Tracking-related pages
│   │   ├── directories/           # NRT and alternatives directory pages
│   │   ├── health/                # Health tracking pages
│   │   ├── community/             # Community feature pages
│   │   ├── tools/                 # Support tool pages
│   │   └── settings/              # Settings pages
│   ├── components/                # Reusable components
│   │   ├── common/                # Generic components used across features
│   │   │   ├── Button/
│   │   │   ├── Form/
│   │   │   └── ...
│   │   ├── features/              # Feature-specific components
│   │   │   ├── tracking/          # Tracking-related components
│   │   │   ├── health/            # Health-related components
│   │   │   ├── community/         # Community-related components
│   │   │   └── ...
│   │   ├── layouts/               # Layout components
│   │   └── ui/                    # UI library components (shadcn/ui)
│   ├── hooks/                     # Custom React hooks
│   ├── contexts/                  # React contexts for state management
│   ├── api/                       # API integration (REST calls)
│   ├── utils/                     # Utility functions
│   ├── lib/                       # Third-party library integrations
│   ├── types/                     # TypeScript type definitions
│   ├── styles/                    # Global styles
│   ├── store/                     # State management (if needed)
│   ├── routes/                    # Route definitions
│   │   ├── index.tsx              # Main router
│   │   ├── publicRoutes.tsx       # Public routes
│   │   ├── appRoutes.tsx          # Protected app routes
│   │   └── webToolsRoutes.tsx     # Web tools routes
│   └── i18n/                      # Internationalization
├── public/                        # Public assets
└── ...other config files
```

## Clean-up Tasks

1. **Eliminate Redundant Nesting**:
   - Remove the nested `micro-frontends/mission-fresh` folder
   - Move any unique content to the parent folder

2. **Reorganize Components**:
   - Move page components from `components/` to `pages/`
   - Group related components in feature-specific folders
   - Break down large components into smaller, more focused ones

3. **Consolidate Duplicate Folders**:
   - Merge `context/` and `contexts/`
   - Merge `layout/` and `layouts/`

4. **Implement Consistent Route Structure**:
   - Update router files to follow the structure defined in ROUTE_ANALYSIS.md
   - Reorganize page components to match the route structure

5. **Clean Up Unused Files**:
   - Remove `.new` or backup files
   - Archive or remove test files that are no longer needed

## Implementation Approach

To safely restructure without breaking the application, we'll follow these steps:

1. **Create the New Structure** in a temporary folder (e.g., `src-new`)
2. **Copy and Reorganize Files** into the new structure
3. **Update Imports** to reflect the new file locations
4. **Test the New Structure** thoroughly
5. **Replace the Old Structure** once testing is complete

This plan addresses both the navigation issues and the folder structure problems, resulting in a cleaner, more maintainable codebase that follows industry best practices. 