# Continue Connector Authorization: Executable Steps

## First: protect the current secrets

`.continue/.env.local` contains credential values. Do not paste them into chat, commit them, or put them in Make webhook data. Rotate any token that has been exposed outside the local machine, especially the Airtable PAT.

The repository now ignores `.continue/.env.local`, `preme-os/.env.local`, and common Google OAuth files. Confirm with `git status` before committing.

## 1. Airtable

The installed package is Airtable's official MCP CLI. Use it for credential testing, but register Airtable in Continue as the hosted Streamable HTTP MCP server rather than as a local stdio process.

```powershell
cd C:\Users\Administrator\continue-demo
npx airtable-mcp whoami
npx airtable-mcp tools
```

If authorization fails, configure a fresh PAT with only the required base and scopes:

```powershell
npx airtable-mcp configure
```

Use `data.records:read` for read-only operation. Add `data.records:write` only when the Airtable update branch is enabled again.

## 2. Slack

The installed Slack server uses a token-based local process. The bot must be installed in the workspace and invited to every channel it needs to read or post in.

For a read-only smoke test:

```powershell
$env:SLACK_BOT_TOKEN = '<token entered locally>'
cd C:\Users\Administrator\continue-demo
npx slack-mcp-server
```

Do not put the token in a command that will be saved in shell history. Prefer the env file loaded by the Continue process. If posting is required, configure `SLACK_MCP_ADD_MESSAGE_TOOL` with an allow-list of channel IDs rather than enabling posting globally.

## 3. Gmail

A Google API key is not enough to access Gmail mailboxes. Use OAuth.

The installed Gmail MCP supports a browser authorization flow:

```powershell
cd C:\Users\Administrator\continue-demo
npx @klodr/gmail-mcp auth --scopes=gmail.readonly,gmail.send
```

Use `gmail.modify` only if the assistant must label or modify messages. The flow stores credentials under the Gmail MCP directory with restricted permissions. Then register the server in the active Continue config:

```yaml
  - name: gmail
    command: npx
    args:
      - -y
      - '@klodr/gmail-mcp'
      - '--scopes=gmail.readonly,gmail.send'
```

For Make's HTTP fallback, use the resulting Google OAuth client ID, client secret, and refresh token in Make's encrypted credential fields. The fallback implementation is `preme-os/gmail-rest-integration.js`.

## 4. Register the connector servers in active Continue config

The active file is `%USERPROFILE%\.continue\config.yaml`. The project template `preme-os/config.yaml` is not automatically used by Continue.

The active config intentionally uses the working Make MCP bridge as the automation gateway:

```yaml
  - name: make-custom-mcp
    command: node
    args:
      - C:/Users/Administrator/continue-demo/web-search-mcp/scripts/make-mcp-bridge.js
```

This bridge is already exposing Make's tools. Create Airtable, Slack, and Gmail connections inside Make, then use the bridge to operate those scenarios. The direct Airtable/Slack/Gmail MCP entries are intentionally disabled until their independent authentication is valid. Never place raw secrets directly in `config.yaml`.

## 5. Restart and verify

1. Save the config.
2. Reload VS Code with `Developer: Reload Window`.
3. Open Continue's MCP/server status view.
4. Confirm the three servers start without `401`, `403`, OAuth, or command-not-found errors.
5. Test read-only calls first: Airtable `whoami/tools`, Slack channel listing, Gmail list unread.
6. Test writes last and only against a test Slack channel/test Gmail recipient.

## Current limitation

Airtable's monthly API limit cannot be bypassed by MCP, Make, or a new token. If the account is hard-blocked, keep Airtable writes disabled and use the webhook-driven Make design in `MAKE_AIRTABLE_LIMIT_BLUEPRINT.md` until Airtable access is restored.
