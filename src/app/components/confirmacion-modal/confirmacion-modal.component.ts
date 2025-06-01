import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-confirmacion-modal',
  templateUrl: './confirmacion-modal.component.html',
  styleUrls: ['./confirmacion-modal.component.css'],
  imports: [CommonModule],
})
export class ConfirmacionModalComponent {
  isVisible = false;

  title = 'Confirmar acción';
  message = '¿Estás seguro?';
  confirmText = 'Sí';
  cancelText = 'Cancelar';
  onConfirm: () => void = () => {};

  show(
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText = 'Sí',
    cancelText = 'Cancelar'
  ) {
    this.title = title;
    this.message = message;
    this.onConfirm = onConfirm;
    this.confirmText = confirmText;
    this.cancelText = cancelText;
    this.isVisible = true;
  }

  close() {
    this.isVisible = false;
  }

  confirmAndClose() {
    console.log("confirmar!!!!");
    this.onConfirm();
    this.close();
  }
}
