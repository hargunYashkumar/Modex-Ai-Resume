const TEMPLATES = [
  {
    id: 'modern',
    name: 'Modern',
    desc: 'Bold header, clean sections. Best for tech & product roles.',
    preview: 'bg-ink-700',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    desc: 'Light, typographic. Great for design & creative fields.',
    preview: 'bg-stone-100',
  },
  {
    id: 'executive',
    name: 'Executive',
    desc: 'Two-column with gold accents. Ideal for senior roles.',
    preview: 'bg-stone-50',
  },
  {
    id: 'sidebar',
    name: 'Sidebar',
    desc: 'Coloured left panel. Stands out for any industry.',
    preview: 'bg-ink-600',
  },
  {
    id: 'creative',
    name: 'Creative',
    desc: 'Bold sidebar with skill bars. Perfect for designers & creatives.',
    preview: 'bg-ink-800',
  },
]

export default function TemplatePicker({ current, onSelect }) {
  return (
    <div className="p-5">
      <h3 className="text-sm font-medium text-ink-700 mb-1">Choose template</h3>
      <p className="text-xs text-ink-400 mb-5">All templates are fully customisable.</p>

      <div className="space-y-3">
        {TEMPLATES.map(t => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={`w-full text-left border-2 rounded-lg p-4 transition-all flex gap-4 items-start ${
              current === t.id
                ? 'border-ink-700 bg-ink-50'
                : 'border-stone-200 hover:border-ink-300 bg-white'
            }`}
          >
            {/* Mini preview swatch */}
            <div className={`w-12 h-16 rounded ${t.preview} flex-shrink-0 border border-stone-200 overflow-hidden relative`}>
              <div className={`absolute top-0 left-0 right-0 h-5 ${t.id === 'sidebar' ? 'bg-ink-700 w-4' : t.id === 'modern' ? 'bg-ink-700' : 'border-b-2 border-gold-400 w-full'}`} style={t.id === 'sidebar' ? { height:'100%', width:'40%' } : {}} />
              {[0,1,2].map(i => (
                <div key={i} className="absolute bg-stone-300 rounded-sm" style={{
                  left: t.id === 'sidebar' ? 18 : 6,
                  top: 24 + i*10,
                  width: t.id === 'sidebar' ? 24 : 36,
                  height: 3,
                  opacity: 0.6,
                }} />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-medium text-ink-700">{t.name}</span>
                {current === t.id && (
                  <span className="badge-gold text-2xs">Active</span>
                )}
              </div>
              <p className="text-xs text-ink-400 leading-relaxed">{t.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
