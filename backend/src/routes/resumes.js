const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const { query, getClient } = require('../models/db');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/validate');
const { auditLog } = require('../middleware/auditLog');
const logger = require('../utils/logger');

// ─── Multer config ────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.userId}-${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed'));
    }
  },
});

// All routes require authentication
router.use(authenticate);

// ─── GET /api/resumes ─────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT r.id, r.title, r.template_id, r.status, r.ats_score,
              r.thumbnail_url, r.version, r.created_at, r.updated_at,
              r.customization->>'primaryColor' as primary_color
       FROM resumes r
       WHERE r.user_id = $1
       ORDER BY r.updated_at DESC`,
      [req.userId]
    );
    res.json({ resumes: result.rows });
  } catch (error) {
    logger.error('Get resumes error:', error);
    res.status(500).json({ error: 'Failed to fetch resumes' });
  }
});

// ─── POST /api/resumes ────────────────────────────────────────────────────
router.post('/', [
  body('title').trim().isLength({ min: 1, max: 255 }),
  body('templateId').optional().isString(),
], auditLog('resume.create', 'resume'), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const client = await getClient();
  try {
    await client.query('BEGIN');
    const { title, templateId = 'modern', content = {}, customization = {} } = req.body;
    logger.debug('Creating resume', { title, hasContent: !!content });

    const defaultContent = {
      personalInfo: { name: '', email: '', phone: '', location: '', summary: '', linkedinUrl: '', githubUrl: '' },
      workExperience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      ...content,
    };
    logger.debug('Final resume content', { content: defaultContent });

    const defaultCustomization = {
      primaryColor: '#1C2B4B',
      accentColor: '#C9A84C',
      fontFamily: 'DM Sans',
      fontSize: 14,
      spacing: 'normal',
      sections: {
        summary: true, workExperience: true, education: true,
        skills: true, projects: true, certifications: true,
      },
      ...customization,
    };

    const result = await client.query(
      `INSERT INTO resumes (user_id, title, template_id, content, customization)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.userId, title, templateId, defaultContent, defaultCustomization]
    );

    await client.query('COMMIT');
    res.status(201).json({ resume: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Create resume error:', error);
    res.status(500).json({ error: 'Failed to create resume' });
  } finally {
    client.release();
  }
});

