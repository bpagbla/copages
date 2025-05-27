import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ObrasService {
  private baseUrl = 'http://localhost:3000'; // Cambia esto si tu backend está en otro puerto/host

  constructor(private http: HttpClient) {}

  // Obtener todas las obras del usuario logueado
  getMisObras(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/loggedInUser-books`);
  }


  // Obtener una obra por ID
  getObraPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/obra/${id}`);
  }

  // Crear una nueva obra
  crearObra(obra: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/obra`, obra);
  }

  // Editar una obra existente
  editarObra(id: number, obra: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/obra/${id}`, obra);
  }

  // Eliminar una obra
  eliminarObra(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/obra/${id}`);
  }
}
