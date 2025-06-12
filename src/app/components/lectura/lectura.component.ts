import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CapitulosService } from '../../services/capitulosService/capitulos.service';
import { CommonModule } from '@angular/common';
import { Capitulo } from '../../interfaces/capitulo';
import { AuthService } from '../../services/authService/auth.service';
import { ObrasService } from '../../services/obrasService/obras.service';

@Component({
  selector: 'app-lectura',
  templateUrl: './lectura.component.html',
  styleUrl: './lectura.component.css',
  imports: [CommonModule],
})
export class LecturaComponent implements OnInit {
  capitulo: Capitulo | undefined;
  idObra: number = 0;
  orden: number = 1;
  totalCapitulos: number = 0;
  guardado: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private chapterService: CapitulosService,
    private router: Router,
    private authService: AuthService,
    private obrasService: ObrasService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.idObra = +params['idObra'];
      this.orden = +params['orden'];

      this.cargarCapitulo(this.idObra, this.orden);
      this.obtenerTotalCapitulos(this.idObra);
    });

    if (this.estaLoggeado) {
      this.comprobarGuardado();
    }
  }

  comprobarGuardado() {
    this.obrasService.estaGuardado(this.idObra).subscribe({
      next: (res) => (this.guardado = res.guardado),
      error: (err) => console.error('Error comprobando guardado', err),
    });
  }
  guardarLibro() {
    if (!this.guardado) {
      this.obrasService.guardarEnBiblioteca(this.idObra).subscribe({
        next: () => {
          this.guardado = true;
          console.log('Libro guardado correctamente');
        },
        error: (err) => console.error('Error al guardar libro', err),
      });
    }
  }

  get estaLoggeado(): boolean {
    return this.authService.isLoggedIn;
  }

  cargarCapitulo(idObra: number, orden: number): void {
    this.chapterService.getCapitulo(this.idObra, this.orden).subscribe({
      next: (data) => {
        const c = data.capitulo;
        this.capitulo = {
          ID: c.ID,
          ORDEN: c.ORDEN,
          TITULO: c.TITULO,
          TEXTO: c.TEXTO,
        };
      },
    });
  }

  get textoCapituloLimpio(): string {
  return this.capitulo?.TEXTO?.replace(/&nbsp;/g, ' ') || '';
}


  toggleBiblioteca() {
    if (!this.estaLoggeado) return;

    if (this.guardado) {
      this.obrasService.eliminarDeBiblioteca(this.idObra).subscribe({
        next: () => {
          this.guardado = false;
          console.log('Libro eliminado de la biblioteca');
        },
        error: (err) => console.error('Error al eliminar libro', err),
      });
    } else {
      this.obrasService.guardarEnBiblioteca(this.idObra).subscribe({
        next: () => {
          this.guardado = true;
          console.log('Libro guardado en la biblioteca');
        },
        error: (err) => console.error('Error al guardar libro', err),
      });
    }
  }

  obtenerTotalCapitulos(idObra: number): void {
    this.chapterService.getTotalCapitulos(idObra).subscribe({
      next: (data) => {
        this.totalCapitulos = data.total;
      },
      error: (err) => {
        console.error('Error al obtener el total de capítulos:', err);
      },
    });
  }

  irAnterior(): void {
    if (this.orden > 1) {
      this.router.navigate(['/libro', this.idObra, 'capitulo', this.orden - 1]);
    }
  }

  irSiguiente(): void {
    if (this.orden < this.totalCapitulos) {
      this.router.navigate(['/libro', this.idObra, 'capitulo', this.orden + 1]);
    }
  }

  home() {
    this.router.navigate(['/home']);
  }
}
