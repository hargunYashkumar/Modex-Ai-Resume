// ResumePreview.jsx — renders the actual resume in the chosen template style
import { CreativeTemplate } from './CreativeTemplate'

export default function ResumePreview({ resume }) {
  const { content = {}, customization = {}, template_id = 'modern' } = resume || {}
  const style = {
    primaryColor: customization.primaryColor || '#1C2540',
    accentColor:  customization.accentColor  || '#C9A84C',
    fontFamily:   customization.fontFamily   || 'DM Sans',
    fontSize:     customization.fontSize     || 14,
    spacing:      customization.spacing      || 'normal',
  }

  const spacingMap = { compact: 12, normal: 18, spacious: 26 }
  const sectionGap = spacingMap[style.spacing] || 18

  const TEMPLATES = {
    modern:    ModernTemplate,
    minimal:   MinimalTemplate,
    executive: ExecutiveTemplate,
    sidebar:   SidebarTemplate,
    creative:  CreativeTemplate,
  }
  const Template = TEMPLATES[template_id] || ModernTemplate

  return <Template content={content} style={style} sectionGap={sectionGap} />
}

// ── MODERN TEMPLATE ────────────────────────────────────────────────────────
function ModernTemplate({ content, style, sectionGap }) {
  const { personalInfo = {}, workExperience = [], education = [], skills = [], projects = [], certifications = [] } = content

  return (
    <div style={{ fontFamily: style.fontFamily, fontSize: style.fontSize, color: '#1C2540', background: '#fff', minHeight: '297mm', width: '100%' }}>
      {/* Header */}
      <div style={{ background: style.primaryColor, color: '#fff', padding: '36px 40px 28px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, margin: 0, letterSpacing: '-0.5px' }}>{personalInfo.name || 'Your Name'}</h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 20px', marginTop: 10, fontSize: 12, opacity: 0.85 }}>
          {personalInfo.email    && <span>✉ {personalInfo.email}</span>}
          {personalInfo.phone    && <span>☏ {personalInfo.phone}</span>}
          {personalInfo.location && <span>◎ {personalInfo.location}</span>}
          {personalInfo.linkedinUrl && <span>in {personalInfo.linkedinUrl}</span>}
          {personalInfo.githubUrl   && <span>⌥ {personalInfo.githubUrl}</span>}
        </div>
        {personalInfo.summary && (
          <p style={{ marginTop: 14, fontSize: 13, lineHeight: 1.6, opacity: 0.9, maxWidth: 600 }}>{personalInfo.summary}</p>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: `${sectionGap + 4}px 40px`, display: 'flex', flexDirection: 'column', gap: sectionGap }}>
        {workExperience.length > 0 && (
          <Section title="Experience" accent={style.accentColor}>
            {workExperience.map((job, i) => (
              <ExpEntry key={i} item={job} accent={style.accentColor} />
            ))}
          </Section>
        )}
        {education.length > 0 && (
          <Section title="Education" accent={style.accentColor}>
            {education.map((edu, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ fontSize: 13 }}>{edu.institution}</strong>
                  <span style={{ fontSize: 11, color: '#6B7694' }}>{edu.startDate}{edu.endDate ? ` — ${edu.endDate}` : ''}</span>
                </div>
                <div style={{ fontSize: 12, color: '#3E4A6A', marginTop: 2 }}>
                  {edu.degree}{edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ''}
                  {edu.gpa ? <span style={{ marginLeft: 8, color: '#6B7694' }}>GPA: {edu.gpa}</span> : null}
                </div>
              </div>
            ))}
          </Section>
        )}
        {skills.length > 0 && (
          <Section title="Skills" accent={style.accentColor}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {skills.map(s => (
                <span key={s} style={{ padding: '3px 10px', background: '#F4F5F7', border: `1px solid ${style.accentColor}40`, borderRadius: 3, fontSize: 12, color: '#3E4A6A' }}>{s}</span>
              ))}
            </div>
          </Section>
        )}
        {projects.length > 0 && (
          <Section title="Projects" accent={style.accentColor}>
            {projects.map((p, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ fontSize: 13 }}>{p.name}</strong>
                  {p.url && <a href={p.url} style={{ fontSize: 11, color: style.accentColor }}>{p.url}</a>}
                </div>
                {p.description && <p style={{ fontSize: 12, color: '#3E4A6A', margin: '3px 0', lineHeight: 1.5 }}>{p.description}</p>}
                {p.technologies?.length > 0 && <span style={{ fontSize: 11, color: '#6B7694' }}>{p.technologies.join(' · ')}</span>}
              </div>
            ))}
          </Section>
        )}
        {certifications.length > 0 && (
          <Section title="Certifications" accent={style.accentColor}>
            {certifications.map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                <div><strong>{c.name}</strong>{c.issuer ? ` — ${c.issuer}` : ''}</div>
                <span style={{ color: '#6B7694', fontSize: 11 }}>{c.issueDate}</span>
              </div>
            ))}
          </Section>
        )}
      </div>
    </div>
  )
}

