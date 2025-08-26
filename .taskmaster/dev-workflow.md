# Development Workflow Commands

## TaskMaster Operations
```bash
# Get next task to work on
npx task-master-ai next-task

# Update task status
npx task-master-ai set-task-status --id 1 --status in-progress

# Get project overview
npx task-master-ai get-tasks --with-subtasks
```

## Database Operations
```bash
# Check database tables
npx @supabase/mcp-server-supabase list-tables

# Run SQL queries
npx @supabase/mcp-server-supabase execute-sql --query "SELECT COUNT(*) FROM stories"

# Check logs
npx @supabase/mcp-server-supabase get-logs --service api
```

## AI Integration
```bash
# Search for AI models
npx replicate-mcp search-models --query "story generation"

# Get development help
npx openai-mcp ask --prompt "How to optimize React components?"
```
