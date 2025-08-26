# Security Guidelines for Tale Forge

## Environment Setup

### 1. Never Commit Secrets
- **NEVER** commit `.env` files to version control
- **NEVER** commit `.mcp.json` or `mcp.json` files
- **NEVER** commit API keys, tokens, or passwords

### 2. Use Environment Variables
1. Copy `.env.example` to `.env`
2. Fill in your actual values in `.env`
3. Keep `.env` local only

### 3. MCP Configuration
1. Copy `.mcp.example.json` to `.mcp.json`
2. Add your API keys to `.mcp.json`
3. Never commit `.mcp.json`

## Files That Should Never Be Committed

The following files are automatically ignored by `.gitignore`:

- `.env` and all `.env.*` files (except `.env.example`)
- `.mcp.json` and `mcp.json`
- Any file ending in `.key`, `.pem`, `.p12`, `.pfx`, `.crt`, `.cer`
- `serviceAccountKey.json` and similar credential files
- Database migration scripts (`*-direct.js`, `check-db-*.js`, etc.)
- `.vscode/`, `.cursor/` directories (may contain workspace secrets)

## If You Accidentally Commit Secrets

If you accidentally commit sensitive information:

1. **Immediately rotate/regenerate the exposed keys**
2. Remove the file from tracking: `git rm --cached <filename>`
3. Add the file to `.gitignore`
4. Consider using `git filter-branch` or BFG Repo-Cleaner to remove from history
5. Force push to update remote (coordinate with team first)

## Best Practices

1. **Always use environment variables** for sensitive configuration
2. **Review changes before committing** - use `git diff` to check
3. **Use `.example` files** to document required environment variables
4. **Rotate keys regularly** especially if they've been exposed
5. **Use secret scanning tools** like GitHub secret scanning

## Required Environment Variables

See `.env.example` for all required environment variables and their descriptions.

## Questions or Concerns?

If you have security concerns or questions, please reach out to the project maintainers.