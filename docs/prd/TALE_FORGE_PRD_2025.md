# Tale Forge - Product Requirements Document (PRD)
## AI-Powered Interactive Storytelling Platform for Children

**Version:** 1.0  
**Date:** January 2025  
**Status:** Production  

---

## 1. Executive Summary

### 1.1 Product Vision
Tale Forge is an AI-powered interactive storytelling platform designed specifically for children aged 4-12. It creates personalized, educational, and safe story experiences where children make choices that shape the narrative, accompanied by AI-generated images and optional voice narration.

### 1.2 Problem Statement
- Parents struggle to find safe, engaging, and educational digital content for their children
- Traditional storytelling lacks interactivity and personalization
- Existing AI tools are not child-safe or age-appropriate
- Children need creative outlets that combine entertainment with learning

### 1.3 Solution
Tale Forge provides:
- AI-generated interactive stories tailored to specific age groups
- Safe, moderated content with educational value
- Visual storytelling through AI-generated images
- Voice narration for enhanced engagement
- Parental controls and family-friendly features

---

## 2. Core Features & Functionality

### 2.1 Story Creation System

#### 2.1.1 Genre Selection
**Current Implementation:**
- 8 primary genres optimized for children:
  - Bedtime Stories (🌙)
  - Fantasy & Magic (🧙‍♂️)
  - Adventure & Exploration (🗺️)
  - Mystery & Detective (🔍)
  - Science Fiction & Space (🚀)
  - Educational Stories (📚)
  - Values & Life Lessons (💎)
  - Silly & Humorous Stories (😄)

**Technical Details:**
- Genre selection influences AI prompt templates
- Each genre has age-specific content guidelines
- Stored in `story_mode` field in database

#### 2.1.2 Age-Based Content Adaptation
**Age Groups:**
- 4-6 years: 50-90 words per segment, simple choices, gentle themes
- 7-9 years: 80-120 words per segment, moderate complexity
- 10-12 years: 150-180 words per segment, complex narratives

**Implementation:**
- Dynamic word count enforcement
- Age-appropriate vocabulary selection
- Theme and complexity adjustments

#### 2.1.3 Story Generation Pipeline
**Process Flow:**
1. User selects genre and provides story prompt
2. Optional character selection from user's library
3. AI generates story segment with:
   - Narrative text (age-appropriate length)
   - 3 interactive choices
   - Image generation prompt
4. Automatic image generation via OVH AI/Stable Diffusion XL
5. Story continues based on user choices
6. Ending generation when story completes

**Technical Components:**
- `generate-story-segment` edge function
- `generate-story-ending` edge function
- AI Provider abstraction layer
- JSON parsing with fallback mechanisms

### 2.2 Multimodal Content Generation

#### 2.2.1 Text Generation
**Provider:** OpenAI GPT-4o-mini (primary)
**Features:**
- Context-aware story continuation
- Character consistency tracking
- Educational content integration
- Safety filtering

#### 2.2.2 Image Generation
**Provider:** OVH AI Endpoints (Stable Diffusion XL)
**Features:**
- Child-safe image generation
- Automatic prompt enhancement
- Negative prompt filtering
- Retry mechanism with exponential backoff
- Storage in Supabase buckets

#### 2.2.3 Voice Narration
**Provider:** ElevenLabs API
**Features:**
- Professional narrator voice (Brian - Master Storyteller)
- Full story narration after completion
- MP3 format storage
- Tier-based access control

### 2.3 User Experience Features

#### 2.3.1 Story Library ("My Stories")
- Grid/list view toggle
- Filtering by status (completed, in-progress, new)
- Search functionality
- Story metadata display
- Export capabilities (text, HTML, JSON, images)

#### 2.3.2 Story Discovery
- Public story gallery
- Community-created content
- Filtering by genre, age, popularity
- Like and comment system
- Pagination support

#### 2.3.3 Story Viewer
- Immersive reading experience
- Choice selection interface
- Image display with loading states
- Audio playback controls
- Progress tracking
- Story completion celebrations

### 2.4 Character Management System

#### 2.4.1 Character Creation
- Name, description, role definition
- Trait assignment
- Avatar customization
- Character library management

#### 2.4.2 Character Integration
- Automatic inclusion in story generation
- Character consistency across segments
- Role-based story influence

