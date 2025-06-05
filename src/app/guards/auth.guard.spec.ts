import { TestBed } from '@angular/core/testing';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/authService/auth.service';
import { Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn$'], {
      isLoggedIn$: new BehaviorSubject<boolean>(false),
    });

    routerSpy = jasmine.createSpyObj('Router', ['parseUrl']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    guard = TestBed.inject(AuthGuard);
  });

  it('debe permitir acceso si el usuario está logueado', (done) => {
    authServiceSpy.isLoggedIn$ = of(true);

    guard.canActivate().subscribe((result) => {
      expect(result).toBeTrue();
      done();
    });
  });

  it('debe redirigir al login si el usuario NO está logueado', (done) => {
    const mockUrlTree = {} as ReturnType<Router['parseUrl']>;
    routerSpy.parseUrl.and.returnValue(mockUrlTree);
    authServiceSpy.isLoggedIn$ = of(false);

    guard.canActivate().subscribe((result) => {
      expect(result).toBe(mockUrlTree);
      expect(routerSpy.parseUrl).toHaveBeenCalledWith('/login');
      done();
    });
  });
});
