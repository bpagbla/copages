import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ObrasService } from '../../services/obrasService/obras.service';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-detalle-obra',
  templateUrl: './detalle-obra.component.html',
  styleUrls: ['./detalle-obra.component.css'],
  imports: [NgIf, CommonModule],
})
export class DetalleObraComponent implements OnInit {
  obra: any;

  constructor(
    private route: ActivatedRoute,
    private obrasService: ObrasService
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.obrasService.getObraDetalle(id).subscribe((data) => {
      this.obra = data;
    });
  }
}
