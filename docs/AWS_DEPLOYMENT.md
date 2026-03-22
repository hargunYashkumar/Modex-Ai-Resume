# Modex — Complete AWS Deployment Guide
# Free Tier Optimised · Estimated Monthly Cost: $0–5

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## ARCHITECTURE OVERVIEW (Free Tier)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  EC2 t2.micro (Free tier 12mo)
  ├── Frontend: Nginx serving React build
  ├── Backend:  Node.js + Express API (PM2)
  └── Database: PostgreSQL on RDS db.t3.micro (Free 12mo)
  
  S3 (5GB free) — file uploads storage
  CloudFront (optional) — CDN for frontend
  ACM — Free SSL certificate


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 1: Prerequisites (Local Machine)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Install AWS CLI:
   https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html

2. Configure AWS credentials:
   $ aws configure
   AWS Access Key ID: [paste from IAM]
   AWS Secret Access Key: [paste from IAM]
   Default region: ap-south-1   (Mumbai — lowest latency for India)
   Default output: json

3. Ensure you have Node.js 20+, Git installed locally.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 2: Google OAuth 2.0 Setup
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Go to: https://console.cloud.google.com/
2. Create new project → "ResumeAI"
3. APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
4. Application type: Web application
5. Add Authorised JavaScript origins:
     http://localhost:3000
     https://yourdomain.com           ← update after getting domain
6. Add Authorised redirect URIs:
     http://localhost:5000/api/auth/google/callback
     https://yourdomain.com/api/auth/google/callback
7. Download JSON → note Client ID and Client Secret
8. APIs & Services → OAuth consent screen → Add test users (your email)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 3: Test on Localhost First
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Option A — Docker Compose (recommended)
  $ cp backend/.env.example backend/.env
  # Edit backend/.env — fill in all values
  
  $ cp frontend/.env.example frontend/.env
  # Edit frontend/.env — fill VITE_GOOGLE_CLIENT_ID
  
  $ docker-compose up --build
  # Visit http://localhost → frontend
  # API at http://localhost:5000/health

# Option B — Native Node.js
  Terminal 1 (Backend):
    $ cd backend
    $ npm install
    $ cp .env.example .env  # fill values
    # Ensure PostgreSQL is running locally
    $ npm run db:migrate
    $ npm run dev
  
  Terminal 2 (Frontend):
    $ cd frontend
    $ npm install
    $ cp .env.example .env  # fill values
    $ npm run dev
  # Visit http://localhost:3000


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 4: Create RDS PostgreSQL (Free Tier)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AWS Console → RDS → Create database

  Settings:
    Engine:                  PostgreSQL 16
    Template:                Free tier
    DB instance class:       db.t3.micro
    DB instance identifier:  modex-db
    Master username:         postgres
    Master password:         [strong password — save this]
    
  Storage:
    Allocated storage:       20 GB
    Enable storage autoscaling: NO (to stay free)
    
  Connectivity:
    VPC:                     Default VPC
    Public access:           YES (for initial setup, restrict later)
    VPC security group:      Create new → name: modex-rds-sg
    
  Additional config:
    Initial database name:   modex_db
    Backup retention:        7 days
    
  → Click "Create database" (takes ~5 minutes)
  
  After creation, note the Endpoint URL:
  e.g. resumeai-db.xxxx.ap-south-1.rds.amazonaws.com


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 5: Create EC2 Instance (Free Tier)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AWS Console → EC2 → Launch Instance

  Name:            modex-server
  AMI:             Ubuntu Server 24.04 LTS (64-bit x86)
  Instance type:   t2.micro (Free tier eligible)
  Key pair:        Create new → modex-key → Download .pem
  
  Network settings:
    Create security group: resumeai-sg
    Allow SSH:      Port 22  from My IP
    Allow HTTP:     Port 80  from Anywhere
    Allow HTTPS:    Port 443 from Anywhere
    Allow Custom:   Port 5000 from Anywhere (remove after Nginx setup)
  
  Storage:
    8 GB gp3 (default)
  
  → Launch Instance

  After launch, note the Public IPv4 address.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 6: Connect RDS to EC2
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

