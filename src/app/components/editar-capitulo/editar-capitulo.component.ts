import { Component } from '@angular/core';
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
    ORDEN: 0, //el numero que le ponga el usuario
  };

  libroId: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private capitulosService: CapitulosService
  ) {
    // Recupera el ID del libro de la ruta
    this.libroId = Number(this.route.snapshot.paramMap.get('id'));
    // Si editar capítulo, también podrías obtener el id del capítulo y cargarlo aquí
  }
ordenesUsados: number[] = [];

ngOnInit(): void {
  this.capitulosService.getTotalCapitulos(this.libroId).subscribe((caps) => {
    this.ordenesUsados = caps.map((c: Capitulo) => c.ORDEN);
    // Sugerir el siguiente número disponible 
    let siguiente = 1;
    while (this.ordenesUsados.includes(siguiente)) {
      siguiente++;
    }
    this.capitulo.ORDEN = siguiente;
  });
}


  guardarCapitulo() {
    // llamada al servicio para guardar el capítulo
    this.capitulosService.crearCapitulo(this.libroId, this.capitulo).subscribe({
      next: () => {
        // Redirecciona
        this.router.navigate(['/obra/editar', this.libroId]);
      },
      error: () => {
        // Maneja errores
        alert('Error al guardar el capítulo');
      },
    });
  }
}
