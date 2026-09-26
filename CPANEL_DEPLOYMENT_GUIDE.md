# cPanel Shared Hosting Deployment Guide - Spinel Distribution

If you encountered a **"503 Service Unavailable"** error when hosting this application on cPanel, this guide explains why it happened, the fixes applied, and the exact steps to get your app live immediately.

---

## 1. Why Did the "503 Service Unavailable" Error Occur?

On cPanel shared hosting with CloudLinux **"Setup Node.js App"** (Phusion Passenger):

1. **Hardcoded Port Conflict (Primary Cause)**:
   - cPanel assigns a dynamic TCP port or Unix domain socket via `process.env.PORT`.
   - The application previously attempted to bind strictly to port `3000`. Phusion Passenger could not connect to its assigned port/socket, timed out, and returned HTTP **503 Service Unavailable**.

2. **Missing Startup File (`app.js`)**:
   - In cPanel's Node.js selector, the default startup file is **`app.js`**.
   - If `app.js` did not exist in the root directory, Passenger crashed immediately on boot with `Cannot find module 'app.js'`, resulting in a 503 error.

3. **Node.js Cannot Run TypeScript Directly**:
   - If `server.ts` was entered into the cPanel startup file field, Node crashed with `SyntaxError: Unexpected token ':'` because standard Node.js does not parse TypeScript files without pre-compilation.

4. **CommonJS vs ES Module Loader Conflict**:
   - Phusion Passenger's internal launcher uses CommonJS `require()` to start Node applications. ES Modules or missing loaders trigger `ERR_REQUIRE_ESM` crashes.

---

## 2. Fixes Implemented in this Codebase

- **Dynamic Port & Passenger Socket Support**: `server.ts` now inspects `process.env.PORT`, automatically handling both numeric ports and CloudLinux Passenger Unix domain sockets.
- **Universal Startup Files Created**:
  - `app.js` (cPanel default)
  - `server.js`
  - `app.cjs`
  - `server.cjs`
  All four files point seamlessly to the production server bundle.
- **Resilient Path Resolution**: The server dynamically detects your static assets inside `dist/` regardless of cPanel home folder directory structures.
- **Crash Prevention Handlers**: Added `uncaughtException` and `unhandledRejection` guards so unexpected errors do not crash the shared hosting process.
- **Graceful Fallback Mode**: If `dist/` is ever missing, the server still boots and serves a diagnostic status page rather than crashing with a raw 503.

---

## 3. Top Reasons Why 503 Still Shows (And How to Fix in 1 Minute)

### 1. Folder Path Mismatch (The Most Common Cause)
In cPanel File Manager, look at where `app.js` is located:
- If `app.js` is in `/home/yourusername/public_html/app.js`:
  Set **Application root** = `public_html`
- If `app.js` is inside a subfolder like `/home/yourusername/public_html/spinel/app.js`:
  Set **Application root** = `public_html/spinel`
- If `app.js` is in `/home/yourusername/spinel/app.js` (outside `public_html`):
  Set **Application root** = `spinel`

If the Application root does not match the exact folder where `app.js` lives, Phusion Passenger cannot find the startup file and immediately returns **503 Service Unavailable**.

### 2. Uploading Newly Built Files
If you configured cPanel before downloading the updated code:
1. Ensure the new **`server.cjs`**, **`app.js`**, and **`dist/`** directory are uploaded to your Application root folder.
2. The new `server.cjs` is **100% self-contained**: all backend dependencies (Express, dotenv, Supabase, etc.) are pre-bundled inside it, meaning **no `node_modules` installation is required on cPanel**!

### 3. Check the Error Log (`stderr.log`)
In cPanel File Manager:
- Open your Application root directory (or check `~/.cagefs/tmp/` or your home directory).
- Look for a file named **`stderr.log`**.
- This file records the exact crash error if Node failed to start.

---

## 4. Step-by-Step cPanel Configuration

### Step A: Build the Project
Because shared hosting servers often have memory limits (512MB–1GB RAM), it is recommended to run the build before uploading, or run it once in cPanel terminal:
```bash
npm run build
```
This produces the `dist/` folder containing the optimized frontend and `dist/server.cjs`.

### Step B: Upload Files to cPanel
Using **cPanel File Manager** or **FTP/SSH**, upload the project files into your chosen application folder (e.g. `/home/username/spinel` or `public_html`):
- `dist/` (Crucial! Contains frontend bundle and server bundle)
- `app.js`
- `server.js`
- `app.cjs`
- `server.cjs`
- `package.json`
- `.htaccess`
- `.env` (optional, or set env vars in cPanel)

*(You do **not** need to upload `node_modules` or `.git`)*

### Step C: Configure "Setup Node.js App" in cPanel
1. In cPanel, search for and open **"Setup Node.js App"**.
2. Click **Create Application**:
   - **Node.js version**: Choose `18.x`, `20.x`, or `22.x` (Recommended: `20.x` or `22.x`).
   - **Application mode**: Select **`Production`**.
   - **Application root**: Enter your folder name (e.g. `spinel` or your deployment directory).
   - **Application URL**: Select your domain or subdomain.
   - **Application startup file**: Enter **`app.js`** (or `server.js`).
3. Click **Create**.

### Step D: Install Dependencies & Run
1. In the Node.js application management screen, click **Run NPM Install** (or open the cPanel Terminal and run `npm install --omit=dev`).
2. Add your environment variables under **Environment variables** (optional):
   - `NODE_ENV` = `production`
   - `ADMIN_TECHNICAL_EMAIL` = `admin@spineldistribution.com`
   - `ADMIN_ACCESS_KEY` = `your_admin_key`
   - `USD_TO_NGN_EXCHANGE_RATE` = `1500`
3. Click **Restart** at the top of the cPanel Node.js App page.

### Step E: Test Your Application
- Visit your website URL: `https://yourdomain.com`
- Check API Health: `https://yourdomain.com/api/health` (should return `{"status":"ok"}`)
- Access Admin Portal: `https://yourdomain.com/admin`
