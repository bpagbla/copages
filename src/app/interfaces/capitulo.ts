/**
 * Representa un capítulo dentro de una obra.
 */
export interface Capitulo {
  /**
   * Identificador único del capítulo.
   */
  ID: number;

  /**
   * Orden o posición del capítulo dentro de la obra.
   */
  ORDEN: number;

  /**
   * Título del capítulo.
   */
  TITULO: string;

  /**
   * Contenido textual completo del capítulo.
   */
  TEXTO: string;
}
