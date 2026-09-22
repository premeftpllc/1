#!/usr/bin/env node

const required = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN'];

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

function encodeBase64Url(value) {
  return Buffer.from(value, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function validateHeader(value, name) {
  if (/\r|\n/.test(value)) {
    throw new Error(`${name} must not contain a newline`);
  }
}

async function getAccessToken() {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: requireEnv('GOOGLE_CLIENT_ID'),
      client_secret: requireEnv('GOOGLE_CLIENT_SECRET'),
      refresh_token: requireEnv('GOOGLE_REFRESH_TOKEN'),
      grant_type: 'refresh_token'
    })
  });

  const body = await response.json();
  if (!response.ok || !body.access_token) {
    throw new Error(`Google token request failed: ${response.status} ${JSON.stringify(body)}`);
  }
  return body.access_token;
}

async function gmailRequest(path, options = {}) {
  const accessToken = await getAccessToken();
  const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me${path}`, {
    ...options,
    headers: {
      authorization: `Bearer ${accessToken}`,
      ...(options.headers || {})
    }
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(`Gmail request failed: ${response.status} ${JSON.stringify(body)}`);
  }
  return body;
}

async function listUnread(maxResults = 20) {
  const params = new URLSearchParams({
    q: 'in:anywhere is:unread',
    maxResults: String(Math.min(Math.max(maxResults, 1), 100))
  });
  return gmailRequest(`/messages?${params}`);
}

async function sendEmail({ to, subject, text }) {
  validateHeader(to, 'to');
  validateHeader(subject, 'subject');
  const raw = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    text
  ].join('\r\n');

  return gmailRequest('/messages/send', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ raw: encodeBase64Url(raw) })
  });
}

async function main() {
  for (const name of required) {
    requireEnv(name);
  }

  const [command, ...args] = process.argv.slice(2);
  if (command === 'list-unread') {
    console.log(JSON.stringify(await listUnread(Number(args[0] || 20)), null, 2));
    return;
  }

  if (command === 'send') {
    const [to, subject, ...textParts] = args;
    if (!to || !subject || textParts.length === 0) {
      throw new Error('Usage: node gmail-rest-integration.js send <to> <subject> <body>');
    }
    console.log(JSON.stringify(await sendEmail({ to, subject, text: textParts.join(' ') }), null, 2));
    return;
  }

  throw new Error('Usage: node gmail-rest-integration.js list-unread [maxResults] | send <to> <subject> <body>');
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { listUnread, sendEmail };
