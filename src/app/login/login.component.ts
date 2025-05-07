import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../services/authService/auth.service';

@Component({
  selector: 'app-login',
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  constructor(private authService: AuthService) {}
  loginForm = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });

  handleSubmit() {
    const username: string = this.loginForm.get('username')?.value ?? '';
    const password: string = this.loginForm.get('password')?.value ?? '';
    if (this.loginForm.valid) {
      this.authService.validarLogin(username, password);
      
    }

    
  }
}
