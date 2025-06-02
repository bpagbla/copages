import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ObrasService } from '../../services/obrasService/obras.service';
import { FormsModule } from '@angular/forms';
import { Obra } from '../../interfaces/obra';
import { NgIcon } from '@ng-icons/core';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-editordashboard',
  imports: [RouterModule, CommonModule, FormsModule, NgIcon, MatTooltipModule],
  templateUrl: './editordashboard.component.html',
  styleUrl: './editordashboard.component.css',
})
export class EditordashboardComponent implements OnInit {
  obras: Obra[] = [];
  error: string = '';
  modalError = '';

  constructor(private obrasService: ObrasService, private router: Router) {}

  ngOnInit(): void {
    this.obrasService.getMisObras().subscribe({
      next: (data: Obra[]) => {
        this.obras = data;
        console.log(data);
      },
      error: (err) => {
        this.error = 'No se pudieron cargar tus obras.';
        console.error(err);
      },
    });
  }

  editarObra(id: number): void {
    this.router.navigate(['/editar/obra', id]);
  }

  eliminarObra(id: number): void {
    const confirmacion = confirm(
      '¿Estás seguro de que quieres eliminar esta obra?'
    );
    if (!confirmacion) return;

    this.obrasService.eliminarObra(id).subscribe({
      next: () => {
        // Actualiza la lista local quitando la obra eliminada
        this.obras = this.obras.filter((obra) => obra.ID !== id);
      },
      error: (err) => {
        console.error('Error al eliminar la obra:', err);
        this.error = 'No se pudo eliminar la obra.';
      },
    });
  }

  showModal = false;
  nuevaObra = { TITULO: '', DESCRIPCION: '' };

  crearObra() {
    if (!this.nuevaObra.TITULO || !this.nuevaObra.DESCRIPCION) {
      this.modalError = 'Completa todos los campos';
      return;
    }

    this.modalError = '';

    this.obrasService.crearObra(this.nuevaObra).subscribe({
      next: (data) => {
        this.showModal = false;
        this.nuevaObra = { TITULO: '', DESCRIPCION: '' };

        const nuevaObraId = data?.id; // Captura el ID que devuelve el backend
        if (nuevaObraId) {
          this.router.navigate(['/editar/obra', nuevaObraId]);
        } else {
          this.modalError = 'Obra creada pero no se pudo obtener el ID.';
        }
      },
      error: () => {
        this.modalError = 'No se pudo crear la obra.';
      },
    });
  }

  abrirModal() {
    this.showModal = true;
    this.nuevaObra = { TITULO: '', DESCRIPCION: '' };
    this.modalError = '';
  }

  cerrarModal() {
    this.showModal = false;
    this.nuevaObra = { TITULO: '', DESCRIPCION: '' };
    this.modalError = '';
  }
}
