# Notice Board Dashboard

A React + Vite + TypeScript dashboard for students and teachers to manage notices. The app uses Tailwind CSS for styling and Supabase for backend data storage.

## Features

- Student and teacher dashboards
- Create and manage notices
- Category, department, and priority filters
- Animated form and dropdown UI
- Supabase integration for database and authentication

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn
- Supabase project configured with the provided SQL migrations

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

### Type checking

```bash
npm run typecheck
```

## Project structure

- `src/` - application source code
  - `components/` - reusable UI components
  - `pages/` - page-level views
  - `contexts/` - React context providers
  - `lib/` - shared utilities and types
- `supabase/migrations/` - SQL migrations for database schema and seeds
- `vite.config.ts` - Vite configuration
- `tailwind.config.js` - Tailwind CSS configuration

## Notes

- The app uses native `<select>` elements for dropdowns and global CSS animation is applied in `src/index.css`.
- Ensure your Supabase `supabaseUrl` and `supabaseKey` values are configured in `src/lib/supabase.ts` or environment variables.

## License

This project is currently unlicensed.
