import { Component, OnInit } from '@angular/core';
import { ObrasService } from '../../services/obrasService/obras.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { Obra } from '../../interfaces/obra';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notificationService/notification.service';

/**
 * Componente de biblioteca personal del usuario.
 *
 * Muestra una lista de libros guardados, permite filtrarlos, acceder a su lectura,
 * y eliminarlos de la biblioteca con confirmación.
 */
@Component({
  selector: 'app-biblioteca',
  templateUrl: './biblioteca.component.html',
  styleUrl: './biblioteca.component.css',
  standalone: true,
  imports: [CommonModule, NgIcon, MatTooltipModule, FormsModule, RouterModule],
})
export class BibliotecaComponent implements OnInit {
  /**
   * Lista completa de libros en la biblioteca del usuario.
   */
  libros: Obra[] = [];

  /**
   * Texto usado para filtrar libros por título.
   */
  filtro: string = '';

  /**
   * Constructor del componente.
   * 
   * @param obrasService Servicio para gestionar obras y biblioteca.
   * @param router Servicio de navegación para redirigir a la lectura.
   * @param notificationService Servicio para mostrar notificaciones y confirmaciones.
   */
  constructor(
    private obrasService: ObrasService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  /**
   * Al inicializar el componente, se carga la lista de libros guardados por el usuario.
   */
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

  /**
   * Devuelve la lista de libros filtrada según el texto introducido.
   */
  get librosFiltrados(): Obra[] {
    const f = this.filtro.toLowerCase();
    return this.libros.filter((libro) =>
      libro.TITULO.toLowerCase().includes(f)
    );
  }

  /**
   * Navega al primer capítulo del libro seleccionado.
   * 
   * @param libroId ID del libro al que se desea acceder.
   */
  irALectura(libroId: number): void {
    this.router.navigate(['/libro', libroId, 'capitulo', 1]);
  }

  /**
   * Muestra una confirmación antes de eliminar un libro de la biblioteca.
   * 
   * @param libroId ID del libro a eliminar.
   */
  eliminarLibroConConfirmacion(libroId: number): void {
    this.notificationService.confirm({
      title: 'Eliminar libro',
      message: '¿Estás seguro de eliminar este libro de tu biblioteca?',
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      onConfirm: () => this.eliminar(libroId),
    });
  }

  /**
   * Elimina el libro de la biblioteca si se confirma la acción.
   * 
   * @param libroId ID del libro a eliminar.
   */
  eliminar(libroId: number): void {
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
