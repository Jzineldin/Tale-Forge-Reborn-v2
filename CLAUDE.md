# Tale-Forge Development Workflow with MCP Integration

This document defines the integrated development workflow using Multiple MCP servers for comprehensive project management.

## 🔧 Available MCP Servers

### 1. **Filesystem MCP** - File Operations
- **Purpose**: Direct file system access and management
- **Capabilities**: Read, write, edit files; directory operations; search files
- **Usage**: Core development file operations

### 2. **Supabase MCP** - Database & Backend
- **Purpose**: Database operations and backend management
- **Capabilities**: SQL execution, table management, migrations, logs, project info
- **Usage**: Database development, schema changes, debugging

### 3. **GitHub MCP** - Version Control & Collaboration
- **Purpose**: Git repository management and collaboration
- **Capabilities**: Commit history, PR/issue management, file operations, code search
- **Usage**: Code reviews, repository management, CI/CD integration

### 4. **Context7 MCP** - Documentation & Libraries
- **Purpose**: Access to up-to-date library documentation
- **Capabilities**: Library documentation, code examples, API references
- **Usage**: Development assistance, learning new libraries

### 5. **Replicate MCP** - AI Model Integration
- **Purpose**: AI model hosting and execution
- **Capabilities**: Model inference, image generation, AI predictions
- **Usage**: Story generation, image creation, AI features

### 6. **OpenAI MCP** - AI Development Assistant
- **Purpose**: Direct GPT integration for development help
- **Capabilities**: Code assistance, problem solving, technical questions
- **Usage**: Development guidance, debugging, code review

### 7. **IDE MCP** - Development Environment
- **Purpose**: IDE integration for diagnostics and code execution
- **Capabilities**: Language diagnostics, Jupyter integration, error detection
- **Usage**: Code quality, testing, debugging

### 8. **TaskMaster MCP** - Project Management
- **Purpose**: AI-powered task and project management
- **Capabilities**: Task creation, progress tracking, analytics, project organization
- **Usage**: Project planning, task management, progress monitoring

### 9. **Obsidian MCP** - Knowledge Management & Documentation
- **Purpose**: Obsidian vault integration for note-taking and knowledge management
- **Capabilities**: Create, read, update notes; link management; vault organization
- **Usage**: Project documentation, knowledge base, meeting notes, technical specifications

## 🚀 Integrated Development Workflow

### Phase 1: Project Setup & Planning
```bash
# 1. Use TaskMaster for project initialization
mcp taskmaster initialize-project --projectRoot ./

# 2. Parse PRD to generate tasks
mcp taskmaster parse-prd --input .taskmaster/docs/prd.txt

# 3. Set up development environment
npm install
npm run dev
```

### Phase 2: Development Cycle
```bash
# 1. Get next task from TaskMaster
mcp taskmaster next-task

# 2. Use Context7 for documentation
mcp context7 get-library-docs --library react --topic hooks

# 3. Document findings in Obsidian
# Create notes for technical decisions and implementation details

# 4. Use IDE diagnostics for code quality
mcp ide get-diagnostics

# 5. Test with Supabase integration
mcp supabase execute-sql --query "SELECT * FROM stories LIMIT 5"

# 6. Update task progress
mcp taskmaster set-task-status --id 1 --status in-progress
```

### Phase 3: Testing & Integration
```bash
# 1. Run tests and check diagnostics
npm test
mcp ide get-diagnostics

# 2. Test AI integrations
mcp replicate search-models --query "story generation"
mcp openai ask-openai --prompt "Best practices for React hooks"

# 3. Database operations
mcp supabase list-tables
mcp supabase get-logs --service api

# 4. Mark tasks complete
mcp taskmaster set-task-status --id 1 --status completed
```

### Phase 4: Deployment & Monitoring
```bash
# 1. GitHub operations
mcp github create-pull-request --title "Feature: Story Creation Wizard"

# 2. Monitor application
mcp supabase get-advisors --type security
mcp supabase get-logs --service postgres

# 3. Update project status
mcp taskmaster get-tasks --status completed
```

