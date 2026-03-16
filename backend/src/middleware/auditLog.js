const { query } = require('../models/db')
const logger    = require('../utils/logger')

/**
 * auditLog(action, resourceType?)
 * Express middleware factory — call after authenticate middleware.
 *
 * Usage:
 *   router.delete('/:id', authenticate, auditLog('resume.delete', 'resume'), handler)
 */
const auditLog = (action, resourceType = null) => async (req, res, next) => {
  // Capture original json() to intercept the response
  const originalJson = res.json.bind(res)

  res.json = async (body) => {
    // Only log successful (2xx) responses
    if (res.statusCode >= 200 && res.statusCode < 300) {
      try {
        const resourceId = req.params?.id || body?.resume?.id || body?.job?.id || null
        await query(
          `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, metadata, ip_address)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            req.userId || null,
            action,
            resourceType,
            resourceId,
            JSON.stringify({ method: req.method, path: req.path, statusCode: res.statusCode }),
            req.ip || req.headers['x-forwarded-for'] || null,
          ]
        )
      } catch (err) {
        // Never fail the request because of audit logging
        logger.error('Audit log write error:', err.message)
      }
    }
    return originalJson(body)
  }

  next()
}

/**
 * getAuditLogs(userId, limit?) — fetch recent audit entries for a user
 */
const getAuditLogs = async (userId, limit = 50) => {
  const result = await query(
    `SELECT action, resource_type, resource_id, metadata, created_at
     FROM audit_logs WHERE user_id = $1
     ORDER BY created_at DESC LIMIT $2`,
    [userId, limit]
  )
  return result.rows
}

module.exports = { auditLog, getAuditLogs }
