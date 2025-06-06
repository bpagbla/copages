import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CapitulosService } from '../../services/capitulosService/capitulos.service';
import { Capitulo } from '../../interfaces/capitulo';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EditorComponent } from '../editor/editor.component';
import { NotificationService } from '../../services/notificationService/notification.service';

@Component({
  selector: 'app-editar-capitulo',
  imports: [RouterModule, FormsModule, CommonModule, EditorComponent],
  templateUrl: './editar-capitulo.component.html',
  styleUrl: './editar-capitulo.component.css',
})
export class EditarCapituloComponent implements OnInit {
  capitulo: Capitulo | undefined;
  idObra!: number;

  constructor(
    private capitulosService: CapitulosService,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.idObra = +this.route.snapshot.params['idObra'];
    const capituloId = +this.route.snapshot.params['idCapitulo'];
    this.capitulosService.getCapituloPorId(capituloId).subscribe({
      next: (cap) => (this.capitulo = cap),
      error: (err) => console.error('Error al cargar capítulo:', err),
    });
    
  }

  guardar(): void {
    if (!this.capitulo) return;

    this.capitulosService.actualizarCapitulo(this.capitulo).subscribe({
      next: () => {
        this.notificationService.show({
          type: 'success',
          message: 'Capitulo guardada',
          title: 'Se han guardado los cambios.',
        });
        //  redirigir:
        this.router.navigate(['/editar/obra', this.idObra]);
      },
      error: (err) => {
        console.error('Error al guardar capítulo:', err);
        alert('Error al guardar capítulo');
      },
    });
  }
}
