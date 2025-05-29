import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Post } from '../../interfaces/post';
import { ObrasService } from '../../services/obrasService/obras.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  imports: [NgIf, CommonModule, RouterModule],
})
export class PostComponent {
  @Input() post!: Post;
  @Input() showDescripcion = true;
  @Input() showAuthor = true;
  @Input() showDate = true;
  @Input() showTituloCap = true;
  @Input() showOrdenCap = true;

  guardado = false;

  constructor(private obrasService: ObrasService) {}

  addToLibrary(): void {
    this.obrasService.guardarEnBiblioteca(this.post.id).subscribe({
      next: () => {
        this.guardado = true;
        alert('Libro guardado en tu biblioteca');
      },
      error: (err) => {
        console.error(err);
        alert('Error al guardar el libro');
      },
    });
  }
}
