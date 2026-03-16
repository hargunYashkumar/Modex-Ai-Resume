/**
 * exportDocx.js
 * Generates a .docx file from resume content using the `docx` npm package.
 * Called from ExportPanel via dynamic import to keep bundle size lean.
 */

/**
 * exportToDocx(resume) → downloads a .docx file
 * @param {{ title: string, content: object, customization: object }} resume
 */
export async function exportToDocx(resume) {
  const {
    Document, Packer, Paragraph, TextRun, HeadingLevel,
    AlignmentType, BorderStyle, Table, TableRow, TableCell,
    WidthType, ShadingType, convertInchesToTwip,
  } = await import('docx')

  const { content = {}, customization = {}, title = 'Resume' } = resume
  const {
    personalInfo    = {},
    workExperience  = [],
    education       = [],
    skills          = [],
    projects        = [],
    certifications  = [],
  } = content

  const primaryHex = (customization.primaryColor || '#1C2540').replace('#', '')
  const accentHex  = (customization.accentColor  || '#C9A84C').replace('#', '')
  const fontSize   = Math.round((customization.fontSize || 14) * 1.5) // pt to half-pt

  // ── Helper builders ────────────────────────────────────────────────────
  const sectionHeading = (text) => new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 80 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: accentHex, space: 4 },
    },
    run: { color: primaryHex, bold: true },
  })

  const bodyText = (text, opts = {}) => new Paragraph({
    children: [new TextRun({ text: text || '', size: fontSize, ...opts })],
    spacing: { after: 40 },
  })

  const boldLine = (label, value) => value ? new Paragraph({
    children: [
      new TextRun({ text: `${label}: `, bold: true, size: fontSize }),
      new TextRun({ text: value, size: fontSize }),
    ],
    spacing: { after: 40 },
  }) : null

  const bullet = (text) => new Paragraph({
    text: text || '',
    bullet: { level: 0 },
    spacing: { after: 30 },
    run: { size: fontSize },
  })

  const spacer = () => new Paragraph({ text: '', spacing: { after: 60 } })

  // ── Document sections ──────────────────────────────────────────────────
  const children = []

  // Header: Name
  if (personalInfo.name) {
    children.push(new Paragraph({
      children: [new TextRun({
        text: personalInfo.name,
        bold: true,
        size: 56,            // 28pt
        color: primaryHex,
      })],
      spacing: { after: 60 },
    }))
  }

  // Contact line
  const contactParts = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.location,
    personalInfo.linkedinUrl,
    personalInfo.githubUrl,
  ].filter(Boolean)

  if (contactParts.length) {
    children.push(new Paragraph({
      children: contactParts.flatMap((part, i) => [
        new TextRun({ text: part, size: Math.round(fontSize * 0.85), color: '6B7694' }),
        ...(i < contactParts.length - 1
          ? [new TextRun({ text: '  ·  ', size: Math.round(fontSize * 0.85), color: '9EA5B8' })]
          : []),
      ]),
      spacing: { after: 80 },
    }))
  }

  // Summary
  if (personalInfo.summary) {
    children.push(sectionHeading('Professional Summary'))
    children.push(bodyText(personalInfo.summary, { italics: true, color: '3E4A6A' }))
    children.push(spacer())
  }

  // Work Experience
  if (workExperience.length) {
    children.push(sectionHeading('Experience'))
    for (const job of workExperience) {
      const dateRange = [
        job.startDate,
        job.isCurrent ? 'Present' : job.endDate,
      ].filter(Boolean).join(' – ')

      children.push(new Paragraph({
        children: [
          new TextRun({ text: job.position || '', bold: true, size: fontSize + 4 }),
          ...(job.company
            ? [new TextRun({ text: `  @  ${job.company}`, size: fontSize, color: '3E4A6A' })]
            : []),
          new TextRun({ text: `  ${dateRange}`, size: fontSize - 2, color: '6B7694' }),
        ],
        spacing: { after: 40 },
      }))

      if (job.location) children.push(bodyText(job.location, { size: fontSize - 2, color: '6B7694' }))

      for (const b of (job.bullets || []).filter(Boolean)) {
        children.push(bullet(b))
      }
      children.push(spacer())
    }
  }

  // Education
  if (education.length) {
    children.push(sectionHeading('Education'))
    for (const edu of education) {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: edu.institution || '', bold: true, size: fontSize + 2 }),
          ...(edu.endDate || edu.startDate
            ? [new TextRun({ text: `  ${edu.endDate || edu.startDate}`, size: fontSize - 2, color: '6B7694' })]
            : []),
        ],
        spacing: { after: 40 },
      }))
      if (edu.degree || edu.fieldOfStudy) {
        children.push(bodyText(
          [edu.degree, edu.fieldOfStudy].filter(Boolean).join(', '),
          { color: '3E4A6A' }
        ))
      }
      if (edu.gpa) children.push(bodyText(`GPA: ${edu.gpa}`, { size: fontSize - 2, color: '6B7694' }))
      children.push(spacer())
    }
  }

  // Skills
  if (skills.length) {
    children.push(sectionHeading('Skills'))
    children.push(new Paragraph({
      children: skills.flatMap((skill, i) => [
        new TextRun({ text: skill, size: fontSize }),
        ...(i < skills.length - 1 ? [new TextRun({ text: '  ·  ', color: '9EA5B8', size: fontSize })] : []),
      ]),
      spacing: { after: 80 },
    }))
  }

  // Projects
  if (projects.length) {
    children.push(sectionHeading('Projects'))
    for (const p of projects) {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: p.name || '', bold: true, size: fontSize + 2 }),
          ...(p.url ? [new TextRun({ text: `  ${p.url}`, size: fontSize - 2, color: accentHex })] : []),
        ],
        spacing: { after: 40 },
      }))
      if (p.description) children.push(bodyText(p.description, { color: '3E4A6A' }))
      if (p.technologies?.length) {
        children.push(bodyText(p.technologies.join(' · '), { size: fontSize - 2, color: '6B7694' }))
      }
      children.push(spacer())
    }
  }

  // Certifications
  if (certifications.length) {
    children.push(sectionHeading('Certifications'))
    for (const c of certifications) {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: c.name || '', bold: true, size: fontSize }),
          ...(c.issuer ? [new TextRun({ text: `  —  ${c.issuer}`, size: fontSize - 2, color: '3E4A6A' })] : []),
          ...(c.issueDate ? [new TextRun({ text: `  ${c.issueDate}`, size: fontSize - 2, color: '6B7694' })] : []),
        ],
        spacing: { after: 60 },
      }))
    }
  }

  // ── Build & download ───────────────────────────────────────────────────
  const doc = new Document({
    creator:     'Modex',
    title:       title,
    description: `Resume generated by Modex`,
    styles: {
      default: {
        document: {
          run: {
            font:  customization.fontFamily || 'Calibri',
            size:  fontSize,
            color: '1C2540',
          },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: {
            top:    convertInchesToTwip(0.75),
            right:  convertInchesToTwip(0.75),
            bottom: convertInchesToTwip(0.75),
            left:   convertInchesToTwip(0.75),
          },
        },
      },
      children,
    }],
  })

  const blob = await Packer.toBlob(doc)
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `${(title || 'resume').replace(/[^a-z0-9]/gi, '_')}.docx`
  a.click()
  URL.revokeObjectURL(url)
}
