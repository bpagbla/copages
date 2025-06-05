import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { UserService } from '../services/userService/user.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * Guard que impide que un usuario autenticado acceda al landing o a rutas públicas como `/login` o `/register`.
 *
 * Este guard se utiliza para evitar que usuarios ya logueados accedan a rutas públicas. Si el usuario está logueado,
 * se le redirige a la página principal (`/home`). Si no lo está, se permite el acceso normalmente.
 *
 * @example
 * ts
 * {
 *   path: '',
 *   component: LandingComponent,
 *   canActivate: [RedirectIfLoggedGuard]
 * }
 */
@Injectable({
  providedIn: 'root',
})
export class RedirectIfLoggedGuard implements CanActivate {
  /**
   * Constructor del guard.
   *
   * @param userService Servicio que obtiene los datos del usuario autenticado.
   * @param router Servicio de rutas de Angular usado para redirección.
   */
  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  /**
   * Verifica si el usuario está logueado.
   *
   * @returns Observable que emite un `UrlTree` si el usuario está logueado (para redirigir a `/home`), o `true` si no lo está.
   */
  canActivate(): Observable<boolean | UrlTree> {
    return this.userService.getUserInfo().pipe(
      map(() => this.router.createUrlTree(['/home'])),
      catchError(() => of(true))
    );
  }
}
