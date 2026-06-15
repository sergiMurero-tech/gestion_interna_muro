import { useLang, type Lang } from '../lib/i18n'

const OPTIONS: { value: Lang; label: string; title: string }[] = [
  { value: 'va', label: 'VA', title: 'Valencià' },
  { value: 'es', label: 'ES', title: 'Castellano' },
]

/** Selector de idioma compacto pensado para ir sobre la barra negra de marca. */
export default function LanguageToggle() {
  const { lang, setLang } = useLang()
  return (
    <div className="inline-flex overflow-hidden rounded-md bg-white/10 text-xs font-bold uppercase tracking-wider">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => setLang(o.value)}
          title={o.title}
          className={`px-2.5 py-1.5 transition ${
            lang === o.value ? 'bg-gold text-black' : 'text-zinc-200 hover:bg-white/10'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
