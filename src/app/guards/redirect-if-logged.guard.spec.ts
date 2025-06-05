import { TestBed } from '@angular/core/testing';
import { RedirectIfLoggedGuard } from './redirect-if-logged.guard';
import { UserService } from '../services/userService/user.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('RedirectIfLoggedGuard', () => {
  let guard: RedirectIfLoggedGuard;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    userServiceSpy = jasmine.createSpyObj('UserService', ['getUserInfo']);
    routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        RedirectIfLoggedGuard,
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    guard = TestBed.inject(RedirectIfLoggedGuard);
  });

  it('debe redirigir si el usuario está logueado', (done) => {
    const mockUrlTree = {} as ReturnType<Router['createUrlTree']>;
    routerSpy.createUrlTree.and.returnValue(mockUrlTree);
    userServiceSpy.getUserInfo.and.returnValue(of({ id: 1 }));

    guard.canActivate().subscribe((result) => {
      expect(result).toBe(mockUrlTree);
      expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/home']);
      done();
    });
  });

  it('debe permitir acceso si el usuario NO está logueado', (done) => {
    userServiceSpy.getUserInfo.and.returnValue(throwError(() => new Error('401')));

    guard.canActivate().subscribe((result) => {
      expect(result).toBe(true);
      done();
    });
  });
});
