# Tale-Forge MCP Development Setup

## Quick Start
```bash
# Check MCP status
npm run mcp:status

# Start development workflow
npm run workflow:start

# Get next task from TaskMaster
npm run taskmaster:next

# Run quality checks
npm run workflow:check
```

## Available MCP Servers
- **Filesystem**: File operations and management
- **Supabase**: Database operations and backend
- **GitHub**: Version control and collaboration  
- **Context7**: Library documentation access
- **Replicate**: AI model integration
- **OpenAI**: Development assistance
- **IDE**: Code diagnostics and execution
- **TaskMaster**: Project and task management

## Development Workflow
1. Use TaskMaster to get next priority task
2. Use Context7 for library documentation
3. Use IDE for code quality and diagnostics
4. Use Supabase for database operations
5. Use GitHub for version control
6. Use AI tools for complex problem solving

## Next Steps
1. Run `npm run taskmaster:init` to initialize project
2. Check `CLAUDE.md` for detailed workflow documentation
3. Use `.taskmaster/dev-workflow.md` for command reference
