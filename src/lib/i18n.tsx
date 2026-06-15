import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Lang = 'va' | 'es'

const STORAGE_KEY = 'lang'
const DEFAULT_LANG: Lang = 'va'

// ============================================================
// Diccionario de textos fijos de la interfaz pública.
// Las claves se referencian con t('clave').
// ============================================================
const DICT: Record<string, { va: string; es: string }> = {
  // Cabecera / acciones
  'nav.acceso': { va: 'Accés', es: 'Acceso' },
  'nav.acceso_admin': { va: 'Accés administrador', es: 'Acceso administrador' },
  'nav.ver_web': { va: 'Veure web', es: 'Ver web' },
  'nav.salir': { va: 'Eixir', es: 'Salir' },

  // Estado / genéricos
  'state.loading': { va: 'Carregant…', es: 'Cargando…' },
  'state.empty': { va: 'No hi ha contingut.', es: 'No hay contenido.' },
  'action.volver': { va: 'Tornar', es: 'Volver' },
  'action.ver_mas': { va: 'Veure més →', es: 'Ver más →' },
  'action.ver_todas': { va: 'Veure totes →', es: 'Ver todas →' },

  // Home / hero
  'home.eyebrow': { va: 'Muro Club de Futbol', es: 'Muro Club de Fútbol' },
  'home.lema_top': { va: 'Sentiment', es: 'Sentiment' }, // expresión bilingüe igual
  'home.lema_bottom': { va: 'blanc i negre', es: 'blanc i negre' },
  'home.descripcion': {
    va: 'La cantera, el primer equip i tota l’actualitat del Muro CF en un mateix lloc.',
    es: 'La cantera, el primer equipo y toda la actualidad del Muro CF en un mismo sitio.',
  },
  'home.cta.equipos': { va: 'Conèixer els equips', es: 'Conocer los equipos' },
  'home.cta.noticias': { va: 'Veure notícies →', es: 'Ver noticias →' },
  'home.accesos.title.before': { va: 'Accessos', es: 'Accesos' },
  'home.accesos.title.after': { va: 'ràpids', es: 'rápidos' },
  'home.accesos.eyebrow': { va: 'Comença ací', es: 'Empieza aquí' },
  'home.ultimas.eyebrow': { va: 'Actualitat', es: 'Actualidad' },
  'home.ultimas.title.before': { va: 'Últimes', es: 'Últimas' },
  'home.ultimas.title.after': { va: 'notícies', es: 'noticias' },
  'home.empty_news': { va: 'No hi ha més notícies per ara.', es: 'No hay más noticias por ahora.' },
  'home.destacada': { va: 'Destacada', es: 'Destacada' },

  // Accesos rápidos
  'accesos.area.label': { va: 'Àrea Esportiva', es: 'Área Deportiva' },
  'accesos.area.desc': { va: 'Equips del club', es: 'Equipos del club' },
  'accesos.noticias.label': { va: 'Notícies', es: 'Noticias' },
  'accesos.noticias.desc': { va: 'Actualitat del club', es: 'Actualidad del club' },
  'accesos.inscripciones.label': { va: 'Inscripcions', es: 'Inscripciones' },
  'accesos.inscripciones.desc': { va: 'Unix-te al club', es: 'Únete al club' },
  'accesos.contacto.label': { va: 'Contacte', es: 'Contacto' },
  'accesos.contacto.desc': { va: 'Parla amb nosaltres', es: 'Habla con nosotros' },

  // Noticias
  'noticias.eyebrow': { va: 'Actualitat', es: 'Actualidad' },
  'noticias.title.before': { va: 'Notí', es: 'Noti' },
  'noticias.title.after': { va: 'cies', es: 'cias' },
  'noticias.empty': { va: 'No hi ha notícies publicades.', es: 'No hay noticias publicadas.' },
  'noticias.not_found': { va: 'Notícia no trobada.', es: 'Noticia no encontrada.' },
  'noticias.back': { va: '← Tornar a notícies', es: '← Volver a noticias' },
  'noticias.galeria': { va: 'Galeria', es: 'Galería' },
  'noticias.galeria_eyebrow': { va: 'Galeria', es: 'Galería' },
  'noticias.imagenes': { va: 'Imatges', es: 'Imágenes' },
  'noticias.adjuntos': { va: 'Adjunts', es: 'Adjuntos' },
  'noticias.adjuntos_eyebrow': { va: 'Documents', es: 'Documentos' },

  // Club
  'club.eyebrow': { va: 'El nostre club', es: 'Nuestro club' },
  'club.title.before': { va: 'El', es: 'El' },
  'club.title.after': { va: 'club', es: 'club' },
  'club.historia.label': { va: 'Història', es: 'Historia' },
  'club.historia.desc': { va: 'Com va nàixer i ha evolucionat el Muro CF.', es: 'Cómo nació y evolucionó el Muro CF.' },
  'club.directiva.label': { va: 'Directiva', es: 'Directiva' },
  'club.directiva.desc': { va: 'Les persones darrere del club.', es: 'Las personas detrás del club.' },
  'club.estadio.label': { va: 'Estadi', es: 'Estadio' },
  'club.estadio.desc': { va: 'La nostra casa, La Llometa.', es: 'Nuestra casa, La Llometa.' },
  'club.patrocinadores.label': { va: 'Patrocinadors', es: 'Patrocinadores' },
  'club.patrocinadores.desc': { va: 'Qui fa possible el club.', es: 'Quienes hacen posible el club.' },
  'club.contacto.label': { va: 'Contacte', es: 'Contacto' },
  'club.contacto.desc': { va: 'Telèfon, email i xarxes socials.', es: 'Teléfono, email y redes sociales.' },

  // Directiva
  'directiva.eyebrow': { va: 'Equip de gestió', es: 'Equipo de gestión' },
  'directiva.title.before': { va: 'Direc', es: 'Direc' },
  'directiva.title.after': { va: 'tiva', es: 'tiva' },
  'directiva.empty': { va: 'No hi ha membres de la directiva.', es: 'No hay miembros de la directiva.' },

  // Estadio
  'estadio.eyebrow': { va: 'La nostra casa', es: 'Nuestra casa' },
  'estadio.default_title': { va: 'Estadi', es: 'Estadio' },
  'estadio.empty': { va: 'No hi ha informació de l’estadi disponible.', es: 'No hay información del estadio disponible.' },
  'estadio.galeria_eyebrow': { va: 'Galeria', es: 'Galería' },
  'estadio.galeria_title': { va: 'Imatges', es: 'Imágenes' },

  // Patrocinadores
  'patroc.eyebrow': { va: 'Gràcies per fer-ho possible', es: 'Gracias por hacerlo posible' },
  'patroc.title.before': { va: 'Patroci', es: 'Patroci' },
  'patroc.title.after': { va: 'nadors', es: 'nadores' },
  'patroc.empty': { va: 'No hi ha patrocinadors.', es: 'No hay patrocinadores.' },
  'patroc.visit': { va: 'Visitar →', es: 'Visitar →' },

  // Contacto
  'contacto.eyebrow': { va: 'Estem en contacte', es: 'Estamos en contacto' },
  'contacto.title.before': { va: 'Con', es: 'Con' },
  'contacto.title.after': { va: 'tacte', es: 'tacto' },
  'contacto.label_direccion': { va: 'Adreça', es: 'Dirección' },
  'contacto.label_telefono': { va: 'Telèfon', es: 'Teléfono' },
  'contacto.label_email': { va: 'Email', es: 'Email' },
  'contacto.label_redes': { va: 'Xarxes socials', es: 'Redes sociales' },
  'contacto.empty': { va: 'No hi ha informació de contacte disponible.', es: 'No hay información de contacto disponible.' },
  'contacto.mapa_link': { va: 'Veure ubicació al mapa', es: 'Ver ubicación en el mapa' },

  // Área deportiva / equipo
  'area.eyebrow': { va: 'El club en joc', es: 'El club en juego' },
  'area.title.before': { va: 'Àrea', es: 'Área' },
  'area.title.after': { va: 'Esportiva', es: 'Deportiva' },
  'area.empty': { va: 'No hi ha equips disponibles.', es: 'No hay equipos disponibles.' },
  'area.temporada': { va: 'Temporada', es: 'Temporada' },
  'area.ver_equipo': { va: 'Veure equip →', es: 'Ver equipo →' },
  'team.back': { va: '← Tornar a l’àrea esportiva', es: '← Volver al área deportiva' },
  'team.not_found': { va: 'Equip no trobat.', es: 'Equipo no encontrado.' },
  'team.jugadores_eyebrow': { va: 'La plantilla', es: 'La plantilla' },
  'team.jugadores_title': { va: 'Jugadors', es: 'Jugadores' },
  'team.jugadores_empty': { va: 'Encara no hi ha jugadors publicats.', es: 'Aún no hay jugadores publicados.' },
  'team.cuerpo_eyebrow': { va: 'Banqueta', es: 'Banquillo' },
  'team.cuerpo_title': { va: 'Cos tècnic', es: 'Cuerpo técnico' },
  'team.cuerpo_empty': { va: 'Sense informació del cos tècnic.', es: 'Sin información de cuerpo técnico.' },

  // Inscripciones
  'insc.redirigiendo': { va: 'Redirigint a inscripcions…', es: 'Redirigiendo a inscripciones…' },
  'insc.continuar': { va: 'Continuar a inscripcions', es: 'Continuar a inscripciones' },
  'insc.no_disponible': { va: 'Les inscripcions encara no estan disponibles.', es: 'Las inscripciones aún no están disponibles.' },

  // CMS / página genérica
  'cms.not_found': { va: 'Pàgina no trobada.', es: 'Página no encontrada.' },
  'cms.eyebrow': { va: 'El club', es: 'El club' },

  // Footer
  'footer.acceso_privada': { va: 'Accés àrea privada', es: 'Acceso área privada' },

  // Login
  'login.titulo': { va: 'Muro CF · Gestió', es: 'Muro CF · Gestión' },
  'login.dni': { va: 'Accedeix amb el teu DNI', es: 'Accede con tu DNI' },
  'login.admin': { va: 'Accés administrador', es: 'Acceso administrador' },
  'login.dni_label': { va: 'DNI', es: 'DNI' },
  'login.dni_help': { va: 'Introdueix el teu DNI tal com et va donar d’alta el club.', es: 'Introduce tu DNI tal y como te dio de alta el club.' },
  'login.email_label': { va: 'Email', es: 'Email' },
  'login.password_label': { va: 'Contrasenya', es: 'Contraseña' },
  'login.entering': { va: 'Entrant…', es: 'Entrando…' },
  'login.enter': { va: 'Entrar', es: 'Entrar' },
  'login.toggle_admin': { va: 'Accés administrador', es: 'Acceso administrador' },
  'login.toggle_dni': { va: '← Tornar a l’accés per DNI', es: '← Volver al acceso por DNI' },
}

