import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/authService/auth.service';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

/**
 * Guard de ruta que protege el acceso a rutas privadas de la aplicación.
 *
 * Este guard se asegura de que el usuario esté autenticado antes de permitir el acceso
 * a ciertas rutas. Si el usuario no está autenticado, será redirigido a la página de login.
 *
 * Este guard debe ser usado en el array `canActivate` de las rutas protegidas.
 *
 * @example
 * ts
 * {
 *   path: 'perfil',
 *   component: ProfileComponent,
 *   canActivate: [AuthGuard]
 * }
 */
@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  /**
   * Constructor del guard. Inyecta el servicio de autenticación y el router de Angular.
   *
   * @param authService Servicio de autenticación para verificar el estado del usuario.
   * @param router Servicio de rutas de Angular para redirecciones.
   */
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Método principal que determina si se puede activar una ruta.
   *
   * @returns Un `Observable` que emite:
   * - `true` si el usuario está autenticado.
   * - Un `UrlTree` que redirige a `/login` si el usuario no está autenticado.
   */
  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.isLoggedIn$.pipe(
      take(1),
      map((isLoggedIn) => {
        if (isLoggedIn) {
          return true;
        } else {
          return this.router.parseUrl('/login');
        }
      })
    );
  }
}
