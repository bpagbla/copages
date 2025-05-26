import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChapterService } from '../../services/chapterService/chapter.service';

@Component({
  selector: 'app-lectura',
  templateUrl: './lectura.component.html',
  styleUrl: './lectura.component.css',
})
export class LecturaComponent implements OnInit {
  chapter: any;
  author: any;
  totalCapitulos: number = 0;
  ordenActual: number = 1;
  idLibro: string = '';

  constructor(
    private route: ActivatedRoute,
    private chapterService: ChapterService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const idLibro = this.route.snapshot.paramMap.get('id');
    const orden = this.route.snapshot.paramMap.get('orden');
    if (idLibro && orden) {
      // Pide el capítulo
      this.chapterService.getChapterByLibroOrden(idLibro, orden).subscribe({
        next: (data) => {
          this.chapter = data.capitulo;
          this.author = data.autor;
        },
        error: (err) => {
          this.chapter = null;
          this.author = null;
        },
      });
      // Pide el total de capítulos
      this.chapterService.getTotalCapitulos(idLibro).subscribe({
        next: (data) => {
          this.totalCapitulos = data.total;
        },
      });
    }
  }

  volver(): void {
    this.router.navigate(['/']);
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
