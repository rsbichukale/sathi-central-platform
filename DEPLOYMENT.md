# SATHI Central Platform — Production Deployment Guide

This guide details how to deploy the SATHI Central Platform in a production environment using Docker, Nginx, and PM2.

## Prerequisites
- Node.js v18+ (if running bare-metal)
- Docker & Docker Compose (if containerized)
- Nginx (for Reverse Proxy & SSL)
- A registered Domain Name
- SMTP Credentials (for outgoing emails)

---

## 1. Quick Start (Docker Compose) - Recommended

The easiest way to deploy is using the provided `docker-compose.yml`.

1. **Clone the repository:**
   \`\`\`bash
   git clone <repo_url> sathi-central
   cd sathi-central
   \`\`\`

2. **Configure Environment:**
   Edit the `.env` file (or `src/config.js`) to set your production settings.
   \`\`\`env
   PORT=9090
   JWT_SECRET=generate_a_strong_random_secret_here
   SMTP_HOST=smtp.yourprovider.com
   SMTP_PORT=465
   SMTP_USER=alerts@yourdomain.com
   SMTP_PASS=your_secure_app_password
   SMTP_FROM="SATHI Platform <alerts@yourdomain.com>"
   \`\`\`

3. **Build and Run:**
   \`\`\`bash
   docker-compose up --build -d
   \`\`\`
   *This builds the React frontend, packages the Node.js backend, and maps port 9090.*

---

## 2. Bare-Metal Deployment (PM2 + Nginx)

If you prefer to run directly on a VM (e.g., Ubuntu/Debian):

### A. Build the Frontend
\`\`\`bash
cd web-ui
npm install
npm run build
cd ..
\`\`\`
*This generates static assets in `web-ui/dist/`.*

### B. Start Backend with PM2
\`\`\`bash
npm install -g pm2
npm install
pm2 start src/app.js --name "sathi-central"
pm2 save
pm2 startup
\`\`\`

---

## 3. Nginx Reverse Proxy Setup (with SSL)

We strongly recommend placing Nginx in front of the Node.js server to handle HTTPS and static file caching.

1. **Copy the Nginx configuration:**
   Copy `deploy/nginx.conf` to `/etc/nginx/sites-available/sathi`.
   
2. **Enable the site:**
   \`\`\`bash
   sudo ln -s /etc/nginx/sites-available/sathi /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   \`\`\`

3. **Enable SSL (Let's Encrypt):**
   \`\`\`bash
   sudo certbot --nginx -d central.yourdomain.com
   \`\`\`

---

## 4. Database Backups & Data Persistence

The entire platform runs on a local SQLite database (`data/central_platform.sqlite`). 
- **Docker:** Ensure the `./data` directory is mounted as a volume.
- **Manual Backups:** You can download a full `.db` backup at any time from the **Admin Dashboard > Backup & Restore** tab. 
- **Automated Backups:** Set up a daily cron job to copy the `data/` directory to an S3 bucket or external drive.

## 5. Security Checklist
- [ ] Change the default Super Admin password (`admin123`) immediately upon first login.
- [ ] Ensure the `/data` folder is not exposed to public web access (Nginx config handles this).
- [ ] Use HTTPS strictly. Do not allow plain HTTP traffic.
- [ ] Set a strong, unique `JWT_SECRET` in production configuration.
