import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../services/authService/auth.service';
import { NgIf } from '@angular/common';
import { CommonModule } from '@angular/common';

import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-register',
  imports: [RouterModule, ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.registerForm
      .get('username')
      ?.valueChanges.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((value) => {
          if (value && value.length > 2) {
            return this.authService.verificarUsuarioExiste(value);
          }
          return of(null); // no hace petición si no cumple
        })
      )
      .subscribe((res) => {
        const control = this.registerForm.get('username');

        if (!control) return;

        if (res?.existe) {
          control.setErrors({ usuarioExistente: true });
        } else {
          const errors = control.errors;
          if (errors) {
            delete errors['usuarioExistente'];
            if (Object.keys(errors).length === 0) {
              control.setErrors(null);
            } else {
              control.setErrors(errors);
            }
          }
        }
      });
  }

  verificarEmail() {
    const control = this.registerForm.get('email');
    const value = control?.value;
    if (value && value.length > 2) {
      this.authService.verificarEmailExiste(value).subscribe((res) => {
        if (res?.existe) {
          control?.setErrors({ emailExistente: true });
        } else {
          const errors = control?.errors;
          if (errors) {
            delete errors['emailExistente'];
            if (Object.keys(errors).length === 0) {
              control?.setErrors(null);
            } else {
              control?.setErrors(errors);
            }
          }
        }
      });
    }
  }

  registerForm = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    surname: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  handleSubmit() {
    const username: string = this.registerForm.get('username')?.value ?? '';
    const password: string = this.registerForm.get('password')?.value ?? '';
    const name: string = this.registerForm.get('name')?.value ?? '';
    const surname: string = this.registerForm.get('surname')?.value ?? '';
    const email: string = this.registerForm.get('email')?.value ?? '';

    console.log('submit');
    if (this.registerForm.valid) {
      this.authService.registro(username, password, name, surname, email);
    }
  }
}
