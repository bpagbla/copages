import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Notification } from '../../interfaces/notification';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
   private notificationsSubject = new Subject<Notification>();
  
  get notifications$(): Observable<Notification> {
    return this.notificationsSubject.asObservable();
  }

  show(notification: Notification) {
    this.notificationsSubject.next(notification);
  }
}
