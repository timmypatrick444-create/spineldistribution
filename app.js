// cPanel Phusion Passenger Startup File: app.js
// This file is loaded by cPanel's "Setup Node.js App" when Startup File is 'app.js'
const http = require('http');
const fs = require('fs');
const path = require('path');

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Catch unhandled errors so Passenger NEVER sees an unhandled crash (which triggers 503)
process.on('uncaughtException', (err) => {
  console.error('[cPanel Startup Exception]', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[cPanel Startup Rejection]', reason);
});

// Locate compiled server bundle across common cPanel file structures
const bundleCandidates = [
  path.join(__dirname, 'server.cjs'),
  path.join(__dirname, 'dist', 'server.cjs'),
  path.join(process.cwd(), 'server.cjs'),
  path.join(process.cwd(), 'dist', 'server.cjs')
];

const bundlePath = bundleCandidates.find(p => fs.existsSync(p));

if (bundlePath) {
  try {
    console.log('[cPanel Startup] Loading standalone server bundle from:', bundlePath);
    require(bundlePath);
  } catch (err) {
    console.error('[cPanel Startup Error] Failed to require server bundle:', err);
    startDiagnosticServer(err);
  }
} else {
  console.error('[cPanel Startup Error] No server bundle found in candidates:', bundleCandidates);
  startDiagnosticServer(new Error('Server bundle (server.cjs or dist/server.cjs) was not found in the application directory.'));
}

function startDiagnosticServer(error) {
  const port = process.env.PORT || 3000;
  const isSocket = isNaN(Number(port));
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Spinel Distribution - Deployment Diagnostic</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px 20px; line-height: 1.6; }
    .card { max-width: 680px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 32px; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    h2 { color: #f87171; margin-top: 0; font-size: 22px; }
    .badge { display: inline-block; background: #991b1b; color: #fecaca; padding: 4px 12px; border-radius: 9999px; font-weight: 600; font-size: 12px; margin-bottom: 16px; }
    pre { background: #090d16; padding: 16px; border-radius: 8px; color: #fbbf24; overflow-x: auto; font-size: 13px; border: 1px solid #1e293b; }
    code { background: #090d16; padding: 3px 6px; border-radius: 4px; color: #38bdf8; font-family: monospace; }
    ul { padding-left: 20px; color: #94a3b8; }
    li { margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">cPanel Deployment Status</span>
    <h2>Spinel Distribution - Initialization Notice</h2>
    <p>The Node.js application process is running on your cPanel server, but the backend bundle needs to be placed in your application directory:</p>
    <pre>${error ? (error.stack || error.message || String(error)) : 'Unknown initialization detail'}</pre>
    <p><strong>Steps to resolve:</strong></p>
    <ul>
      <li>Ensure <code>server.cjs</code> or the <code>dist/</code> folder is uploaded to your cPanel application root.</li>
      <li>Verify that the <strong>Application root</strong> field in cPanel matches the directory where your files are located.</li>
      <li>Click <strong>Restart Application</strong> in cPanel once the files are in place.</li>
    </ul>
  </div>
</body>
</html>`);
  });

  if (isSocket) {
    server.listen(port, () => console.log('[Diagnostic Server] Listening on socket:', port));
  } else {
    server.listen(parseInt(String(port), 10), () => console.log('[Diagnostic Server] Listening on port:', port));
  }
}