// ── MINIMAL TEMPLATE ───────────────────────────────────────────────────────
function MinimalTemplate({ content, style, sectionGap }) {
  const { personalInfo = {}, workExperience = [], education = [], skills = [], projects = [], certifications = [] } = content

  return (
    <div style={{ fontFamily: style.fontFamily, fontSize: style.fontSize, color: '#1C2540', background: '#fff', minHeight: '297mm', padding: '52px 48px' }}>
      {/* Header */}
      <div style={{ borderBottom: `2px solid ${style.primaryColor}`, paddingBottom: 20, marginBottom: sectionGap }}>
        <h1 style={{ fontSize: 32, fontWeight: 300, margin: 0, letterSpacing: '-1px', color: style.primaryColor }}>
          {personalInfo.name || 'Your Name'}
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', marginTop: 8, fontSize: 11, color: '#6B7694' }}>
          {[personalInfo.email, personalInfo.phone, personalInfo.location, personalInfo.linkedinUrl].filter(Boolean).map((v, i) => (
            <span key={i}>{v}</span>
          ))}
        </div>
      </div>
      {personalInfo.summary && <p style={{ fontSize: 13, color: '#3E4A6A', lineHeight: 1.65, marginBottom: sectionGap, maxWidth: 560 }}>{personalInfo.summary}</p>}
      {workExperience.length > 0 && <MinSection title="Experience" accent={style.accentColor}>{workExperience.map((j,i) => <ExpEntry key={i} item={j} accent={style.accentColor} minimal />)}</MinSection>}
      {education.length > 0 && <MinSection title="Education" accent={style.accentColor}>{education.map((e,i) => <div key={i} style={{ marginBottom: 8 }}><div style={{ display:'flex',justifyContent:'space-between' }}><strong style={{ fontSize:13 }}>{e.institution}</strong><span style={{ fontSize:11,color:'#6B7694' }}>{e.endDate||e.startDate}</span></div><div style={{ fontSize:12,color:'#3E4A6A' }}>{e.degree}{e.fieldOfStudy?`, ${e.fieldOfStudy}`:''}</div></div>)}</MinSection>}
      {skills.length > 0 && <MinSection title="Skills" accent={style.accentColor}><p style={{ fontSize:12,color:'#3E4A6A',lineHeight:1.7 }}>{skills.join(' · ')}</p></MinSection>}
    </div>
  )
}

// ── EXECUTIVE TEMPLATE ─────────────────────────────────────────────────────
function ExecutiveTemplate({ content, style, sectionGap }) {
  const { personalInfo = {}, workExperience = [], education = [], skills = [], projects = [], certifications = [] } = content

  return (
    <div style={{ fontFamily: style.fontFamily, fontSize: style.fontSize, color: '#1C2540', background: '#fff', minHeight: '297mm' }}>
      {/* Gold top bar */}
      <div style={{ height: 6, background: style.accentColor }} />
      <div style={{ padding: '40px 48px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, paddingBottom: 20, borderBottom: `1px solid #ECEAE3` }}>
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 600, margin: 0, color: style.primaryColor }}>{personalInfo.name || 'Your Name'}</h1>
          </div>
          <div style={{ textAlign: 'right', fontSize: 11, color: '#6B7694', lineHeight: 1.8 }}>
            {[personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean).map((v,i) => <div key={i}>{v}</div>)}
          </div>
        </div>
        {personalInfo.summary && <p style={{ fontSize: 13, lineHeight: 1.7, color: '#2A3555', fontStyle: 'italic', marginBottom: sectionGap, borderLeft: `3px solid ${style.accentColor}`, paddingLeft: 16 }}>{personalInfo.summary}</p>}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32 }}>
          <div>
            {workExperience.length > 0 && <ExecSection title="Professional Experience" accent={style.accentColor}>{workExperience.map((j,i) => <ExpEntry key={i} item={j} accent={style.accentColor} />)}</ExecSection>}
            {projects.length > 0 && <ExecSection title="Notable Projects" accent={style.accentColor}>{projects.map((p,i) => <div key={i} style={{ marginBottom:10 }}><strong style={{ fontSize:13 }}>{p.name}</strong><p style={{ fontSize:12,color:'#3E4A6A',margin:'3px 0',lineHeight:1.5 }}>{p.description}</p></div>)}</ExecSection>}
          </div>
          <div>
            {education.length > 0 && <ExecSection title="Education" accent={style.accentColor}>{education.map((e,i) => <div key={i} style={{ marginBottom:10 }}><strong style={{ fontSize:13 }}>{e.institution}</strong><div style={{ fontSize:12,color:'#3E4A6A' }}>{e.degree}</div><div style={{ fontSize:11,color:'#6B7694' }}>{e.endDate}</div></div>)}</ExecSection>}
            {skills.length > 0 && <ExecSection title="Core Skills" accent={style.accentColor}><div style={{ display:'flex',flexDirection:'column',gap:4 }}>{skills.map(s => <div key={s} style={{ fontSize:12,padding:'3px 0',borderBottom:'1px solid #F5F4F0',color:'#2A3555' }}>{s}</div>)}</div></ExecSection>}
            {certifications.length > 0 && <ExecSection title="Certifications" accent={style.accentColor}>{certifications.map((c,i) => <div key={i} style={{ marginBottom:6 }}><div style={{ fontSize:12,fontWeight:500 }}>{c.name}</div><div style={{ fontSize:11,color:'#6B7694' }}>{c.issuer} · {c.issueDate}</div></div>)}</ExecSection>}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── SIDEBAR TEMPLATE ───────────────────────────────────────────────────────
