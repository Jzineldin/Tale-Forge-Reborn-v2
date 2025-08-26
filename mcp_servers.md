## New MCP Server Configurations

Here are the JSON configurations for Linear, Notion, and Sentry MCP servers. These should be added to the `mcpServers` object in your `.cursor/mcp.json` file.

### Linear

```json
{
  "command": "npx",
  "args": [
    "-y",
    "@linearb-dev/linear-mcp-server"
  ],
  "env": {
    "LINEAR_API_KEY": "${env.LINEAR_API_KEY}"
  }
}
```

### Notion

```json
{
  "command": "npx",
  "args": [
    "-y",
    "@mcp-artifacts/notion@0.1.2"
  ],
  "env": {
    "NOTION_API_KEY": "${env.NOTION_API_KEY}"
  }
}
```

### Sentry

```json
{
  "command": "npx",
  "args": [
    "-y",
    "@mcp-artifacts/sentry@0.1.2"
  ],
  "env": {
    "SENTRY_AUTH_TOKEN": "${env.SENTRY_AUTH_TOKEN}",
    "SENTRY_ORG": "${env.SENTRY_ORG}",
    "SENTRY_PROJECT": "${env.SENTRY_PROJECT}"
  }
}
```

### Environment Variables

Add the following to your `.env` file:

```
LINEAR_API_KEY=your_linear_api_key
NOTION_API_KEY=your_notion_api_key
SENTRY_AUTH_TOKEN=your_sentry_auth_token
SENTRY_ORG=your_sentry_organization
SENTRY_PROJECT=your_sentry_project
```

### Permissions

Update the `permissions` array in `mcp.json` to grant access to the new tools:

```json
"permissions": [
  "mcp__linear__*",
  "mcp__notion__*",
  "mcp__sentry__*"
]
```

These configurations will allow the AI to interact with Linear, Notion, and Sentry.