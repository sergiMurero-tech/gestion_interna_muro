export type Rol = 'admin' | 'entrenador'

export interface Profile {
  id: string
  nombre: string
  email: string
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
  created_at: string
}

export interface Jugador {
  id: string
  nombre_completo: string
  equipo_id: string | null
  temporada: string
  activo: boolean
  created_at: string
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
