# Community Challenges Feature

## Overview
The Community Challenges feature allows users to participate in group challenges related to smoking cessation. It provides a structured way for users to work towards goals, earn rewards, and stay motivated through community accountability.

## Components
- `CommunityChallenges.tsx`: Main component for displaying and interacting with challenges
- `challenge_tables.sql`: Database schema for challenge-related tables

## Features
- **Challenge Categories**: Active, upcoming, and completed challenges
- **Challenge Difficulty Levels**: Easy, medium, and hard challenges with corresponding rewards
- **Progress Tracking**: Visual progress indicators for each challenge
- **Task Completion**: Interactive task checkboxes to mark progress
- **Reward Points**: Points earned for completing challenges and tasks
- **User Participation**: Ability to join challenges and track progress

## Database Schema
The feature uses three main tables:
1. `challenges`: Stores challenge information (title, description, difficulty, dates, rewards)
2. `challenge_tasks`: Stores tasks associated with each challenge
3. `challenge_progress`: Tracks user progress on challenges

## Implementation Details
- Uses Supabase for data storage and retrieval
- Implements row-level security (RLS) policies for data protection
- Includes a points system integrated with the user profile
- Provides a responsive UI that works across device sizes
- Uses optimistic UI updates for a smoother user experience

## Usage
The Community Challenges feature is accessible from the main navigation menu. Users can:
1. Browse active, upcoming, and completed challenges
2. Join challenges that interest them
3. Complete tasks to make progress in challenges
4. Earn points for completed challenges and tasks
5. Track their progress visually

## Integration
This feature is integrated with:
- User authentication system
- Profile points system
- Main navigation

## Future Enhancements
- Social sharing of challenge milestones
- Leaderboards for completed challenges
- Challenge creation interface for community moderators

## Getting Started for Developers
To work with the Community Challenges feature:

1. Review the database schema in `challenge_tables.sql`
2. Ensure the Supabase tables are properly set up
3. Study the `CommunityChallenges.tsx` component for UI implementation
4. Test the feature by joining and completing challenges

## Dependencies
- React 18.3.1
- TypeScript
- Supabase 2.48.1
- shadcn/ui components
- Tailwind CSS
- Lucide React icons 