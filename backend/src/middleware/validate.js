const { validationResult } = require('express-validator')

/**
 * Run after express-validator checks.
 * Returns 400 with first error if any validation failed.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: errors.array()[0].msg,
      details: errors.array()
    })
  }
  next()
}

/**
 * Async error wrapper — removes try/catch boilerplate from route handlers.
 * Usage: router.get('/path', asyncHandler(async (req, res) => { ... }))
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

/**
 * Verify the authenticated user owns a resource.
 * Throws 403 if userId doesn't match.
 */
const assertOwner = (resourceUserId, requestUserId) => {
  if (String(resourceUserId) !== String(requestUserId)) {
    const err = new Error('Forbidden')
    err.status = 403
    throw err
  }
}

module.exports = { validate, asyncHandler, assertOwner }
