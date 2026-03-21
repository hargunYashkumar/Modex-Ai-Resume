require('dotenv').config();
const { validateEnv } = require('../src/utils/env');
const app = require('../src/app');

validateEnv();

module.exports = app;
