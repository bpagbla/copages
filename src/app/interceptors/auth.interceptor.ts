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
  constructor(private authService: AuthService) {}

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
        const isAuthError =
          error instanceof HttpErrorResponse &&
          error.status === 401 &&
          !req.url.includes('/login') &&
          !req.url.includes('/refresh') &&
          !req.url.includes('/user-info');

        if (isAuthError) {
          const refreshToken = this.authService['storageService'].getItem('refreshToken');

          // Si no hay refresh token, no se intenta renovar
          if (!refreshToken) {
            return throwError(() => error);
          }

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
