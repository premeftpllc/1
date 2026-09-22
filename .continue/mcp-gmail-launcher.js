const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const envPath = path.join(__dirname, '.env.local');
const oauthPath = path.join(__dirname, 'gcp-oauth.keys.json');
const serverPath = path.join(__dirname, '..', 'node_modules', '@klodr', 'gmail-mcp', 'dist', 'index.js');

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([^#\s][^=]*)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2];
  }
}

function ensureOAuthKeys() {
  if (fs.existsSync(oauthPath)) return;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth2callback';
  if (!clientId || !clientSecret || clientId.includes('YOUR_') || clientSecret.includes('YOUR_')) return;

  const keys = {
    web: {
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uris: [redirectUri]
    }
  };
  fs.writeFileSync(oauthPath, `${JSON.stringify(keys, null, 2)}\n`, { mode: 0o600 });
}

loadEnv(envPath);
ensureOAuthKeys();
process.env.GMAIL_OAUTH_PATH = oauthPath;

const child = spawn(process.execPath, [serverPath, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: process.env
});

child.on('exit', (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
