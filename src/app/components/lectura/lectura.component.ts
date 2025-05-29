import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CapitulosService } from '../../services/capitulosService/capitulos.service';
import { CommonModule } from '@angular/common';
import { Capitulo } from '../../interfaces/capitulo';

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

  constructor(
    private route: ActivatedRoute,
    private chapterService: CapitulosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.idObra = +params['idObra'];
      this.orden = +params['orden'];

      this.cargarCapitulo(this.idObra, this.orden);
      this.obtenerTotalCapitulos(this.idObra);
    });
  }

  cargarCapitulo(idObra: number, orden: number): void {
    this.chapterService.getCapitulo(this.idObra, this.orden).subscribe({
      next: (data) => {
        const c = data.capitulo;
        this.capitulo = {
          ID: c.id,
          ORDEN: c.orden,
          TITULO: c.titulo,
          TEXTO: c.texto,
        };
      },
    });
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
