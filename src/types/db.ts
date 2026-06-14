export type Rol = 'admin' | 'entrenador' | 'coordinador'

export interface Profile {
  id: string
  nombre: string
  email: string
  dni: string | null
  rol: Rol
  activo: boolean
  created_at: string
}

export interface Equipo {
  id: string
  nombre: string
  categoria: string
  temporada: string
  entrenador_id: string | null
  activo: boolean
  foto_url: string | null
  descripcion: string
  created_at: string
}

export interface Jugador {
  id: string
  nombre_completo: string
  equipo_id: string | null
  temporada: string
  activo: boolean
  foto_url: string | null
  dorsal: number | null
  created_at: string
}

export interface CuerpoTecnico {
  id: string
  equipo_id: string | null
  nombre: string
  cargo: string
  foto_url: string | null
  orden: number
  created_at: string
}

export interface Adjunto {
  nombre: string
  url: string
}

export interface Noticia {
  id: string
  titulo: string
  slug: string
  resumen: string
  contenido: string
  imagen_url: string | null
  galeria: string[]
  adjuntos: Adjunto[]
  destacada: boolean
  publicada: boolean
  fecha_publicacion: string
  autor_id: string | null
  created_at: string
}

export interface Pagina {
  id: string
  slug: string
  titulo: string
  contenido: string
  imagen_url: string | null
  galeria: string[]
  publicada: boolean
  orden: number
  created_at: string
}

export interface Patrocinador {
  id: string
  nombre: string
  logo_url: string | null
  enlace: string | null
  orden: number
  visible: boolean
  created_at: string
}

export interface Directivo {
  id: string
  cargo: string
  nombre: string
  foto_url: string | null
  descripcion: string
  orden: number
  created_at: string
}

export type MenuTipo = 'ruta' | 'externa' | 'pagina'

export interface MenuItem {
  id: string
  label: string
  tipo: MenuTipo
  destino: string
  parent_id: string | null
  orden: number
  visible: boolean
  created_at: string
}

export interface ContactoInfo {
  direccion?: string
  telefono?: string
  email?: string
  redes?: { facebook?: string; instagram?: string; x?: string; youtube?: string }
  mapa_embed?: string
}

export interface EstadioInfo {
  nombre?: string
  direccion?: string
  info?: string
  fotos?: string[]
}

export interface SiteConfig {
  id: number
  inscripciones_url: string
  contacto: ContactoInfo
  estadio: EstadioInfo
}

export interface Licencia {
  id: string
  jugador_id: string
  temporada: string
  nombre_archivo: string
  url_archivo: string
  fecha_subida: string
  usuario_subida: string | null
}

export interface DocumentoGenerado {
  id: string
  jugador_id: string | null
  equipo_id: string | null
  usuario_id: string | null
  fecha_generacion: string
  tipo_documento: string
}

export interface EntrenadorEquipo {
  entrenador_id: string
  equipo_id: string
  created_at: string
}

// Minimal typing for the supabase-js generic. The app reads/writes these tables.
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & { id: string }; Update: Partial<Profile> }
      equipos: { Row: Equipo; Insert: Partial<Equipo>; Update: Partial<Equipo> }
      jugadores: { Row: Jugador; Insert: Partial<Jugador>; Update: Partial<Jugador> }
      licencias: { Row: Licencia; Insert: Partial<Licencia>; Update: Partial<Licencia> }
      documentos_generados: {
        Row: DocumentoGenerado
        Insert: Partial<DocumentoGenerado>
        Update: Partial<DocumentoGenerado>
      }
      entrenador_equipos: {
        Row: EntrenadorEquipo
        Insert: Partial<EntrenadorEquipo>
        Update: Partial<EntrenadorEquipo>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
