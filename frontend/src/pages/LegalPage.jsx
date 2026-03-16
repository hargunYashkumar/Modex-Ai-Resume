import { useParams, Link } from 'react-router-dom'
import { useTitle } from '../hooks'

const CONTENT = {
  terms: {
    title: 'Terms of Service',
    lastUpdated: 'March 2025',
    sections: [
      {
        heading: 'Acceptance of terms',
        body: 'By accessing and using Modex, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the service.',
      },
      {
        heading: 'Description of service',
        body: 'Modex provides AI-powered resume building, ATS scoring, job matching, and course recommendation services. Features are subject to change without notice.',
      },
      {
        heading: 'User accounts',
        body: 'You are responsible for maintaining the security of your account and password. You must not share your account credentials or allow others to access your account.',
      },
      {
        heading: 'User content',
        body: 'You retain ownership of all resume content you create on Modex. By using the service, you grant us a limited licence to process your content solely for the purpose of providing the service to you.',
      },
      {
        heading: 'AI-generated content',
        body: 'AI-generated suggestions (resume text, job matches, course recommendations) are provided for informational purposes only. We do not guarantee accuracy, completeness, or suitability for any purpose. Always review AI suggestions before using them.',
      },
      {
        heading: 'Prohibited uses',
        body: 'You may not use Modex to create fraudulent resumes, misrepresent your qualifications, or violate any applicable law or regulation.',
      },
      {
        heading: 'Limitation of liability',
        body: 'Modex is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the service, including job application outcomes.',
      },
      {
        heading: 'Changes to terms',
        body: 'We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms.',
      },
      {
        heading: 'Contact',
        body: 'For questions about these terms, contact us at legal@modex.app.',
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    lastUpdated: 'March 2025',
    sections: [
      {
        heading: 'Information we collect',
        body: 'We collect information you provide directly: your name, email address, and resume content. We also collect usage data such as pages visited and features used to improve the service.',
      },
      {
        heading: 'How we use your information',
        body: 'Your information is used to: provide and improve the service, personalise AI recommendations, send transactional emails (account notifications, password resets), and comply with legal obligations.',
      },
      {
        heading: 'AI processing',
        body: 'Resume content you submit for AI analysis is sent to Anthropic\'s Claude API for processing. Anthropic\'s privacy policy applies to this processing. We do not use your resume content to train AI models.',
      },
      {
        heading: 'Data storage',
        body: 'Your data is stored on secure AWS infrastructure (RDS PostgreSQL, S3). We use industry-standard encryption in transit (TLS) and at rest.',
      },
      {
        heading: 'Data sharing',
        body: 'We do not sell your personal information. We share data only with service providers necessary to operate Modex (AWS, Anthropic) under strict data processing agreements.',
      },
      {
        heading: 'Your rights',
        body: 'You have the right to access, correct, export, or delete your personal data at any time from your Profile settings. You may also request account deletion by contacting privacy@modex.app.',
      },
      {
        heading: 'Cookies',
        body: 'We use only essential cookies required for authentication (JWT stored in localStorage). We do not use tracking or advertising cookies.',
      },
      {
        heading: 'Contact',
        body: 'For privacy questions or data requests, contact privacy@modex.app.',
      },
    ],
  },
}

export default function LegalPage() {
  const { type } = useParams()
  const page = CONTENT[type] || CONTENT.terms
  useTitle(page.title)

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Nav */}
      <nav className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 flex items-center justify-center">
            <img src="https://raw.githubusercontent.com/hargunYashkumar/MODEX/main/Gemini_Generated_Image_ebda0mebda0mebda%20(1)%20-%20Copy.png" alt="Modex Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-serif font-medium text-ink-700">Modex</span>
        </Link>
        <Link to="/auth" className="btn-outline btn-sm">Sign in</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-10">
          <div className="flex gap-3 mb-6">
            <Link
              to="/legal/terms"
              className={`text-sm font-medium transition-colors ${type === 'terms' ? 'text-ink-700 underline-gold' : 'text-ink-400 hover:text-ink-600'}`}
            >
              Terms of Service
            </Link>
            <span className="text-ink-300">·</span>
            <Link
              to="/legal/privacy"
              className={`text-sm font-medium transition-colors ${type === 'privacy' ? 'text-ink-700 underline-gold' : 'text-ink-400 hover:text-ink-600'}`}
            >
              Privacy Policy
            </Link>
          </div>
          <h1 className="text-4xl font-serif text-ink-800 mb-2">{page.title}</h1>
          <p className="text-sm text-ink-400">Last updated: {page.lastUpdated}</p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {page.sections.map((section, i) => (
            <div key={i} className="border-l-gold pl-5">
              <h2 className="text-base font-medium text-ink-700 mb-2 capitalize">
                {section.heading}
              </h2>
              <p className="text-sm text-ink-500 leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-stone-200">
          <Link to="/" className="btn-outline btn-sm">← Back to Modex</Link>
        </div>
      </div>
    </div>
  )
}
