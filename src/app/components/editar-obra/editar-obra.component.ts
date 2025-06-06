import { Component, OnDestroy, OnInit } from '@angular/core';
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
export class EditarObraComponent implements OnInit, OnDestroy {
  obra: Obra | undefined;
  obraId: number = 0;
  capitulos: Capitulo[] = [];
  estadoGuardado: 'idle' | 'guardando' | 'guardado' = 'idle';
  private autoSaveInterval: any;

  constructor(
    private route: ActivatedRoute,
    private obrasService: ObrasService,
    private capitulosService: CapitulosService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.obraId = +params['idObra']; //el + convierte a número
      this.obtenerObra(this.obraId);
      this.obtenerCapitulos(this.obraId);
    });

    this.autoSaveInterval = setInterval(() => {
      this.guardarCambios();
    }, 10000); // cada 10 segundos
  }
  ngOnDestroy(): void {
    clearInterval(this.autoSaveInterval);
  }

  obtenerObra(id: number): void {
    this.obrasService.getObraPorId(id).subscribe({
      next: (data: Obra) => {
        this.obra = data;
        console.log(this.obra);
      },
      error: (err) => {
        if (err.status === 403) {
          this.notificationService.show({
            type: 'error',
            title: 'Acceso denegado',
            message: 'No tienes permiso para editar esta obra.',
          });
          this.router.navigate(['/home']);
        } else {
          console.error('Error al cargar la obra:', err);
          this.notificationService.show({
            type: 'error',
            title: 'Error',
            message: 'Ocurrió un error al cargar la obra.',
          });
        }
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
    if (!this.obra) return;

    const tituloValido = this.obra.TITULO.trim().length > 0;
    const descripcionValida =
      this.obra.DESCRIPCION.trim().length > 0 &&
      this.obra.DESCRIPCION.length <= 600;

    if (!tituloValido || !descripcionValida) return;

    this.estadoGuardado = 'guardando';

    this.obrasService.editarObra(this.obraId, this.obra).subscribe({
      next: () => {
        setTimeout(() => {
          this.estadoGuardado = 'guardado';

          // El estado 'guardado'  permanece visible unos segundos antes de volver a 'idle'
          setTimeout(() => (this.estadoGuardado = 'idle'), 3000);
        }, 1500); // <- spinner visible al menos 1.5s
      },
      error: () => {
        this.estadoGuardado = 'idle';
      },
    });
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
