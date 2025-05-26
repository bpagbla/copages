import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChapterService {
  private baseUrl = 'http://localhost:3000'; // Cambia esto si usas otro puerto

  constructor(private http: HttpClient) {}

  getChapterByLibroOrden(idLibro: string, orden: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/libro/${idLibro}/capitulo/${orden}`);
  }

  getTotalCapitulos(idLibro: string): Observable<any> {
  return this.http.get(`${this.baseUrl}/libro/${idLibro}/capitulos/count`);
}

}
