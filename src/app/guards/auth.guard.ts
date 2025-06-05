import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/authService/auth.service';
import { inject } from '@angular/core';
import { map, take } from 'rxjs/operators';

/**
 * Guard de ruta que protege rutas privadas de la aplicación.
 * 
 * Evita que usuarios no autenticados accedan a rutas restringidas.
 * Si el usuario está autenticado (`isLoggedIn$ === true`), permite el acceso.
 * Si no lo está, redirige automáticamente a la página de login.
 * 
 * @param route Información de la ruta que se intenta activar.
 * @param state Estado actual del router (incluye URL destino).
 * @returns `true` si el usuario está logueado, o una URL de redirección a `/login` si no lo está.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn$.pipe(
    take(1), // solo tomamos el primer valor emitido
    map(isLoggedIn => {
      if (isLoggedIn) {
        return true;
      } else {
        return router.parseUrl('/login');
      }
    })
  );
};
