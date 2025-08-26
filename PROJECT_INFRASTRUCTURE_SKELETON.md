# 🏗️ TALE-FORGE-REBORN-2025 COMPLETE PROJECT INFRASTRUCTURE SKELETON

## 📂 ROOT DIRECTORY STRUCTURE

```
E:\Tale-Forge-Reborn-2025\
│
├── 📁 .claude/                       # Claude AI configuration
│   ├── 📁 agents/                    # AI agent configurations
│   └── 📁 claude-code-chat-images/   # Claude chat images
│
├── 📁 .cursor/                       # Cursor IDE configuration
│   └── 📁 rules/                     # Cursor rules
│       └── 📁 taskmaster/            # TaskMaster specific rules
│
├── 📁 .github/                       # GitHub configuration
│   └── 📁 workflows/                 # CI/CD workflows
│
├── 📁 .taskmaster/                   # TaskMaster project management
│   ├── 📁 docs/                      # Project documentation
│   ├── 📁 reports/                   # Progress reports
│   ├── 📁 tasks/                     # Task definitions
│   └── 📁 templates/                 # Task templates
│
├── 📁 .vite/                         # Vite build cache
│   └── 📁 deps/                      # Dependency cache
│
├── 📁 .vscode/                       # VSCode configuration
│
├── 📁 database/                      # Database scripts & schemas
│   ├── admin_quick_setup.sql
│   ├── complete_schema.sql
│   ├── database-schema.sql
│   ├── database-setup-complete.sql
│   ├── remote_admin_setup.sql
│   ├── setup_admin.sql
│   └── update_spend_credits_function.sql
│
├── 📁 dist/                          # Production build output
│   ├── 📁 assets/                    # Compiled assets
│   └── [mirrors public structure]
│
├── 📁 docs/                          # Project documentation
│   ├── 📁 analysis/                  # Analysis documents
│   ├── 📁 architecture/              # Architecture documentation
│   │   └── 📁 ai-model-documentations/
│   ├── 📁 legacy-docs/               # Legacy documentation
│   ├── 📁 Obsidian-MCP/              # Obsidian integration
│   ├── 📁 prd/                       # Product requirement documents
│   ├── 📁 Reef/                      # Reef MCP documentation
│   │   └── 📁 ref-tools-mcp-main/
│   └── 📁 workflow/                  # Workflow documentation
│
├── 📁 examples/                      # Code examples
│
├── 📁 public/                        # Static assets
│   ├── 📁 icons/                     # Icon assets
│   │   └── 📁 variations/
│   │       ├── 📁 filled/
│   │       ├── 📁 monochrome/
│   │       ├── 📁 outline/
│   │       └── 📁 seasonal/
│   └── 📁 images/                    # Image assets
│       ├── 📁 backgrounds/
│       ├── 📁 characters/
│       ├── 📁 genres/
│       │   ├── 📁 adventure/
│       │   ├── 📁 bedtime/
│       │   ├── 📁 educational/
│       │   ├── 📁 fantasy/
│       │   ├── 📁 humorous/
│       │   ├── 📁 mystery/
│       │   ├── 📁 sci-fi/
│       │   └── 📁 values/
│       ├── 📁 pages/
│       │   ├── 📁 account/
│       │   ├── 📁 admin/
│       │   ├── 📁 auth/
│       │   ├── 📁 create/
│       │   ├── 📁 discover/
│       │   ├── 📁 home/
│       │   ├── 📁 my-stories/
│       │   └── 📁 story-reader/
│       ├── 📁 story-elements/
│       ├── 📁 testimonials/
│       │   └── 📁 webp/
│       └── 📁 ui-elements/
│
├── 📁 scripts/                       # Build and utility scripts
│
├── 📁 shared/                        # Shared resources
│
├── 📁 supabase/                      # Supabase backend
│   ├── 📁 .branches/                 # Branch configurations
│   ├── 📁 .temp/                     # Temporary files
│   ├── 📁 functions/                 # Edge Functions
│   │   ├── 📁 _shared/               # Shared function utilities
│   │   ├── 📁 admin-setup/
│   │   ├── 📁 admin-sql/
│   │   ├── 📁 create-checkout-session/
│   │   ├── 📁 create-story/
│   │   ├── 📁 delete-story/
│   │   ├── 📁 generate-audio/
│   │   ├── 📁 generate-story-ending/
│   │   ├── 📁 generate-story-segment/
│   │   ├── 📁 generate-tts-audio/
│   │   ├── 📁 get-story/
│   │   ├── 📁 get-story-recommendations/
│   │   ├── 📁 handle-stripe-webhook/
│   │   ├── 📁 manage-subscription/
│   │   ├── 📁 regenerate-image/
│   │   └── 📁 update-story/
│   ├── 📁 migrations/                # Database migrations
│   │   └── [20+ migration files]
│   ├── 📁 shared/                    # Shared Supabase resources
│   └── supabase.toml                 # Supabase configuration
│
├── 📁 test-results/                  # Test output
│
├── 📁 tests/                         # Test files
│   ├── 📁 e2e/                       # End-to-end tests
│   ├── social-engagement.test.ts
│   └── templates-page.spec.ts
│
├── 📁 tools/                         # Development tools
│
└── 📁 src/                           # Source code

## 🎯 SRC DIRECTORY STRUCTURE

```
src/
│
├── 📄 App.tsx                        # Main application component (275 lines)
├── 📄 App.css                        # Global styles
├── 📄 index.css                      # Root CSS
├── 📄 main.tsx                       # Application entry point
├── 📄 main-simple.tsx                # Simplified entry
├── 📄 main-test.tsx                  # Test entry
├── 📄 vite-env.d.ts                  # Vite type definitions
│
├── 📁 components/                    # React components
│   ├── 📄 ErrorBoundary.tsx          # Error handling wrapper
│   ├── 📁 atoms/                     # Atomic design components
│   ├── 📁 auth/                      # Authentication components
│   ├── 📁 business/                  # Business logic components
│   ├── 📁 context/                   # Context providers
│   ├── 📁 dashboard/                 # Dashboard components
│   ├── 📁 debug/                     # Debug utilities
│   ├── 📁 design-system/             # Design system components
│   ├── 📁 forms/                     # Form components
│   ├── 📁 gamification/              # Gamification features
│   ├── 📁 hooks/                     # Component-specific hooks
│   ├── 📁 integrations/              # Third-party integrations
│   ├── 📁 layout/                    # Layout components
│   ├── 📁 molecules/                 # Molecular components
│   ├── 📁 navigation/                # Navigation components
│   ├── 📁 organisms/                 # Organism components
│   │   ├── 📁 story-creation-wizard/
│   │   └── 📁 story-management/
│   ├── 📁 routes/                    # Route components
│   ├── 📁 templates/                 # Template components
│   ├── 📁 test/                      # Test components
│   ├── 📁 types/                     # Component type definitions
│   └── 📁 ui/                        # UI components
│
├── 📁 hooks/                         # Custom React hooks
│   ├── useAnalytics.ts
│   ├── useCredits.ts
│   ├── useEnhancedAuth.ts
│   ├── useFeaturedContent.ts
│   ├── useFoundersProgram.ts
│   ├── use-mobile.tsx
│   ├── useSocialEngagement.ts
│   ├── useSocialEngagement.adapted.ts
│   └── use-toast.ts
│
├── 📁 lib/                           # Library utilities
│   └── utils.ts                      # Utility functions
│
├── 📁 pages/                         # Page components
│   ├── 📁 admin/                     # Admin pages (8 pages)
│   │   ├── AdminAIPage.tsx
│   │   ├── AdminAnalyticsPage.tsx
│   │   ├── AdminContentPage.tsx
│   │   ├── AdminDashboardPage.tsx
│   │   ├── AdminGamificationAnalyticsPage.tsx
│   │   ├── AdminSettingsPage.tsx
│   │   ├── AdminSystemPage.tsx
│   │   └── AdminUsersPage.tsx
│   │
│   ├── 📁 auth/                      # Authentication pages (4 pages)
│   │   ├── AuthCallbackPage.tsx
│   │   ├── ResetPasswordPage.tsx
│   │   ├── SigninPage.tsx
│   │   └── SignupPage.tsx
│   │
│   ├── 📁 authenticated/             # Protected pages
│   │   ├── 📁 account/               # Account pages (6 pages)
│   │   │   ├── AccountBillingPage.tsx
│   │   │   ├── AccountExportPage.tsx
│   │   │   ├── AccountHistoryPage.tsx
│   │   │   ├── AccountPage.tsx
│   │   │   ├── AccountSettingsPage.tsx
│   │   │   └── ProfilePage.tsx
│   │   │
│   │   ├── 📁 create/                # Story creation
│   │   │   ├── CreateStoryPage.tsx
│   │   │   └── CreateStoryPage.test.tsx
│   │   │
│   │   ├── 📁 stories/               # Story pages (10 pages)
│   │   │   ├── CollectionsPage.tsx
│   │   │   ├── StoriesHubPage.tsx
│   │   │   ├── StoryCompletePage.tsx
│   │   │   ├── StoryDiscoverPage.tsx
│   │   │   ├── StoryEditorPage.tsx
│   │   │   ├── StoryLibraryPage.tsx
│   │   │   ├── StoryReaderPage.tsx
│   │   │   └── StoryViewerPage.tsx
│   │   │
│   │   ├── AchievementsPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── NotificationsPage.tsx
│   │   ├── SearchPage.tsx
│   │   └── TemplatesPage.tsx
│   │
│   ├── 📁 legal/                     # Legal pages
│   │   ├── PrivacyPage.tsx
│   │   └── TermsPage.tsx
│   │
│   ├── 📁 public/                    # Public pages (6 pages)
│   │   ├── DiscoverPage.tsx
│   │   ├── FeaturesPage.tsx
│   │   ├── HelpPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── PricingPage.tsx
│   │   └── TestimonialsPage.tsx
│   │
│   └── CreditsPage.tsx
│
├── 📁 providers/                     # Context providers
│   ├── AuthContext.tsx               # Authentication context
│   ├── AuthContext.test.tsx
│   ├── AuthContext.tsx.backup
│   ├── BillingContext.tsx            # Billing/subscription context
│   ├── BillingContext.test.tsx
│   ├── SettingsContext.tsx           # User settings context
│   └── index.ts
│
├── 📁 routes/                        # Route definitions
│   └── [routing configuration]
│
├── 📁 services/                      # Business logic services
│   ├── achievementService.ts         # Achievement tracking
│   ├── analyticsService.ts           # Analytics tracking
│   ├── contentCuration.ts            # Content management
│   ├── creditService.ts              # Credit system
│   ├── creditsService.ts             # Credits management
│   ├── foundersService.ts            # Founders program
│   ├── gamificationAnalytics.ts     # Gamification metrics
│   ├── goalService.ts                # Goals tracking
│   ├── stripeService.ts              # Stripe integration
│   ├── templateService.ts            # Template management
│   └── index.ts
│
├── 📁 styles/                        # Style files
│   └── [CSS/SCSS files]
│
├── 📁 test/                          # Test utilities
│   └── [test helpers]
│
└── 📁 utils/                         # Utility functions
    ├── authSecurity.ts               # Auth security utilities
    ├── cache.ts                      # Caching utilities
    ├── cache.test.ts
    ├── characterHooks.ts             # Character utilities
    ├── creditCalculator.ts           # Credit calculations
    ├── mockAIService.ts              # AI service mocks
    ├── monitoring.ts                 # Performance monitoring
    ├── performance.tsx               # Performance utilities
    ├── performance.test.tsx
    ├── realStoryService.ts           # Story service implementation
    ├── safeMigration.ts              # Safe migration utilities
    ├── storyHooks.ts                 # Story-related hooks
    ├── storyService.ts               # Story service
    ├── storyTemplates.ts             # Story templates
    ├── storyValidation.ts            # Story validation
    ├── STORY_SERVICE_DOCUMENTATION.md
    └── index.ts