## 📋 Development Commands

### Code Quality & Linting
```bash
npm run lint        # ESLint checking
npm run lint:fix    # Auto-fix linting issues  
npm run format      # Prettier formatting
npm run test        # Run test suite
npm run test:coverage # Test coverage report
```

### Supabase Operations  
```bash
npm run supabase:start     # Start local Supabase
npm run supabase:stop      # Stop local Supabase
npm run supabase:reset     # Reset database
npm run supabase:functions:serve  # Serve edge functions
npm run supabase:functions:deploy # Deploy edge functions
```

### Build & Deployment
```bash
npm run build      # Production build
npm run preview    # Preview build locally
```

## 🎯 MCP Integration Patterns

### 1. **File-First Development**
```typescript
// Use Filesystem MCP for all file operations
// Use IDE MCP for diagnostics and validation
// Use Context7 MCP for documentation lookup
```

### 2. **Database-Driven Features**
```typescript
// Use Supabase MCP for schema operations
// Use Filesystem MCP for migration files
// Use GitHub MCP for version control
```

### 3. **AI-Powered Development**
```typescript
// Use OpenAI MCP for coding assistance
// Use Replicate MCP for story/image generation
// Use TaskMaster MCP for task planning
```

### 4. **Quality Assurance**
```typescript
// Use IDE MCP for diagnostics
// Use GitHub MCP for code review
// Use Supabase MCP for performance monitoring
```

### 5. **Knowledge Documentation**
```typescript
// Use Obsidian MCP for technical documentation
// Use TaskMaster MCP for progress tracking  
// Use GitHub MCP for collaborative documentation
```

## 🔄 Automated Workflows

### Daily Development Routine
1. **Morning Setup**:
   - Check TaskMaster for priority tasks
   - Review GitHub notifications and PRs
   - Check Supabase logs for any issues

2. **Development Session**:
   - Use Context7 for library documentation
   - Use IDE diagnostics for code quality
   - Use OpenAI for complex problem solving
   - Document technical decisions in Obsidian
   - Update TaskMaster with progress

3. **End of Day**:
   - Run full test suite
   - Check Supabase advisors for security/performance
   - Update GitHub with commits/PRs
   - Mark TaskMaster tasks as completed

### Weekly Planning
1. **Project Review**:
   - Analyze TaskMaster project progress
   - Review GitHub repository metrics
   - Check Supabase usage and performance

2. **Feature Planning**:
   - Use TaskMaster to plan upcoming features
   - Research with Context7 for implementation patterns
   - Estimate complexity with AI assistance

## 🛠️ Troubleshooting

### Common Issues
1. **MCP Connection Issues**:
   - Check `.mcp-config.json` configuration
   - Verify API keys and permissions
   - Restart MCP servers if needed

2. **Development Environment**:
   - Use IDE MCP to check diagnostics
   - Use Filesystem MCP to verify file structure
   - Check package.json dependencies

3. **Database Problems**:
   - Use Supabase MCP to check logs
   - Verify database connection
   - Check migration status

4. **AI Integration Issues**:
   - Verify Replicate/OpenAI API keys
   - Check rate limits and quotas
   - Test with simple requests first

## 📊 Progress Tracking

### TaskMaster Integration
- All development tasks tracked in TaskMaster
- Progress analytics and reporting
- Dependency management and scheduling
- Completion rate monitoring

### GitHub Integration
- Code review workflow
- Issue and PR management
- Release planning and deployment
- Community collaboration

### Quality Metrics
- Code coverage tracking
- Performance monitoring
- Security advisory monitoring
- User experience metrics

This integrated MCP workflow provides comprehensive project management, development assistance, and operational monitoring for the Tale-Forge rebuild project.

## Task Master AI Instructions
**Import Task Master's development workflow commands and guidelines, treat as if import is in the main CLAUDE.md file.**
@./.taskmaster/CLAUDE.md
