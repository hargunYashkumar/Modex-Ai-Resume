/**
 * __tests__/ai.test.js
 * Tests for AI route input validation and mocked AI responses.
 */
const request = require('supertest')
const app     = require('../server')
const { pool } = require('../models/db')

jest.mock('../services/aiService', () => ({
  askJSON: jest.fn(),
  ask:     jest.fn(),
  parseJSON: (text) => JSON.parse(text),
  MODEL:   'claude-3-5-sonnet-20240620',
}))

const { askJSON } = require('../services/aiService')

let token = ''

beforeAll(async () => {
  const email = `ai_test_${Date.now()}@example.com`
  const reg = await request(app)
    .post('/api/auth/register')
    .send({ name: 'AI Tester', email, password: 'TestPass123!' })
  token = reg.body.token
})

afterAll(async () => { await pool.end() })

describe('POST /api/ai/parse-resume', () => {
  it('rejects missing text', async () => {
    const res = await request(app)
      .post('/api/ai/parse-resume')
      .set('Authorization', `Bearer ${token}`)
      .send({})
    expect(res.status).toBe(400)
  })

  it('parses resume text via AI service', async () => {
    askJSON.mockResolvedValueOnce({
      personalInfo: { name: 'Test User', email: 'test@test.com' },
      workExperience: [], education: [], skills: ['React'],
      certifications: [], projects: [],
    })
    const res = await request(app)
      .post('/api/ai/parse-resume')
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'John Doe Software Engineer React developer' })
    expect(res.status).toBe(200)
    expect(res.body.parsed.personalInfo.name).toBe('Test User')
  })
})

describe('POST /api/ai/improve-bullet', () => {
  it('rejects missing bullet', async () => {
    const res = await request(app)
      .post('/api/ai/improve-bullet')
      .set('Authorization', `Bearer ${token}`)
      .send({ jobTitle: 'Engineer' })
    expect(res.status).toBe(400)
  })

  it('returns improved bullet from AI', async () => {
    askJSON.mockResolvedValueOnce({
      improved: 'Led development of pipeline processing 1M+ events/day',
      alternatives: ['Built high-throughput pipeline'],
      tips: 'Added metrics and stronger verb',
    })
    const res = await request(app)
      .post('/api/ai/improve-bullet')
      .set('Authorization', `Bearer ${token}`)
      .send({ bullet: 'worked on pipeline', jobTitle: 'Backend Engineer' })
    expect(res.status).toBe(200)
    expect(typeof res.body.improved).toBe('string')
  })
})

describe('POST /api/ai/tailor-resume', () => {
  it('rejects missing job description', async () => {
    const res = await request(app)
      .post('/api/ai/tailor-resume')
      .set('Authorization', `Bearer ${token}`)
      .send({ resumeContent: {}, jobTitle: 'Engineer' })
    expect(res.status).toBe(400)
  })
})

describe('AI auth guard', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).post('/api/ai/parse-resume').send({ text: 'x' })
    expect(res.status).toBe(401)
  })
})
