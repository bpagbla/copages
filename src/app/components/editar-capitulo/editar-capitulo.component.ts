import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ObrasService } from '../../services/obrasService/obras.service';
import { CapitulosService } from '../../services/capitulosService/capitulos.service';

@Component({
  selector: 'app-editar-capitulo',
  imports: [RouterModule],
  templateUrl: './editar-capitulo.component.html',
  styleUrl: './editar-capitulo.component.css'
})
export class EditarCapituloComponent {

}
