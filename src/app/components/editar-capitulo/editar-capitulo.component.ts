/* import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CapitulosService } from '../../services/capitulosService/capitulos.service';
import { Capitulo } from '../../interfaces/capitulo';
import { FormsModule } from '@angular/forms';
import { EditorComponent } from '../editor/editor.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-editar-capitulo',
  imports: [RouterModule, FormsModule, EditorComponent, CommonModule],
  templateUrl: './editar-capitulo.component.html',
  styleUrl: './editar-capitulo.component.css',
})
export class EditarCapituloComponent implements OnInit {
  obraId!: number;
  capituloId?: number;
  capitulo: Capitulo = {
    ORDEN: 1,
    TITULO: '',
    TEXTO: '',
  };
  error = '';
  modoEdicion = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private capitulosService: CapitulosService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.obraId = +params['id'];
      this.capituloId = params['idCapitulo']
        ? +params['idCapitulo']
        : undefined;

      if (this.capituloId) {
        this.modoEdicion = true;
        this.capitulosService.getCapituloPorId(this.capituloId).subscribe({
          next: (cap) => {
            this.capitulo = cap;
          },
          error: () => {
            this.error = 'No se pudo cargar el capítulo.';
          },
        });
      }
    });
  }

  guardarCapitulo(): void {
    if (this.modoEdicion && this.capituloId) {
      // UPDATE
      this.capitulosService
        .editarCapitulo(this.capituloId, this.capitulo)
        .subscribe({
          next: () => this.router.navigate(['/obra/editar', this.obraId]),
          error: () => (this.error = 'Error al actualizar el capítulo.'),
        });
    } else {
      // CREATE
      this.capitulosService
        .crearCapitulo(this.obraId, this.capitulo)
        .subscribe({
          next: () => this.router.navigate(['/obra/editar', this.obraId]),
          error: () => (this.error = 'Error al crear el capítulo.'),
        });
    }
  }
}
 */