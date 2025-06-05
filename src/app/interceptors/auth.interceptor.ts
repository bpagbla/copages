import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { StorageService } from '../services/storageService/storage.service';
import { Observable } from 'rxjs';

/**
 * Interceptor HTTP que agrega el token de autenticación a cada solicitud saliente.
 *
 * Si existe un `accessToken` en el almacenamiento, lo añade al encabezado `Authorization` con formato `Bearer`.
 *
 * @example
 * ts
 * {
 *   provide: HTTP_INTERCEPTORS,
 *   useClass: AuthInterceptor,
 *   multi: true
 * }
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  /**
   * Constructor del interceptor.
   * @param storage Servicio que maneja el almacenamiento local del token.
   */
  constructor(private storage: StorageService) {}

  /**
   * Intercepta cada solicitud HTTP saliente y añade el token si está disponible.
   *
   * @param req Solicitud HTTP original.
   * @param next Manejador del siguiente interceptor en la cadena.
   * @returns Un Observable de tipo `HttpEvent` con la solicitud potencialmente modificada.
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.storage.getItem('accessToken');

    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(req);
  }
}
