import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/authService/auth.service';
import { inject } from '@angular/core';
import { map, take } from 'rxjs/operators';

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
