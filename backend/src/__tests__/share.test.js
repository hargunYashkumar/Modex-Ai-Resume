const request = require('supertest')
const app     = require('../server')
const { pool } = require('../models/db')

let token = '', resumeId = '', shareToken = ''

beforeAll(async () => {
  const email = `share_test_${Date.now()}@example.com`
  const reg   = await request(app).post('/api/auth/register')
    .send({ name: 'Share Tester', email, password: 'TestPass123!' })
  token = reg.body.token
  const r = await request(app).post('/api/resumes')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Resume to share', templateId: 'modern' })
  resumeId = r.body.resume.id
})

afterAll(async () => { await pool.end() })

describe('Share link lifecycle', () => {
  it('generates a share link', async () => {
    const res = await request(app)
      .post(`/api/share/${resumeId}/generate`)
      .set('Authorization', `Bearer ${token}`)
      .send({ expiresInDays: 7 })
    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    shareToken = res.body.token
  })

  it('fetches shared resume publicly', async () => {
    const res = await request(app).get(`/api/share/${shareToken}`)
    expect(res.status).toBe(200)
    expect(res.body.resume.title).toBe('Resume to share')
  })

  it('revokes share link', async () => {
    await request(app)
      .delete(`/api/share/${resumeId}`)
      .set('Authorization', `Bearer ${token}`)
    const res = await request(app).get(`/api/share/${shareToken}`)
    expect(res.status).toBe(404)
  })
})
