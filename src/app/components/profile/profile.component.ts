import { Component, OnInit } from '@angular/core';
import { User } from '../../interfaces/user';
import { AuthService } from '../../services/authService/auth.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, NgIcon],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  user: User | null = null;


  constructor(private authService: AuthService, private http: HttpClient) {}

  ngOnInit(): void {
    this.authService.getUserInfo().subscribe({
      next: async (res: User) => {
        this.user = res;
      },
      error: (err) => {
        console.error('Error al obtener la info del usuario:', err);
      },
    });
  }


}
