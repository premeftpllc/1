const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const envPath = path.join(__dirname, '.env.local');
const sharedOauthPath = path.join(__dirname, 'gcp-oauth.keys.json');
const driveConfigDir = path.join(os.homedir(), '.config', 'google-drive-mcp');
const driveOauthPath = path.join(driveConfigDir, 'gcp-oauth.keys.json');

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([^#\s][^=]*)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2];
  }
}

function ensureOAuthKeys() {
  if (fs.existsSync(driveOauthPath)) return;

  if (fs.existsSync(sharedOauthPath)) {
    fs.mkdirSync(driveConfigDir, { recursive: true });
    fs.copyFileSync(sharedOauthPath, driveOauthPath);
    return;
  }

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
  fs.mkdirSync(driveConfigDir, { recursive: true });
  fs.writeFileSync(driveOauthPath, `${JSON.stringify(keys, null, 2)}\n`, { mode: 0o600 });
}

loadEnv(envPath);
ensureOAuthKeys();

const serverPath = path.join(__dirname, '..', 'node_modules', '@piotr-agier', 'google-drive-mcp', 'dist', 'index.js');

const child = spawn(process.execPath, [serverPath, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: process.env
});

child.on('exit', (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
