# Tale Forge Frontend

This is the frontend application for Tale Forge, built with React, TypeScript, and Tailwind CSS.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

## Development

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser to `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check for code issues
- `npm run lint:fix` - Run ESLint and automatically fix fixable issues
- `npm run format` - Format code with Prettier
- `npm run test` - Run unit tests with Vitest
- `npm run test:ui` - Run unit tests with Vitest UI
- `npm run test:coverage` - Run unit tests and generate coverage report

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── atoms/         # Basic building blocks (Button, Text, etc.)
│   ├── molecules/     # Compound components (StoryCard, AudioPlayer, etc.)
│   ├── organisms/     # Complex components (StoryCreationWizard, etc.)
│   ├── templates/     # Page templates
│   ├── layout/        # Layout components (MainLayout, AuthenticatedLayout, etc.)
│   ├── navigation/    # Navigation components
│   └── routes/        # Route protection components
├── pages/             # Page components organized by route
│   ├── public/        # Public pages (Home, Features, etc.)
│   ├── auth/          # Authentication pages (Signin, Signup, etc.)
│   ├── authenticated/  # Authenticated user pages
│   ├── admin/         # Admin pages
│   └── legal/         # Legal pages (Privacy, Terms, etc.)
├── providers/         # React context providers
├── routes/            # Route configuration
├── utils/             # Utility functions and hooks
├── test/              # Test files
└── assets/            # Static assets (images, icons, etc.)
```

## Environment Variables

The frontend requires the following environment variables to be set in a `.env` file in the root of the `tale-forge` directory:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `VITE_BASE_URL` - The base URL of your application (e.g., http://localhost:3000)

## Routing

The application uses React Router v6 for routing. Routes are organized into three main categories:

1. Public Routes - Accessible to all users
2. Authenticated Routes - Accessible only to authenticated users
3. Admin Routes - Accessible only to admin users

## Styling

The application uses Tailwind CSS for styling. Custom configurations can be found in `tailwind.config.js`.

## Testing

Tests are written with Vitest and React Testing Library. Test files are located alongside the components they test with a `.test.tsx` extension.

## Deployment

To build the application for production:

```bash
npm run build
```

The built files will be in the `dist/` directory and can be served with any static file server.

## Troubleshooting

For common issues and solutions, see the main [TROUBLESHOOTING.md](../TROUBLESHOOTING.md) guide.