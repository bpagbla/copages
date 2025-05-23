import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/authService/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Post } from '../../interfaces/post';
import { PostComponent } from '../post/post.component';
import { PostService } from '../../services/postService/post.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [CommonModule, RouterModule, PostComponent],
})
export class HomeComponent implements OnInit {
  userRole: string | null = null;
  posts: Post[] = [];
  private postService = inject(PostService);

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getUserInfo().subscribe({
      next: (res) => {
        console.log('Usuario:', res);
        this.userRole = res.role;
      },
      error: (err) => {
        console.error('Error al obtener la información del usuario:', err);
      },
    });

    this.postService.getFeed().subscribe({
      next: (res) => {
        this.posts = res;
        console.log('Posts cargados:', res);
      },
      error: (err) => {
        console.error('Error al cargar posts del feed:', err);
      },
    });
  }
}
