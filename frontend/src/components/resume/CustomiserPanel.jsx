const FONTS = ['DM Sans', 'Georgia', 'Times New Roman', 'Arial', 'Helvetica', 'Garamond', 'Palatino']

const COLOR_PRESETS = [
  { primary: '#1C2540', accent: '#C9A84C', label: 'Navy & Gold' },
  { primary: '#1A1A2E', accent: '#E94560', label: 'Dark & Red' },
  { primary: '#2C3E50', accent: '#3498DB', label: 'Slate & Blue' },
  { primary: '#1B4332', accent: '#52B788', label: 'Forest & Sage' },
  { primary: '#2D1B4E', accent: '#A855F7', label: 'Plum & Violet' },
  { primary: '#1A1A1A', accent: '#D4AF37', label: 'Black & Gold' },
]

const SECTIONS = [
  { id: 'summary',        label: 'Summary' },
  { id: 'workExperience', label: 'Work Experience' },
  { id: 'education',      label: 'Education' },
  { id: 'skills',         label: 'Skills' },
  { id: 'projects',       label: 'Projects' },
  { id: 'certifications', label: 'Certifications' },
]

export default function CustomiserPanel({ customization, onChange }) {
  const u = (key, val) => onChange({ ...customization, [key]: val })
  const toggleSection = (id) => onChange({
    ...customization,
    sections: { ...customization.sections, [id]: !customization.sections?.[id] },
  })

  return (
    <div className="p-5 space-y-7">
      {/* Color presets */}
      <div>
        <h3 className="text-xs font-medium uppercase tracking-wide text-ink-500 mb-3">Colour presets</h3>
        <div className="grid grid-cols-3 gap-2">
          {COLOR_PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => onChange({ ...customization, primaryColor: p.primary, accentColor: p.accent })}
              className="flex flex-col items-center gap-1.5 p-2 rounded border-2 border-stone-200 hover:border-ink-300 transition-all"
            >
              <div className="flex gap-1">
                <div className="w-5 h-5 rounded-sm" style={{ background: p.primary }} />
                <div className="w-5 h-5 rounded-sm" style={{ background: p.accent }} />
              </div>
              <span className="text-2xs text-ink-400 leading-none">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom colors */}
      <div>
        <h3 className="text-xs font-medium uppercase tracking-wide text-ink-500 mb-3">Custom colours</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-xs text-ink-600 w-24">Primary</label>
            <input type="color" value={customization.primaryColor || '#1C2540'} onChange={e => u('primaryColor', e.target.value)}
              className="w-9 h-9 rounded border border-stone-200 cursor-pointer p-0.5" />
            <span className="text-xs text-ink-400 font-mono">{customization.primaryColor || '#1C2540'}</span>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs text-ink-600 w-24">Accent</label>
            <input type="color" value={customization.accentColor || '#C9A84C'} onChange={e => u('accentColor', e.target.value)}
              className="w-9 h-9 rounded border border-stone-200 cursor-pointer p-0.5" />
            <span className="text-xs text-ink-400 font-mono">{customization.accentColor || '#C9A84C'}</span>
          </div>
        </div>
      </div>

      {/* Font */}
      <div>
        <h3 className="text-xs font-medium uppercase tracking-wide text-ink-500 mb-3">Font family</h3>
        <select
          className="select text-sm"
          value={customization.fontFamily || 'DM Sans'}
          onChange={e => u('fontFamily', e.target.value)}
        >
          {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      {/* Font size */}
      <div>
        <h3 className="text-xs font-medium uppercase tracking-wide text-ink-500 mb-3">
          Font size — <span className="text-ink-700 font-semibold">{customization.fontSize || 14}px</span>
        </h3>
        <input
          type="range" min={11} max={17} step={1}
          value={customization.fontSize || 14}
          onChange={e => u('fontSize', parseInt(e.target.value))}
          className="w-full accent-ink-700"
        />
        <div className="flex justify-between text-2xs text-ink-300 mt-1">
          <span>Compact</span><span>Large</span>
        </div>
      </div>

      {/* Spacing */}
      <div>
        <h3 className="text-xs font-medium uppercase tracking-wide text-ink-500 mb-3">Section spacing</h3>
        <div className="flex gap-2">
          {['compact', 'normal', 'spacious'].map(s => (
            <button
              key={s}
              onClick={() => u('spacing', s)}
              className={`flex-1 py-1.5 text-xs font-medium rounded border-2 transition-all capitalize ${
                customization.spacing === s
                  ? 'border-ink-700 bg-ink-700 text-stone-50'
                  : 'border-stone-200 text-ink-500 hover:border-ink-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Section visibility */}
      <div>
        <h3 className="text-xs font-medium uppercase tracking-wide text-ink-500 mb-3">Section visibility</h3>
        <div className="space-y-2">
          {SECTIONS.map(sec => (
            <label key={sec.id} className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm text-ink-600 group-hover:text-ink-800 transition-colors">{sec.label}</span>
              <div
                onClick={() => toggleSection(sec.id)}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                  customization.sections?.[sec.id] !== false ? 'bg-ink-700' : 'bg-stone-300'
                }`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                  customization.sections?.[sec.id] !== false ? 'translate-x-4' : 'translate-x-0.5'
                }`} />
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
