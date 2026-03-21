const path = require('path');

const UPLOADS_DIR = process.env.VERCEL
  ? '/tmp'
  : path.join(__dirname, '../../uploads');

module.exports = {
  UPLOADS_DIR,
};
