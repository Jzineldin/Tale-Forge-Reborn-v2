# 🚨 POST-RESTART INSTRUCTIONS - SUPABASE CLI FIX

## CURRENT ISSUE
- Supabase CLI is broken due to token format incompatibility
- Error: "Invalid access token format. Must be like `sbp_0102...1920`"
- This breaks MCP tools, deployment, and all Supabase management

## WHAT WE FIXED
- ✅ Removed ALL old `sbp_` tokens from project files (.cursor/mcp.json, .mcp.json, deploy scripts)
- ✅ Cleaned hardcoded JWT tokens from MCP configs
- ✅ Set MCP configs to use environment variables instead
- ✅ Removed conflicting SUPABASE_ACCESS_TOKEN from .env file

## WHAT YOU NEED TO DO AFTER RESTART

### 1. VERIFY ENVIRONMENT IS CLEAN
```bash
echo $SUPABASE_ACCESS_TOKEN
# Should be empty or not exist
```

### 2. GET FRESH CLI ACCESS TOKEN
- Go to: https://supabase.com/dashboard/account/tokens
- Create new token named "Tale-Forge-CLI"
- Copy the token (should start with `sbp_` and be in correct format)

### 3. TEST CLI LOGIN
```bash
supabase login --token YOUR_NEW_SBP_TOKEN
supabase projects list
# Should work without errors!
```

### 4. UPDATE ENVIRONMENT FOR MCP
Add to your `.env` file:
```bash
SUPABASE_ACCESS_TOKEN=your_new_sbp_token_here
```

### 5. TEST MCP TOOLS
```bash
# Test if MCP Supabase tools work
mcp supabase list-projects
```

### 6. DEPLOY EDGE FUNCTIONS TO PRODUCTION
```bash
# Deploy your AI-optimized Edge Functions
supabase functions deploy generate-story-segment --project-ref fyihypkigbcmsxyvseca
supabase functions deploy create-story --project-ref fyihypkigbcmsxyvseca
```

## EXPECTED RESULTS
- ✅ CLI commands work
- ✅ MCP Supabase tools work  
- ✅ Can deploy to production
- ✅ AI story generation works in production
- ✅ Vercel deployment will work

## IF STILL BROKEN
The environment variable might still be inherited from system level. Check:
```bash
powershell "Get-ChildItem Env: | Where-Object Name -like '*SUPABASE*'"
```

If still there, you may need to:
1. Remove from Windows system environment variables
2. Restart computer
3. Or use `supabase login --token` directly without environment variables

---
**ROOT CAUSE**: You had multiple conflicting Supabase tokens scattered across files, causing the CLI to use wrong token types. Now everything is clean and ready for fresh authentication.