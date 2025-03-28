# Changelog

## [Unreleased]

### Added
- Real-time health improvement tracking using Supabase REST API
- SQL migration to create `health_improvements` and `default_health_improvements` tables
- Migration script for applying SQL changes to Supabase
- Detailed fallback mechanism for when API calls fail
- Automatic calculation of health improvement achievement status

### Changed
- Replaced mock implementation of `getHealthImprovements` with real Supabase REST API calls
- Updated `HealthImprovementTimeline` component to use real data
- Enhanced error handling in API endpoints
- Improved type definitions for health improvement interfaces

### Fixed
- TypeScript errors related to the `HealthImprovement` interface
- Fixed issue with `timeline_hours` property not being properly handled
- Resolved console errors from missing achievement status calculations
- Ensured consistent display of health improvements between different environments

## [0.1.0] - 2025-03-26

### Initial Release
- Basic smoke cessation tracking app
- Health improvement timeline with mock data
- User authentication with Supabase
- Progress tracking features 