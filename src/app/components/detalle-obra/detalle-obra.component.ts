import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ObrasService } from '../../services/obrasService/obras.service';
import { CommonModule, NgIf } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { NotificationService } from '../../services/notificationService/notification.service';
import { Obra } from '../../interfaces/obra';
import { CapitulosService } from '../../services/capitulosService/capitulos.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../services/authService/auth.service';

@Component({
  selector: 'app-detalle-obra',
  templateUrl: './detalle-obra.component.html',
  styleUrls: ['./detalle-obra.component.css'],
  imports: [NgIf, CommonModule, RouterModule, NgIcon, MatTooltipModule],
})
export class DetalleObraComponent implements OnInit {
  obra!: Obra;
  guardado = false;
  tieneCapitulos = false;
  primerCapituloVacio = false;
  totalCapitulos = 0;

  constructor(
    private route: ActivatedRoute,
    private obrasService: ObrasService,
    private capitulosService: CapitulosService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  get estaLoggeado(): boolean {
    return this.authService.isLoggedIn;
  }
ngOnInit(): void {
  const id = +this.route.snapshot.paramMap.get('id')!;
  this.obrasService.getObraDetalle(id).subscribe((data) => {
    this.obra = data;

    this.capitulosService.getTotalCapitulos(id).subscribe((res) => {
      this.totalCapitulos = res.total;
      this.tieneCapitulos = res.total > 0;
    });

    this.capitulosService.getCapitulo(id, 1).subscribe({
      next: (data) => {
        const cap = data.capitulo;
        const sinTitulo = !cap.TITULO || cap.TITULO.trim() === '';
        const sinTexto = !cap.TEXTO || cap.TEXTO.trim() === '';
        this.primerCapituloVacio =
          this.tieneCapitulos &&
          this.totalCapitulos === 1 &&
          sinTitulo &&
          sinTexto;
      },
      error: (err) =>
        console.error('Error al cargar primer capítulo:', err),
    });

    if (this.estaLoggeado) {
      this.obrasService.estaGuardado(id).subscribe({
        next: (res) => (this.guardado = res.guardado),
        error: (err) =>
          console.error('Error al comprobar si está guardado:', err),
      });
    }
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
