const request = require('supertest')
const app     = require('../server')
const { pool } = require('../models/db')

let token  = ''
let jobId  = ''

const SAMPLE_JOB = {
  title:       'Senior Backend Engineer',
  description: 'Build scalable APIs at a Series B startup',
  salary:      '₹35–50 LPA',
  company:     'TestCo',
}

beforeAll(async () => {
  const email = `jobs_test_${Date.now()}@example.com`
  const reg = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Jobs Tester', email, password: 'TestPass123!' })
  token = reg.body.token
})

afterAll(async () => { await pool.end() })

describe('Jobs CRUD', () => {
  it('saves a job', async () => {
    const res = await request(app)
      .post('/api/jobs/save')
      .set('Authorization', `Bearer ${token}`)
      .send({ jobData: SAMPLE_JOB, matchScore: 87 })

    expect(res.status).toBe(201)
    expect(res.body.job).toBeDefined()
    expect(res.body.job.match_score).toBe(87)
    jobId = res.body.job.id
  })

  it('lists saved jobs', async () => {
    const res = await request(app)
      .get('/api/jobs/saved')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.jobs)).toBe(true)
    expect(res.body.jobs.length).toBeGreaterThan(0)
  })

  it('updates job status', async () => {
    const res = await request(app)
      .patch(`/api/jobs/${jobId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'applied' })

    expect(res.status).toBe(200)
  })

  it('rejects invalid status', async () => {
    const res = await request(app)
      .patch(`/api/jobs/${jobId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'invalid_status' })

    expect(res.status).toBe(400)
  })

  it('deletes a saved job', async () => {
    const res = await request(app)
      .delete(`/api/jobs/${jobId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
  })

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/jobs/saved')
    expect(res.status).toBe(401)
  })
})