### 2.5 Subscription & Monetization

#### 2.5.1 Tier Structure
**Free Tier:**
- 3 stories per month
- 1 image per story
- Basic features

**Premium Tier ($9.99/month):**
- 10 stories per month
- 3 images per story
- Voice narration (5 stories)
- Character creation

**Pro Tier ($19.99/month):**
- Unlimited stories
- Unlimited images
- Unlimited voice narration
- Advanced features

**Family Tier ($29.99/month):**
- All Pro features
- 5 family member accounts
- Parental controls
- Shared story library

#### 2.5.2 Founder Program
- Limited to first 200 users
- Lifetime discounts (25-75%)
- Special benefits and early access
- Tiered based on signup order

#### 2.5.3 Payment Processing
- Stripe integration for subscriptions
- Automated billing management
- Customer portal access
- Webhook handling for subscription events

### 2.6 Admin & Analytics

#### 2.6.1 Admin Dashboard
**Features:**
- User management
- Story moderation
- System metrics
- AI provider monitoring
- Prompt library management
- Usage analytics

**Access Control:**
- Server-side role validation
- Admin user table
- Secure authentication

#### 2.6.2 Analytics Tracking
- Story creation metrics
- User engagement data
- AI provider usage
- Performance monitoring
- Error tracking

### 2.7 Safety & Moderation

#### 2.7.1 Content Safety
- Pre-generation content filtering
- Age-appropriate theme enforcement
- Negative prompt lists
- Educational value requirements

#### 2.7.2 User Safety
- Authentication required for all features
- Parental controls for family accounts
- Private by default story settings
- No direct messaging between users

---

## 3. Technical Architecture

### 3.1 Frontend Stack
- **Framework:** React 18.3 with TypeScript
- **Routing:** React Router v6
- **State Management:** Zustand, React Query
- **UI Components:** Radix UI, shadcn/ui
- **Styling:** Tailwind CSS
- **Build Tool:** Vite

### 3.2 Backend Infrastructure
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** Supabase Auth
- **Edge Functions:** Deno runtime
- **File Storage:** Supabase Storage buckets
- **Real-time:** Supabase Realtime (WebSocket)

### 3.3 AI Integration
- **Text Generation:** OpenAI API (GPT-4o-mini)
- **Image Generation:** OVH AI Endpoints (SDXL)
- **Voice Generation:** ElevenLabs API
- **Fallback Providers:** Multiple provider support

### 3.4 Database Schema

#### Key Tables:
- `stories` - Main story records
- `story_segments` - Individual story parts
- `story_characters` - Character associations
- `user_characters` - User-created characters
- `subscribers` - Subscription data
- `user_usage` - Usage tracking
- `tier_limits` - Tier configurations
- `prompt_library` - AI prompt templates

### 3.5 API Endpoints (Edge Functions)

#### Story Generation:
- `/generate-story-segment` - Create story segments
- `/generate-story-ending` - Generate conclusions
- `/regenerate-image` - Image generation/regeneration
- `/generate-audio` - Voice narration
- `/regenerate-seeds` - Prompt seed generation

#### Subscription Management:
- `/stripe-create-checkout` - Create checkout sessions
- `/stripe-webhook` - Handle Stripe events
- `/customer-portal` - Manage subscriptions

#### Admin Functions:
- `/setup-prompts` - Initialize prompt library
- `/update-prompt` - Modify prompts
- `/get-prompt` - Retrieve prompts

---

## 4. User Journeys

### 4.1 First-Time User Flow
1. Land on homepage → View value proposition
2. Sign up for free account
3. Complete onboarding tutorial
4. Create first story:
   - Select age group
   - Choose genre
   - Enter story idea
   - Make choices
   - Complete story
5. Explore features
6. Consider subscription upgrade

### 4.2 Story Creation Flow
1. Click "Create New Story"
2. Select genre from grid
3. Enter story prompt/idea
4. Optional: Add characters
5. Generate first segment
6. View generated image
7. Make choice from 3 options
8. Continue until story ends
9. Optional: Generate voice narration
10. Save to library

### 4.3 Story Consumption Flow
1. Browse "My Stories" or "Discover"
2. Select story to read
3. Navigate through segments
4. Listen to audio if available
5. Share or export story

