# Continue MCP Servers Setup

**Status:** Template ready  
**Services:** Airtable, Make, Gmail, Shopify, Notion, Slack  
**Method:** YAML config with environment variables  

---

## Quick Start

### 1. Set Environment Variables

**Option A: Add to `~/.zshrc` (recommended for Mac)**

```bash
# Open your shell profile
nano ~/.zshrc

# Add these lines (replace with real tokens):
export AIRTABLE_TOKEN="pat_YOUR_TOKEN_HERE"
export AIRTABLE_BASE_ID="appXXXXXXXXXXXX"
export MAKE_API_KEY="sk_live_YOUR_KEY_HERE"
export MAKE_TEAM_ID="YOUR_TEAM_ID"
export GOOGLE_CREDENTIALS_PATH="$HOME/.continue/google-credentials.json"
export SHOPIFY_STORE_URL="premeftpshop.myshopify.com"
export SHOPIFY_ACCESS_TOKEN="shppa_YOUR_TOKEN_HERE"
export NOTION_API_KEY="ntn_YOUR_TOKEN_HERE"
export SLACK_BOT_TOKEN="xoxb_YOUR_TOKEN_HERE"
export SLACK_TEAM_ID="T_YOUR_TEAM_ID"

# Save and reload
source ~/.zshrc
```

**Option B: Use direnv (.envrc file)**

```bash
# Create .envrc in project root
cat > .envrc << 'EOF'
export AIRTABLE_TOKEN="pat_YOUR_TOKEN"
export MAKE_API_KEY="sk_live_YOUR_KEY"
# ... etc
EOF

# Install direnv and load
brew install direnv
direnv allow
```

### 2. Get API Tokens

| Service | Token | Where to Get |
|---------|-------|-------------|
| **Airtable** | `pat_*` | https://airtable.com/account/tokens |
| **Make** | `sk_live_*` | Make.com → Profile → API |
| **Google** | JSON file | https://console.cloud.google.com → Credentials |
| **Shopify** | `shppa_*` | Shopify → Apps & integrations → Apps & channel settings |
| **Notion** | `ntn_*` | https://www.notion.so/my-integrations |
| **Slack** | `xoxb_*` | https://api.slack.com/apps → OAuth & Permissions |

### 3. Download Google Credentials

```bash
# Download OAuth JSON from Google Cloud Console
# Save to: ~/.continue/google-credentials.json
# Set in .zshrc: export GOOGLE_CREDENTIALS_PATH="$HOME/.continue/google-credentials.json"
```

### 4. Restart Continue IDE

1. Close VS Code completely
2. Reopen VS Code
3. Open a Continue chat
4. Start using MCP tools: "Query my Airtable base" or "List Make scenarios"

---

## Cross-Device Sync (PC → Mac)

**Git workflow:**

```bash
# On PC: Set environment variables in Windows environment
# Commit config.yaml to git (tokens NOT in file)
git add .continue/mcpServers/config.yaml
git commit -m "Add: MCP servers configuration"
git push

# On Mac: Pull the config
git pull

# Add tokens to ~/.zshrc
# Test: reload shell and verify environment vars
env | grep AIRTABLE_TOKEN
```

**PC Setup** (Windows):

```powershell
# Set environment variables in Windows
[System.Environment]::SetEnvironmentVariable("AIRTABLE_TOKEN", "pat_YOUR_TOKEN", "User")
[System.Environment]::SetEnvironmentVariable("MAKE_API_KEY", "sk_live_YOUR_KEY", "User")
# ... repeat for others

# Verify
echo $env:AIRTABLE_TOKEN

# Then: git add .continue/mcpServers/config.yaml and commit
```

---

## Verify Setup

```bash
# Test 1: Check environment variables
env | grep AIRTABLE
env | grep MAKE_API

# Test 2: Restart Continue and test in chat
# "Query Airtable table: [table name]"
# "List Make.com scenarios"

# Test 3: Check Continue logs if issues
# Look for MCP server startup messages
```

---

## Troubleshooting

**MCP server not connecting?**
- ✓ Verify environment variables: `env | grep AIRTABLE_TOKEN`
- ✓ Restart VS Code completely (not just the window)
- ✓ Check token validity (some tokens expire)
- ✓ Look at Continue output panel for error messages

**Token expired?**
- Get new token from service
- Update environment variable
- Restart Continue

**PC/Mac sync issues?**
- Tokens should NOT be in config.yaml (only in environment)
- Each device sets its own environment variables
- config.yaml should be identical on both devices

---

## Files

- `config.yaml` — MCP server definitions (shared via git)
- `~/.zshrc` — Environment variables (local to each device)
- `~/.continue/google-credentials.json` — Google auth JSON (local to each device)

---

**Ready to set up?** Fill in your tokens and restart Continue IDE.
