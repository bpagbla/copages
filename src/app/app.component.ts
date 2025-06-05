import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { NavComponent } from './components/nav/nav.component';
import { AuthService } from './services/authService/auth.service';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './components/toast/toast.component';
import { ConfirmacionModalComponent } from './components/confirmacion-modal/confirmacion-modal.component';
import { NotificationService } from './services/notificationService/notification.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,
    NavComponent,
    SidebarComponent,
    CommonModule,
    ToastComponent,
    ConfirmacionModalComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'copages';
  esHome: boolean = false; // ahora: ¿está logueado?

  constructor(
    public authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.authService.verificarSesion();
  }

  @ViewChild('confirmModal') confirmModal!: ConfirmacionModalComponent;

  ngAfterViewInit() {
    this.notificationService.registerModal(this.confirmModal);
  }
}
