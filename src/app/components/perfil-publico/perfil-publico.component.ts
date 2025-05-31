import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../services/userService/user.service';
import { User } from '../../interfaces/user';
import { NotificationService } from '../../services/notificationService/notification.service';

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
  currentUserId: number | null = null;


  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

ngOnInit() {
  this.userService.getUserInfo().subscribe({
    next: (user) => {
      this.currentUserId = user.id;
      this.nick = this.route.snapshot.paramMap.get('nick') || '';
      if (this.nick) {
        this.cargarPerfil(this.nick);
      }
    },
    error: () => {
      this.error = 'No se pudo obtener el usuario actual';
    },
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
    next: (res) => {
      this.estaSiguiendo = res.sigue;

      const message = res.sigue
        ? `Ahora sigues a ${this.usuario?.nick}`
        : `Has dejado de seguir a ${this.usuario?.nick}`;

      this.notificationService.show({
        type: 'success',
        title: 'Seguimiento actualizado',
        message,
      });
    },
    error: (err) => {
      console.error('Error al cambiar seguimiento:', err);
      this.notificationService.show({
        type: 'error',
        title: 'Error',
        message: 'No se pudo actualizar el seguimiento',
      });
    },
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
