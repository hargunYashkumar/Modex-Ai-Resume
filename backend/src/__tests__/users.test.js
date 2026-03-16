const request = require('supertest')
const app     = require('../server')
const { pool } = require('../models/db')

let token = ''

beforeAll(async () => {
  const email = `users_test_${Date.now()}@example.com`
  const reg = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Users Tester', email, password: 'TestPass123!' })
  token = reg.body.token
})

afterAll(async () => { await pool.end() })

describe('GET /api/users/profile', () => {
  it('returns profile for authenticated user', async () => {
    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.profile).toBeDefined()
    expect(res.body.profile.name).toBe('Users Tester')
  })

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/users/profile')
    expect(res.status).toBe(401)
  })
})

describe('PUT /api/users/profile', () => {
  it('updates profile fields', async () => {
    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        phone:       '+91 98765 43210',
        location:    'Bangalore, India',
        linkedinUrl: 'linkedin.com/in/test',
        skills:      ['React', 'Node.js', 'TypeScript'],
      })

    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Profile updated successfully')
  })

  it('persists updated fields', async () => {
    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)

    expect(res.body.profile.phone).toBe('+91 98765 43210')
    expect(res.body.profile.location).toBe('Bangalore, India')
  })
})

describe('GET /api/users/dashboard', () => {
  it('returns dashboard stats', async () => {
    const res = await request(app)
      .get('/api/users/dashboard')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.stats).toBeDefined()
    expect(typeof res.body.stats.totalResumes).toBe('number')
  })
})

describe('GET /health', () => {
  it('returns 200 with database status', async () => {
    const res = await request(app).get('/health')

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.database).toBeDefined()
    expect(res.body.database.status).toBe('ok')
    expect(typeof res.body.database.latencyMs).toBe('number')
    expect(typeof res.body.uptime).toBe('number')
  })
})
