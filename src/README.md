# Mission Fresh Micro-Frontend

A quit-smoking application integrated with the Well-Charged platform. This micro-frontend shares the same authentication and database infrastructure as the main application while maintaining its own routing and component structure.

## Features

- **Dashboard**: Track smoke-free days, cigarettes avoided, and money saved
- **Progress Tracking**: Monitor daily cravings and achievements
- **Community Support**: Share experiences and support other quitters
- **Settings**: Customize quit-smoking preferences and notifications

## Directory Structure

```
mission-fresh/
├── components/
│   ├── Dashboard.tsx       # Main dashboard with quit-smoking statistics
│   ├── Progress.tsx       # Progress tracking and visualization
│   ├── Community.tsx      # Community support and interaction
│   ├── Settings.tsx       # User preferences and settings
│   └── MissionFreshLayout.tsx  # Shared layout component
├── page.tsx               # Entry point component
└── MissionFreshApp.tsx    # Main app component with routing
```

## Database Schema

The application uses the following Supabase tables:

- `quit_smoking_stats`: User's overall quit-smoking statistics
- `quit_smoking_progress`: Daily progress tracking
- `quit_smoking_settings`: User preferences and settings
- `community_posts`: Community interaction and support

## Integration with Main App

The micro-frontend is integrated into the main application through:

1. Shared authentication using the singleton Supabase client
2. Dedicated routing at `/mission-fresh/*`
3. Shared UI components from the main application
4. Common database infrastructure

## Development

To run the application:

```bash
npm run dev
```

Access the micro-frontend at: `http://localhost:8002/mission-fresh`

## Security

- Row Level Security (RLS) policies ensure data privacy
- Authentication handled through the main app's AuthProvider
- All database operations use the singleton Supabase client
