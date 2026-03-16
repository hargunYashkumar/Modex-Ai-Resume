/**
 * CreativeTemplate — bold left accent bar, name in serif, skills as bars
 * Add to ResumePreview.jsx TEMPLATES map as 'creative'
 */
export function CreativeTemplate({ content, style, sectionGap }) {
  const {
    personalInfo    = {},
    workExperience  = [],
    education       = [],
    skills          = [],
    projects        = [],
    certifications  = [],
  } = content

  return (
    <div style={{
      fontFamily: style.fontFamily,
      fontSize:   style.fontSize,
      color:      '#1C2540',
      background: '#fff',
      minHeight:  '297mm',
      display:    'grid',
      gridTemplateColumns: '200px 1fr',
    }}>
      {/* ── Left panel ── */}
      <div style={{
        background:  style.primaryColor,
        padding:     '36px 20px',
        display:     'flex',
        flexDirection: 'column',
        gap:         sectionGap,
      }}>
        {/* Avatar initial */}
        <div style={{
          width:          64, height: 64,
          borderRadius:   '50%',
          background:     `${style.accentColor}30`,
          border:         `2px solid ${style.accentColor}`,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          fontSize:       24,
          fontWeight:     600,
          color:          style.accentColor,
          marginBottom:   8,
        }}>
          {(personalInfo.name || '?')[0].toUpperCase()}
        </div>

        {/* Contact info */}
        <div>
          <PanelHeading label="Contact" accent={style.accentColor} />
          {[
            personalInfo.email,
            personalInfo.phone,
            personalInfo.location,
            personalInfo.linkedinUrl,
            personalInfo.githubUrl,
          ].filter(Boolean).map((v, i) => (
            <p key={i} style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.78)', marginBottom: 4, wordBreak: 'break-all', lineHeight: 1.5 }}>
              {v}
            </p>
          ))}
        </div>

        {/* Skills with accent bars */}
        {skills.length > 0 && (
          <div>
            <PanelHeading label="Skills" accent={style.accentColor} />
            {skills.map(skill => (
              <div key={skill} style={{ marginBottom: 6 }}>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', marginBottom: 2 }}>{skill}</p>
                <div style={{ height: 2, background: 'rgba(255,255,255,0.15)', borderRadius: 1 }}>
                  <div style={{ height: '100%', width: '75%', background: style.accentColor, borderRadius: 1 }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Education in sidebar */}
        {education.length > 0 && (
          <div>
            <PanelHeading label="Education" accent={style.accentColor} />
            {education.map((edu, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 11, color: '#fff', fontWeight: 600, lineHeight: 1.4 }}>{edu.institution}</p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', lineHeight: 1.4 }}>
                  {edu.degree}{edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ''}
                </p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>{edu.endDate || edu.startDate}</p>
              </div>
            ))}
          </div>
        )}

        {/* Certifications in sidebar */}
        {certifications.length > 0 && (
          <div>
            <PanelHeading label="Certifications" accent={style.accentColor} />
            {certifications.map((c, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <p style={{ fontSize: 11, color: '#fff', fontWeight: 500, lineHeight: 1.4 }}>{c.name}</p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)' }}>{c.issuer} · {c.issueDate}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Right panel ── */}
      <div style={{ padding: '36px 32px', display: 'flex', flexDirection: 'column', gap: sectionGap }}>
        {/* Name + title */}
        <div style={{ borderBottom: `3px solid ${style.accentColor}`, paddingBottom: 16, marginBottom: 4 }}>
          <h1 style={{ fontSize: 26, fontWeight: 600, color: style.primaryColor, letterSpacing: '-0.5px', margin: 0 }}>
            {personalInfo.name || 'Your Name'}
          </h1>
        </div>

        {/* Summary */}
        {personalInfo.summary && (
          <p style={{ fontSize: 12, lineHeight: 1.65, color: '#3E4A6A', margin: 0 }}>
            {personalInfo.summary}
          </p>
        )}

        {/* Work experience */}
        {workExperience.length > 0 && (
          <div>
            <RightHeading label="Experience" accent={style.accentColor} />
            {workExperience.map((job, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 4 }}>
                  <div>
                    <strong style={{ fontSize: 13 }}>{job.position}</strong>
                    {job.company && (
                      <span style={{ fontSize: 12, color: '#3E4A6A', marginLeft: 6 }}>
                        @ {job.company}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 11, color: '#6B7694', whiteSpace: 'nowrap' }}>
                    {job.startDate}{job.isCurrent ? ' – Present' : job.endDate ? ` – ${job.endDate}` : ''}
                  </span>
                </div>
                {job.bullets?.filter(Boolean).length > 0 && (
                  <ul style={{ margin: '5px 0 0', paddingLeft: 16, listStyleType: 'disc' }}>
                    {job.bullets.filter(Boolean).map((b, bi) => (
                      <li key={bi} style={{ fontSize: 11.5, lineHeight: 1.5, marginBottom: 2, color: '#2A3555' }}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div>
            <RightHeading label="Projects" accent={style.accentColor} />
            {projects.map((p, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ fontSize: 13 }}>{p.name}</strong>
                  {p.url && <span style={{ fontSize: 10.5, color: style.accentColor }}>{p.url}</span>}
                </div>
                {p.description && (
                  <p style={{ fontSize: 11.5, color: '#3E4A6A', margin: '3px 0', lineHeight: 1.5 }}>{p.description}</p>
                )}
                {p.technologies?.length > 0 && (
                  <span style={{ fontSize: 10.5, color: '#6B7694' }}>{p.technologies.join(' · ')}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PanelHeading({ label, accent }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <p style={{
        fontSize:      9,
        fontWeight:    700,
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        color:         accent,
        marginBottom:  4,
      }}>
        {label}
      </p>
      <div style={{ height: 1, background: `${accent}50` }} />
    </div>
  )
}

function RightHeading({ label, accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <span style={{ width: 3, height: 16, background: accent, borderRadius: 1.5, flexShrink: 0 }} />
      <h2 style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1C2540', margin: 0 }}>
        {label}
      </h2>
    </div>
  )
}
