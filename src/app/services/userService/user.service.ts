import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:3000';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

    /**
   * Obtiene un usuario por su ID.
   * @param nick Nick del usuario a consultar
   * @returns Observable con los datos del usuario
   */
  getPerfil(nick: string): Observable<any> {
    return this.http.get(`${API_URL}/profile/${nick}`);
  }

/**
 * Verifica si el usuario autenticado sigue actualmente al usuario con el ID proporcionado.
 *
 * @param seguidoId ID del usuario que se desea comprobar si está siendo seguido.
 * @returns Observable que emite un objeto con la propiedad `sigue`, de tipo booleano (`true` si lo sigue, `false` si no).
 */

  toggleSeguimiento(seguidoId: number): Observable<{ sigue: boolean }> {
    return this.http.post<{ sigue: boolean }>(
      `${API_URL}/sigue/${seguidoId}`,
      {}
    );
  }


  getUserInfo(): Observable<any> {
    return this.http.get(`${API_URL}/user-info`);
  }

  existeSolicitudColaboracion(destinatarioId: number): Observable<any> {
    return this.http.get(`${API_URL}/colaboracion-existe/${destinatarioId}`);
  }

  enviarSolicitudColaboracion(destinatarioId: number): Observable<any> {
    return this.http.post(`${API_URL}/colaboracion`, { destinatarioId });
  }

  cancelarSolicitudColaboracion(destinatarioId: number): Observable<any> {
    return this.http.delete(`${API_URL}/colaboracion/${destinatarioId}`);
  }

  actualizarUsuario(
    id: number,
    user: any
  ): Observable<{ message: string; accessToken: string }> {
    return this.http.put<{ message: string; accessToken: string }>(
      `${API_URL}/user/${id}`,
      user
    );
  }

/**
 * Envía una solicitud PUT al backend para actualizar los datos del usuario, incluyendo archivos (como imagen de perfil).
 *
 * @param id ID del usuario que se va a actualizar.
 * @param formData Objeto `FormData` que contiene los datos a actualizar.
 * @returns Un observable con la respuesta del servidor (`any`).
 */
actualizarUsuarioFormData(id: number, formData: FormData): Observable<any> {
  return this.http.put(`http://localhost:3000/user/${id}`, formData);
}

/**
 * Consulta al backend si el usuario actual sigue a otro usuario específico.
 *
 * @param seguidoId ID del usuario que se quiere verificar si está siendo seguido.
 * @returns Un observable que emite un objeto con la propiedad `sigue`, que indica si el seguimiento existe.
 *
 * @example
 * ts
 * comprobarSeguimiento(12).subscribe(res => {
 *   if (res.sigue) {
 *     // Ya lo sigue
 *   }
 * });
 */
comprobarSeguimiento(seguidoId: number): Observable<{ sigue: boolean }> {
  return this.http.get<{ sigue: boolean }>(`${API_URL}/sigue/${seguidoId}`);
}

}
