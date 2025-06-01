import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Notification } from '../../interfaces/notification';
import { ConfirmacionModalComponent } from '../../components/confirmacion-modal/confirmacion-modal.component';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationsSubject = new Subject<Notification>();
  private confirmModal?: ConfirmacionModalComponent;

  get notifications$(): Observable<Notification> {
    return this.notificationsSubject.asObservable();
  }

  show(notification: Notification) {
    this.notificationsSubject.next(notification);
  }
  private modalComponent?: ConfirmacionModalComponent;

  registerModal(modal: ConfirmacionModalComponent) {
    this.modalComponent = modal;
  }

  confirm(config: {
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
  }) {
    console.log("llega o no")
    this.modalComponent?.show(
      config.title || 'Confirmar acción',
      config.message || '¿Estás seguro?',
      config.onConfirm,
      config.confirmText,
      config.cancelText
    );
  }
}
