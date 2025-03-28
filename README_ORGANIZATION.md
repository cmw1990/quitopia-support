# Mission Fresh Codebase Organization

This document explains how the Mission Fresh codebase has been organized and provides instructions for using the organization scripts.

## Directory Structure

The Mission Fresh codebase follows a structured organization pattern to enhance maintainability and reduce duplication. The main structure is:

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

For more detailed information about the organization principles, please refer to [CODE_ORGANIZATION.md](./CODE_ORGANIZATION.md).

## Organization Scripts

The following scripts were created to facilitate the organization of the codebase:

### 1. organize-structure.sh

This script creates a restructured version of the codebase in a new directory called `src-restructured`. It copies files from the original structure to the new structure based on predefined mapping rules.

Usage:
```bash
./scripts/organize-structure.sh
```

### 2. fix-imports.js

This script analyzes the restructured codebase and fixes import statements to reflect the new file locations. It's particularly useful for fixing absolute imports that may have broken during restructuring.

Usage:
```bash
node scripts/fix-imports.js
```

### 3. switch-to-new-structure.sh

This script switches from the old structure to the new structure by renaming directories. It creates a timestamped backup of the original `src` directory before making changes.

Usage:
```bash
./scripts/switch-to-new-structure.sh
```

## How to Use the Organization System

### For Existing Code

1. Run the organization script to create a restructured version of the codebase:
   ```bash
   ./scripts/organize-structure.sh
   ```

2. Fix any broken imports in the restructured codebase:
   ```bash
   node scripts/fix-imports.js
   ```

3. Test the restructured codebase to make sure everything works correctly.

4. Switch to the new structure when ready:
   ```bash
   ./scripts/switch-to-new-structure.sh
   ```

### For New Code

When adding new code to the codebase, follow these guidelines:

1. **Pages**: Add new pages to the appropriate subdirectory under `src/pages/`.

2. **Components**: 
   - Common components go in `src/components/common/`
   - UI components go in `src/components/ui/`
   - Feature-specific components go in `src/components/features/{feature-name}/`

3. **API Services**: Add new API services to `src/api/`.

4. **Contexts and Hooks**: Add new contexts to `src/contexts/` and hooks to `src/hooks/`.

## Benefits of the Organization

- **Reduced duplication**: Similar functionality is grouped together, making it easier to reuse existing code.
- **Better discoverability**: Clear organization makes it easier to find files.
- **Easier maintenance**: Related files are grouped together.
- **Scalability**: The structure can accommodate new features without becoming disorganized.
- **Onboarding**: New developers can quickly understand the codebase organization.

## Troubleshooting

If you encounter issues with the organization:

1. **Broken imports**: Run the fix-imports.js script to fix broken import statements.
2. **Missing files**: Check the organization script output for any errors or skipped files.
3. **Revert to original**: If necessary, you can revert to the original structure using the command provided by the switch script.

For any questions or issues, please contact the development team. 