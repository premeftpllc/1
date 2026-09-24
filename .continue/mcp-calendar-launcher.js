const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const envPath = path.join(__dirname, '.env.local');
const oauthPath = path.join(__dirname, 'gcp-oauth.keys.json');

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([^#\s][^=]*)=(.*)$/);
    // Only fill from .env.local when the var is unset OR is an unexpanded template.
    // Continue passes single-brace ${VAR} (and unresolved ${{ secrets.X }}) through as
    // LITERAL text, which is truthy - so a plain `||` guard would keep the garbage.
    // A real value (e.g. resolved from ${{ secrets.X }} via ~/.continue/.env) wins.
    if (match) {
      const k = match[1].trim(), cur = process.env[k];
      if (!cur || /^\$\{\{?/.test(cur)) process.env[k] = match[2];
    }
  }
}

function ensureOAuthKeys() {
  if (fs.existsSync(oauthPath)) return;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth2callback';
  if (!clientId || !clientSecret || clientId.includes('YOUR_') || clientSecret.includes('YOUR_')) return;

  const keys = {
    installed: {
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uris: [redirectUri]
    }
  };
  fs.writeFileSync(oauthPath, `${JSON.stringify(keys, null, 2)}\n`, { mode: 0o600 });
}

loadEnv(envPath);
ensureOAuthKeys();
process.env.GOOGLE_OAUTH_CREDENTIALS = oauthPath;

const serverPath = path.join(__dirname, '..', 'node_modules', '@cocal', 'google-calendar-mcp', 'build', 'index.js');

const child = spawn(process.execPath, [serverPath, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: process.env
});

child.on('exit', (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