function SidebarTemplate({ content, style, sectionGap }) {
  const { personalInfo = {}, workExperience = [], education = [], skills = [], certifications = [] } = content

  return (
    <div style={{ fontFamily: style.fontFamily, fontSize: style.fontSize, color: '#1C2540', background: '#fff', minHeight: '297mm', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ width: 200, background: style.primaryColor, padding: '40px 24px', flexShrink: 0 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: style.accentColor + '30', border: `3px solid ${style.accentColor}`, marginBottom: 16, display:'flex', alignItems:'center', justifyContent:'center', color: style.accentColor, fontSize: 28, fontWeight: 600 }}>
          {(personalInfo.name||'?')[0]}
        </div>
        <h1 style={{ color: '#fff', fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>{personalInfo.name || 'Your Name'}</h1>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 24, lineHeight: 1.8 }}>
          {[personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean).map((v,i) => <div key={i} style={{ wordBreak:'break-all' }}>{v}</div>)}
        </div>
        {skills.length > 0 && (
          <div>
            <div style={{ color: style.accentColor, fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform:'uppercase', marginBottom: 8 }}>Skills</div>
            {skills.map(s => <div key={s} style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{s}</div>)}
          </div>
        )}
        {education.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div style={{ color: style.accentColor, fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform:'uppercase', marginBottom: 8 }}>Education</div>
            {education.map((e,i) => <div key={i} style={{ marginBottom: 10 }}><div style={{ fontSize: 11, color: '#fff', fontWeight: 500 }}>{e.institution}</div><div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)' }}>{e.degree}</div><div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{e.endDate}</div></div>)}
          </div>
        )}
      </div>
      {/* Main */}
      <div style={{ flex: 1, padding: '40px 36px', display: 'flex', flexDirection: 'column', gap: sectionGap }}>
        {personalInfo.summary && <p style={{ fontSize: 13, lineHeight: 1.65, color: '#3E4A6A' }}>{personalInfo.summary}</p>}
        {workExperience.length > 0 && <ExecSection title="Experience" accent={style.accentColor}>{workExperience.map((j,i) => <ExpEntry key={i} item={j} accent={style.accentColor} />)}</ExecSection>}
      </div>
    </div>
  )
}

// ── Shared Section Components ─────────────────────────────────────────────

function Section({ title, accent, children }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ width: 4, height: 18, background: accent, borderRadius: 2, flexShrink: 0 }} />
        <h2 style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1C2540', margin: 0 }}>{title}</h2>
      </div>
      {children}
    </div>
  )
}

function MinSection({ title, accent, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: accent, margin: '0 0 10px', paddingBottom: 4, borderBottom: `1px solid #ECEAE3` }}>{title}</h2>
      {children}
    </div>
  )
}

function ExecSection({ title, accent, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1C2540', margin: '0 0 10px', paddingBottom: 6, borderBottom: `2px solid ${accent}` }}>{title}</h2>
      {children}
    </div>
  )
}

function ExpEntry({ item, accent, minimal }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 4 }}>
        <div>
          <strong style={{ fontSize: 13 }}>{item.position}</strong>
          {item.company && <span style={{ fontSize: 12, color: '#3E4A6A', marginLeft: 6 }}>@ {item.company}</span>}
          {item.location && !minimal && <span style={{ fontSize: 11, color: '#6B7694', marginLeft: 6 }}>— {item.location}</span>}
        </div>
        <span style={{ fontSize: 11, color: '#6B7694', whiteSpace: 'nowrap' }}>
          {item.startDate}{item.isCurrent ? ' — Present' : item.endDate ? ` — ${item.endDate}` : ''}
        </span>
      </div>
      {item.bullets?.filter(Boolean).length > 0 && (
        <ul style={{ margin: '6px 0 0', paddingLeft: 18, listStyleType: 'disc' }}>
          {item.bullets.filter(Boolean).map((b, i) => (
            <li key={i} style={{ fontSize: 12, lineHeight: 1.55, marginBottom: 3, color: '#2A3555' }}>{b}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