In RDS Security Group (resumeai-rds-sg):
  Add inbound rule:
    Type:   PostgreSQL
    Port:   5432
    Source: [Security group ID of resumeai-sg]  ← EC2's SG

This allows only your EC2 to connect to RDS.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 7: Server Setup on EC2
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# SSH into your server
  $ chmod 400 resumeai-key.pem
  $ ssh -i resumeai-key.pem ubuntu@<EC2_PUBLIC_IP>

# Update system
  $ sudo apt update && sudo apt upgrade -y

# Install Node.js 20
  $ curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  $ sudo apt install -y nodejs

# Install PM2 (process manager)
  $ sudo npm install -g pm2

# Install Nginx
  $ sudo apt install -y nginx

# Install Git
  $ sudo apt install -y git


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 8: Deploy the Application
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# On EC2 server:

# Clone your repository
  $ git clone https://github.com/hargunYashkumar/MODEX.git
  $ cd MODEX

# ── Backend setup ──
  $ cd backend
  $ npm install --production

  # Create .env file
  $ nano .env
  # Paste and fill all values:
  
    NODE_ENV=production
    PORT=5000
    DATABASE_URL=postgresql://postgres:<PASSWORD>@<RDS_ENDPOINT>:5432/resumeai_db
    JWT_SECRET=<generate with: openssl rand -base64 64>
    GOOGLE_CLIENT_ID=<your_google_client_id>
    GOOGLE_CLIENT_SECRET=<your_google_client_secret>
    HUGGINGFACE_API_KEY=<your_huggingface_token>
    FRONTEND_URL=https://yourdomain.com

  # Run database migrations
  $ npm run db:migrate

  # Start backend with PM2
  $ pm2 start src/server.js --name modex-backend
  $ pm2 save
  $ pm2 startup  # follow the printed command to auto-start on reboot

# ── Frontend build ──
  $ cd ../frontend
  $ npm install
  
  # Create production env
  $ echo "VITE_API_URL=/api" > .env.production
  $ echo "VITE_GOOGLE_CLIENT_ID=<your_google_client_id>" >> .env.production
  
  $ npm run build
  # dist/ folder is created

  # Copy to Nginx web root
  $ sudo cp -r dist/* /var/www/html/


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 9: Configure Nginx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  $ sudo nano /etc/nginx/sites-available/resumeai

  Paste:
  ─────────────────────────────────────────
  server {
      listen 80;
      server_name yourdomain.com www.yourdomain.com;
      root /var/www/html;
      index index.html;
      gzip on;
      gzip_types text/plain text/css application/json application/javascript;

      location / {
          try_files $uri $uri/ /index.html;
      }

      location /api/ {
          proxy_pass http://localhost:5000/api/;
          proxy_http_version 1.1;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection 'upgrade';
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
          proxy_cache_bypass $http_upgrade;
          client_max_body_size 10M;
      }

      location /uploads/ {
          alias /home/ubuntu/resumeai/backend/uploads/;
      }
  }
  ─────────────────────────────────────────

  $ sudo ln -s /etc/nginx/sites-available/modex /etc/nginx/sites-enabled/
  $ sudo rm /etc/nginx/sites-enabled/default
  $ sudo nginx -t       # test config
  $ sudo systemctl reload nginx


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 10: Domain + Free SSL (HTTPS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Option A — Your own domain
  1. Buy domain (Namecheap, GoDaddy, Hostinger)
  2. Add A record pointing to EC2 public IP
  3. Install Certbot for free SSL:
     $ sudo apt install -y certbot python3-certbot-nginx
     $ sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
     # Follow prompts — certificate auto-renews
  
# Option B — AWS Route 53 + ACM (free SSL)
  1. Register domain in Route 53 (~$12/year for .com)
  2. Request certificate in ACM (us-east-1 region)
  3. Add CloudFront distribution pointing to EC2
  4. Set SSL certificate in CloudFront

# Option C — Free subdomain for testing
  Use nip.io: http://<EC2_IP>.nip.io (no SSL)
  Or use Cloudflare Tunnel (free) for HTTPS


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 11: S3 for File Storage (Optional)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AWS Console → S3 → Create bucket
  Name:    resumeai-uploads-<yourunique>
  Region:  ap-south-1
  Block all public access: YES

IAM → Create policy → JSON:
  {
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Action": ["s3:PutObject","s3:GetObject","s3:DeleteObject"],
      "Resource": "arn:aws:s3:::resumeai-uploads-*/*"
    }]
  }

