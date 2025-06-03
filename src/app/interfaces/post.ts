export interface Author {
  id: number;
  username: string;
  nombre: string;
  apellidos: string;
  pfp: string;
}

export interface Post {
  id?: number; // libro.id (solo si es post real)
  title: string; // para ambos: libro o solicitud
  excerpt: string; ///
  date: string;
  portada?: string; // vacío en colaboraciones
  author: Author;

  // Solo si es post de capítulo real
  capituloTitulo?: string;
  capituloOrden?: number;

  // Solo si es solicitud de colaboración
  isCollabRequest?: boolean;
  solicitudId?: number;
}
