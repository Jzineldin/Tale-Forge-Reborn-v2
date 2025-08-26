## Updated Supabase Configuration

To grant full access to your Supabase database, replace the existing `supabase` server configuration in your `.cursor/mcp.json` file with the following:

```json
{
  "command": "npx",
  "args": [
    "-y",
    "@mcp-artifacts/supabase@0.1.7",
    "--key",
    "${env.SUPABASE_SERVICE_ROLE_KEY}",
    "--url",
    "${env.SUPABASE_URL}"
  ],
  "env": {
    "SUPABASE_URL": "${env.SUPABASE_URL}",
    "SUPABASE_SERVICE_ROLE_KEY": "${env.SUPABASE_SERVICE_ROLE_KEY}"
  }
}
```

### Instructions

1.  Obtain the `service_role` key from your Supabase project dashboard.
2.  Add the following to your `.env` file:
    ```
    SUPABASE_URL=your_supabase_project_url
    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
    ```
3.  Replace the existing `supabase` object in the `servers` section of your `mcp.json` with the JSON above.
4.  Update the `permissions` array in `mcp.json` to grant full access:
    ```json
    "permissions": [
      "mcp__supabase__*"
    ]
    ```

This configuration will allow the AI to perform administrative tasks on your Supabase database.