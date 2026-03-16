// ecosystem.config.js — PM2 configuration for production
// Usage: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'modex-backend',
      script: 'src/server.js',
      cwd: './backend',

      // Clustering — use all CPU cores
      instances: 'max',
      exec_mode: 'cluster',

      // Environment
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },

      // Logging
      out_file:   './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,

      // Auto-restart
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      min_uptime: '10s',

      // Memory guard — restart if process exceeds 512MB
      max_memory_restart: '512M',

      // Watch (disabled in prod — use deploy.sh instead)
      watch: false,
    },
  ],

  deploy: {
    production: {
      user:   'ubuntu',
      host:   'YOUR_EC2_PUBLIC_IP',
      ref:    'origin/main',
      repo:   'git@github.com:hargunYashkumar/MODEX.git',
      path:   '/home/ubuntu/modex',
      'post-deploy': [
        'cd backend && npm install --production',
        'npm run db:migrate',
        'pm2 reload ecosystem.config.js --env production',
        'cd ../frontend && npm install && npm run build',
        'sudo cp -r dist/* /var/www/html/',
      ].join(' && '),
    },
  },
}
