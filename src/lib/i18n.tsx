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

  // ===== Acciones comunes (admin) =====
  'action.guardar': { va: 'Guardar', es: 'Guardar' },
  'action.guardando': { va: 'Guardant…', es: 'Guardando…' },
  'action.cancelar': { va: 'Cancel·lar', es: 'Cancelar' },
  'action.editar': { va: 'Editar', es: 'Editar' },
  'action.eliminar': { va: 'Eliminar', es: 'Eliminar' },
  'action.nuevo': { va: '+ Nou', es: '+ Nuevo' },
  'action.nueva': { va: '+ Nova', es: '+ Nueva' },
  'action.añadir': { va: 'Afegir', es: 'Añadir' },
  'action.crear': { va: 'Crear', es: 'Crear' },
  'action.subir': { va: 'Pujar', es: 'Subir' },
  'action.sustituir': { va: 'Substituir', es: 'Sustituir' },
  'action.descargar': { va: 'Descarregar', es: 'Descargar' },
  'action.activar': { va: 'Activar', es: 'Activar' },
  'action.desactivar': { va: 'Desactivar', es: 'Desactivar' },

  'field.titulo': { va: 'Títol', es: 'Título' },
  'field.contenido': { va: 'Contingut', es: 'Contenido' },
  'field.resumen': { va: 'Resum', es: 'Resumen' },
  'field.slug': { va: 'Slug', es: 'Slug' },
  'field.galeria': { va: 'Galeria', es: 'Galería' },
  'field.imagen': { va: 'Imatge', es: 'Imagen' },
  'field.imagen_principal': { va: 'Imatge principal', es: 'Imagen principal' },
  'field.foto_opcional': { va: 'Foto (opcional)', es: 'Foto (opcional)' },
  'field.nombre': { va: 'Nom', es: 'Nombre' },
  'field.nombre_completo': { va: 'Nom complet', es: 'Nombre completo' },
  'field.cargo': { va: 'Càrrec', es: 'Cargo' },
  'field.descripcion': { va: 'Descripció', es: 'Descripción' },
  'field.categoria': { va: 'Categoria', es: 'Categoría' },
  'field.temporada': { va: 'Temporada', es: 'Temporada' },
  'field.dorsal': { va: 'Dorsal (opcional)', es: 'Dorsal (opcional)' },
  'field.orden': { va: 'Ordre', es: 'Orden' },
  'field.enlace': { va: 'Enllaç', es: 'Enlace' },
  'field.publicada': { va: 'Publicada', es: 'Publicada' },
  'field.destacada': { va: 'Destacada', es: 'Destacada' },
  'field.visible': { va: 'Visible', es: 'Visible' },
  'field.activo_equipo': { va: 'Equip actiu', es: 'Equipo activo' },
  'field.activo_jugador': { va: 'Jugador actiu', es: 'Jugador activo' },
  'field.entrenador_principal': { va: 'Entrenador principal', es: 'Entrenador principal' },
  'field.fecha_publicacion': { va: 'Data de publicació', es: 'Fecha de publicación' },
  'field.tipo': { va: 'Tipus', es: 'Tipo' },
  'field.destino': { va: 'Destí', es: 'Destino' },
  'field.padre': { va: 'Pare', es: 'Padre' },
  'field.equipo': { va: 'Equip', es: 'Equipo' },

  // Gestión Web — índice
  'admin.web.title': { va: 'Gestió Web', es: 'Gestión Web' },
  'admin.web.subtitle': {
    va: 'Administra el contingut de la web pública del club.',
    es: 'Administra el contenido de la web pública del club.',
  },
  'admin.web.noticias': { va: 'Notícies', es: 'Noticias' },
  'admin.web.noticias_desc': {
    va: 'Crear, editar, publicar i destacar notícies.',
    es: 'Crear, editar, publicar y destacar noticias.',
  },
  'admin.web.paginas': { va: 'Pàgines', es: 'Páginas' },
  'admin.web.paginas_desc': {
    va: 'Història i pàgines informatives editables.',
    es: 'Historia y páginas informativas editables.',
  },
  'admin.web.directiva': { va: 'Directiva', es: 'Directiva' },
  'admin.web.directiva_desc': {
    va: 'Càrrecs i membres de la directiva.',
    es: 'Cargos y miembros de la directiva.',
  },
  'admin.web.patrocinadores': { va: 'Patrocinadors', es: 'Patrocinadores' },
  'admin.web.patrocinadores_desc': { va: 'Logotips, enllaços i ordre.', es: 'Logos, enlaces y orden.' },
  'admin.web.menu': { va: 'Menú', es: 'Menú' },
  'admin.web.menu_desc': {
    va: 'Apartats i subapartats del menú públic.',
    es: 'Apartados y subapartados del menú público.',
  },
  'admin.web.config': { va: 'Configuració', es: 'Configuración' },
  'admin.web.config_desc': {
    va: 'Inscripcions, contacte i estadi.',
    es: 'Inscripciones, contacto y estadio.',
  },

  // Admin — Noticias
  'admin.noticias.title': { va: 'Notícies', es: 'Noticias' },
  'admin.noticias.empty': { va: 'No hi ha notícies.', es: 'No hay noticias.' },
  'admin.noticias.new': { va: 'Nova notícia', es: 'Nueva noticia' },
  'admin.noticias.edit': { va: 'Editar notícia', es: 'Editar noticia' },
  'admin.noticias.help_bilingual': {
    va: 'Ompli cada camp en <b>castellà</b> i <b>valencià</b>. Si deixes el valencià buit, a la web es mostrarà la versió en castellà.',
    es: 'Rellena cada campo en <b>castellano</b> y <b>valenciano</b>. Si dejas el valenciano vacío, en la web se mostrará la versión en castellano.',
  },
  'admin.noticias.adjuntos': { va: 'Adjunts', es: 'Adjuntos' },
  'admin.noticias.adjuntos_add': { va: 'Afegir adjunt…', es: 'Añadir adjunto…' },
  'admin.noticias.featured': { va: 'Destacada', es: 'Destacada' },
  'admin.noticias.confirm_delete': {
    va: '¿Eliminar la notícia?',
    es: '¿Eliminar la noticia?',
  },

  // Admin — Páginas
  'admin.paginas.title': { va: 'Pàgines', es: 'Páginas' },
  'admin.paginas.empty': { va: 'No hi ha pàgines.', es: 'No hay páginas.' },
  'admin.paginas.new': { va: 'Nova pàgina', es: 'Nueva página' },
  'admin.paginas.edit': { va: 'Editar pàgina', es: 'Editar página' },

  // Admin — Directiva
  'admin.directiva.title': { va: 'Directiva', es: 'Directiva' },
  'admin.directiva.empty': { va: 'No hi ha membres.', es: 'No hay miembros.' },
  'admin.directiva.new': { va: 'Nou membre', es: 'Nuevo miembro' },
  'admin.directiva.edit': { va: 'Editar membre', es: 'Editar miembro' },

  // Admin — Patrocinadores
  'admin.patroc.title': { va: 'Patrocinadors', es: 'Patrocinadores' },
  'admin.patroc.empty': { va: 'No hi ha patrocinadors.', es: 'No hay patrocinadores.' },
  'admin.patroc.new': { va: 'Nou patrocinador', es: 'Nuevo patrocinador' },
  'admin.patroc.edit': { va: 'Editar patrocinador', es: 'Editar patrocinador' },

  // Admin — Menú
  'admin.menu.title': { va: 'Menú', es: 'Menú' },
  'admin.menu.empty': { va: 'No hi ha elements de menú.', es: 'No hay elementos de menú.' },
  'admin.menu.new': { va: 'Nou element', es: 'Nuevo elemento' },
  'admin.menu.edit': { va: 'Editar element', es: 'Editar elemento' },
  'admin.menu.tipo_ruta': { va: 'Ruta interna', es: 'Ruta interna' },
  'admin.menu.tipo_externa': { va: 'Enllaç extern', es: 'Enlace externo' },
  'admin.menu.tipo_pagina': { va: 'Pàgina CMS', es: 'Página CMS' },
  'admin.menu.parent_none': { va: '— Sense pare (nivell principal) —', es: '— Sin padre (nivel principal) —' },

  // Admin — Configuración
  'admin.config.title': { va: 'Configuració web', es: 'Configuración web' },
  'admin.config.saved': { va: 'Guardat', es: 'Guardado' },
  'admin.config.inscripciones': { va: 'Inscripcions', es: 'Inscripciones' },
  'admin.config.inscripciones_url': { va: 'URL d’inscripcions', es: 'URL de inscripciones' },
  'admin.config.contacto': { va: 'Contacte', es: 'Contacto' },
  'admin.config.mapa': { va: 'Mapa', es: 'Mapa' },
  'admin.config.estadio': { va: 'Estadi', es: 'Estadio' },
  'admin.config.fotos_estadio': { va: 'Fotos de l’estadi', es: 'Fotos del estadio' },

  // Admin — Equipos
  'admin.equipos.title': { va: 'Equips', es: 'Equipos' },
  'admin.equipos.empty': { va: 'No hi ha equips.', es: 'No hay equipos.' },
  'admin.equipos.new': { va: 'Nou equip', es: 'Nuevo equipo' },
  'admin.equipos.edit': { va: 'Editar equip', es: 'Editar equipo' },
  'admin.equipos.cuerpo_tecnico': { va: 'Cos tècnic', es: 'Cuerpo técnico' },
  'admin.equipos.foto_team': { va: 'Foto de l’equip (opcional)', es: 'Foto del equipo (opcional)' },
  'admin.equipos.desc_team': { va: 'Descripció (opcional)', es: 'Descripción (opcional)' },
  'admin.equipos.entrenador_no_asignado': { va: '— Sense assignar —', es: '— Sin asignar —' },

  // Admin — Jugadores
  'admin.jugadores.title': { va: 'Jugadors', es: 'Jugadores' },
  'admin.jugadores.empty': { va: 'No hi ha jugadors.', es: 'No hay jugadores.' },
  'admin.jugadores.new': { va: 'Nou jugador', es: 'Nuevo jugador' },
  'admin.jugadores.edit': { va: 'Editar jugador', es: 'Editar jugador' },
  'admin.jugadores.filter_all': { va: 'Tots els equips', es: 'Todos los equipos' },
  'admin.jugadores.foto_player': { va: 'Foto del jugador (opcional)', es: 'Foto del jugador (opcional)' },
  'admin.jugadores.no_equipo': { va: '— Sense equip —', es: '— Sin equipo —' },
  'admin.jugadores.temporada_hint': { va: '(de l’equip si està buit)', es: '(del equipo si vacío)' },

  // Admin — Licencias
  'admin.licencias.title': { va: 'Llicències', es: 'Licencias' },
  'admin.licencias.empty_filters': { va: 'No hi ha jugadors amb aquests filtres.', es: 'No hay jugadores con estos filtros.' },
  'admin.licencias.filter_all_teams': { va: 'Tots els equips', es: 'Todos los equipos' },
  'admin.licencias.filter_all_cats': { va: 'Totes les categories', es: 'Todas las categorías' },
  'admin.licencias.filter_all_seasons': { va: 'Totes les temporades', es: 'Todas las temporadas' },
  'admin.licencias.only_missing': { va: 'Només sense llicència', es: 'Solo sin licencia' },

  // Admin — Entrenadores
  'admin.entrenadores.title': { va: 'Entrenadors i usuaris', es: 'Entrenadores y usuarios' },
  'admin.entrenadores.new': { va: '+ Nou entrenador', es: '+ Nuevo entrenador' },
  'admin.entrenadores.help': {
    va: 'Dóna d’alta cada entrenador amb el seu DNI i nom. Entrarà a l’app escrivint només el seu DNI. Després podràs assignar-li equips i, si pertoca, fer-lo administrador.',
    es: 'Da de alta a cada entrenador con su DNI y nombre. Entrará en la app escribiendo solo su DNI. Después podrás asignarle equipos y, si procede, hacerlo administrador.',
  },
  'admin.entrenadores.new_title': { va: 'Nou entrenador', es: 'Nuevo entrenador' },
  'admin.entrenadores.assign_btn': { va: 'Assignar equips', es: 'Asignar equipos' },
  'admin.entrenadores.assign_title': { va: 'Equips de', es: 'Equipos de' },

  // Admin — Historial
  'admin.historial.title': { va: 'Historial de documents', es: 'Historial de documentos' },
  'admin.historial.empty': { va: 'No hi ha documents generats.', es: 'No hay documentos generados.' },
  'admin.historial.col_fecha': { va: 'Data', es: 'Fecha' },
  'admin.historial.col_tipo': { va: 'Tipus', es: 'Tipo' },
  'admin.historial.col_jugador': { va: 'Jugador', es: 'Jugador' },
  'admin.historial.col_equipo': { va: 'Equip', es: 'Equipo' },
  'admin.historial.col_usuario': { va: 'Generat per', es: 'Generado por' },
  'admin.historial.tipo_parte': { va: 'Comunicat de lesió', es: 'Parte de lesión' },

  // Admin — Panel principal
  'admin.dashboard.title': { va: 'Panell d’administració', es: 'Panel de administración' },
  'admin.dashboard.card.equipos': { va: 'Equips', es: 'Equipos' },
  'admin.dashboard.card.jugadores': { va: 'Jugadors', es: 'Jugadores' },
  'admin.dashboard.card.entrenadores': { va: 'Entrenadors', es: 'Entrenadores' },
  'admin.dashboard.card.licencias': { va: 'Llicències pujades', es: 'Licencias subidas' },
  'admin.dashboard.card.sin_lic': { va: 'Jugadors sense llicència', es: 'Jugadores sin licencia' },
  'admin.dashboard.recent_title': { va: 'Últims documents generats', es: 'Últimos documentos generados' },
  'admin.dashboard.recent_empty': {
    va: 'Encara no s’ha generat cap documentació.',
    es: 'Todavía no se ha generado documentación.',
  },

  // ===== Gestión interna =====
  'gestion.title': { va: 'Muro CF · Gestió', es: 'Muro CF · Gestión' },
  'gestion.nav.equipos': { va: 'Equips', es: 'Equipos' },
  'gestion.nav.panel': { va: 'Panell', es: 'Panel' },
  'gestion.nav.jugadores': { va: 'Jugadors', es: 'Jugadores' },
  'gestion.nav.licencias': { va: 'Llicències', es: 'Licencias' },
  'gestion.nav.entrenadores': { va: 'Entrenadors', es: 'Entrenadores' },
  'gestion.nav.historial': { va: 'Historial', es: 'Historial' },
  'gestion.nav.web': { va: 'Gestió Web', es: 'Gestión Web' },

  // Roles
  'rol.admin': { va: 'Admin', es: 'Admin' },
  'rol.coordinador': { va: 'Coordinador', es: 'Coordinador' },
  'rol.entrenador': { va: 'Entrenador', es: 'Entrenador' },

  // Páginas internas
  'gestion.equipos.title': { va: 'Equips', es: 'Equipos' },
  'gestion.equipos.empty_admin': {
    va: 'No hi ha equips. Crea’n un des del panell d’administració.',
    es: 'No hay equipos. Crea uno desde el panel de administración.',
  },
  'gestion.equipos.empty_coach': {
    va: 'Encara no tens equips assignats. Contacta amb l’administrador.',
    es: 'Aún no tienes equipos asignados. Contacta con el administrador.',
  },

  'gestion.players.loading': { va: 'Carregant jugadors…', es: 'Cargando jugadores…' },
  'gestion.players.back': { va: '← Equips', es: '← Equipos' },
  'gestion.players.empty': { va: 'Aquest equip no té jugadors.', es: 'Este equipo no tiene jugadores.' },

  'gestion.player.loading': { va: 'Carregant jugador…', es: 'Cargando jugador…' },
  'gestion.player.not_found': { va: 'Jugador no trobat.', es: 'Jugador no encontrado.' },
  'gestion.player.equipo': { va: 'Equip', es: 'Equipo' },
  'gestion.player.temporada': { va: 'Temporada', es: 'Temporada' },
  'gestion.player.estado_lic': { va: 'Estat de la llicència', es: 'Estado de licencia' },
  'gestion.player.no_lic_warn': {
    va: 'Aquest jugador no té llicència federativa pujada. Contacta amb l’administrador.',
    es: 'Este jugador no tiene licencia federativa subida. Contacte con el administrador.',
  },
  'gestion.player.cta': { va: 'Obtenir documentació per lesió', es: 'Obtener documentación por lesión' },
  'gestion.player.fecha_label': { va: 'Data del comunicat (per defecte, hui)', es: 'Fecha del parte (por defecto, hoy)' },
  'gestion.player.fecha_help': {
    va: 'Només s’omple la data del comunicat. La data de lesió i la resta les completa el metge.',
    es: 'Solo se rellena la fecha del parte. La fecha de lesión y el resto los completa el médico.',
  },
  'gestion.player.generando': { va: 'Generant…', es: 'Generando…' },
  'gestion.player.generar': { va: 'Generar comunicat + llicència', es: 'Generar parte + licencia' },
  'gestion.player.listo': { va: 'Llest. Descarrega o comparteix els documents:', es: 'Listo. Descarga o comparte los documentos:' },
  'gestion.player.desc_parte': { va: 'Descarregar comunicat', es: 'Descargar parte' },
  'gestion.player.desc_lic': { va: 'Descarregar llicència', es: 'Descargar licencia' },
  'gestion.player.compartir': { va: 'Compartir comunicat + llicència', es: 'Compartir parte + licencia' },
  'gestion.player.correo': { va: 'Correu', es: 'Correo' },
  'gestion.player.share_help': {
    va: 'A WhatsApp/Correu es descarreguen els PDF perquè els adjuntes. Al mòbil, usa “Compartir” per enviar-los directament.',
    es: 'En WhatsApp/Correo se descargan los PDF para que los adjuntes. En móvil, usa “Compartir” para enviarlos directamente.',
  },
  'gestion.player.cerrar': { va: 'Tancar', es: 'Cerrar' },

  // Login (existente, antes 'login.titulo')
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