```

## 🚦 ROUTING ARCHITECTURE

### Public Routes (8 routes)
- `/` - HomePage
- `/discover` - DiscoverPage  
- `/features` - FeaturesPage
- `/help` - HelpPage
- `/pricing` - PricingPage
- `/testimonials` - TestimonialsPage
- `/legal/privacy` - PrivacyPage
- `/legal/terms` - TermsPage

### Authentication Routes (3 routes)
- `/signin` - SigninPage (PublicOnlyRoute)
- `/signup` - SignupPage (PublicOnlyRoute)
- `/auth/callback` - AuthCallbackPage

### Protected User Routes (11 routes)
- `/dashboard` - DashboardPage
- `/stories` - StoriesHubPage
- `/stories/:id` - StoryReaderPage
- `/stories/:id/complete` - StoryCompletePage
- `/create` - CreateStoryPage
- `/templates` - TemplatesPage
- `/credits` - CreditsPage
- `/achievements` - AchievementsPage
- `/account` - AccountPage
- `/account/profile` - ProfilePage

### Admin Routes (7 routes)
- `/admin` - AdminDashboardPage
- `/admin/users` - AdminUsersPage
- `/admin/content` - AdminContentPage
- `/admin/system` - AdminSystemPage
- `/admin/ai` - AdminAIPage
- `/admin/analytics` - AdminAnalyticsPage
- `/admin/gamification-analytics` - AdminGamificationAnalyticsPage

## 🏛️ LAYOUT ARCHITECTURE

### Layout Components
1. **MainLayout** - Public pages wrapper
2. **AuthenticatedLayout** - Protected pages wrapper
3. **AdminLayout** - Admin pages wrapper

### Route Protection
1. **ProtectedRoute** - Requires authentication
2. **AdminRoute** - Requires admin role
3. **PublicOnlyRoute** - Redirects authenticated users

## 🗄️ DATABASE SCHEMA (Key Tables)

### Core Tables
- `profiles` - User profiles
- `stories` - Story data
- `story_segments` - Story segments/chapters
- `story_templates` - Story templates
- `story_images` - Story images storage

### Feature Tables
- `achievements` - User achievements
- `user_achievements` - Achievement progress
- `credits_transactions` - Credit system
- `social_engagement` - Social features
- `analytics_events` - Analytics tracking
- `founders_members` - Founders program
- `user_goals` - User goals tracking
- `featured_content` - Featured stories

### Subscription Tables  
- `subscription_products` - Stripe products
- `subscription_prices` - Stripe prices
- `user_subscriptions` - User subscriptions
- `subscription_invoices` - Billing invoices

## ⚡ SUPABASE EDGE FUNCTIONS

### Story Management
- `create-story` - Create new story
- `get-story` - Retrieve story data
- `update-story` - Update story
- `delete-story` - Delete story
- `generate-story-segment` - Generate story content
- `generate-story-ending` - Generate story ending
- `regenerate-image` - Regenerate story images

### AI & Audio
- `generate-audio` - Generate story audio
- `generate-tts-audio` - Text-to-speech generation

### Payments
- `create-checkout-session` - Stripe checkout
- `handle-stripe-webhook` - Webhook handler
- `manage-subscription` - Subscription management

### Admin
- `admin-setup` - Admin initialization
- `admin-sql` - Admin SQL operations

### Recommendations
- `get-story-recommendations` - Story suggestions

## 🔧 CONFIGURATION FILES

### Build & Development
- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript configuration
- `tsconfig.app.json` - App TS config
- `tsconfig.node.json` - Node TS config
- `tailwind.config.ts` - Tailwind CSS
- `postcss.config.js` - PostCSS config
- `eslint.config.js` - ESLint rules
- `vitest.config.ts` - Vitest testing
- `playwright.config.ts` - E2E testing

### Package Management
- `package.json` - Dependencies
- `package-lock.json` - Lock file
- `components.json` - Component config

### Environment
- `.env` - Environment variables
- `.env.local` - Local environment
- `.env.production` - Production environment
- `.env.example` - Example configs

### Project Management
- `taskmaster.config.json` - TaskMaster config
- `.mcp.json` - MCP configuration
- `.mcp-config.json` - MCP detailed config
- `mcp.json` - MCP server config

### Documentation
- `README.md` - Project readme
- `CLAUDE.md` - Claude AI instructions
- `DEPLOYMENT_CHECKLIST.md` - Deployment guide
- `SENTRY_INTEGRATION_SETUP.md` - Sentry setup
- `USER_DATABASE_LOCATION.md` - DB info

## 🔄 CONTEXT PROVIDERS

1. **AuthProvider** - Authentication state
2. **SettingsProvider** - User preferences
3. **BillingProvider** - Subscription state
4. **QueryClientProvider** - React Query

## 🎨 STYLING ARCHITECTURE

- **Tailwind CSS** - Utility-first CSS
- **Component CSS** - Component-specific styles
- **Global CSS** - App-wide styles
- **Design System** - Consistent UI components

## 📊 STATE MANAGEMENT

- **React Query** - Server state management
- **Context API** - Client state management
- **Custom Hooks** - Reusable logic
- **Local Storage** - Persistent state

## 🔐 SECURITY LAYERS

1. **Supabase RLS** - Row-level security
2. **Auth Guards** - Route protection
3. **API Keys** - Environment variables
4. **CORS** - Cross-origin policies
5. **Input Validation** - Data sanitization

## 🚀 DEPLOYMENT STRUCTURE

- **Frontend** - Vercel deployment
- **Backend** - Supabase cloud
- **Edge Functions** - Deno runtime
- **Database** - PostgreSQL
- **Storage** - Supabase storage
- **CDN** - Static asset delivery

## 📈 MONITORING & ANALYTICS

- **Sentry** - Error tracking
- **Web Vitals** - Performance metrics
- **Custom Analytics** - User behavior
- **Supabase Logs** - Backend monitoring

## 🧪 TESTING STRUCTURE

- **Unit Tests** - Component testing
- **Integration Tests** - Service testing
- **E2E Tests** - Playwright testing
- **Performance Tests** - Load testing

---

This skeleton represents the complete infrastructure of Tale-Forge-Reborn-2025, manually explored and documented from the actual file system and code structure.