require('dotenv').config();
const app = require('./app');
const logger = require('./utils/logger');

// ─── Start Server ─────────────────────────────────────────────────────────
if ((process.env.NODE_ENV !== 'production' || !process.env.VERCEL) && process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    logger.info(`🚀 Modex Server running on port ${PORT}`);
    logger.info(`   Environment: ${process.env.NODE_ENV}`);
    logger.info(`   Frontend URL: ${process.env.FRONTEND_URL}`);
  });
}

module.exports = app;
