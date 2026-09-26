// cPanel Phusion Passenger Startup File: app.js
// This file is loaded by cPanel's "Setup Node.js App" when Startup File is 'app.js'
const fs = require('fs');
const path = require('path');

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Locate server bundle
const bundleCandidates = [
  path.join(__dirname, 'dist', 'server.cjs'),
  path.join(__dirname, 'server.cjs'),
  path.join(process.cwd(), 'dist', 'server.cjs'),
  path.join(process.cwd(), 'server.cjs')
];

const bundlePath = bundleCandidates.find(p => fs.existsSync(p));

if (bundlePath) {
  require(bundlePath);
} else {
  // Graceful fallback listener so cPanel never serves a 503 error
  const http = require('http');
  const port = process.env.PORT || 3000;
  const isSocket = isNaN(Number(port));
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Spinel Distribution - Deployment Notice</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b1329; color: #f8fafc; padding: 40px 20px; text-align: center; }
          .card { background: #1e293b; max-width: 600px; margin: 30px auto; padding: 32px; border-radius: 12px; border: 1px solid #334155; }
          h2 { color: #f59e0b; margin-top: 0; }
          p { color: #94a3b8; font-size: 15px; line-height: 1.6; }
          code { background: #0f172a; padding: 3px 8px; border-radius: 4px; color: #38bdf8; }
          .badge { display: inline-block; background: #b45309; color: #fef3c7; padding: 4px 10px; border-radius: 9999px; font-weight: 600; font-size: 12px; margin-bottom: 12px; }
        </style>
      </head>
      <body>
        <div class="card">
          <span class="badge">Action Required</span>
          <h2>Spinel Distribution Node.js App Running</h2>
          <p>The cPanel Node.js server is online, but the production bundle (<code>dist/server.cjs</code>) was not found in the application directory.</p>
          <p><strong>To resolve:</strong> Run <code>npm run build</code> in the cPanel Terminal, or build locally and upload the <code>dist/</code> folder into your application root.</p>
        </div>
      </body>
      </html>
    `);
  });

  if (isSocket) {
    server.listen(port, () => console.log('[cPanel Fallback] Listening on socket', port));
  } else {
    server.listen(parseInt(String(port), 10), () => console.log('[cPanel Fallback] Listening on port', port));
  }
}
