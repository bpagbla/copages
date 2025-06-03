import { Component, OnInit } from '@angular/core';
import { ObrasService } from '../../services/obrasService/obras.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { Obra } from '../../interfaces/obra';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notificationService/notification.service';

@Component({
  selector: 'app-biblioteca',
  templateUrl: './biblioteca.component.html',
  styleUrl: './biblioteca.component.css',
  standalone: true,
  imports: [CommonModule, NgIcon, MatTooltipModule, FormsModule, RouterModule],
})
export class BibliotecaComponent implements OnInit {
  libros: Obra[] = [];
  filtro: string = '';

  constructor(
    private obrasService: ObrasService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.obrasService.getBiblioteca().subscribe({
      next: (res) => {
        this.libros = res;
      },
      error: (err) => {
        console.error('Error al cargar la biblioteca:', err);
      },
    });
  }

  get librosFiltrados(): Obra[] {
    const f = this.filtro.toLowerCase();
    return this.libros.filter((libro) =>
      libro.TITULO.toLowerCase().includes(f)
    );
  }

  irALectura(libroId: number): void {
    this.router.navigate(['/libro', libroId, 'capitulo', 1]);
  }
  eliminarLibroConConfirmacion(libroId: number): void {
    console.log('ELIMINAR');
    
    this.notificationService.confirm({
      title: 'Eliminar libro',
      message: '¿Estás seguro de eliminar este libro de tu biblioteca?',
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      onConfirm: () => this.eliminar(libroId),
    });
  }

  eliminar(libroId: number): void {
    console.log("fdnj");
    this.obrasService.eliminarDeBiblioteca(libroId).subscribe({
      next: () => {
        this.libros = this.libros.filter((l) => l.ID !== libroId);
      },
      error: (err) => {
        console.error('Error al eliminar el libro:', err);
      },
    });
  }
}
