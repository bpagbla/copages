import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavComponent } from './nav/nav.component';
import { AuthService } from './services/authService/auth.service';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'copages';
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Verificar el estado del login al cargar la página
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Si el token está en el localStorage, intentar obtener un nuevo accessToken
      this.authService.refreshToken();  // Renueva el token si es necesario
      this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
        if (isLoggedIn) {
          // Si está logueado, redirige al home
          this.router.navigate(['/home']);
        } else {
          // Si no está logueado, redirige al login
          this.router.navigate(['/login']);
        }
      });
    } else {
      this.authService.setLoggedIn(false); // Si no hay token, asegurarse de que loggedIn esté en false
    }
  }
}
