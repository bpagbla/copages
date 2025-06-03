import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgIf } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Post } from '../../interfaces/post';
import { ObrasService } from '../../services/obrasService/obras.service';
import { NotificationService } from '../../services/notificationService/notification.service';
import { NgIcon } from '@ng-icons/core';
import { PostService } from '../../services/postService/post.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css'],
  imports: [NgIf, CommonModule, RouterModule, NgIcon],
})
export class PostComponent implements OnInit {
  @Input() post!: Post;
  @Input() showDescripcion = true;
  @Input() showAuthor = true;
  @Input() showDate = true;
  @Input() showTituloCap = true;
  @Input() showOrdenCap = true;
  @Input() index: number = 0;
  @Output() postEliminado = new EventEmitter<number>();

  guardado = false;

  constructor(
    private obrasService: ObrasService,
    private notificationService: NotificationService,
    private postService: PostService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('Post recibido:', this.post);
    if (this.post.id) {
      this.obrasService.estaGuardado(this.post.id).subscribe({
        next: (res) => {
          this.guardado = res.guardado;
        },
        error: (err) => {
          console.error('Error al comprobar si el libro está guardado:', err);
        },
      });
    }
  }

  toggleBiblioteca(): void {
    if (!this.post.id) return;

    if (this.guardado) {
      this.obrasService.eliminarDeBiblioteca(this.post.id).subscribe({
        next: () => {
          this.guardado = false;
          this.notificationService.show({
            type: 'info',
            title: 'Eliminado de la biblioteca',
            message: 'Se ha eliminado este libro de tu biblioteca',
          });
        },
        error: (err) => {
          console.error(err);
          this.notificationService.show({
            type: 'info',
            title: 'Error al eliminar libro',
            message: 'No se ha podido eliminar este libro de tu biblioteca',
          });
        },
      });
    } else {
      this.obrasService.guardarEnBiblioteca(this.post.id).subscribe({
        next: () => {
          this.guardado = true;
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

  aceptarColaboracion(solicitudId: number) {
    this.postService.aceptarColaboracion(solicitudId).subscribe({
      next: (res) => {
        this.notificationService.show({
          type: 'success',
          title: 'Colaboración aceptada',
          message: 'Ahora puedes empezar una obra conjunta.',
        });
        const libroId = res.libroId;
        this.postEliminado.emit(this.index);
        this.router.navigate(['/editar/obra', libroId]);
      },
      error: (err) => {
        console.error('Error al aceptar colaboración:', err);
        this.notificationService.show({
          type: 'error',
          title: 'Error',
          message: 'No se pudo aceptar la colaboración.',
        });
      },
    });
  }

  rechazarColaboracion(solicitudId: number) {
    this.postService.rechazarColaboracion(solicitudId).subscribe({
      next: () => {
        this.notificationService.show({
          type: 'info',
          title: 'Colaboración rechazada',
          message: 'Has rechazado la solicitud de colaboración.',
        });
        this.postEliminado.emit(this.index);
      },
      error: (err) => {
        console.error('Error al rechazar colaboración:', err);
        this.notificationService.show({
          type: 'error',
          title: 'Error',
          message: 'No se pudo rechazar la colaboración.',
        });
      },
    });
  }

  getProfilePicUrl(pfp: string): string {
  if (!pfp || pfp === 'defPfp.webp') {
    return '/assets/pfpics/defPfp.webp'; // imagen local por defecto
  }
  return `http://localhost:3000/pfpics/${pfp}`; // imagen subida por usuario
}

}
