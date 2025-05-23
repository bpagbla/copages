import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../services/notificationService/notification.service';
import { Notification } from '../../interfaces/notification';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css'],
  imports:[CommonModule]
})
export class ToastComponent implements OnInit {
 notifications: Notification[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.notifications$.subscribe(notification => {
      this.notifications.push(notification);
      // Desaparece el toast tras 3 segundos
      setTimeout(() => this.removeNotification(notification), 3000);
    });
  }

  removeNotification(notification: Notification) {
    this.notifications = this.notifications.filter(n => n !== notification);
  }
}
