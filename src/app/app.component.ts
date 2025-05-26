import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavComponent } from './components/nav/nav.component';
import { AuthService } from './services/authService/auth.service';
import { StorageService } from './services/storageService/storage.service';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './components/toast/toast.component';


@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    NavComponent,
    SidebarComponent,
    CommonModule,
    ToastComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'copages';
  esHome: boolean = false; // ahora: ¿está logueado?

  constructor(
    public authService: AuthService,
    private router: Router,
    private storageService: StorageService
  ) {}

ngOnInit() {
  this.authService.verificarSesion();
}
}
