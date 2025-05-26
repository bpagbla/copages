import { Component } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { AuthService } from '../../services/authService/auth.service';
import { RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [NgIcon, RouterModule, MatTooltipModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  userRole: string | null = null;
  userNick: string | null = null;
  isLoggedIn: boolean = false;
  constructor(private authService: AuthService) {}
  ngOnInit(): void {
    this.authService.getUserInfo().subscribe({
      next: (res) => {
        console.log('Usuario:', res.role);
        console.log('?????');
        this.userRole = res.role;
        this.userNick = res.nick;
      },
      error: (err) => {
        console.error('Error al obtener la información del usuario:', err);
      },
    });

    // Suscribirse al estado de autenticación
    this.authService.isLoggedIn$.subscribe((status) => {
      this.isLoggedIn = status;
    });
  }

  logout() {
    console.log('bye');
    this.authService.logout();
  }

  menuAbierto = false;

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }
}
