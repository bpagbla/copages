import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ObrasService } from '../../services/obrasService/obras.service';
import { CapitulosService } from '../../services/capitulosService/capitulos.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-editar-obra',
  imports: [RouterModule, CommonModule],
  templateUrl: './editar-obra.component.html',
  styleUrl: './editar-obra.component.css',
})
export class EditarObraComponent {
  obra: any;
  capitulos: any[] = [];
  obraId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private obrasService: ObrasService,
    private capitulosService: CapitulosService
  ) {}

  ngOnInit(): void {
    this.obraId = Number(this.route.snapshot.paramMap.get('id'));

    // Obtener datos de la obra
    this.obrasService
      .getObraPorId(this.obraId)
      .subscribe((obra) => (this.obra = obra));

    // Obtener lista de capítulos de esta obra
    this.capitulosService
      .getCapitulosPorLibro(this.obraId)
      .subscribe((caps) => (this.capitulos = caps));
  }

  editarCapitulo(idCapitulo: number): void {
    this.router.navigate(['/obra/editar', this.obraId, 'capitulo', idCapitulo]);
  }

  nuevoCapitulo(): void {
    this.router.navigate(['/obra/editar', this.obraId, 'capitulo', 'nuevo']);
  }
}
