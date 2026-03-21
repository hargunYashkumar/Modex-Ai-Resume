const { Pool } = require('pg');
const logger = require('../utils/logger');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.NODE_ENV === 'production' ? { 
    rejectUnauthorized: false,
  } : false,
});

pool.on('connect', () => {
  logger.debug('New database connection established');
});

pool.on('error', (err) => {
  logger.error('Unexpected database error on idle client', err);
  // In serverless, we don't want to exit the process as it might be reused or handled by the platform
});

const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    logger.error('Database query error', { text, error: error.message });
    throw error;
  }
};

const getClient = async () => {
  const client = await pool.connect();
  const release = client.release.bind(client);
  const timeout = setTimeout(() => {
    logger.error('Client checked out for too long');
    release();
  }, 5000);
  client.release = () => {
    clearTimeout(timeout);
    release();
  };
  return client;
};

module.exports = { query, getClient, pool };
