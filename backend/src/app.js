require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const logger = require('./utils/logger');
const { UPLOADS_DIR } = require('./utils/paths');
const requestLogger = require('./middleware/requestLogger');
const authRoutes = require('./routes/auth');
const resumeRoutes = require('./routes/resumes');
const jobRoutes = require('./routes/jobs');
const courseRoutes = require('./routes/courses');
const userRoutes = require('./routes/users');
const aiRoutes = require('./routes/ai');
const shareRoutes = require('./routes/share');

const app = express();

// ─── Security Middleware ───────────────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://accounts.google.com"],
      frameSrc: ["https://accounts.google.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
}));

// allow all origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173', // Add default Vite port
  'https://modex-ai-resume-frontend.vercel.app'
];

// Add origins from environment variables
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}
if (process.env.CORS_ALLOWED_ORIGINS) {
  const envOrigins = process.env.CORS_ALLOWED_ORIGINS.split(',').map(o => o.trim());
  allowedOrigins.push(...envOrigins);
}

const frontendHostname = (() => {
  try {
    if (!process.env.FRONTEND_URL) return null;
    return new URL(process.env.FRONTEND_URL).hostname;
  } catch (error) {
    logger.warn('Invalid FRONTEND_URL for CORS hostname parsing');
    return null;
  }
})();

const isAllowedVercelPreview = (origin) => {
  if (!origin || !frontendHostname || !frontendHostname.endsWith('.vercel.app')) return false;

  try {
    const originHostname = new URL(origin).hostname;
    if (!originHostname.endsWith('.vercel.app')) return false;

    const frontendProjectName = frontendHostname.replace('.vercel.app', '');
    return originHostname === frontendHostname || originHostname.startsWith(`${frontendProjectName}-`);
  } catch {
    return false;
  }
};

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.includes(origin) || isAllowedVercelPreview(origin);

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

// ─── Rate Limiting ────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'AI request limit reached. Please wait before retrying.' },
});
app.use('/api/ai/', aiLimiter);

// ─── Body Parsing ─────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

// ─── Static Files ─────────────────────────────────────────────────────────
app.use('/uploads', express.static(UPLOADS_DIR));

// ─── Health Check ─────────────────────────────────────────────────────────
app.get('/health', async (req, res) => {
  const start = Date.now();
  let dbStatus = 'ok';
  let dbLatencyMs = null;

  try {
    const t0 = Date.now();
    await require('./models/db').query('SELECT 1');
    dbLatencyMs = Date.now() - t0;
  } catch (err) {
    dbStatus = 'error';
    logger.error('Health check DB error:', err.message);
  }

  const healthy = dbStatus === 'ok';
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: Math.floor(process.uptime()),
    database: { status: dbStatus, latencyMs: dbLatencyMs },
    responseMs: Date.now() - start,
  });
});

// Added root route for basic verification
app.get('/', (req, res) => {
  res.json({ 
    message: 'Modex API is running',
    version: '1.0.0',
    docs: '/health'
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────
// We mount them both with and without /api prefix for maximum compatibility
const mountRoutes = (router) => {
  router.use('/auth', authRoutes);
  router.use('/users', userRoutes);
  router.use('/resumes', resumeRoutes);
  router.use('/jobs', jobRoutes);
  router.use('/courses', courseRoutes);
  router.use('/ai', aiRoutes);
  router.use('/share', shareRoutes);
};

mountRoutes(app); // Mount directly (e.g., /auth/login)
const apiRouter = express.Router();
mountRoutes(apiRouter);
app.use('/api', apiRouter); // Mount with prefix (e.g., /api/auth/login)

// ─── 404 Handler ──────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
});

// ─── Unhandled Rejection Handler ──────────────────────────────────────────
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = app;
