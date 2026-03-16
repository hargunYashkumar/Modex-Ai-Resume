/* eslint-disable camelcase */
exports.shorthands = undefined

exports.up = (pgm) => {
  // ── Resume shares (public view links) ────────────────────────────────────
  pgm.createTable('resume_shares', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    resume_id: {
      type: 'uuid',
      notNull: true,
      unique: true,              // one active share per resume
      references: '"resumes"',
      onDelete: 'CASCADE',
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    share_token: {
      type: 'varchar(64)',
      notNull: true,
      unique: true,
    },
    is_active: {
      type: 'boolean',
      default: true,
      notNull: true,
    },
    view_count: {
      type: 'integer',
      default: 0,
      notNull: true,
    },
    expires_at: {
      type: 'timestamptz',
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
  })

  pgm.createIndex('resume_shares', 'share_token')
  pgm.createIndex('resume_shares', 'user_id')

  // ── User sessions table (optional JWT blacklist for logout) ──────────────
  pgm.createTable('user_sessions', {
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
    token_hash: {
      type: 'varchar(128)',
      notNull: true,
      unique: true,
    },
    expires_at: {
      type: 'timestamptz',
      notNull: true,
    },
    revoked: {
      type: 'boolean',
      default: false,
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  })

  pgm.createIndex('user_sessions', 'token_hash')
  pgm.createIndex('user_sessions', ['user_id', 'revoked'])

  // ── Password reset tokens ────────────────────────────────────────────────
  pgm.createTable('password_reset_tokens', {
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
    token_hash: {
      type: 'varchar(128)',
      notNull: true,
    },
    expires_at: {
      type: 'timestamptz',
      notNull: true,
    },
    used: {
      type: 'boolean',
      default: false,
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  })

  pgm.createIndex('password_reset_tokens', 'token_hash')
  pgm.createIndex('password_reset_tokens', 'user_id')

  // ── Additional performance indexes ──────────────────────────────────────
  pgm.createIndex('resumes', 'template_id')
  pgm.createIndex('resumes', 'updated_at')
  pgm.createIndex('audit_logs', ['resource_type', 'resource_id'])
}

exports.down = (pgm) => {
  pgm.dropTable('password_reset_tokens')
  pgm.dropTable('user_sessions')
  pgm.dropTable('resume_shares')
}
