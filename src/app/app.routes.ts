import { Routes } from '@angular/router';

import { LandingComponent } from './components/landing/landing.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/profile/profile.component';
import { EditorComponent } from './components/editor/editor.component';
import { PerfilPublicoComponent } from './components/perfil-publico/perfil-publico.component';

import { authGuard } from './guards/auth.guard';
import { BibliotecaComponent } from './components/biblioteca/biblioteca.component';
import { LecturaComponent } from './components/lectura/lectura.component';
import { EditarObraComponent } from './components/editar-obra/editar-obra.component';
import { EditarCapituloComponent } from './components/editar-capitulo/editar-capitulo.component';
import { EditordashboardComponent } from './components/editordashboard/editordashboard.component';
import { ExploreComponent } from './components/explore/explore.component';
import { redirectIfLoggedGuard } from './guards/redirect-if-logged.guard';
import { DetalleObraComponent } from './components/detalle-obra/detalle-obra.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
    canActivate: [redirectIfLoggedGuard],
  },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] }, // perfil propio (editable)
  { path: 'profile/:nick', component: PerfilPublicoComponent }, // perfil público (cualquier usuario)
  { path: 'editor', component: EditorComponent, canActivate: [authGuard] },
  {
    path: 'biblioteca',
    component: BibliotecaComponent,
    canActivate: [authGuard],
  },
  {
    path: 'explore',
    component: ExploreComponent,
  },
  { path: 'libro/:idObra/capitulo/:orden', component: LecturaComponent },

  {
    path: 'dashboard',
    component: EditordashboardComponent,
    canActivate: [authGuard],
  },

  {
    path: 'editar/obra/:idObra',
    component: EditarObraComponent,
    canActivate: [authGuard],
  },

  {
    path: 'editar/:idObra/capitulo/:idCapitulo',
    component: EditarCapituloComponent,
    canActivate: [authGuard],
  },
  {
    path: 'obra/:id',
    component: DetalleObraComponent,
  },

  { path: '**', redirectTo: '' }, // Redirigir cualquier ruta desconocida al landing
];
