# AI Development Tools Setup

## Overview
This project is configured with two powerful AI development tools:

1. **Task Master AI** - Task management and planning
2. **Claude Context** - Semantic code search and contextual understanding

## Task Master AI Setup

### What it does
- Manages development tasks and workflows
- Breaks down complex features into manageable steps
- Tracks progress and priorities

### Usage Commands
```bash
# List all tasks
npx task-master list

# Show next task to work on
npx task-master next

# Parse a PRD document
npx task-master parse-prd <file>

# Generate task files
npx task-master generate
```

### Configuration
- Main config: `taskmaster.config.json`
- MCP integration: `.mcp-config.json`

## Claude Context Setup

### What it does
- Provides semantic search across your entire codebase
- Uses hybrid search (BM25 + vector embeddings)
- Makes your entire codebase available as context to AI assistants

### Required API Keys
You'll need to set up these services:

1. **OpenAI API Key** - For embeddings
2. **Zilliz Cloud** - For vector database storage
   - Sign up at: https://cloud.zilliz.com/
   - Create a cluster and get URI + token

### Configuration Steps
1. Update `.mcp-config.json` with your API keys:
   ```json
   "OPENAI_API_KEY": "sk-your-key-here",
   "ZILLIZ_CLOUD_URI": "your-zilliz-uri-here",
   "ZILLIZ_CLOUD_TOKEN": "your-zilliz-token-here"
   ```

2. Configuration file: `.claude-context.config.json`
   - Indexes TypeScript, React, SQL, and Markdown files
   - Excludes test files and build directories

### Usage
Once configured, Claude Context will:
- Index your codebase automatically
- Provide semantic search capabilities
- Enable contextual code assistance

## MCP Integration

Both tools are configured as MCP (Model Context Protocol) servers in `.mcp-config.json`. This enables:
- Direct integration with Claude Code and other AI assistants
- Seamless access to task management and code context
- Enhanced development workflow automation

## Getting Started

1. Install dependencies (already done):
   ```bash
   npm install task-master-ai
   ```

2. Set up your API keys in `.mcp-config.json`

3. Start using the tools:
   ```bash
   # Task management
   npx task-master list
   
   # Your AI assistant now has access to both tools via MCP
   ```

## File Structure
```
.
├── taskmaster.config.json      # Task Master configuration
├── .claude-context.config.json # Claude Context configuration
├── .mcp-config.json           # MCP server configuration
└── README-AI-SETUP.md         # This file
```