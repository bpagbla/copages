import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Post } from '../../interfaces/post';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  constructor() {}
  baseUrl = 'http://localhost:3000';
  private http = inject(HttpClient);

  getFeed(): Observable<Post[]> {
    const accessToken = localStorage.getItem('accessToken');

    return this.http.get<Post[]>('http://localhost:3000/posts', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  // Enviar solicitud de colaboración
  enviarSolicitudColaboracion(destinatarioId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/colaboracion`, { destinatarioId });
  }

  // Obtener solicitudes pendientes (como posts)
  getSolicitudesColaboracion(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.baseUrl}/colaboraciones-pendientes`);
  }

  // Aceptar solicitud
  aceptarColaboracion(solicitudId: number): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/colaboracion/${solicitudId}/aceptar`,
      {}
    );
  }

  // Rechazar solicitud
  rechazarColaboracion(solicitudId: number): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/colaboracion/${solicitudId}/rechazar`,
      {}
    );
  }
}
