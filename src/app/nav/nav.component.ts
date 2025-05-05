import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-nav',
  imports: [CommonModule, RouterModule ],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent {
  // Variable que indica si el usuario está logueado o no
  isLoggedIn: boolean = false; 

  // Método para simular un inicio de sesión
  login() {
    this.isLoggedIn = true;  // Cambia el estado a logueado
  }

  // Método para simular un cierre de sesión
  logout() {
    this.isLoggedIn = false;  // Cambia el estado a no logueado
  }
}
