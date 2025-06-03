import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ObrasService } from '../../services/obrasService/obras.service';
import { CommonModule, NgIf } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { NotificationService } from '../../services/notificationService/notification.service';
import { Obra } from '../../interfaces/obra';

@Component({
  selector: 'app-detalle-obra',
  templateUrl: './detalle-obra.component.html',
  styleUrls: ['./detalle-obra.component.css'],
  imports: [NgIf, CommonModule, RouterModule, NgIcon],
})
export class DetalleObraComponent implements OnInit {
   obra!: Obra;
  guardado = false;

  constructor(
    private route: ActivatedRoute,
    private obrasService: ObrasService, private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.obrasService.getObraDetalle(id).subscribe((data) => {
      this.obra = data;
    });
  }
  toggleBiblioteca(): void {
    if (!this.obra.ID) return;

    if (this.guardado) {
      this.obrasService.eliminarDeBiblioteca(this.obra.ID).subscribe({
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
      this.obrasService.guardarEnBiblioteca(this.obra.ID).subscribe({
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
