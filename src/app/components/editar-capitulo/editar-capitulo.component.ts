import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CapitulosService } from '../../services/capitulosService/capitulos.service';
import { Capitulo } from '../../interfaces/capitulo';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EditorComponent } from '../editor/editor.component';

@Component({
  selector: 'app-editar-capitulo',
  imports: [RouterModule, FormsModule, CommonModule, EditorComponent],
  templateUrl: './editar-capitulo.component.html',
  styleUrl: './editar-capitulo.component.css',
})
export class EditarCapituloComponent implements OnInit {
guardar() {
throw new Error('Method not implemented.');
}
  capitulo: Capitulo | undefined;

  constructor(
    private capitulosService: CapitulosService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const capituloId = +this.route.snapshot.params['idCapitulo'];
    this.capitulosService.getCapituloPorId(capituloId).subscribe({
      next: (cap) => this.capitulo = cap,
      error: (err) => console.error('Error al cargar capítulo:', err)
    });
  }
}
