import { Component, OnInit } from '@angular/core';
import { ObrasService } from '../../services/obrasService/obras.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { Obra } from '../../interfaces/obra';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-biblioteca',
  templateUrl: './biblioteca.component.html',
  styleUrl: './biblioteca.component.css',
  imports: [CommonModule, NgIcon, MatTooltipModule],
})
export class BibliotecaComponent implements OnInit {
 libros: Obra[] = [];

  constructor(private obrasService: ObrasService, private router: Router) {}

  ngOnInit(): void {
    this.obrasService.getBiblioteca().subscribe({
      next: (res) => {
        this.libros = res;
      },
      error: (err) => {
        console.error('Error al cargar la biblioteca:', err);
      },
    });
  }

  irALectura(libroId: number) {
    this.router.navigate(['/libro', libroId, 'capitulo', 1]); // por defecto al primer capítulo
  }

  eliminar(libroId: number): void {
    this.obrasService.eliminarDeBiblioteca(libroId).subscribe({
      next: () => {
        this.libros = this.libros.filter((l) => l.ID !== libroId);
      },
      error: (err) => {
        console.error('Error al eliminar el libro:', err);
      },
    });
  }
}
