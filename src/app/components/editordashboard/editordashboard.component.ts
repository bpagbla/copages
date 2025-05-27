import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ObrasService } from '../../services/obrasService/obras.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-editordashboard',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './editordashboard.component.html',
  styleUrl: './editordashboard.component.css',
})
export class EditordashboardComponent implements OnInit {
  obras: any[] = [];
  error: string = '';
  modalError = '';

  constructor(private obrasService: ObrasService, private router: Router) {}

  ngOnInit(): void {
    // Suponiendo que tu servicio filtra las obras por el usuario logueado (por el backend o token)
    this.obrasService.getMisObras().subscribe({
      next: (data) => (this.obras = data),
      error: (err) => (this.error = 'No se pudieron cargar tus obras.'),
    });
  }

  editarObra(id: number): void {
    this.router.navigate(['/obra/editar', id]);
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
        this.ngOnInit();
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
