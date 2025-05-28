import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ObrasService } from '../../services/obrasService/obras.service';
import { CapitulosService } from '../../services/capitulosService/capitulos.service';

import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notificationService/notification.service';

@Component({
  selector: 'app-editar-obra',
  imports: [RouterModule, CommonModule],
  templateUrl: './editar-obra.component.html',
  styleUrl: './editar-obra.component.css',
  providers: [ObrasService, CapitulosService],
})
export class EditarObraComponent {
  obra: any;
  capitulos: any[] = [];
  obraId: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private obrasService: ObrasService,
    private notificationService: NotificationService,
    private capitulosService: CapitulosService
  ) {
    this.obraId = Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
  this.route.params.subscribe(params => {
    this.obraId = +params['id'];

    this.obrasService.getObraPorId(this.obraId).subscribe({
      next: (obraData) => {
        this.obra = obraData;

        this.capitulosService.getListaCapitulos(this.obraId).subscribe({
          next: (capitulosData) => {
            this.capitulos = capitulosData;
          },
          error: (err) => {
            console.error('Error al cargar capítulos:', err);
          }
        });
      },
      error: (err) => {
        if (err.status === 403) {
          this.notificationService.show({
            type: 'error',
            title: 'Acceso denegado',
            message: 'No tienes permiso para editar esta obra.'
          });
          this.router.navigate(['/dashboard']);
        } else {
          this.notificationService.show({
            type: 'error',
            title: 'Error',
            message: 'Error al cargar la obra.'
          });
          console.error(err);
        }
      }
    });
  });
}

  editarCapitulo(ordenCapitulo: number): void {
    this.router.navigate([
      '/obra/editar',
      this.obraId,
      'capitulo',
      ordenCapitulo,
    ]);
  }

  nuevoCapitulo(): void {
    this.router.navigate(['/obra/editar', this.obraId, 'capitulo', 'nuevo']);
  }
}
