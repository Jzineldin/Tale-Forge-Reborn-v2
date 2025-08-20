# Tale Forge

AI-powered interactive storytelling platform for children aged 4-12, creating personalized, educational, and safe story experiences with AI-generated images and voice narration.

## Features

- Interactive storytelling with AI-generated content
- Age-appropriate stories for children 4-12
- AI-generated images and voice narration
- Safe, moderated content with educational value
- Parental controls and family-friendly features

## Tech Stack

- **Frontend**: React 18.3 with TypeScript and Vite
- **Backend**: Supabase Edge Functions with Deno
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth
- **AI Providers**: 
  - Text Generation: OpenAI GPT-4o-mini
  - Image Generation: OVH AI Endpoints (Stable Diffusion XL)
  - Voice Generation: ElevenLabs API

## Project Structure

```
tale-forge/
├── frontend/          # React frontend application
├── backend/           # Supabase Edge Functions
├── shared/            # Shared utilities and types
├── README.md
├── .gitignore
├── package.json
└── tsconfig.json
```

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

This project uses GitHub Actions for CI/CD with automatic deployments to staging and production environments.