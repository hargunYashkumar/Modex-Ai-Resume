import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'

const FEATURES = [
  { icon: '◈', title: 'AI Resume Parser', desc: 'Upload any existing resume — our AI extracts and structures every detail instantly.' },
  { icon: '◉', title: 'Smart Templates', desc: 'Choose from curated templates. Customise every colour, font, spacing, and section.' },
  { icon: '◎', title: 'ATS Scoring',     desc: 'Get a real-time compatibility score and specific suggestions to pass screening bots.' },
  { icon: '◍', title: 'Job Matching',    desc: 'AI reads your resume and surfaces the roles you\'re most qualified for right now.' },
  { icon: '◐', title: 'Course Roadmap',  desc: 'See exactly which skills to learn next with curated courses from top providers.' },
  { icon: '◑', title: 'Export Anywhere', desc: 'Download as PDF, DOCX, or share a live link. Your resume, your format.' },
]

const STATS = [
  { value: '94%', label: 'ATS pass rate' },
  { value: '3×',  label: 'More interviews' },
  { value: '12+', label: 'Resume templates' },
  { value: '50k', label: 'Resumes built' },
]

export default function LandingPage() {
  const heroRef = useRef(null)
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 400], [0, -80])
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.3])

  return (
    <div className="min-h-screen bg-stone-50 overflow-x-hidden">
      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-stone-50/90 backdrop-blur-sm border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 flex items-center justify-center">
              <img src="https://raw.githubusercontent.com/hargunYashkumar/MODEX/main/Gemini_Generated_Image_ebda0mebda0mebda%20(1)%20-%20Copy.png" alt="Modex Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-serif font-medium text-ink-700 text-lg">Modex</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth" className="text-sm text-ink-500 hover:text-ink-700 transition-colors font-medium">Sign in</Link>
            <Link to="/auth?signup=1" className="btn-primary btn-sm">Get started</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 bg-grid-ink [background-size:28px_28px] opacity-40" />

        {/* Floating accent blobs */}
        <div className="absolute top-24 right-16 w-64 h-64 bg-gold-100 rounded-full blur-3xl opacity-40" />
        <div className="absolute bottom-32 left-16 w-48 h-48 bg-ink-100 rounded-full blur-3xl opacity-30" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-5xl mx-auto px-6 text-center">


          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-serif text-ink-800 leading-[1.08] mb-6 text-balance"
          >
            Build resumes that
            <br />
            <em className="not-italic underline-gold">actually get read</em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-ink-400 max-w-xl mx-auto mb-10 leading-relaxed"
          >
            AI-powered resume builder with ATS scoring, smart templates,
            job matching, and personalised learning paths — all in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link to="/auth?signup=1" className="btn-primary btn-lg">
              Build your resume — free
            </Link>
            <Link to="/auth" className="btn-outline btn-lg">
              Sign in
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto"
          >
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-serif text-ink-700 mb-1">{value}</div>
                <div className="text-xs text-ink-400 uppercase tracking-wide">{label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-ink-300"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section className="py-28 px-6 bg-white border-t border-stone-200">
        <div className="max-w-6xl mx-auto">
          <FadeInView>
            <div className="mb-16 text-center">
              <h2 className="text-4xl font-serif text-ink-800 mb-3">Everything you need</h2>
              <p className="text-ink-400 text-base max-w-md mx-auto">
                From first draft to final offer — one intelligent platform handles it all.
              </p>
            </div>
          </FadeInView>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <FadeInView key={f.title} delay={i * 0.07}>
                <div className="card-hover group cursor-default">
                  <div className="w-10 h-10 mb-4 rounded border-2 border-ink-100 flex items-center justify-center text-xl text-ink-400 group-hover:border-gold-400 group-hover:text-gold-500 transition-colors">
                    {f.icon}
                  </div>
                  <h3 className="font-medium text-ink-700 mb-2">{f.title}</h3>
                  <p className="text-sm text-ink-400 leading-relaxed">{f.desc}</p>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 px-6 bg-ink-700">
        <div className="max-w-2xl mx-auto text-center">
          <FadeInView>
            <h2 className="text-4xl font-serif text-stone-50 mb-4">
              Your next job starts with a better resume
            </h2>
            <p className="text-ink-200 mb-8 text-base">
              Free to start. No credit card needed.
            </p>
            <Link to="/auth?signup=1" className="btn-gold btn-lg">
              Get started for free
            </Link>
          </FadeInView>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-6 bg-ink-800 border-t border-ink-600">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-serif text-ink-300">Modex</span>
          <div className="flex items-center gap-5">
            <Link to="/legal/terms"   className="text-xs text-ink-400 hover:text-ink-200 transition-colors">Terms</Link>
            <Link to="/legal/privacy" className="text-xs text-ink-400 hover:text-ink-200 transition-colors">Privacy</Link>
            <p className="text-xs text-ink-500">© {new Date().getFullYear()} Modex</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FadeInView({ children, delay = 0 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
