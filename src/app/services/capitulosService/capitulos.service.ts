import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CapitulosService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getChapterByLibroOrden(idLibro: number, orden: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/libro/${idLibro}/capitulo/${orden}`);
  }

  getTotalCapitulos(idLibro: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/libro/${idLibro}/capitulos/count`);
  }

  crearCapitulo(libroId: number, capitulo: any): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/libro/${libroId}/capitulo`,
      capitulo
    );
  }
}
