import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/authService/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Post } from '../../interfaces/post';
import { PostComponent } from '../post/post.component';
import { PostService } from '../../services/postService/post.service';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [CommonModule, RouterModule, PostComponent, NgIcon],
})
export class HomeComponent implements OnInit {
  userRole: string | null = null;
  posts: Post[] = [];
  private postService = inject(PostService);

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getUserInfo().subscribe({
      next: (res) => {
        this.userRole = res.role;
      },
      error: (err) => {
        console.error('Error al obtener la información del usuario:', err);
      },
    });

    this.cargarFeedCompleto();
  }

  actualizarFeed(): void {
    this.cargarFeedCompleto();
  }

  private cargarFeedCompleto(): void {
    // Llamada a ambos endpoints 
    const feed$ = this.postService.getFeed();
    const solicitudes$ = this.postService.getSolicitudesColaboracion();

    feed$.subscribe({
      next: (postsNormales) => {
        solicitudes$.subscribe({
          next: (solicitudes) => {
            this.posts = [...solicitudes, ...postsNormales]; // Primero solicitudes
          },
          error: (err) => {
            console.error('Error al cargar colaboraciones:', err);
            this.posts = postsNormales; // Al menos muestra el feed normal
          },
        });
      },
      error: (err) => {
        console.error('Error al cargar posts del feed:', err);
      },
    });
  }
}
