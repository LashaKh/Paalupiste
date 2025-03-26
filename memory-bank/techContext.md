# Technical Context

## Technology Stack

### Frontend
- **Framework**: React 18.2.0 with TypeScript 5.2.2
- **Build Tool**: Vite 4.4.11
- **Styling**: Tailwind CSS 3.3.3
- **Type Checking**: TypeScript (strict mode)
- **Routing**: React Router DOM 6.17.0

### Backend
- **Platform**: Supabase
- **Services**:
  - Database
  - Authentication (@supabase/supabase-js 2.38.4)
  - Real-time subscriptions (available through Supabase)

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint
- **Code Formatting**: Configured through ESLint
- **Version Control**: Git
- **Editor Support**: Monaco Editor (@monaco-editor/react 4.5.2)

### UI Components and Utilities
- **Table Management**: @tanstack/react-table 8.10.7
- **Icons**: lucide-react 0.292.0
- **Animation**: framer-motion 12.5.0
- **Date Handling**: date-fns 4.1.0
- **PDF Generation**: html2pdf.js 0.10.1, jspdf 2.5.1
- **Data Processing**: papaparse 5.4.1, xlsx 0.18.5
- **Utility Libraries**: clsx, tailwind-merge, uuid 9.0.1

### Deployment
- **Platform**: Netlify
- **CI/CD**: Netlify's built-in CI/CD
- **Node Requirement**: >= 18.0.0

## Project Structure
```
src/
├── assets/      # Static assets
├── components/  # Reusable UI components
├── contexts/    # React context providers
├── hooks/       # Custom React hooks
├── lib/         # Utility functions and constants
├── pages/       # Route components
├── types/       # TypeScript type definitions
└── main.tsx     # Application entry point
```

## Development Setup
1. Node.js environment (v18.0.0 or higher)
2. npm for package management
3. Environment variables in `.env`
4. Supabase project configuration

## Technical Constraints
- TypeScript strict mode enabled
- ESLint rules defined in `eslint.config.js`
- Tailwind configuration in `tailwind.config.js`
- Vite as the build tool and dev server

## Environment Configuration
Environment variables required:
- Supabase configuration
- API endpoints and keys
- Environment-specific settings

Note: This document will be updated as the technical stack evolves. 