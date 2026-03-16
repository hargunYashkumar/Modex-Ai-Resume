const request = require('supertest')
const app     = require('../server')
const { pool } = require('../models/db')

let token = ''
let resumeId = ''

beforeAll(async () => {
  const email = `resume_test_${Date.now()}@example.com`
  const reg = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Resume Tester', email, password: 'TestPass123!' })
  token = reg.body.token
})

afterAll(async () => {
  await pool.end()
})

describe('Resume CRUD', () => {
  it('creates a resume', async () => {
    const res = await request(app)
      .post('/api/resumes')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Resume', templateId: 'modern' })

    expect(res.status).toBe(201)
    expect(res.body.resume.title).toBe('Test Resume')
    resumeId = res.body.resume.id
  })

  it('lists resumes', async () => {
    const res = await request(app)
      .get('/api/resumes')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.resumes)).toBe(true)
    expect(res.body.resumes.length).toBeGreaterThan(0)
  })

  it('fetches a single resume', async () => {
    const res = await request(app)
      .get(`/api/resumes/${resumeId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.resume.id).toBe(resumeId)
  })

  it('updates a resume', async () => {
    const res = await request(app)
      .put(`/api/resumes/${resumeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated Title' })

    expect(res.status).toBe(200)
    expect(res.body.resume.title).toBe('Updated Title')
  })

  it('duplicates a resume', async () => {
    const res = await request(app)
      .post(`/api/resumes/${resumeId}/duplicate`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(201)
    expect(res.body.resume.title).toContain('Copy')
  })

  it('deletes a resume', async () => {
    const res = await request(app)
      .delete(`/api/resumes/${resumeId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
  })

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/resumes')
    expect(res.status).toBe(401)
  })
})
