#!/usr/bin/env pwsh
# Setup Continue MCP Servers - Airtable, Slack, Gmail
# Run as Administrator: powershell -ExecutionPolicy Bypass -File setup-continue-mcps.ps1

$ContinueDir = "C:\Users\Administrator\continue-demo\.continue"
$ConfigFile = "$ContinueDir\config.yaml"

if (-not (Test-Path $ConfigFile)) {
    Write-Host "❌ Error: config.yaml not found at $ConfigFile" -ForegroundColor Red
    exit 1
}

Write-Host "📝 Updating Continue MCP configuration..." -ForegroundColor Cyan
Write-Host "   File: $ConfigFile`n" -ForegroundColor Gray

# Read the current config
$config = Get-Content $ConfigFile -Raw

# Check if MCPs are already configured
if ($config -match "airtable:") {
    Write-Host "✅ Airtable MCP already configured" -ForegroundColor Green
} else {
    Write-Host "➕ Adding Airtable MCP..." -ForegroundColor Yellow
}

if ($config -match "slack:") {
    Write-Host "✅ Slack MCP already configured" -ForegroundColor Green
} else {
    Write-Host "➕ Adding Slack MCP..." -ForegroundColor Yellow
}

if ($config -match "gmail:") {
    Write-Host "✅ Gmail MCP already configured" -ForegroundColor Green
} else {
    Write-Host "➕ Adding Gmail MCP..." -ForegroundColor Yellow
}

Write-Host ""

# Find the mcpServers section and add new servers if needed
if ($config -notmatch "airtable:") {
    $airtableConfig = @"
  airtable:
    type: stdio
    command: node
    args:
      - "%APPDATA%/npm/node_modules/@airtable/mcp-server/dist/index.js"
    env:
      AIRTABLE_TOKEN: "`${AIRTABLE_TOKEN}"
    disabled: false
    tools:
      - "*"

"@

    # Insert before the next server (make, notion, or web-search)
    if ($config -match "make:") {
        $config = $config -replace "(mcpServers:)", "`$1`n$airtableConfig"
    }
}

if ($config -notmatch "slack:") {
    $slackConfig = @"
  slack:
    type: stdio
    command: node
    args:
      - "%APPDATA%/npm/node_modules/slack-mcp-server/dist/index.js"
    env:
      SLACK_BOT_TOKEN: "`${SLACK_BOT_TOKEN}"
      SLACK_TEAM_ID: "`${SLACK_TEAM_ID}"
    disabled: false
    tools:
      - "*"

"@

    if ($config -match "make:") {
        $config = $config -replace "(airtable:\s+type:.*?tools:.*?\n)", "`$1`n$slackConfig"
    }
}

if ($config -notmatch "gmail:") {
    $gmailConfig = @"
  gmail:
    type: stdio
    command: node
    args:
      - "%APPDATA%/npm/node_modules/@anthropic-ai/gmail-mcp-server/dist/index.js"
    env:
      GOOGLE_SERVICE_ACCOUNT_JSON: "`${GOOGLE_SERVICE_ACCOUNT_JSON}"
    disabled: false
    tools:
      - "*"

"@

    if ($config -match "slack:") {
        $config = $config -replace "(slack:\s+type:.*?tools:.*?\n)", "`$1`n$gmailConfig"
    }
}

# Write back with proper encoding
[System.IO.File]::WriteAllText($ConfigFile, $config, [System.Text.Encoding]::UTF8)

Write-Host "✅ Config updated successfully!`n" -ForegroundColor Green

# Install packages
Write-Host "📦 Installing MCP packages..." -ForegroundColor Cyan
Push-Location "C:\Users\Administrator\continue-demo"

$packages = @(
    "@airtable/mcp-server",
    "slack-mcp-server",
    "@anthropic-ai/gmail-mcp-server"
)

foreach ($package in $packages) {
    Write-Host "   Installing $package..." -ForegroundColor Gray
    npm install $package 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ $package installed" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Failed to install $package" -ForegroundColor Red
    }
}

Pop-Location

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Close VS Code completely" -ForegroundColor White
Write-Host "2. Reopen VS Code" -ForegroundColor White
Write-Host "3. Go to Continue → Tools (wrench icon)" -ForegroundColor White
Write-Host "4. Verify you see: airtable, slack, gmail (all ✅ green)" -ForegroundColor White
Write-Host "`nThen test in Continue chat:" -ForegroundColor Cyan
Write-Host "@airtable List your bases" -ForegroundColor Gray
Write-Host "@slack List channels" -ForegroundColor Gray
Write-Host "@gmail Show recent emails" -ForegroundColor Gray
