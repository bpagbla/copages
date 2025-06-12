import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../services/userService/user.service';
import { User } from '../../interfaces/user';
import { NotificationService } from '../../services/notificationService/notification.service';
import { NgIcon } from '@ng-icons/core';
import { MatTooltip } from '@angular/material/tooltip';
import { ObrasService } from '../../services/obrasService/obras.service';
import { AuthService } from '../../services/authService/auth.service';

@Component({
  selector: 'app-perfil-publico',
  templateUrl: './perfil-publico.component.html',
  styleUrls: ['./perfil-publico.component.css'],
  imports: [CommonModule, RouterModule, NgIcon, MatTooltip],
})
export class PerfilPublicoComponent implements OnInit {
irADetalle(arg0: any) {
throw new Error('Method not implemented.');
}
  guardado = false;

  nick!: string;
  usuario: User | undefined;
  obras: any[] = [];
  error: string = '';
  estaSiguiendo: boolean = false;
  currentUserId: number | null = null;
  solicitudEnviada: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private notificationService: NotificationService,
    private router: Router,
    private obrasService: ObrasService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.nick = this.route.snapshot.paramMap.get('nick') || '';
    if (this.nick) {
      this.cargarPerfil(this.nick);
    }

    // obtener usuario logueado si lo hay
    this.userService.getUserInfo().subscribe({
      next: (user) => {
        this.currentUserId = user.id;
      },
      error: () => {
        this.currentUserId = null;
      },
    });
  }

  irALectura(idObra: number) {
    this.router.navigate(['/libro', idObra, 'capitulo', 1]);
  }

  eliminarLibroConConfirmacion(idObra: number) {
    this.notificationService.confirm({
      title: '¿Eliminar obra?',
      message:
        '¿Estás seguro de que quieres eliminar esta obra de tu biblioteca?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      onConfirm: () => {
        // Llama al servicio de eliminación aquí
        console.log('Eliminar obra', idObra);
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

      this.obras = data.obras.map((obra: any) => ({
        ...obra,
        GUARDADO: false, // valor inicial
      }));

      // Solo si hay sesión iniciada 
      if (this.authService.isLoggedIn) {
        this.obras.forEach((obra) => {
          this.obrasService.estaGuardado(obra.ID).subscribe({
            next: (res) => {
              obra.GUARDADO = res.guardado;
            },
            error: (err) => {
              console.error(
                `Error al comprobar si el libro ${obra.ID} está guardado:`,
                err
              );
            },
          });
        });

        this.comprobarSiSigue(this.usuario.id);
        this.comprobarSolicitudColaboracion();
      }
    },
    error: (err) => {
      this.error = err.error?.message || 'Error al cargar el perfil';
    },
  });
}


  comprobarSolicitudColaboracion() {
    if (!this.usuario) return;
    this.userService.existeSolicitudColaboracion(this.usuario.id).subscribe({
      next: (res) => {
        this.solicitudEnviada = res.enviada;
      },
      error: (err) => {
        console.error('Error al comprobar solicitud de colaboración:', err);
      },
    });
  }

  colaborar() {
    if (!this.usuario) return;

    if (!this.currentUserId) {
      this.notificationService.show({
        type: 'info',
        title: 'No autenticado',
        message: 'Debes iniciar sesión para colaborar.',
      });
      return;
    }

    if (!this.solicitudEnviada) {
      // Enviar solicitud
      this.userService.enviarSolicitudColaboracion(this.usuario.id).subscribe({
        next: () => {
          this.solicitudEnviada = true;
          this.notificationService.show({
            type: 'success',
            title: 'Solicitud enviada',
            message: 'Has enviado una solicitud de colaboración.',
          });
        },
        error: (err) => {
          console.error('Error al enviar solicitud:', err);
          this.notificationService.show({
            type: 'error',
            title: 'Error',
            message: 'No se pudo enviar la solicitud.',
          });
        },
      });
    } else {
      // Cancelar solicitud
      this.userService
        .cancelarSolicitudColaboracion(this.usuario.id)
        .subscribe({
          next: () => {
            this.solicitudEnviada = false;
            this.notificationService.show({
              type: 'info',
              title: 'Solicitud cancelada',
              message: 'Has cancelado la solicitud de colaboración.',
            });
          },
          error: (err) => {
            console.error('Error al cancelar solicitud:', err);
            this.notificationService.show({
              type: 'error',
              title: 'Error',
              message: 'No se pudo cancelar la solicitud.',
            });
          },
        });
    }
  }

  toggleBiblioteca(obra: any): void {
      if (!this.authService.isLoggedIn) {
    this.notificationService.show({
      type: 'info',
      title: 'No autenticado',
      message: 'Debes iniciar sesión para guardar libros en tu biblioteca.',
    });
    return;
  }
    if (obra.GUARDADO) {
      this.obrasService.eliminarDeBiblioteca(obra.ID).subscribe({
        next: () => {
          obra.GUARDADO = false;
          this.notificationService.show({
            type: 'warning',
            title: 'Eliminado de la biblioteca',
            message: 'Se ha eliminado este libro de tu biblioteca',
          });
        },
        error: (err) => {
          console.error(err);
          this.notificationService.show({
            type: 'error',
            title: 'Error al eliminar libro',
            message: 'No se ha podido eliminar este libro de tu biblioteca',
          });
        },
      });
    } else {
      this.obrasService.guardarEnBiblioteca(obra.ID).subscribe({
        next: () => {
          obra.GUARDADO = true;
          this.notificationService.show({
            type: 'info',
            title: 'Guardado en la biblioteca',
            message: 'Se ha guardado este libro en tu biblioteca',
          });
        },
        error: (err) => {
          console.error(err);
          this.notificationService.show({
            type: 'error',
            title: 'Error al guardar el libro',
            message: 'No se ha podido guardar este libro en la biblioteca',
          });
        },
      });
    }
  }
  getPfpUrl(pfp: string): string {
    if (!pfp || pfp === 'defPfp.webp') {
      return '/assets/pfpics/defPfp.webp'; // imagen por defecto en frontend
    }
    return `http://localhost:3000/pfpics/${pfp}`; // imagen subida y servida por backend
  }

  get tooltipSeguir(): string {
  if (!this.authService.isLoggedIn) return 'Es necesario Iniciar Sesión';
  if (this.usuario?.id === this.currentUserId) return 'No puedes seguirte a ti mismo';
  return '';
}

get tooltipColaborar(): string {
  if (!this.authService.isLoggedIn) return 'Es necesario Iniciar Sesión';
  if (this.usuario?.id === this.currentUserId) return 'No puedes colaborar contigo mismo';
  return '';
}

}