// ============================================================
// Contexto + hook
// ============================================================
interface LangValue {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}

const LangContext = createContext<LangValue | undefined>(undefined)

function readStored(): Lang {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === 'es' || v === 'va' ? v : DEFAULT_LANG
  } catch {
    return DEFAULT_LANG
  }
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => readStored())

  useEffect(() => {
    document.documentElement.lang = lang === 'va' ? 'ca-valencia' : 'es'
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      /* ignore */
    }
  }, [lang])

  const value = useMemo<LangValue>(
    () => ({
      lang,
      setLang: (l: Lang) => setLangState(l),
      t: (key: string) => DICT[key]?.[lang] ?? key,
    }),
    [lang],
  )

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLang(): LangValue {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang debe usarse dentro de <LangProvider>')
  return ctx
}

/**
 * Devuelve el campo correcto según el idioma activo, con fallback a castellano.
 * Ejemplo: pickLang(noticia, 'titulo', 'va') → noticia.titulo_va || noticia.titulo
 */
// eslint-disable-next-line react-refresh/only-export-components
export function pickLang(item: unknown, field: string, lang: Lang): string {
  if (!item || typeof item !== 'object') return ''
  const obj = item as Record<string, unknown>
  if (lang === 'va') {
    const v = obj[`${field}_va`]
    if (typeof v === 'string' && v.trim()) return v
  }
  const base = obj[field]
  return typeof base === 'string' ? base : ''
}
