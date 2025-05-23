import { Routes } from '@angular/router';

import { LandingComponent } from './components/landing/landing.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/profile/profile.component';
import { EditorComponent } from './components/editor/editor.component';

import { authGuard } from './guards/auth.guard'; // Ajusta la ruta según tu estructura

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'editor', component: EditorComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }, // Redirigir cualquier ruta desconocida al landing
];
