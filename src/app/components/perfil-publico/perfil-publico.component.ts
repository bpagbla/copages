import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-perfil-publico',
  templateUrl: './perfil-publico.component.html',
  styleUrls: ['./perfil-publico.component.css'],
  imports: [CommonModule],
})
export class PerfilPublicoComponent implements OnInit {
  nick!: string;
  usuario: any;
  obras: any[] = [];
  error: string = '';

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.nick = params.get('nick') || '';
      if (this.nick) {
        this.cargarPerfil(this.nick);
      }
    });
  }

  cargarPerfil(nick: string) {
    this.http.get(`http://localhost:3000/profile/${nick}`).subscribe({
      next: (data: any) => {
        this.usuario = {
          nick: data.nick,
          nombre: data.nombre,
          apellidos: data.apellidos,
          pfp: data.pfp,
        };
        this.obras = data.obras;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al cargar el perfil';
      },
    });
  }
}
