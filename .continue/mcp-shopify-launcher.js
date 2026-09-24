const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const envPath = path.join(__dirname, '.env.local');

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

loadEnv(envPath);

const hasStaticToken = process.env.SHOPIFY_ACCESS_TOKEN && !process.env.SHOPIFY_ACCESS_TOKEN.includes('YOUR_');
const hasClientCreds =
  process.env.SHOPIFY_CLIENT_ID &&
  process.env.SHOPIFY_CLIENT_SECRET &&
  !process.env.SHOPIFY_CLIENT_ID.includes('YOUR_') &&
  !process.env.SHOPIFY_CLIENT_SECRET.includes('YOUR_');

if (!hasStaticToken && !hasClientCreds) {
  throw new Error(
    'Shopify MCP launcher: set either SHOPIFY_ACCESS_TOKEN or SHOPIFY_CLIENT_ID/SHOPIFY_CLIENT_SECRET in .continue/.env.local'
  );
}

if (!process.env.MYSHOPIFY_DOMAIN || process.env.MYSHOPIFY_DOMAIN.includes('YOUR_')) {
  throw new Error('Shopify MCP launcher: set MYSHOPIFY_DOMAIN in .continue/.env.local');
}

const serverPath = path.join(__dirname, '..', 'node_modules', 'shopify-mcp', 'dist', 'index.js');

const child = spawn(process.execPath, [serverPath, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: process.env
});

child.on('exit', (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