IAM → Create user → resumeai-app → Attach policy
→ Create access key → Add to backend .env:
  AWS_ACCESS_KEY_ID=...
  AWS_SECRET_ACCESS_KEY=...
  AWS_REGION=ap-south-1
  AWS_S3_BUCKET=resumeai-uploads-<yourunique>


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 12: Deployment Script (for updates)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Save as deploy.sh in project root:

  #!/bin/bash
  echo "🚀 Deploying ResumeAI..."
  
  # Pull latest code
  git pull origin main
  
  # Backend
  cd backend
  npm install --production
  npm run db:migrate
  pm2 restart modex-backend
  
  # Frontend
  cd ../frontend
  npm install
  npm run build
  sudo cp -r dist/* /var/www/html/
  
  echo "✅ Deployment complete!"

  $ chmod +x deploy.sh
  $ ./deploy.sh


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 13: Monitoring & Logs
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  # View backend logs
  $ pm2 logs modex-backend

  # View Nginx access/error logs
  $ sudo tail -f /var/log/nginx/access.log
  $ sudo tail -f /var/log/nginx/error.log

  # Monitor processes
  $ pm2 monit

  # Check health
  $ curl https://yourdomain.com/health


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## FREE TIER USAGE SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Service           Free tier limit           Your usage
  ───────────────────────────────────────────────────────
  EC2 t2.micro     750 hrs/mo (12 months)    ~720 hrs/mo ✓
  RDS db.t3.micro  750 hrs/mo (12 months)    ~720 hrs/mo ✓
  RDS storage      20 GB                     ~1–5 GB ✓
  S3 storage       5 GB                      ~1–2 GB ✓
  S3 requests      20,000 GET / 2,000 PUT    low traffic ✓
  Data transfer    15 GB/mo outbound         depends ✓
  ACM SSL cert     Free                      ✓

  Estimated monthly cost after free tier: ~$15–25/mo
  (EC2 ~$9 + RDS ~$13 + misc)

  💡 TIP: After 12 months, consider:
  - Migrate DB to Supabase free tier (500MB)
  - Use Render.com free backend tier
  - Upgrade to t3.micro for better performance


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## ENVIRONMENT VARIABLES CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Backend (.env):
    [ ] NODE_ENV=production
    [ ] PORT=5000
    [ ] DATABASE_URL=postgresql://...
    [ ] JWT_SECRET=<64-char random string>
    [ ] GOOGLE_CLIENT_ID=...
    [ ] GOOGLE_CLIENT_SECRET=...
    [ ] HUGGINGFACE_API_KEY=hf_...
    [ ] FRONTEND_URL=https://yourdomain.com
    [ ] AWS_ACCESS_KEY_ID=...      (if using S3)
    [ ] AWS_SECRET_ACCESS_KEY=...  (if using S3)
    [ ] AWS_S3_BUCKET=...          (if using S3)

  Frontend (.env.production):
    [ ] VITE_API_URL=/api
    [ ] VITE_GOOGLE_CLIENT_ID=...


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## TROUBLESHOOTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Issue: 502 Bad Gateway
  Fix: $ pm2 status  →  $ pm2 restart resumeai-backend
       $ sudo nginx -t && sudo systemctl reload nginx

  Issue: DB connection refused
  Fix: Check RDS security group allows EC2 SG on port 5432
       Verify DATABASE_URL is correct in .env

  Issue: Google OAuth not working
  Fix: Add your domain to Google Console → Authorised origins
       Verify GOOGLE_CLIENT_ID matches in both frontend + backend

  Issue: CORS errors
  Fix: Update FRONTEND_URL in backend .env to match your domain
       $ pm2 restart resumeai-backend

  Issue: File uploads failing
  Fix: $ ls -la backend/uploads/  →  ensure directory exists
       $ chmod 755 backend/uploads/
