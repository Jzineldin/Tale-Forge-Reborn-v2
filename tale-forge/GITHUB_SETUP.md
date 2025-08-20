# GitHub Repository Setup Instructions

This document provides step-by-step instructions for initializing the Tale Forge project as a GitHub repository with the appropriate settings.

## Prerequisites

1. Git installed on your local machine
2. A GitHub account
3. GitHub CLI installed (optional but recommended)

## Local Repository Initialization

1. Navigate to the project directory:
   ```bash
   cd tale-forge
   ```

2. Initialize the Git repository:
   ```bash
   git init
   ```

3. Add all files to the repository:
   ```bash
   git add .
   ```

4. Commit the initial files:
   ```bash
   git commit -m "Initial commit: Project structure for Tale Forge"
   ```

## GitHub Repository Creation

### Option 1: Using GitHub CLI (Recommended)

1. Create a new repository on GitHub:
   ```bash
   gh repo create tale-forge --public --push --remote=origin
   ```

### Option 2: Using GitHub Web Interface

1. Go to https://github.com/new
2. Enter repository name: `tale-forge`
3. Add description: "AI-powered interactive storytelling platform for children aged 4-12, creating personalized, educational, and safe story experiences with AI-generated images and voice narration."
4. Set repository to Public
5. Do not initialize with README, .gitignore, or license
6. Click "Create repository"
7. Follow the instructions to push an existing repository

## Branch Protection Rules Setup

After creating the repository, set up branch protection rules for main and staging branches:

1. Go to your repository on GitHub
2. Navigate to Settings > Branches
3. Click "Add rule" for the main branch:
   - Branch name pattern: `main`
   - Check "Require pull request reviews before merging"
   - Check "Require status checks to pass before merging"
   - Check "Require branches to be up to date before merging"
   - Check "Include administrators" (optional but recommended)
   - Click "Create"

4. Click "Add rule" for the staging branch:
   - Branch name pattern: `staging`
   - Check "Require pull request reviews before merging"
   - Check "Require status checks to pass before merging"
   - Check "Require branches to be up to date before merging"
   - Click "Create"

## Environment Setup

Set up deployment environments for staging and production:

1. Go to your repository on GitHub
2. Navigate to Settings > Environments
3. Click "New environment"
4. Create a "staging" environment
5. Create a "production" environment

## GitHub Secrets (for CI/CD)

Set up the necessary secrets for CI/CD:

1. Go to your repository on GitHub
2. Navigate to Settings > Secrets and variables > Actions
3. Add the following secrets:
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `OVH_AI_API_KEY` - Your OVH AI API key
   - `ELEVENLABS_API_KEY` - Your ElevenLabs API key
   - `STRIPE_SECRET_KEY` - Your Stripe secret key

## Deployment Configuration

The project uses GitHub Actions for CI/CD with automatic deployments:

- Pushes to the `staging` branch will trigger deployment to the staging environment
- Pushes to the `main` branch will trigger deployment to the production environment

Configure your deployment scripts in the `.github/workflows/ci.yml` file according to your hosting provider's requirements.

## Collaborator Access

To add collaborators to the repository:

1. Go to your repository on GitHub
2. Navigate to Settings > Collaborators and teams
3. Click "Add people"
4. Enter the GitHub username of the collaborator
5. Select appropriate permissions (Read, Triage, Write, Maintain, or Admin)

## Repository Webhooks

Set up any necessary webhooks for integrations:

1. Go to your repository on GitHub
2. Navigate to Settings > Webhooks
3. Click "Add webhook"
4. Configure the webhook according to your integration requirements