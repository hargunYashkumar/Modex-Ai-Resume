/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = (pgm) => {
  // Enable UUID extension
  pgm.createExtension('uuid-ossp', { ifNotExists: true });

  // ─── USERS ────────────────────────────────────────────────────────────────
  pgm.createTable('users', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    email: {
      type: 'varchar(255)',
      notNull: true,
      unique: true,
    },
    name: {
      type: 'varchar(255)',
      notNull: true,
    },
    avatar_url: {
      type: 'text',
    },
    google_id: {
      type: 'varchar(255)',
      unique: true,
    },
    password_hash: {
      type: 'varchar(255)',
    },
    is_email_verified: {
      type: 'boolean',
      default: false,
    },
    subscription_tier: {
      type: 'varchar(50)',
      default: 'free',
      notNull: true,
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
    last_login_at: {
      type: 'timestamptz',
    },
  });
  pgm.createIndex('users', 'email');
  pgm.createIndex('users', 'google_id');

  // ─── USER PROFILES ─────────────────────────────────────────────────────────
  pgm.createTable('user_profiles', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
      unique: true,
    },
    phone: { type: 'varchar(50)' },
    location: { type: 'varchar(255)' },
    linkedin_url: { type: 'text' },
    github_url: { type: 'text' },
    portfolio_url: { type: 'text' },
    summary: { type: 'text' },
    skills: { type: 'jsonb', default: '[]' },
    preferences: { type: 'jsonb', default: '{}' },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  // ─── RESUMES ────────────────────────────────────────────────────────────────
  pgm.createTable('resumes', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    title: {
      type: 'varchar(255)',
      notNull: true,
    },
    template_id: {
      type: 'varchar(100)',
      notNull: true,
      default: "'modern'",
    },
    status: {
      type: 'varchar(50)',
      default: "'draft'",
      notNull: true,
      // draft | published | archived
    },
    content: {
      type: 'jsonb',
      notNull: true,
      default: '{}',
    },
    customization: {
      type: 'jsonb',
      notNull: true,
      default: '{}',
      // color, font, fontSize, spacing, elements visibility
    },
    ats_score: {
      type: 'integer',
    },
    ai_feedback: {
      type: 'text',
    },
    thumbnail_url: {
      type: 'text',
    },
    original_file_url: {
      type: 'text',
    },
    version: {
      type: 'integer',
      default: 1,
      notNull: true,
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });
  pgm.createIndex('resumes', 'user_id');
  pgm.createIndex('resumes', ['user_id', 'status']);

  // ─── RESUME VERSIONS (History) ─────────────────────────────────────────────
  pgm.createTable('resume_versions', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    resume_id: {
      type: 'uuid',
      notNull: true,
      references: '"resumes"',
      onDelete: 'CASCADE',
    },
    version_number: {
      type: 'integer',
      notNull: true,
    },
    content_snapshot: {
      type: 'jsonb',
      notNull: true,
    },
    customization_snapshot: {
      type: 'jsonb',
      notNull: true,
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });
  pgm.createIndex('resume_versions', 'resume_id');

  // ─── WORK EXPERIENCE ────────────────────────────────────────────────────────
  pgm.createTable('work_experiences', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    resume_id: {
      type: 'uuid',
      notNull: true,
      references: '"resumes"',
      onDelete: 'CASCADE',
    },
    company: { type: 'varchar(255)', notNull: true },
    position: { type: 'varchar(255)', notNull: true },
    location: { type: 'varchar(255)' },
    start_date: { type: 'date' },
    end_date: { type: 'date' },
    is_current: { type: 'boolean', default: false },
    description: { type: 'text' },
    bullets: { type: 'jsonb', default: '[]' },
    display_order: { type: 'integer', default: 0 },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });
  pgm.createIndex('work_experiences', 'resume_id');

  // ─── EDUCATION ──────────────────────────────────────────────────────────────
  pgm.createTable('educations', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    resume_id: {
      type: 'uuid',
      notNull: true,
      references: '"resumes"',
      onDelete: 'CASCADE',
    },
    institution: { type: 'varchar(255)', notNull: true },
    degree: { type: 'varchar(255)' },
    field_of_study: { type: 'varchar(255)' },
    start_date: { type: 'date' },
    end_date: { type: 'date' },
    gpa: { type: 'varchar(20)' },
    description: { type: 'text' },
    display_order: { type: 'integer', default: 0 },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  // ─── CERTIFICATIONS ─────────────────────────────────────────────────────────
  pgm.createTable('certifications', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    resume_id: {
      type: 'uuid',
      notNull: true,
      references: '"resumes"',
      onDelete: 'CASCADE',
    },
    name: { type: 'varchar(255)', notNull: true },
    issuer: { type: 'varchar(255)' },
    issue_date: { type: 'date' },
    expiry_date: { type: 'date' },
    credential_id: { type: 'varchar(255)' },
    credential_url: { type: 'text' },
    display_order: { type: 'integer', default: 0 },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  // ─── PROJECTS ───────────────────────────────────────────────────────────────
  pgm.createTable('projects', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    resume_id: {
      type: 'uuid',
      notNull: true,
      references: '"resumes"',
      onDelete: 'CASCADE',
    },
    name: { type: 'varchar(255)', notNull: true },
    description: { type: 'text' },
    technologies: { type: 'jsonb', default: '[]' },
    url: { type: 'text' },
    github_url: { type: 'text' },
    start_date: { type: 'date' },
    end_date: { type: 'date' },
    display_order: { type: 'integer', default: 0 },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  // ─── JOB SEARCH HISTORY ──────────────────────────────────────────────────────
  pgm.createTable('job_searches', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    resume_id: {
      type: 'uuid',
      references: '"resumes"',
      onDelete: 'SET NULL',
    },
    search_query: { type: 'text' },
    results: { type: 'jsonb', default: '[]' },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });
  pgm.createIndex('job_searches', 'user_id');

  // ─── SAVED JOBS ──────────────────────────────────────────────────────────────
  pgm.createTable('saved_jobs', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    job_data: { type: 'jsonb', notNull: true },
    match_score: { type: 'integer' },
    status: {
      type: 'varchar(50)',
      default: "'saved'",
      // saved | applied | interviewing | rejected | offered
    },
    notes: { type: 'text' },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });
  pgm.createIndex('saved_jobs', 'user_id');

  // ─── COURSE RECOMMENDATIONS ─────────────────────────────────────────────────
  pgm.createTable('course_recommendations', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    resume_id: {
      type: 'uuid',
      references: '"resumes"',
      onDelete: 'SET NULL',
    },
    courses: { type: 'jsonb', default: '[]' },
    skill_gaps: { type: 'jsonb', default: '[]' },
    generated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });
  pgm.createIndex('course_recommendations', 'user_id');

  // ─── AUDIT LOG ───────────────────────────────────────────────────────────────
  pgm.createTable('audit_logs', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    user_id: {
      type: 'uuid',
      references: '"users"',
      onDelete: 'SET NULL',
    },
    action: { type: 'varchar(255)', notNull: true },
    resource_type: { type: 'varchar(100)' },
    resource_id: { type: 'uuid' },
    metadata: { type: 'jsonb' },
    ip_address: { type: 'varchar(45)' },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });
  pgm.createIndex('audit_logs', 'user_id');
  pgm.createIndex('audit_logs', 'created_at');
};

exports.down = (pgm) => {
  pgm.dropTable('audit_logs');
  pgm.dropTable('course_recommendations');
  pgm.dropTable('saved_jobs');
  pgm.dropTable('job_searches');
  pgm.dropTable('projects');
  pgm.dropTable('certifications');
  pgm.dropTable('educations');
  pgm.dropTable('work_experiences');
  pgm.dropTable('resume_versions');
  pgm.dropTable('resumes');
  pgm.dropTable('user_profiles');
  pgm.dropTable('users');
};
