/**
 * share.js — public resume sharing
 *
 * Routes:
 *   POST /api/share/:resumeId/generate  → creates a share token (authenticated)
 *   GET  /api/share/:token              → returns resume data (public, no auth)
 *   DELETE /api/share/:resumeId         → revokes share token (authenticated)
 */
const express  = require('express')
const router   = express.Router()
const crypto   = require('crypto')
const { query } = require('../models/db')
const { authenticate } = require('../middleware/auth')
const { asyncHandler } = require('../middleware/validate')
const logger   = require('../utils/logger')

// ── POST /api/share/:resumeId/generate ───────────────────────────────────
// Create (or refresh) a public share token for a resume
router.post('/:resumeId/generate', authenticate, asyncHandler(async (req, res) => {
  const { resumeId } = req.params
  const { expiresInDays = 30 } = req.body

  // Verify ownership
  const resumeResult = await query(
    'SELECT id, title, status FROM resumes WHERE id = $1 AND user_id = $2',
    [resumeId, req.userId]
  )
  if (!resumeResult.rows.length) {
    return res.status(404).json({ error: 'Resume not found' })
  }

  const token     = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)

  // Upsert: one share link per resume
  await query(
    `INSERT INTO resume_shares (resume_id, user_id, share_token, expires_at)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (resume_id) DO UPDATE SET
       share_token = EXCLUDED.share_token,
       expires_at  = EXCLUDED.expires_at,
       is_active   = true,
       updated_at  = now()`,
    [resumeId, req.userId, token, expiresAt]
  )

  const shareUrl = `${process.env.FRONTEND_URL}/r/${token}`
  res.json({ shareUrl, token, expiresAt })
}))

// ── GET /api/share/:token ─────────────────────────────────────────────────
// Public: fetch a shared resume by token
router.get('/:token', asyncHandler(async (req, res) => {
  const { token } = req.params

  const result = await query(
    `SELECT r.content, r.customization, r.template_id, r.title,
            u.name as author_name
     FROM resume_shares rs
     JOIN resumes r ON r.id = rs.resume_id
     JOIN users   u ON u.id = rs.user_id
     WHERE rs.share_token = $1
       AND rs.is_active = true
       AND (rs.expires_at IS NULL OR rs.expires_at > now())`,
    [token]
  )

  if (!result.rows.length) {
    return res.status(404).json({ error: 'Share link not found or expired' })
  }

  // Increment view count (fire-and-forget)
  query(
    'UPDATE resume_shares SET view_count = view_count + 1 WHERE share_token = $1',
    [token]
  ).catch(() => {})

  res.json({ resume: result.rows[0] })
}))

// ── DELETE /api/share/:resumeId ───────────────────────────────────────────
// Revoke (deactivate) a share link
router.delete('/:resumeId', authenticate, asyncHandler(async (req, res) => {
  await query(
    'UPDATE resume_shares SET is_active = false WHERE resume_id = $1 AND user_id = $2',
    [req.params.resumeId, req.userId]
  )
  res.json({ message: 'Share link revoked' })
}))

// ── GET /api/share/:resumeId/stats ────────────────────────────────────────
// Get view stats for your own share link
router.get('/:resumeId/stats', authenticate, asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT share_token, view_count, expires_at, is_active, created_at
     FROM resume_shares WHERE resume_id = $1 AND user_id = $2`,
    [req.params.resumeId, req.userId]
  )
  if (!result.rows.length) return res.json({ shareLink: null })

  const row = result.rows[0]
  res.json({
    shareLink: {
      url:       row.is_active ? `${process.env.FRONTEND_URL}/r/${row.share_token}` : null,
      viewCount: row.view_count,
      expiresAt: row.expires_at,
      isActive:  row.is_active,
      createdAt: row.created_at,
    }
  })
}))

module.exports = router
