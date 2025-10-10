# OpenConference

A modern conferencing platform built for networking and collaboration.

## Features

- **Conference Management**: Create and manage multi-day conferences
- **Attendee Discovery**: Browse and connect with other conference attendees
- **Meeting Scheduling**: Create private or public meetings with time-based scheduling
- **Interactive Calendar**: Google Calendar-style view for all your meetings
- **Invitation System**: Invite specific attendees to private meetings
- **Real-time Updates**: Built on Convex for real-time data synchronization

## Tech Stack

- **Frontend**: React 19, Vite, TanStack Router, TanStack Form, TanStack Query
- **Backend**: Convex (serverless backend with real-time data)
- **Auth**: Clerk
- **Styling**: Tailwind CSS 4, daisyUI 5
- **Testing**: Playwright (e2e tests)
- **TypeScript**: Full type safety across the stack

## Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local
# Add your Clerk and Convex keys to .env.local

# Start development servers
pnpm dev
```

## Project Structure

```
├── convex/
│   ├── schema.ts              # Database schema
│   ├── conferences.ts         # Conference queries/mutations
│   ├── meetings.ts            # Meeting queries/mutations
│   └── users.ts               # User queries/mutations
├── src/
│   ├── components/
│   │   └── Calendar.tsx       # Pure calendar component
│   ├── routes/
│   │   ├── index.tsx          # Conference list
│   │   ├── conferences/
│   │   │   ├── new.tsx        # Create conference
│   │   │   └── $conferenceId.tsx  # Conference detail
│   │   └── conferences/$conferenceId/meetings/
│   │       ├── new.tsx        # Create meeting
│   │       └── $meetingId.tsx # Meeting detail
│   └── main.tsx
└── e2e/
    └── openconference.spec.ts # Comprehensive e2e tests
```

## Database Schema

### Tables

- **users**: User profiles with bio
- **conferences**: Public conferences with start/end dates
- **conferenceAttendees**: Join table for conference membership
- **meetings**: Time-based meetings (public or private)
- **meetingAttendees**: Meeting invitations with status tracking

### Meeting Statuses

- `owner`: Created the meeting
- `accepted`: Accepted the invitation
- `pending`: Invitation sent, awaiting response
- `rejected`: Declined the invitation

## Development

```bash
# Run linter
pnpm lint

# Run e2e tests
pnpm test:e2e

# Run e2e tests with UI
pnpm test:e2e:ui

# Build for production
pnpm build
```

## Key Features Implementation

### Pure Calendar Component

The calendar component (`src/components/Calendar.tsx`) is designed to be:
- **Pure**: Props-based, no external data dependencies
- **Reusable**: Can be used in any context
- **Testable**: Easy to test with different event configurations
- **Styled**: Google Calendar-like interface with week/day views

Example usage:
```tsx
<Calendar
  events={meetings.map(m => ({
    id: m._id,
    title: m.title,
    startTime: new Date(m.startTime),
    endTime: new Date(m.endTime),
    color: m.isPublic ? "#3b82f6" : "#8b5cf6",
  }))}
  view="week"
  onEventClick={(event) => navigate(event.id)}
/>
```

## Testing Strategy

The e2e tests cover key user flows:
1. Conference creation
2. Joining conferences and browsing attendees
3. Creating meetings (public and private)
4. Inviting attendees to meetings
5. Viewing meetings in different tabs
6. Calendar navigation
7. Joining public meetings
8. Full conference lifecycle

## License

MIT
