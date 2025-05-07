import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.loggedIn.asObservable();

  constructor(private http: HttpClient, private router:Router) {
    // Al iniciar, verificamos si hay sesión activa
    this.verificarSesion();
  }

  // Verifica si hay sesión activa en el servidor
  verificarSesion() {
    this.http
      .get('http://localhost:3000/sesion', { withCredentials: true })
      .subscribe(
        (res: any) => {
          if (res.loggedIn) {
            this.loggedIn.next(true);
          } else {
            this.loggedIn.next(false);
          }
        },
        () => {
          this.loggedIn.next(false);
        }
      );
  }

  // validar inicio de sesión
  validarLogin(username: string, password: string) {
    const loginData = { username, password };
  
    this.http.post('http://localhost:3000/login', loginData, { withCredentials: true })
      .subscribe(
        (res: any) => {
          console.log('Login exitoso', res);
          localStorage.setItem('accessToken', res.accessToken);  // Guardamos el accessToken en localStorage
          alert('Login exitoso');
          this.loggedIn.next(true);  // Actualizamos el estado de login
          this.router.navigate(['/home']);
        },
        (error) => {
          console.error('Error al validar login', error);
          if (error.status === 401) {
            alert('Usuario o contraseña incorrecta');
          } else {
            alert('Hubo un error, por favor intenta nuevamente');
          }
          this.loggedIn.next(false);  // Si el login falla, actualizamos el estado
        }
      );
  }
  
  

  //  Cierra sesión
  logout() {
    this.http.post('http://localhost:3000/logout', {}, { withCredentials: true })
      .subscribe(
        () => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          this.loggedIn.next(false);
          this.router.navigate(['/login']);
        },
        (error) => {
          console.error('Error al cerrar sesión', error);
        }
      );
  }
  

  registro(username: string, password: string, name: string, surname: string, email: string) {
    console.log("Llamando al backend con:", username, password, name, surname, email);

    const registerData = {
      nick: username,
      password: password,
      nombre: name,
      apellidos: surname,
      email: email,
      role: 'user' 
    };

    this.http.post('http://localhost:3000/register', registerData)
    .subscribe({
      next: (res) => console.log('Usuario registrado', res),
      error: (err) => console.error('Error al registrar usuario', err)
    });
  }

  refreshToken() {
    this.http
      .post('http://localhost:3000/refresh', {}, { withCredentials: true })
      .subscribe(
        (res: any) => {
          if (res.accessToken) {
            console.log('Token renovado:', res);
            localStorage.setItem('accessToken', res.accessToken); // Guardar el nuevo accessToken
            this.setLoggedIn(true); // Actualizamos el estado de login
          }
        },
        () => {
          console.error('No se pudo renovar el token.');
          this.setLoggedIn(false);
        }
        
      );
  }

  verificarUsuarioExiste(username: string) {
    return this.http.post<{ existe: boolean }>(
      'http://localhost:3000/usuarioExiste',
      { username }
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
}
