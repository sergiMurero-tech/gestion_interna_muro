import { supabase } from './supabase'
import type { MenuItem, SiteConfig } from '../types/db'

export async function getConfig(): Promise<SiteConfig> {
  const { data } = await supabase.from('site_config').select('*').eq('id', 1).maybeSingle()
  return (
    data ?? { id: 1, inscripciones_url: '', contacto: {}, estadio: {} }
  ) as SiteConfig
}

export async function getMenuItems(includeHidden = false): Promise<MenuItem[]> {
  let q = supabase.from('menu_items').select('*').order('orden')
  if (!includeHidden) q = q.eq('visible', true)
  const { data } = await q
  return (data ?? []) as MenuItem[]
}

export interface MenuNode {
  item: MenuItem
  children: MenuItem[]
}

/** Agrupa los items en árbol de 2 niveles (apartado -> subapartados). */
export function buildMenuTree(items: MenuItem[]): MenuNode[] {
  const roots = items.filter((i) => !i.parent_id)
  return roots.map((item) => ({
    item,
    children: items.filter((c) => c.parent_id === item.id),
  }))
}

/** Convierte un item de menú en una ruta navegable dentro de la app. */
export function menuHref(item: MenuItem): string {
  if (item.tipo === 'externa') return item.destino
  if (item.tipo === 'pagina') return `/p/${item.destino}`
  return item.destino || '/'
}

export function isExternal(item: MenuItem): boolean {
  return item.tipo === 'externa'
}
