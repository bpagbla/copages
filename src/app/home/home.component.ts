import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/authService/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [CommonModule, RouterModule],
})
export class HomeComponent implements OnInit {
  userRole: string | null = null;
  constructor(private authService: AuthService) {}
  ngOnInit(): void {
    this.authService.getUserInfo().subscribe({
      next: (res) => {
        console.log('Usuario:', res);
        this.userRole = res.role;
      },
      error: (err) => {
        console.error('Error al obtener la información del usuario:', err);
      }
    });
  }
}
