import { Component } from '@angular/core';
import { ObrasService } from '../../services/obrasService/obras.service';
import { Obra } from '../../interfaces/obra';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/authService/auth.service';

@Component({
  selector: 'app-explore',
  imports: [CommonModule, RouterModule],
  templateUrl: './explore.component.html',
  styleUrl: './explore.component.css',
})
export class ExploreComponent {
  obrasRecientes: Obra[] = [];

  constructor(private obrasService: ObrasService,  public authService: AuthService) {}

  ngOnInit(): void {
    this.obrasService.getObrasRecientes().subscribe({
      next: (obras) => (this.obrasRecientes = obras),
      error: (err) => console.error('Error al obtener obras recientes:', err),
    });
  }
}
