const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { query } = require('../models/db');
const { authenticate } = require('../middleware/auth');
const logger = require('../utils/logger');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── Helper: generate JWT ─────────────────────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// ─── Helper: upsert user profile ──────────────────────────────────────────
const ensureUserProfile = async (userId) => {
  await query(
    `INSERT INTO user_profiles (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
    [userId]
  );
};

// ─── POST /api/auth/google ────────────────────────────────────────────────
// Verifies Google ID token and creates/updates user
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Google credential required' });
    }

    // Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Upsert user
    const result = await query(
      `INSERT INTO users (email, name, avatar_url, google_id, is_email_verified, last_login_at)
       VALUES ($1, $2, $3, $4, true, now())
       ON CONFLICT (email) DO UPDATE SET
         name = EXCLUDED.name,
         avatar_url = EXCLUDED.avatar_url,
         google_id = EXCLUDED.google_id,
         last_login_at = now()
       RETURNING *`,
      [email, name, picture, googleId]
    );

    const user = result.rows[0];
    await ensureUserProfile(user.id);

    const token = generateToken(user.id);
    logger.info(`User authenticated via Google: ${user.email}`);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatar_url,
        subscriptionTier: user.subscription_tier,
      },
    });
  } catch (error) {
    logger.error('Google auth error:', error);
    res.status(401).json({ error: 'Invalid Google credential' });
  }
});

// ─── POST /api/auth/register ──────────────────────────────────────────────
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('password').isLength({ min: 8 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, name, password } = req.body;

    // Check if user exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await query(
      `INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING *`,
      [email, name, passwordHash]
    );

    const user = result.rows[0];
    await ensureUserProfile(user.id);
    const token = generateToken(user.id);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatar_url,
        subscriptionTier: user.subscription_tier,
      },
    });
  } catch (error) {
    logger.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await query('UPDATE users SET last_login_at = now() WHERE id = $1', [user.id]);
    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatar_url,
        subscriptionTier: user.subscription_tier,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT u.*, up.phone, up.location, up.linkedin_url, up.github_url,
              up.portfolio_url, up.summary, up.skills, up.preferences
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE u.id = $1`,
      [req.userId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    delete user.password_hash;
    res.json({ user });
  } catch (error) {
    logger.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ─── POST /api/auth/logout ─────────────────────────────────────────────────
router.post('/logout', authenticate, (req, res) => {
  // JWT is stateless — client should discard token
  res.json({ message: 'Logged out successfully' });
});

// ─── POST /api/auth/forgot-password ───────────────────────────────────────
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { email } = req.body;
    const userResult = await query('SELECT id FROM users WHERE email = $1', [email]);

    if (userResult.rows.length) {
      const crypto = require('crypto');
      const { sendPasswordReset } = require('../services/emailService');
      const userId = userResult.rows[0].id;
      const token  = crypto.randomBytes(32).toString('hex');
      const hash   = crypto.createHash('sha256').update(token).digest('hex');
      const expiry = new Date(Date.now() + 60 * 60 * 1000);

      await query('UPDATE password_reset_tokens SET used = true WHERE user_id = $1', [userId]);
      await query(
        'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
        [userId, hash, expiry]
      );

      const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
      await sendPasswordReset(email, resetUrl);
    }

    res.json({ message: 'If an account exists, a reset link has been sent.' });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// ─── POST /api/auth/reset-password ────────────────────────────────────────
router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 8 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const crypto = require('crypto');
    const { token, password } = req.body;
    const hash = crypto.createHash('sha256').update(token).digest('hex');

    const tokenResult = await query(
      `SELECT user_id FROM password_reset_tokens
       WHERE token_hash = $1 AND used = false AND expires_at > now()`,
      [hash]
    );

    if (!tokenResult.rows.length) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const userId = tokenResult.rows[0].user_id;
    const passwordHash = await bcrypt.hash(password, 12);

    await query(
      'UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2',
      [passwordHash, userId]
    );
    await query('UPDATE password_reset_tokens SET used = true WHERE token_hash = $1', [hash]);

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

module.exports = router;
