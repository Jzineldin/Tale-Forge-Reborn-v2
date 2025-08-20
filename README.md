# Tale Forge - AI-Powered Interactive Storytelling Platform

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/react-18.3-blue.svg)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/supabase-2.0-green.svg)](https://supabase.io/)

Tale Forge is an AI-powered interactive storytelling platform designed specifically for children aged 4-12. It creates personalized, educational, and safe story experiences where children make choices that shape the narrative, accompanied by AI-generated images and optional voice narration.

## 🚀 Quick Setup Guide

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- A Supabase account
- API keys for:
  - OpenAI
  - OVH AI (for image generation)
  - ElevenLabs (for audio narration)
  - Stripe (for payments)

### Environment Variables Setup

1. Copy the `.env.example` file to create your `.env` file:
   ```bash
   cp tale-forge/.env.example tale-forge/.env
   ```

2. Fill in all the required environment variables in `tale-forge/.env`:
   - Supabase credentials
   - OpenAI API key
   - OVH AI API key
   - ElevenLabs API key
   - Stripe keys

### Installation

1. Install frontend dependencies:
   ```bash
   cd tale-forge/frontend
   npm install
   ```

2. Install backend dependencies:
   ```bash
   cd ../backend
   npm install
   ```

### Running the Application

1. Start the frontend development server:
   ```bash
   cd tale-forge/frontend
   npm run dev
   ```

2. Start the Supabase backend (if running locally):
   ```bash
   cd tale-forge/backend
   npm run dev
   ```

The application will be available at `http://localhost:3000`

## 📋 Implemented Features

### 1. Public Pages
- Home page with hero section and featured stories
- Testimonials page
- Authentication pages (Sign in, Sign up)

### 2. Authenticated User Features
- Story creation wizard (5-step process)
- Story reader with interactive choices
- Personal story library
- Account management (settings, billing, profile)
- Story discovery and search

### 3. Admin Features
- User management
- Content moderation
- Analytics dashboard
- System configuration

## 🔧 Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Ensure you've created a `.env` file from `.env.example`
   - Verify all required variables are filled in
   - Restart the development server after changes

2. **API Connection Errors**
   - Check that all API keys are valid and have proper permissions
   - Verify Supabase project URL and keys
   - Ensure you have internet connectivity

3. **Story Generation Failures**
   - Check OpenAI API key and quota
   - Verify OVH AI credentials for image generation
   - Confirm ElevenLabs API key for audio generation

4. **Payment Integration Issues**
   - Verify Stripe keys in environment variables
   - Check that webhook signing secret matches

### Mock Data vs. Real Services

Some features can be tested with mock data:
- UI components and navigation
- Basic story reading flow (with sample data)
- Account settings and preferences

Features requiring real services:
- Story generation (OpenAI)
- Image generation (OVH AI)
- Audio narration (ElevenLabs)
- Payment processing (Stripe)
- User authentication (Supabase Auth)

## 📖 Project Overview

This document contains all essential information needed to rebuild Tale Forge from scratch with a clean, optimized codebase while maintaining all core functionality. The current 350k+ line codebase has significant bloat and issues that make it difficult to maintain and extend.

## Key Documents

### 1. Complete Product Requirements Document (PRD)
Location: `TALEFORGE_PRD_2025.md`
- Complete specification of all features and functionality
- Detailed user stories and requirements
- Technical specifications and constraints
- Success criteria and acceptance tests

### 2. Optimized Routing Skeleton
Location: `OPTIMIZED_ROUTING_SKELETON.md`
- Streamlined navigation structure (25 essential routes vs 50+)
- Eliminates debug/test routes and redundancies
- Mobile-first design patterns
- Clear component architecture

### 3. Implementation Strategy
Location: This document
- 6-week rebuild timeline
- Daily task structure for AI agents
- Quality control processes
- Success metrics

## Project Goals

### Primary Objectives:
1. **Reduce Codebase Size**: From 350k+ lines to ~35k lines
2. **Improve Maintainability**: Clean, well-organized code
3. **Enhance Performance**: Faster loading and better UX
4. **Fix Core Issues**: Resolve broken functionality
5. **Preserve Features**: Maintain all essential functionality

### Non-Goals:
- Changing core user experience
- Adding major new features (beyond what's documented)
- Switching technology stacks (React + Supabase)

## Core Features To Preserve

### 1. Story Generation Engine
- AI-powered story creation with choices
- Multi-modal content (text, images, audio)
- Age-appropriate content filtering
- Genre-based templates

### 2. User Management
- Authentication (email/password + OAuth)
- Subscription tiers (Free, Premium, Pro, Family)
- Profile management
- Activity tracking

### 3. Content Management
- Personal story library
- Public story discovery
- Story sharing and exporting
- Bookmarking and favorites

### 4. Admin System
- User management
- Content moderation
- Analytics and reporting
- System configuration

## Technical Requirements

### Stack:
- **Frontend**: React 18+ with TypeScript
- **Routing**: React Router v6
- **State Management**: React Context + useReducer
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Payments**: Stripe Integration

### Key Integrations:
- OpenAI GPT for text generation
- DALL-E/Stable Diffusion for images
- Text-to-speech services for audio
- Stripe for payments

## Implementation Strategy

### Phase 1: Foundation (Week 1)
**Deliverables**: Basic app structure, auth, layout
- Project setup and folder structure
- Authentication system
- Core layout and navigation
- Error handling and loading states

### Phase 2: User System (Week 2)
**Deliverables**: Complete account management
- User profiles
- Settings panel
- Subscription management
- Story library system

### Phase 3: Story Creation (Week 3)
**Deliverables**: Full story creation workflow
- Creation wizard (5-step process)
- Character management
- Prompt generation
- Status tracking

### Phase 4: Story Experience (Week 4)
**Deliverables**: Story reading and interaction
- Story reader interface
- Choice system
- Media integration
- Progress tracking

### Phase 5: Admin & Business (Week 5)
**Deliverables**: Admin panel and business features
- Admin dashboard
- User management
- Analytics
- Payment integration

### Phase 6: Polish & Launch (Week 6)
**Deliverables**: Production-ready application
- Performance optimization
- Accessibility improvements
- Testing and QA
- Deployment setup

## Daily Task Structure for AI Agents

Each task should follow this template:

```
TASK: [Specific task name]
PRIORITY: [High/Medium/Low]
ESTIMATED TIME: [Hours]
DEPENDENCIES: [List any dependencies]
DELIVERABLES: [What should be produced]
SUCCESS CRITERIA: [How to verify completion]

INSTRUCTIONS:
1. [Step-by-step implementation guide]
2. [Code patterns to follow]
3. [Specific requirements]
4. [Integration points]

REFERENCES:
- [Relevant documentation]
- [Existing code examples]
- [Design guidelines]
```

### Example Task:
```
TASK: Create Story Creation Wizard Component
PRIORITY: High
ESTIMATED TIME: 8 hours
DEPENDENCIES: Authentication system, database schema
DELIVERABLES: 
- CreateStoryWizard.tsx component
- Step components (AudienceStep, GenreStep, etc.)
- Wizard context for state management
SUCCESS CRITERIA: 
- Wizard navigates through 5 steps
- User data persists between steps
- Form validation on each step
- Integration with story generation API

INSTRUCTIONS:
1. Create a multi-step form component using React Context
2. Implement step navigation with progress indicators
3. Each step should be a separate component
4. Use form validation with Zod or similar
5. Integrate with existing story generation endpoints
6. Add loading states and error handling
7. Ensure mobile-responsive design
8. Follow existing styling patterns

REFERENCES:
- OPTIMIZED_ROUTING_SKELETON.md (creation workflow section)
- Existing Supabase schema for stories table
- Current story generation edge functions
```

## Quality Control Process

### Daily Checkpoints:
1. **Code Review**: Verify code quality and patterns
2. **Functionality Test**: Ensure features work as expected
3. **Integration Check**: Confirm components work together
4. **Documentation**: Update README with progress

### Weekly Milestones:
1. **Phase Completion**: All tasks in phase finished
2. **Testing**: Comprehensive testing of phase features
3. **Refactoring**: Code cleanup and optimization
4. **Demo**: Show working features to stakeholders

## Success Metrics

### Code Quality:
- Clean, maintainable, well-documented code
- Consistent styling and patterns
- Proper error handling
- Efficient performance

### Functionality:
- All features working per PRD specifications
- No critical bugs or issues
- Good user experience
- Mobile-responsive design

### Performance:
- Fast loading times (< 3s for main views)
- Efficient API usage
- Small bundle sizes
- Good accessibility scores

### Project Management:
- On schedule completion
- Clear progress tracking
- Good documentation
- Easy handoff to other developers

## Migration Considerations

### Data Migration:
- User accounts and profiles
- Existing stories (completed and in-progress)
- Subscription information
- Activity history

### Domain/Deployment:
- Preserve existing domain and URLs where possible
- Set up proper redirects for old routes
- Maintain SEO rankings
- Ensure SSL certificates

### User Experience:
- Preserve familiar UI patterns
- Maintain feature parity
- Communicate changes to users
- Provide transition support

## Next Steps

1. **Review all documentation** in this folder
2. **Set up development environment**
3. **Begin Phase 1 implementation**
4. **Follow daily task structure**
5. **Track progress against milestones**
6. **Conduct regular quality checks**

## Support Resources

- **PRD Document**: Complete feature specifications
- **Routing Skeleton**: Optimized navigation structure
- **Existing Codebase**: Reference for functionality (but not implementation)
- **Database Schema**: Supabase migrations folder
- **Edge Functions**: Reference for API integration

This rebuild project will result in a cleaner, faster, and more maintainable Tale Forge that preserves all essential functionality while eliminating the technical debt that currently makes development difficult.