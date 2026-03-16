// ──────────────────────────────────────────────────────
// users.js
// ──────────────────────────────────────────────────────
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { query } = require('../models/db');
const { authenticate } = require('../middleware/auth');
const logger = require('../utils/logger');

router.use(authenticate);

// GET /api/users/profile
router.get('/profile', async (req, res) => {
  try {
    const result = await query(
      `SELECT u.id, u.email, u.name, u.avatar_url, u.subscription_tier,
              u.created_at, up.*
       FROM users u
       LEFT JOIN user_profiles up ON up.user_id = u.id
       WHERE u.id = $1`,
      [req.userId]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Profile not found' });
    const user = result.rows[0];
    delete user.password_hash;
    res.json({ profile: user });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/users/profile
router.put('/profile', [
  body('name').optional().trim().isLength({ min: 2 }),
  body('phone').optional().trim(),
  body('location').optional().trim(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name, phone, location, linkedinUrl, githubUrl, portfolioUrl, summary, skills, preferences } = req.body;

    if (name) {
      await query('UPDATE users SET name = $1, updated_at = now() WHERE id = $2', [name, req.userId]);
    }

    await query(
      `UPDATE user_profiles SET
        phone = COALESCE($1, phone),
        location = COALESCE($2, location),
        linkedin_url = COALESCE($3, linkedin_url),
        github_url = COALESCE($4, github_url),
        portfolio_url = COALESCE($5, portfolio_url),
        summary = COALESCE($6, summary),
        skills = COALESCE($7::jsonb, skills),
        preferences = COALESCE($8::jsonb, preferences),
        updated_at = now()
       WHERE user_id = $9`,
      [phone, location, linkedinUrl, githubUrl, portfolioUrl, summary,
       skills ? JSON.stringify(skills) : null,
       preferences ? JSON.stringify(preferences) : null,
       req.userId]
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET /api/users/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const [resumesResult, jobsResult, coursesResult] = await Promise.all([
      query('SELECT COUNT(*) as count FROM resumes WHERE user_id = $1', [req.userId]),
      query('SELECT COUNT(*) as count FROM saved_jobs WHERE user_id = $1', [req.userId]),
      query('SELECT * FROM course_recommendations WHERE user_id = $1 ORDER BY generated_at DESC LIMIT 1', [req.userId]),
    ]);

    res.json({
      stats: {
        totalResumes: parseInt(resumesResult.rows[0].count),
        savedJobs: parseInt(jobsResult.rows[0].count),
      },
      latestCourses: coursesResult.rows[0] || null,
    });
  } catch (error) {
    logger.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;