// ─── GET /api/resumes/:id ─────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      `SELECT r.*,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'id', we.id, 'company', we.company, 'position', we.position,
            'location', we.location, 'startDate', we.start_date,
            'endDate', we.end_date, 'isCurrent', we.is_current,
            'description', we.description, 'bullets', we.bullets,
            'displayOrder', we.display_order
          )) FILTER (WHERE we.id IS NOT NULL),
          '[]'
        ) as work_experience_data,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'id', ed.id, 'institution', ed.institution, 'degree', ed.degree,
            'fieldOfStudy', ed.field_of_study, 'startDate', ed.start_date,
            'endDate', ed.end_date, 'gpa', ed.gpa, 'description', ed.description,
            'displayOrder', ed.display_order
          )) FILTER (WHERE ed.id IS NOT NULL),
          '[]'
        ) as education_data,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'id', p.id, 'name', p.name, 'description', p.description,
            'technologies', p.technologies, 'url', p.url,
            'githubUrl', p.github_url, 'displayOrder', p.display_order
          )) FILTER (WHERE p.id IS NOT NULL),
          '[]'
        ) as projects_data,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'id', c.id, 'name', c.name, 'issuer', c.issuer,
            'issueDate', c.issue_date, 'credentialUrl', c.credential_url,
            'displayOrder', c.display_order
          )) FILTER (WHERE c.id IS NOT NULL),
          '[]'
        ) as certifications_data
       FROM resumes r
       LEFT JOIN work_experiences we ON we.resume_id = r.id
       LEFT JOIN educations ed ON ed.resume_id = r.id
       LEFT JOIN projects p ON p.resume_id = r.id
       LEFT JOIN certifications c ON c.resume_id = r.id
       WHERE r.id = $1 AND r.user_id = $2
       GROUP BY r.id`,
      [req.params.id, req.userId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const resume = result.rows[0];
    
    // Diagnostic log
    logger.debug('Fetching resume details', { 
      id: resume.id, 
      contentType: typeof resume.content,
      hasPersonalInfo: !!resume.content?.personalInfo 
    });

    res.json({ resume });
  } catch (error) {
    logger.error('Get resume error:', error);
    res.status(500).json({ error: 'Failed to fetch resume' });
  }
});

// ─── PUT /api/resumes/:id ─────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Verify ownership
    const existing = await client.query(
      'SELECT id, version FROM resumes WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (!existing.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Resume not found' });
    }

    const resume = existing.rows[0];
    const { title, templateId, content, customization, status } = req.body;

    // Save version snapshot before updating
    await client.query(
      `INSERT INTO resume_versions (resume_id, version_number, content_snapshot, customization_snapshot)
       SELECT id, version, content, customization FROM resumes WHERE id = $1`,
      [req.params.id]
    );

    const updated = await client.query(
      `UPDATE resumes SET
        title = COALESCE($1, title),
        template_id = COALESCE($2, template_id),
        content = COALESCE($3, content),
        customization = COALESCE($4, customization),
        status = COALESCE($5, status),
        version = version + 1,
        updated_at = now()
       WHERE id = $6 RETURNING *`,
      [title, templateId, content || null, customization || null, status, req.params.id]
    );

    await client.query('COMMIT');
    res.json({ resume: updated.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Update resume error:', error);
    res.status(500).json({ error: 'Failed to update resume' });
  } finally {
    client.release();
  }
});

// ─── DELETE /api/resumes/:id ──────────────────────────────────────────────
router.delete('/:id', auditLog('resume.delete', 'resume'), async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM resumes WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.userId]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    logger.error('Delete resume error:', error);
    res.status(500).json({ error: 'Failed to delete resume' });
  }
});

// ─── POST /api/resumes/upload ─────────────────────────────────────────────
// Parse uploaded resume with AI
router.post('/upload/parse', (req, res, next) => {
  upload.single('resume')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      logger.error('Multer error:', err);
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      logger.error('Unknown upload error:', err);
      return res.status(500).json({ error: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    let text = '';
    const ext = req.file.originalname.toLowerCase();
    logger.info('Processing file upload', { fileName: req.file.originalname, ext, size: req.file.size });

    // Extract text from document
    if (ext.endsWith('.pdf')) {
      const pdfParse = require('pdf-parse');
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      text = pdfData.text;
    } else if (ext.endsWith('.docx')) {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } else {
      text = `[Unsupported file format: ${req.file.originalname}]`;
    }

    logger.info('Text extracted successfully', { textLength: text?.length || 0 });

    if (!text || text.trim().length < 20) {
      return res.status(400).json({ error: 'Failed to extract text from resume. Please ensure the file is not a scanned image or corrupted.' });
    }

    // Clean up file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      extractedText: text.substring(0, 10000), // limit
      fileName: req.file.originalname,
    });
  } catch (error) {
    logger.error('Upload parse error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to parse resume file' });
  }
});

// ─── POST /api/resumes/:id/duplicate ─────────────────────────────────────
router.post('/:id/duplicate', async (req, res) => {
  try {
    const original = await query(
      'SELECT * FROM resumes WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (!original.rows.length) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    const r = original.rows[0];
    const dup = await query(
      `INSERT INTO resumes (user_id, title, template_id, content, customization, status)
       VALUES ($1, $2, $3, $4, $5, 'draft') RETURNING *`,
      [req.userId, `${r.title} (Copy)`, r.template_id, r.content, r.customization]
    );
    res.status(201).json({ resume: dup.rows[0] });
  } catch (error) {
    logger.error('Duplicate resume error:', error);
    res.status(500).json({ error: 'Failed to duplicate resume' });
  }
});

module.exports = router;
