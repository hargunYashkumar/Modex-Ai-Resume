// jobs.js
const express = require('express');
const jobRouter = express.Router();
const { query } = require('../models/db');
const { authenticate } = require('../middleware/auth');
const logger = require('../utils/logger');

jobRouter.use(authenticate);

// GET /api/jobs/saved
jobRouter.get('/saved', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM saved_jobs WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json({ jobs: result.rows });
  } catch (error) {
    logger.error('Get saved jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch saved jobs' });
  }
});

// POST /api/jobs/save
jobRouter.post('/save', async (req, res) => {
  try {
    const { jobData, matchScore } = req.body;
    const result = await query(
      `INSERT INTO saved_jobs (user_id, job_data, match_score) VALUES ($1, $2, $3) RETURNING *`,
      [req.userId, JSON.stringify(jobData), matchScore]
    );
    res.status(201).json({ job: result.rows[0] });
  } catch (error) {
    logger.error('Save job error:', error);
    res.status(500).json({ error: 'Failed to save job' });
  }
});

// PATCH /api/jobs/:id/status
jobRouter.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['saved', 'applied', 'interviewing', 'rejected', 'offered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    await query(
      'UPDATE saved_jobs SET status = $1 WHERE id = $2 AND user_id = $3',
      [status, req.params.id, req.userId]
    );
    res.json({ message: 'Status updated' });
  } catch (error) {
    logger.error('Update job status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// DELETE /api/jobs/:id
jobRouter.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM saved_jobs WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    res.json({ message: 'Job removed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

// courses.js
const courseRouter = express.Router();
courseRouter.use(authenticate);

// GET /api/courses/history
courseRouter.get('/history', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM course_recommendations WHERE user_id = $1 ORDER BY generated_at DESC LIMIT 5',
      [req.userId]
    );
    res.json({ recommendations: result.rows });
  } catch (error) {
    logger.error('Get course history error:', error);
    res.status(500).json({ error: 'Failed to fetch course history' });
  }
});

module.exports = { jobRouter, courseRouter };
