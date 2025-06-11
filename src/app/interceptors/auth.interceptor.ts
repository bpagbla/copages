/**
 * Interceptor HTTP que agrega el token de autenticación a cada solicitud saliente
 * y maneja automáticamente la renovación del token cuando expira (código 401).
 *
 * Si el token ha expirado, intenta obtener uno nuevo mediante el endpoint /refresh.
 * Si falla la renovación, se cierra la sesión.
 *
 * @example
 * ts
 * {
 *   provide: HTTP_INTERCEPTORS,
 *   useClass: AuthRefreshInterceptor,
 *   multi: true
 * }
 */
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../services/authService/auth.service';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  /**
   * Constructor del interceptor.
   * @param authService Servicio de autenticación que gestiona tokens y sesión.
   */
  constructor(private authService: AuthService) {}

  /**
   * Intercepta solicitudes HTTP para añadir el token y gestionar la renovación automática.
   *
   * @param req Solicitud HTTP original.
   * @param next Manejador del siguiente interceptor en la cadena.
   * @returns Un Observable de tipo `HttpEvent` con la solicitud modificada o reintentada.
   */
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.authService['storageService'].getItem('accessToken');

    let clonedReq = req;
    if (token) {
      clonedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(clonedReq).pipe(
      catchError((error) => {
        // Si es error 401 y no es /login ni /refresh
        if (
          error instanceof HttpErrorResponse &&
          error.status === 401 &&
          !req.url.includes('/login') &&
          !req.url.includes('/refresh') &&
          !req.url.includes('/user-info')
        ) {
          return this.authService.refreshToken$().pipe(
            switchMap((newToken) => {
              this.authService.actualizarAccessToken(newToken);
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`,
                },
              });
              return next.handle(retryReq);
            }),
            catchError((err) => {
              this.authService.logout();
              return throwError(() => err);
            })
          );
        }

        return throwError(() => error);
      })
    );
  }
}
