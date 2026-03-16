# MCP Setup — Q'go Cargo Survey Platform

Connect any AI agent (Claude Desktop, Cursor, Windsurf, VS Code, CLI) to manage this project's Supabase database via MCP.

---

## Step 1 — Get your Supabase Personal Access Token

1. Go to: https://supabase.com/dashboard/account/tokens
2. Click **Generate new token**
3. Give it a name like `qgo-mcp`
4. Copy the token (shown only once)

---

## Step 2 — Configure your AI tool

### Claude Desktop (`~/.claude/claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token", "YOUR_TOKEN_HERE"
      ]
    }
  }
}
```

### Cursor (`.cursor/mcp.json` in project root or `~/.cursor/mcp.json`)

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token", "YOUR_TOKEN_HERE"
      ]
    }
  }
}
```

### Windsurf (`~/.codeium/windsurf/mcp_config.json`)

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token", "YOUR_TOKEN_HERE"
      ]
    }
  }
}
```

### VS Code (`.vscode/mcp.json` in project root)

```json
{
  "inputs": [],
  "servers": {
    "supabase": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token", "YOUR_TOKEN_HERE"
      ]
    }
  }
}
```

### CLI / Any MCP-compatible tool

```bash
npx -y @supabase/mcp-server-supabase@latest --access-token YOUR_TOKEN_HERE
```

---

## Step 3 — Tell the AI about this project

When you open this project in your AI tool, just say:

> "Open AGENTS.md and use project ID evxjnkoxupqkmewtuusv to manage the Q'go Cargo Survey Platform via Supabase MCP."

The AI will read `AGENTS.md` for full context and use MCP tools to manage the database directly.

---

## Project ID (always use this)

```
evxjnkoxupqkmewtuusv
```

---

## Quick Test

Once MCP is connected, ask your AI:

```
List all tables in the Q'go Cargo Supabase project
```

Expected: Shows all 15 tables (profiles, survey_requests, survey_rooms, survey_items, items, item_categories, surveyors, survey_reports, gps_logs, tracking_sessions, container_specs, app_settings, email_logs, notifications, survey_activity)

---

## What the AI can do via MCP

- ✅ View all tables, columns, indexes
- ✅ Run SQL queries
- ✅ Apply new migrations (schema changes)
- ✅ Deploy / update Edge Functions
- ✅ Check security & performance advisors
- ✅ View logs (API, Postgres, Edge Functions, Auth)
- ✅ Add surveyors, items, categories
- ✅ Promote users to admin
- ✅ Create dev branches for testing
- ✅ Merge branches to production
