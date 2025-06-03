import { Component, OnInit } from '@angular/core';
import { User } from '../../interfaces/user';
import { AuthService } from '../../services/authService/auth.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgIcon } from '@ng-icons/core';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notificationService/notification.service';
import { UserService } from '../../services/userService/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, NgIcon, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  nickInicial: string = '';
  selectedFile: File | null = null;
  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private notificationService: NotificationService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.getUserInfo().subscribe({
      next: (res: User) => {
        this.user = res;
        this.nickInicial = res.nick;
      },
      error: (err) => {
        console.error('Error al obtener la info del usuario:', err);
      },
    });
  }
  getPfpUrl(pfp: string): string {
    if (!pfp || pfp === 'defPfp.webp') {
      return 'assets/pfpics/defPfp.webp';
    }
    return `http://localhost:3000/pfpics/${pfp}`;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }
  guardarCambiosConfirmacion() {
    if (!this.user) return;

    const nuevoNick = this.user.nick;

    if (nuevoNick !== this.nickInicial) {
      // Verifica si el nuevo nick ya está en uso
      this.authService.verificarUsuarioExiste(nuevoNick).subscribe({
        next: (res) => {
          if (res.existe) {
            this.notificationService.show({
              type: 'error',
              title: 'Nick en uso',
              message: 'Ese nombre de usuario ya está registrado. Elige otro.',
            });
            return;
          }

          // Confirmación antes de proceder
          this.notificationService.confirm({
            title: 'Cambio de nombre de usuario',
            message:
              'Vas a cambiar tu nombre de usuario. Será necesario volver a iniciar sesión.',
            confirmText: 'Confirmar',
            cancelText: 'Cancelar',
            onConfirm: () => this.actualizar(true),
          });
        },
        error: (err) => console.error('Error al verificar nick:', err),
      });
    } else {
      this.actualizar(false);
    }
  }

  actualizar(cambioNick: boolean) {
    if (!this.user) return;

    const formData = new FormData();
    formData.append('nombre', this.user.nombre);
    formData.append('apellidos', this.user.apellidos);
    formData.append('nick', this.user.nick);

    if (this.selectedFile) {
      formData.append('pfp', this.selectedFile);
    }

    this.userService
      .actualizarUsuarioFormData(this.user.id, formData)
      .subscribe({
        next: (res) => {
          if (cambioNick && res.accessToken) {
            this.authService.actualizarAccessToken(res.accessToken);
          }

          this.notificationService.show({
            type: 'success',
            title: 'Perfil actualizado',
            message: res.message,
          });

          this.nickInicial = this.user!.nick;

          // Actualizar visualización de imagen nueva si se subió
          if (this.selectedFile) {
            this.user!.pfp = `${this.user!.nick}${this.getFileExtension(
              this.selectedFile.name
            )}`;
          }
        },
        error: (err) => {
          console.error('Error al actualizar el usuario:', err);
          this.notificationService.show({
            type: 'error',
            title: 'Error',
            message: 'Hubo un problema al actualizar el perfil.',
          });
        },
      });
  }
  getFileExtension(filename: string): string {
    return '.' + filename.split('.').pop();
  }
}
