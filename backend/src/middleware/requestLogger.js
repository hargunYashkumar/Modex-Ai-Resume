/**
 * requestLogger.js
 * Logs incoming HTTP requests in development mode.
 * In production, relies on Nginx/ALB access logs instead.
 */
const logger = require('../utils/logger')

const SKIP_PATHS = new Set(['/health', '/favicon.ico'])

const requestLogger = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') return next()
  if (SKIP_PATHS.has(req.path)) return next()

  const start = Date.now()
  const { method, path, ip } = req

  res.on('finish', () => {
    const ms     = Date.now() - start
    const status = res.statusCode
    const color  = status >= 500 ? 'error'
                 : status >= 400 ? 'warn'
                 : 'debug'

    logger[color](`${method} ${path} ${status} ${ms}ms`, {
      ip:     ip || req.headers['x-forwarded-for'],
      userId: req.userId || '-',
    })
  })

  next()
}

module.exports = requestLogger
