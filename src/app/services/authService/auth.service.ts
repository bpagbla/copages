import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  catchError,
  filter,
  map,
  Observable,
  take,
  tap,
  throwError,
} from 'rxjs';
import { StorageService } from '../storageService/storage.service';
import { NotificationService } from '../notificationService/notification.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.loggedIn.asObservable();
  private refreshInProgress = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router,
    private storageService: StorageService,
    private notificationService: NotificationService
  ) {
    this.checkToken();
  }

  private checkToken() {
    const token = this.storageService.getItem('accessToken');
    if (token && this.isTokenValid(token)) {
      this.loggedIn.next(true);
    } else {
      this.loggedIn.next(false);
      this.storageService.removeItem('accessToken');
    }
  }

  private isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() / 1000 < payload.exp;
    } catch {
      return false;
    }
  }

  // Verifica si hay sesión activa en el servidor
  verificarSesion() {
    const token = this.storageService.getItem('accessToken');

    if (!token) {
      this.loggedIn.next(false);
      return;
    }

    this.http
      .post<{ accessToken: string }>(
        'http://localhost:3000/refresh',
        {},
        { withCredentials: true }
      )
      .subscribe({
        next: (res) => {
          if (res.accessToken) {
            this.storageService.setItem('accessToken', res.accessToken);
            this.loggedIn.next(true);
          } else {
            this.loggedIn.next(false);
            this.storageService.removeItem('accessToken');
          }
        },
        error: () => {
          this.loggedIn.next(false);
          this.storageService.removeItem('accessToken');
        },
      });
  }

  // validar inicio de sesión
  validarLogin(username: string, password: string) {
    const loginData = { username, password };

    this.http
      .post('http://localhost:3000/login', loginData, { withCredentials: true })
      .subscribe(
        (res: any) => {
          console.log('Login exitoso', res);
          this.storageService.setItem('accessToken', res.accessToken);
          this.notificationService.show({
            type: 'success',
            message: 'Sesión iniciada correctamente',
            title: '¡Hola de nuevo!',
          });

          this.loggedIn.next(true);
          this.router.navigate(['/home']);
        },
        (error) => {
          console.error('Error al iniciar sesión:', error);
          this.notificationService.show({
            type: 'error',
            message: 'No se pudo iniciar sesión. Verifica tus credenciales.',
            title: 'Error de login',
          });
        }
      );
  }

  //  Cierra sesión
  logout() {
    this.http
      .post('http://localhost:3000/logout', {}, { withCredentials: true })
      .subscribe(
        () => {
          this.storageService.removeItem('accessToken');
          this.storageService.removeItem('refreshToken');
          this.loggedIn.next(false);
          this.router.navigate(['/login']);
        },
        (error) => {
          console.error('Error al cerrar sesión', error);
        }
      );
  }

  //registrar nuevo usuario
  registro(
    username: string,
    password: string,
    name: string,
    surname: string,
    email: string
  ) {
    console.log(
      'Llamando al backend con:',
      username,
      password,
      name,
      surname,
      email
    );

    const registerData = {
      nick: username,
      password: password,
      nombre: name,
      apellidos: surname,
      email: email,
      role: 'user',
    };

    this.http.post('http://localhost:3000/register', registerData).subscribe({
      next: (res) => {
        console.log('Usuario registrado', res);
        this.router.navigate(['/login']); // Redirige al login
      },
      error: (err) => console.error('Error al registrar usuario', err),
    });
  }

  refreshToken$(): Observable<string> {
    return this.http
      .post<{ accessToken: string }>(
        'http://localhost:3000/refresh',
        {},
        { withCredentials: true }
      )
      .pipe(map((response) => response.accessToken));
  }

  getUserInfo(): Observable<any> {
    const accessToken = this.storageService.getItem('accessToken');

    return this.http.get('http://localhost:3000/user-info', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  verificarUsuarioExiste(username: string) {
    return this.http.post<{ existe: boolean }>(
      'http://localhost:3000/usuarioExiste',
      { username }
    );
  }

  verificarEmailExiste(email: string) {
    return this.http.post<{ existe: boolean }>(
      'http://localhost:3000/emailExiste',
      { email }
    );
  }

  // Getter para obtener el valor actual de login
  get isLoggedIn(): boolean {
    return this.loggedIn.value;
  }

  // Método para actualizar el estado de login
  setLoggedIn(value: boolean): void {
    this.loggedIn.next(value);
  }

  actualizarAccessToken(token: string): void {
    this.storageService.setItem('accessToken', token);
    this.checkToken(); // vuelve a evaluar si el token es válido
  }
}
