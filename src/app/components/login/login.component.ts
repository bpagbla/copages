import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/authService/auth.service';

/**
 * Componente de login que permite a los usuarios autenticarse en la aplicación.
 * 
 * Utiliza formularios reactivos y valida que se hayan introducido usuario y contraseña antes de enviar.
 */
@Component({
  selector: 'app-login',
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  /**
   * Constructor del componente.
   * 
   * @param authService Servicio encargado de validar el login y gestionar la autenticación.
   */
  constructor(private authService: AuthService) {}

  /**
   * Formulario reactivo que contiene los campos `username` y `password`, ambos obligatorios.
   */
  loginForm = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });

  /**
   * Método que se ejecuta al enviar el formulario de login.
   * 
   * Si el formulario es válido, se extraen los valores y se llama al método de autenticación.
   */
  handleSubmit(): void {
    const username: string = this.loginForm.get('username')?.value ?? '';
    const password: string = this.loginForm.get('password')?.value ?? '';
    if (this.loginForm.valid) {
      this.authService.validarLogin(username, password);
    }
  }
}
