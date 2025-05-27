import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CapitulosService } from '../../services/capitulosService/capitulos.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lectura',
  templateUrl: './lectura.component.html',
  styleUrl: './lectura.component.css',
  imports:[CommonModule]
})
export class LecturaComponent implements OnInit {
  chapter: any;
  author: any;
  totalCapitulos: number = 0;
  ordenActual: number = 1;
  idLibro: number = 0;

  constructor(
    private route: ActivatedRoute,
    private chapterService: CapitulosService,
    private router: Router
  ) {}

 ngOnInit(): void {
  this.route.params.subscribe(params => {
    this.idLibro = params['id'];
    this.ordenActual = Number(params['orden']);

    this.chapterService.getChapterByLibroOrden(this.idLibro, this.ordenActual).subscribe({
      next: data => {
        this.chapter = data.capitulo;
        this.author = data.autor;
      },
      error: err => {
        this.chapter = null;
        this.author = null;
      }
    });

    this.chapterService.getTotalCapitulos(this.idLibro).subscribe({
      next: data => {
        this.totalCapitulos = data.total;
      }
    });
  });
}


  volver(): void {
    this.router.navigate(['/home']);
  }

  irAnterior() {
    if (this.ordenActual > 1) {
      this.router.navigate([
        `/libro/${this.idLibro}/capitulo/${this.ordenActual - 1}`,
      ]);
    }
  }

  irSiguiente() {
    if (this.ordenActual < this.totalCapitulos) {
      this.router.navigate([
        `/libro/${this.idLibro}/capitulo/${this.ordenActual + 1}`,
      ]);
    }
  }
}
