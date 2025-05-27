import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ObrasService } from '../../services/obrasService/obras.service';

@Component({
  selector: 'app-editordashboard',
  imports: [RouterModule, CommonModule],
  templateUrl: './editordashboard.component.html',
  styleUrl: './editordashboard.component.css'
})
export class EditordashboardComponent {

  obras: any[] = [];
  error: string = '';

  constructor(private obrasService: ObrasService, private router: Router) {}

  ngOnInit(): void {
    // Suponiendo que tu servicio filtra las obras por el usuario logueado (por el backend o token)
    this.obrasService.getMisObras().subscribe({
      next: (data) => this.obras = data,
      error: (err) => this.error = 'No se pudieron cargar tus obras.',
    });
  }

  nuevaObra(): void {
    this.router.navigate(['/obra/nueva']);
  }

  editarObra(id: number): void {
    this.router.navigate(['/obra/editar', id]);
  }

}
