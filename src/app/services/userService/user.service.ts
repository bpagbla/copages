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

  actualizarUsuarioFormData(id: number, formData: FormData): Observable<any> {
  return this.http.put(`http://localhost:3000/user/${id}`, formData);
}
  comprobarSeguimiento(seguidoId: number): Observable<{ sigue: boolean }> {
    return this.http.get<{ sigue: boolean }>(`${API_URL}/sigue/${seguidoId}`);
  }
}
