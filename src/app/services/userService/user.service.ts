import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:3000';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  getPerfil(nick: string): Observable<any> {
    return this.http.get(`${API_URL}/profile/${nick}`);
  }

  comprobarSeguimiento(seguidoId: number): Observable<{ sigue: boolean }> {
    return this.http.get<{ sigue: boolean }>(`${API_URL}/sigue/${seguidoId}`);
  }

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

}
