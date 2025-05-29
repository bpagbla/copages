import { Component, Input, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Post } from '../../interfaces/post';
import { ObrasService } from '../../services/obrasService/obras.service';
import { NotificationService } from '../../services/notificationService/notification.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  imports: [NgIf, CommonModule, RouterModule],
})
export class PostComponent implements OnInit {
  @Input() post!: Post;
  @Input() showDescripcion = true;
  @Input() showAuthor = true;
  @Input() showDate = true;
  @Input() showTituloCap = true;
  @Input() showOrdenCap = true;

  guardado = false;

  constructor(
    private obrasService: ObrasService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
     this.obrasService.estaGuardado(this.post.id).subscribe({
    next: (res) => {
      this.guardado = res.guardado;
    },
    error: (err) => {
      console.error('Error al comprobar si el libro está guardado:', err);
    },
  });
  }

  toggleBiblioteca(): void {
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
}
