/**
 * Representa una notificación del sistema (toast) que puede ser mostrada al usuario.
 *
 * Utilizada comúnmente por un servicio global para mostrar mensajes temporales en la interfaz.
 */
export interface Notification {
  /**
   * Tipo de notificación que define su estilo visual y comportamiento.
   * Puede ser:
   * - `success`: operación exitosa.
   * - `error`: error del sistema o del usuario.
   * - `info`: información relevante o neutra.
   * - `warning`: advertencia sobre una acción.
   */
  type: 'success' | 'error' | 'info' | 'warning';

  /**
   * Mensaje principal que se mostrará al usuario.
   */
  message: string;

  /**
   * Título o encabezado de la notificación.
   */
  title: string;
}
