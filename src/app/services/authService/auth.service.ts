import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.loggedIn.asObservable();

  constructor(private http: HttpClient) {
    // Al iniciar, verificamos si hay sesión activa
    this.verificarSesion();
  }

  // Verifica si hay sesión activa en el servidor
  verificarSesion() {
    this.http
      .get('http://localhost:3000/usuario', { withCredentials: true })
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
          alert('Login exitoso');
          this.loggedIn.next(true);
        },
        (error) => {
          console.error('Error al validar login', error);
          if (error.status === 401) {
            alert('Usuario o contraseña incorrecta');
          } else {
            alert('Hubo un error, por favor intenta nuevamente');
          }
          this.loggedIn.next(false);
        }
      );
  }
  

  //  Cierra sesión
  logout() {
    this.http
      .post('http://localhost:3000/logout', {}, { withCredentials: true })
      .subscribe(
        () => {
          this.loggedIn.next(false);
        },
        () => {
          alert('Error al cerrar sesión');
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
}
