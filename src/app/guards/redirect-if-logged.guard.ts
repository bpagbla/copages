import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/userService/user.service';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export const redirectIfLoggedGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);

  return userService.getUserInfo().pipe(
    map(() => router.createUrlTree(['/home'])), // Si está logueado, redirige
    catchError(() => of(true)) // Si NO está logueado, permite acceso al landing
  );
};
