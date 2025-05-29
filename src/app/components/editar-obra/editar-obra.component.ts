import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ObrasService } from '../../services/obrasService/obras.service';
import { CapitulosService } from '../../services/capitulosService/capitulos.service';

import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notificationService/notification.service';
import { Capitulo } from '../../interfaces/capitulo';
import { Obra } from '../../interfaces/obra';
import { FormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-editar-obra',
  imports: [RouterModule, CommonModule, FormsModule, NgIcon],
  templateUrl: './editar-obra.component.html',
  styleUrl: './editar-obra.component.css',
  providers: [ObrasService, CapitulosService],
})
export class EditarObraComponent {
  obra: Obra | undefined;
  obraId: number = 0;
  capitulos: Capitulo[] = [];

  constructor(
    private route: ActivatedRoute,
    private obrasService: ObrasService,
    private capitulosService: CapitulosService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.obraId = +params['idObra']; // el + convierte a número
      this.obtenerObra(this.obraId);
      this.obtenerCapitulos(this.obraId);
    });
  }

  obtenerObra(id: number): void {
    this.obrasService.getObraPorId(id).subscribe({
      next: (data: Obra) => {
        this.obra = data;
        console.log(this.obra);
      },
      error: (err) => {
        console.log('no');
        console.error('Error al cargar la obra:', err);
      },
    });
  }

  obtenerCapitulos(id: number): void {
    this.capitulosService.getListaCapitulos(id).subscribe({
      next: (data: Capitulo[]) => {
        this.capitulos = data;
      },
      error: (err) => {
        console.error('Error al cargar los capítulos:', err);
      },
    });
  }

  //guardar cambios al editar la obra
  guardarCambios() {
    if (this.obra) {
      this.obrasService.editarObra(this.obraId, this.obra).subscribe({
        next: () => {
          console.log('Obra actualizada');
          // mostrar notificación
          this.notificationService.show({
            type: 'success',
            message: 'Obra guardada',
            title: 'Se han guardado los cambios.',
          });
        },
        error: (err) => {
          console.error('Error al guardar la obra:', err);
        },
      });
    }
  }

  //editar capitulo
  editarCapitulo(id: number): void {
    this.router.navigate(['/editar', this.obraId, 'capitulo', id]);
  }

  //borrar capitulo
  borrarCapitulo(id: number): void {
    this.capitulosService.eliminarCapitulo(id).subscribe({
      next: () => {
        this.capitulos = this.capitulos.filter((c) => c.ID !== id); // actualiza la vista
      },
      error: (err) => {
        console.error('Error al borrar el capítulo:', err);
      },
    });
  }

  //crear nuevo capitulo
  nuevoCap(): void {
    const maxOrden =
      this.capitulos.length > 0
        ? Math.max(...this.capitulos.map((c) => c.ORDEN))
        : 0;

    const ordenNuevo = maxOrden + 1;

    this.capitulosService
      .crearCapitulo(this.obraId, {
        ID: 0, // se asigna en backend
        TITULO: '',
        TEXTO: '',
        ORDEN: ordenNuevo,
      })
      .subscribe({
        next: (nuevoCap) => {
          this.router.navigate([
            '/editar',
            this.obraId,
            'capitulo',
            nuevoCap.ID,
          ]); // redirige al nuevo capítulo
        },
        error: (err) => {
          console.error('Error al crear capítulo:', err);
        },
      });
  }
}
