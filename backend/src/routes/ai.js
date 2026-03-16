const express = require('express');
const router = express.Router();
const { query } = require('../models/db');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/validate');
const { askJSON } = require('../services/aiService');
const logger = require('../utils/logger');

router.use(authenticate);

// ─── POST /api/ai/parse-resume ────────────────────────────────────────────
router.post('/parse-resume', asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text) {
    logger.warn('Parse-resume called without text');
    return res.status(400).json({ error: 'Resume text required' });
  }

  logger.info('Parsing resume text', { textLength: text.length });

  const parsed = await askJSON(
    `Parse this resume text into structured JSON.

    Required structure:
    {
      "personalInfo": { "name":"","email":"","phone":"","location":"","linkedinUrl":"","githubUrl":"","portfolioUrl":"","summary":"" },
      "workExperience": [{ "company":"","position":"","location":"","startDate":"","endDate":"","isCurrent":false,"bullets":[] }],
      "education": [{ "institution":"","degree":"","fieldOfStudy":"","startDate":"","endDate":"","gpa":"" }],
      "skills": [],
      "certifications": [{ "name":"","issuer":"","issueDate":"" }],
      "projects": [{ "name":"","description":"","technologies":[],"url":"" }]
    }

    Resume text:
    ${text.substring(0, 8000)}`,
    4096
  );
  res.json({ parsed });
}));

// ─── POST /api/ai/ats-score ───────────────────────────────────────────────
router.post('/ats-score', asyncHandler(async (req, res) => {
  const { resumeId, resumeContent, jobDescription } = req.body;

  const analysis = await askJSON(
    `Analyse this resume for ATS (Applicant Tracking System) compatibility.
    ${jobDescription ? `Job Description:\n${jobDescription}\n` : ''}
    Resume Content: ${JSON.stringify(resumeContent)}

    Return JSON:
    {
      "overallScore": 0-100,
      "sections": {
        "keywords":    { "score":0-100, "found":[], "missing":[], "feedback":"" },
        "formatting":  { "score":0-100, "issues":[], "feedback":"" },
        "completeness":{ "score":0-100, "missing":[], "feedback":"" },
        "impact":      { "score":0-100, "suggestions":[], "feedback":"" }
      },
      "topSuggestions": [],
      "strengthsSummary": "",
      "improvementSummary": ""
    }`,
    2048
  );

  if (resumeId) {
    await query(
      'UPDATE resumes SET ats_score=$1, ai_feedback=$2 WHERE id=$3 AND user_id=$4',
      [analysis.overallScore, JSON.stringify(analysis), resumeId, req.userId]
    );
  }
  res.json({ analysis });
}));

// ─── POST /api/ai/improve-bullet ─────────────────────────────────────────
router.post('/improve-bullet', asyncHandler(async (req, res) => {
  const { bullet, jobTitle, context } = req.body;
  if (!bullet) return res.status(400).json({ error: 'Bullet text required' });

  const result = await askJSON(
    `Improve this resume bullet point to be more impactful and ATS-friendly.
    ${jobTitle ? `Job Title: ${jobTitle}` : ''}
    ${context   ? `Company Context: ${context}` : ''}

    Original: "${bullet}"

    Return JSON:
    { "improved":"...strong action verb...", "alternatives":["alt1","alt2"], "tips":"brief explanation" }`,
    512
  );
  res.json(result);
}));

// ─── POST /api/ai/generate-summary ───────────────────────────────────────
router.post('/generate-summary', asyncHandler(async (req, res) => {
  const { resumeContent, targetRole } = req.body;

  const result = await askJSON(
    `Generate a compelling professional summary for this resume.
    ${targetRole ? `Target Role: ${targetRole}` : ''}
    Resume data: ${JSON.stringify(resumeContent)}

    Return JSON: { "summary":"2-3 sentences", "keywords":["kw1","kw2","kw3"] }`,
    512
  );
  res.json(result);
}));

// ─── POST /api/ai/job-matches ─────────────────────────────────────────────
router.post('/job-matches', asyncHandler(async (req, res) => {
  const { resumeContent, location, jobType } = req.body;

  const result = await askJSON(
    `Based on this resume, suggest relevant job opportunities.
    Location preference: ${location || 'Remote/Any'}
    Job type: ${jobType || 'Full-time'}
    Resume: ${JSON.stringify(resumeContent)}

    Return JSON:
    {
      "recommendedRoles": [{
        "title":"","matchScore":0-100,"requiredSkills":[],"missingSkills":[],
        "salaryRange":"","demandLevel":"high|medium|low","description":"","searchKeywords":[]
      }],
      "topSkills":[],"industryFit":[],"careerLevel":"junior|mid|senior|lead",
      "searchPlatforms":[{"platform":"","url":"","tip":""}],
      "networkingTips":[]
    }`,
    3000
  );

  await query(
    'INSERT INTO job_searches (user_id, results) VALUES ($1,$2)',
    [req.userId, JSON.stringify(result)]
  );
  res.json(result);
}));

// ─── POST /api/ai/course-recommendations ─────────────────────────────────
router.post('/course-recommendations', asyncHandler(async (req, res) => {
  const { resumeContent, targetRole, resumeId } = req.body;

  const result = await askJSON(
    `Analyse this resume and recommend courses/certifications.
    ${targetRole ? `Target Role: ${targetRole}` : ''}
    Resume: ${JSON.stringify(resumeContent)}

    Return JSON:
    {
      "skillGaps":[{"skill":"","importance":"critical|high|medium","reason":""}],
      "courses":[{
        "title":"","provider":"Coursera|Udemy|LinkedIn Learning|edX|freeCodeCamp|Google|AWS|Microsoft",
        "url":"","duration":"","level":"beginner|intermediate|advanced","cost":"free|paid",
        "skills":[],"certificateOffered":true,"priority":"high|medium|low","reason":""
      }],
      "certifications":[{"name":"","provider":"","url":"","relevance":"","timeToComplete":"","cost":""}],
      "learningPath":{"shortTerm":[],"mediumTerm":[],"longTerm":[]},
      "estimatedTimeInvestment":""
    }`,
    3000
  );

  await query(
    'INSERT INTO course_recommendations (user_id, resume_id, courses, skill_gaps) VALUES ($1,$2,$3,$4)',
    [req.userId, resumeId || null, JSON.stringify(result.courses), JSON.stringify(result.skillGaps)]
  );
  res.json(result);
}));

// ─── POST /api/ai/tailor-resume ───────────────────────────────────────────
router.post('/tailor-resume', asyncHandler(async (req, res) => {
  const { resumeContent, jobDescription, jobTitle, company } = req.body;
  if (!jobDescription) return res.status(400).json({ error: 'Job description required' });

  const result = await askJSON(
    `Tailor this resume for the specific job posting.
    Job Title: ${jobTitle || 'Not specified'}
    Company:   ${company || 'Not specified'}
    Job Description: ${jobDescription}
    Current Resume: ${JSON.stringify(resumeContent)}

    Return JSON matching the same resume structure plus:
    { "tailoredContent":{...same structure...}, "changes":[], "keywordsAdded":[], "matchScore":0-100 }`,
    4096
  );
  res.json(result);
}));

module.exports = router;
