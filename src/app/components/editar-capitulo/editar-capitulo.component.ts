import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CapitulosService } from '../../services/capitulosService/capitulos.service';
import { EditorComponent } from '../editor/editor.component';
import { FormsModule } from '@angular/forms';
import { Capitulo } from '../../interfaces/capitulo';

@Component({
  selector: 'app-editar-capitulo',
  standalone: true,
  imports: [RouterModule, EditorComponent, FormsModule],
  templateUrl: './editar-capitulo.component.html',
  styleUrl: './editar-capitulo.component.css',
})
export class EditarCapituloComponent {
  capitulo = {
    TITULO: '',
    TEXTO: '',
    ORDEN: 1,
  };

  libroId: number;
  capituloOrden: number;
  ordenesUsados: number[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private capitulosService: CapitulosService,
    private cd: ChangeDetectorRef
  ) {
    this.libroId = Number(this.route.snapshot.paramMap.get('id'));
    this.capituloOrden = Number(this.route.snapshot.paramMap.get('orden'));
  }


  ngOnInit(): void {
    this.capitulosService
      .getCapitulo(this.libroId, this.capituloOrden)
      .subscribe((data) => {
        setTimeout(() => {
         this.capitulo.TEXTO = data.capitulo.texto;
         this.cd.detectChanges();
        });
        this.capitulo.ORDEN = data.capitulo.orden;
        this.capitulo.TITULO = data.capitulo.titulo;
      });

    this.capitulosService
      .getCapitulosPorLibro(this.libroId)
      .subscribe((caps) => {
        this.ordenesUsados = caps.map((c: Capitulo) => c.ORDEN);

        // Sugerir el siguiente número disponible
        let siguiente = 1;
        while (this.ordenesUsados.includes(siguiente)) {
          siguiente++;
        }
        this.capitulo.ORDEN = siguiente;

        // Aquí forzamos la actualización del binding para evitar ExpressionChangedAfterItHasBeenCheckedError
        this.cd.detectChanges();
      });
  }

  guardarCapitulo() {
    this.capitulosService.crearCapitulo(this.libroId, this.capitulo).subscribe({
      next: () => {
        this.router.navigate(['/obra/editar', this.libroId]);
      },
      error: (err) => {
        console.log('this.capitulo:', this.capitulo);
        console.error('Error al guardar el capítulo:', err);
        alert(
          'Error al guardar el capítulo: ' +
            (err.error?.mensaje || err.message || '')
        );
      },
    });
  }
}
