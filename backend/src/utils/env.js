const logger = require('./logger');

const REQUIRED_IN_PRODUCTION = [
  'DATABASE_URL',
  'JWT_SECRET',
  'FRONTEND_URL',
];

function validateEnv() {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  const missing = REQUIRED_IN_PRODUCTION.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.join(', ')}`;
    logger.error(message);
    throw new Error(message);
  }
}

module.exports = {
  validateEnv,
};
