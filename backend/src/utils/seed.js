/**
 * seed.js — Run with: npm run db:seed
 * Creates a demo account and sample resume so the app works out-of-the-box.
 */
require('dotenv').config()
const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function seed() {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    console.log('🌱 Starting seed...')

    // ── Demo user ─────────────────────────────────────────────────────────
    const passwordHash = await bcrypt.hash('demo1234', 12)

    const userResult = await client.query(`
      INSERT INTO users (email, name, password_hash, is_email_verified, subscription_tier)
      VALUES ('demo@resumeai.app', 'Demo User', $1, true, 'free')
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `, [passwordHash])

    const userId = userResult.rows[0].id
    console.log(`  ✓ Demo user: demo@resumeai.app / demo1234  (id: ${userId})`)

    // ── User profile ──────────────────────────────────────────────────────
    await client.query(`
      INSERT INTO user_profiles (user_id, phone, location, linkedin_url, github_url, summary, skills)
      VALUES ($1, '+91 98765 43210', 'Bangalore, India',
              'linkedin.com/in/demouser', 'github.com/demouser',
              'Full-stack software engineer with 4 years of experience building scalable web applications.',
              '["React","Node.js","PostgreSQL","TypeScript","Docker","AWS"]'::jsonb)
      ON CONFLICT (user_id) DO NOTHING
    `, [userId])

    // ── Sample resume ─────────────────────────────────────────────────────
    const resumeContent = {
      personalInfo: {
        name: 'Demo User',
        email: 'demo@resumeai.app',
        phone: '+91 98765 43210',
        location: 'Bangalore, India',
        linkedinUrl: 'linkedin.com/in/demouser',
        githubUrl: 'github.com/demouser',
        summary: 'Full-stack software engineer with 4+ years building scalable web apps. Passionate about clean architecture, developer experience, and shipping products users love.'
      },
      workExperience: [
        {
          company: 'Razorpay',
          position: 'Software Engineer II',
          location: 'Bangalore, India',
          startDate: 'Jul 2022',
          endDate: '',
          isCurrent: true,
          bullets: [
            'Led migration of payment gateway core from monolith to microservices, reducing latency by 38%',
            'Built real-time fraud detection pipeline processing 2M+ transactions/day using Node.js and Kafka',
            'Mentored 3 junior engineers; introduced code review culture that cut bug escape rate by 60%',
            'Shipped a self-serve merchant dashboard (React + TypeScript) used by 18,000+ businesses'
          ]
        },
        {
          company: 'Swiggy',
          position: 'Software Engineer',
          location: 'Bangalore, India',
          startDate: 'Jun 2020',
          endDate: 'Jun 2022',
          isCurrent: false,
          bullets: [
            'Developed order tracking microservice (Node.js + Redis) serving 500k+ concurrent users',
            'Reduced API p99 latency from 420ms to 85ms by optimising PostgreSQL queries and adding Redis caching',
            'Integrated third-party logistics APIs for 12 new delivery partners across 6 cities'
          ]
        }
      ],
      education: [
        {
          institution: 'NIT Trichy',
          degree: 'B.Tech',
          fieldOfStudy: 'Computer Science & Engineering',
          startDate: '2016',
          endDate: '2020',
          gpa: '8.7 / 10'
        }
      ],
      skills: [
        'React', 'TypeScript', 'Node.js', 'Express.js',
        'PostgreSQL', 'Redis', 'Docker', 'Kubernetes',
        'AWS (EC2, RDS, S3, Lambda)', 'Kafka', 'REST APIs', 'GraphQL'
      ],
      projects: [
        {
          name: 'OpenMetrics',
          description: 'Open-source observability dashboard for Node.js microservices. Collects custom metrics via SDK and visualises them in real-time. 1.2k GitHub stars.',
          technologies: ['React', 'Node.js', 'InfluxDB', 'WebSockets'],
          url: 'https://openmetrics.dev',
          githubUrl: 'https://github.com/demouser/openmetrics'
        }
      ],
      certifications: [
        {
          name: 'AWS Certified Solutions Architect – Associate',
          issuer: 'Amazon Web Services',
          issueDate: 'Mar 2023',
          credentialUrl: 'https://aws.amazon.com/certification'
        }
      ]
    }

    const resumeCustomization = {
      primaryColor: '#1C2540',
      accentColor: '#C9A84C',
      fontFamily: 'DM Sans',
      fontSize: 14,
      spacing: 'normal',
      sections: {
        summary: true,
        workExperience: true,
        education: true,
        skills: true,
        projects: true,
        certifications: true
      }
    }

    const resumeResult = await client.query(`
      INSERT INTO resumes (user_id, title, template_id, content, customization, status, ats_score)
      VALUES ($1, 'Software Engineer — Bangalore 2025', 'modern', $2::jsonb, $3::jsonb, 'published', 84)
      ON CONFLICT DO NOTHING
      RETURNING id
    `, [userId, JSON.stringify(resumeContent), JSON.stringify(resumeCustomization)])

    if (resumeResult.rows.length) {
      console.log(`  ✓ Sample resume created (id: ${resumeResult.rows[0].id})`)
    }

    await client.query('COMMIT')
    console.log('\n✅ Seed complete!')
    console.log('   Login: demo@resumeai.app  /  demo1234\n')

  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌ Seed failed:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

seed()