---

## 5. Design & UX Principles

### 5.1 Visual Design
- **Theme:** Magical library/book aesthetic
- **Colors:** Warm amber/gold accents on dark backgrounds
- **Typography:** Fantasy-inspired headings, readable body text
- **Animations:** Subtle, smooth transitions
- **Responsive:** Mobile-first design approach

### 5.2 UX Guidelines
- **Simplicity:** Child-friendly interfaces
- **Feedback:** Clear loading states and progress indicators
- **Safety:** No sharp corners, friendly imagery
- **Accessibility:** WCAG compliance, screen reader support
- **Performance:** Fast load times, optimized images

---

## 6. Performance Requirements

### 6.1 Response Times
- Story generation: < 5 seconds
- Image generation: < 20 seconds
- Page load: < 2 seconds
- API responses: < 1 second

### 6.2 Reliability
- 99.9% uptime target
- Graceful degradation
- Retry mechanisms
- Error recovery

### 6.3 Scalability
- Support 10,000+ concurrent users
- Horizontal scaling capability
- CDN for static assets
- Database connection pooling

---

## 7. Security & Compliance

### 7.1 Data Protection
- COPPA compliance for children's data
- GDPR compliance for EU users
- Encrypted data transmission
- Secure authentication tokens

### 7.2 Content Security
- CSP headers implementation
- XSS protection
- SQL injection prevention
- Rate limiting

---

## 8. Success Metrics

### 8.1 User Engagement
- Daily Active Users (DAU)
- Stories created per user
- Story completion rate
- Time spent in app

### 8.2 Business Metrics
- Conversion rate (free to paid)
- Monthly Recurring Revenue (MRR)
- Customer Lifetime Value (CLV)
- Churn rate

### 8.3 Quality Metrics
- AI generation success rate
- Error rates
- Page load times
- User satisfaction scores

---

## 9. Future Enhancements

### 9.1 Planned Features
- Collaborative storytelling
- Story templates library
- Educational curriculum alignment
- Multi-language support
- Mobile applications
- Offline mode
- Story branching visualization
- Achievement system
- Parent dashboard
- School/classroom features

### 9.2 Technical Improvements
- WebAssembly for performance
- Progressive Web App (PWA)
- GraphQL API
- Microservices architecture
- Advanced caching strategies

---

## 10. Known Issues & Technical Debt

### 10.1 Current Limitations
- Large codebase (340k+ lines) with dead code
- Inconsistent error handling
- Limited test coverage
- Performance bottlenecks in story generation
- Image generation timeout issues

### 10.2 Refactoring Needs
- Component standardization
- State management consolidation
- API response caching
- Database query optimization
- Code splitting improvements

---

## 11. Development Guidelines

### 11.1 Code Standards
- TypeScript with strict mode
- ESLint configuration
- Prettier formatting
- Component-based architecture
- Atomic design principles

### 11.2 Testing Requirements
- Unit tests for utilities
- Integration tests for API
- E2E tests for critical paths
- Performance testing
- Accessibility testing

### 11.3 Deployment Process
- Git-based version control
- CI/CD via GitHub Actions
- Staging environment
- Blue-green deployments
- Rollback procedures

---

## 12. Support & Documentation

### 12.1 User Support
- In-app help system
- FAQ section
- Email support
- Community forum (planned)

### 12.2 Developer Documentation
- API documentation
- Component library
- Database schema docs
- Deployment guides
- Troubleshooting guides

---

## Appendices

### A. Glossary
- **Segment:** Individual part of a story
- **Choice:** Interactive option presented to users
- **Prompt:** User input or AI instruction
- **Edge Function:** Serverless backend function
- **Tier:** Subscription level

### B. References
- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [ElevenLabs API](https://elevenlabs.io/docs)

### C. Version History
- v1.0 - January 2025 - Initial comprehensive PRD

---

**Document Prepared By:** AI Analysis System  
**Last Updated:** January 2025  
**Next Review:** February 2025

---

## Contact Information
For questions about this PRD, please contact the Tale Forge development team.

**Note:** This PRD represents the current state of Tale Forge as analyzed from the production codebase. It should be updated regularly as features evolve and new requirements emerge.