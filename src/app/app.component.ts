import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavComponent } from './nav/nav.component';
import { AuthService } from './services/authService/auth.service';
import { StorageService } from './services/storageService/storage.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'copages';
  constructor(
    private authService: AuthService,
    private router: Router,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    const token = this.storageService.getItem('accessToken');

    if (token) {
      this.authService.refreshToken();
      this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
        if (isLoggedIn) {
          this.router.navigate(['/home']);
        } else {
          this.router.navigate(['/login']);
        }
      });
    } else {
      this.authService.setLoggedIn(false);
    }
  }
}
