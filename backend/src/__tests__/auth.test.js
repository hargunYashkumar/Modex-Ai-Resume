/**
 * __tests__/auth.test.js
 * Integration tests for /api/auth routes.
 * Requires DATABASE_URL env var pointing to a test DB with migrations applied.
 */
const request = require('supertest')
const app     = require('../app')
const { pool } = require('../models/db')

const TEST_USER = {
  name:     'Test User',
  email:    `test_${Date.now()}@example.com`,
  password: 'TestPass123!',
}

let authToken = ''

afterAll(async () => {
  // Clean up test user
  await pool.query('DELETE FROM users WHERE email = $1', [TEST_USER.email])
  await pool.end()
})

describe('POST /api/auth/register', () => {
  it('creates a new user and returns JWT', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(TEST_USER)

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('token')
    expect(res.body.user.email).toBe(TEST_USER.email)
    authToken = res.body.token
  })

  it('rejects duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(TEST_USER)

    expect(res.status).toBe(409)
  })

  it('rejects short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...TEST_USER, email: 'other@example.com', password: '123' })

    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/login', () => {
  it('returns JWT for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('token')
  })

  it('rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: 'WrongPass' })

    expect(res.status).toBe(401)
  })
})

describe('GET /api/auth/me', () => {
  it('returns user for valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`)

    expect(res.status).toBe(200)
    expect(res.body.user.email).toBe(TEST_USER.email)
  })

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(401)
  })
})

describe('GET /health', () => {
  it('returns ok', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })
})
