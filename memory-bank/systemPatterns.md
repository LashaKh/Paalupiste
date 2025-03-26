# System Patterns

## Architecture Overview
- Single Page Application (SPA) built with React and TypeScript
- Supabase for backend services and real-time data
- Component-based UI architecture with modular design
- Client-side routing with React Router

## Design Patterns
### Component Patterns
- Functional components with hooks
- Custom hooks for reusable logic
- Context providers for state management
- Higher-order components where needed

### State Management
- React Context for global state
- Local component state with useState
- Custom hooks for complex state logic
- Supabase real-time subscriptions for data sync

### Data Flow
- Top-down props passing
- Context for global state
- Custom hooks for data fetching
- Supabase client for backend communication

## Component Relationships
### Core Structure
```
App
├── Contexts (Global state)
├── Pages (Route components)
│   └── Page-specific components
├── Shared Components
│   ├── UI Components
│   └── Layout Components
└── Hooks (Shared logic)
```

## Key Technical Decisions
1. TypeScript for type safety and developer experience
2. Tailwind CSS for utility-first styling
3. Supabase for backend services and real-time features
4. Netlify for automated deployment and hosting
5. Vite for fast development and optimized builds
6. React Router for client-side routing
7. Custom hooks for reusable logic

## Security Patterns
- Environment variables for sensitive data
- Supabase authentication
- Type-safe API calls
- Protected routes implementation

## Performance Patterns
- Code splitting with React Router
- Lazy loading of components
- Optimized builds with Vite
- Efficient state management
- Tailwind CSS for optimized styling

Note: This document will be updated as system patterns are identified and implemented. 