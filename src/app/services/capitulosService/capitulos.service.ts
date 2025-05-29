import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Capitulo } from '../../interfaces/capitulo';

@Injectable({
  providedIn: 'root',
})
export class CapitulosService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getListaCapitulos(idLibro: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/libro/${idLibro}/capitulos`);
  }

  //capitulo por su orden
  getCapitulo(idLibro: number, orden: number): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/libro/${idLibro}/capitulo/${orden}`
    );
  }
  //capitulo por su id
  getCapituloPorId(id: number): Observable<Capitulo> {
    return this.http.get<Capitulo>(`${this.baseUrl}/capitulo/${id}`);
  }

  getTotalCapitulos(idLibro: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/libro/${idLibro}/capitulos/count`);
  }

  crearCapitulo(libroId: number, capitulo: Capitulo): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/libro/${libroId}/capitulo`,
      capitulo
    );
  }

  editarCapitulo(id: number, capitulo: Capitulo): Observable<any> {
    return this.http.put(`${this.baseUrl}/capitulo/${id}`, capitulo);
  }

  eliminarCapitulo(idCapitulo: number): Observable<any> {
     return this.http.delete(`${this.baseUrl}/capitulo/${idCapitulo}`);
  }
}
