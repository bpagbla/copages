import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../services/userService/user.service';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-perfil-publico',
  templateUrl: './perfil-publico.component.html',
  styleUrls: ['./perfil-publico.component.css'],
  imports: [CommonModule, RouterModule],
})
export class PerfilPublicoComponent implements OnInit {
  nick!: string;
  usuario: User | undefined;
  obras: any[] = [];
  error: string = '';
  estaSiguiendo: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.nick = params.get('nick') || '';
      if (this.nick) {
        this.cargarPerfil(this.nick);
      }
    });
  }

  comprobarSiSigue(seguidoId: number) {
    console.log('comprobando');
    this.userService.comprobarSeguimiento(seguidoId).subscribe({
      next: (res) => (this.estaSiguiendo = res.sigue),
      error: (err) => console.error('Error al comprobar seguimiento:', err),
    });
  }

  seguir() {
    if (!this.usuario) return;

    this.userService.toggleSeguimiento(this.usuario.id).subscribe({
      next: (res) => (this.estaSiguiendo = res.sigue),
      error: (err) => console.error('Error al cambiar seguimiento:', err),
    });
  }

  cargarPerfil(nick: string) {
    this.userService.getPerfil(nick).subscribe({
      next: (data: any) => {
        this.usuario = {
          id: data.id,
          nick: data.nick,
          nombre: data.nombre,
          apellidos: data.apellidos,
          pfp: data.pfp,
          role: data.role,
        };
        this.obras = data.obras;

        this.comprobarSiSigue(this.usuario.id);
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al cargar el perfil';
      },
    });
  }
}
