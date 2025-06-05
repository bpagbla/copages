import { LandingComponent } from './components/landing/landing.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/profile/profile.component';
import { EditorComponent } from './components/editor/editor.component';
import { PerfilPublicoComponent } from './components/perfil-publico/perfil-publico.component';

import { AuthGuard } from './guards/auth.guard';
import { BibliotecaComponent } from './components/biblioteca/biblioteca.component';
import { LecturaComponent } from './components/lectura/lectura.component';
import { EditarObraComponent } from './components/editar-obra/editar-obra.component';
import { EditarCapituloComponent } from './components/editar-capitulo/editar-capitulo.component';
import { EditordashboardComponent } from './components/editordashboard/editordashboard.component';
import { ExploreComponent } from './components/explore/explore.component';
import { RedirectIfLoggedGuard } from './guards/redirect-if-logged.guard';
import { DetalleObraComponent } from './components/detalle-obra/detalle-obra.component';
import { Routes } from '@angular/router';

/**
 * Rutas principales de la aplicación .
 * Define la navegación entre componentes públicos, privados y protegidos mediante guards.
 *
 * @description Algunas rutas están protegidas con `authGuard` (requieren autenticación),
 * y otras como la ruta raíz están condicionadas por `redirectIfLoggedGuard`.
 */
export const routes: Routes = [
  /**
   * Ruta raíz - muestra la página de inicio solo si no estás logueado.
   */
  {
    path: '',
    component: LandingComponent,
    canActivate: [RedirectIfLoggedGuard],
  },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] }, // perfil propio (editable)
  /**
   * Perfil público de cualquier usuario por su nick
   * @param nick Nick del usuario cuyo perfil se quiere visualizar
   */
  { path: 'profile/:nick', component: PerfilPublicoComponent }, // perfil público (cualquier usuario)
  { path: 'editor', component: EditorComponent, canActivate: [AuthGuard] },
  {
    path: 'biblioteca',
    component: BibliotecaComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'explore',
    component: ExploreComponent,
  },
  /**
   * Vista de lectura de un capítulo de una obra.
   * @param idObra ID de la obra.
   * @param orden Orden del capítulo dentro de la obra.
   */
  { path: 'libro/:idObra/capitulo/:orden', component: LecturaComponent },

  {
    path: 'dashboard',
    component: EditordashboardComponent,
    canActivate: [AuthGuard],
  },
  /**
   * Página de edición de una obra existente.
   * @param idObra ID de la obra a editar.
   */
  {
    path: 'editar/obra/:idObra',
    component: EditarObraComponent,
    canActivate: [AuthGuard],
  },
  /**
   * Edición de un capítulo específico dentro de una obra.
   * @param idObra ID de la obra.
   * @param idCapitulo ID del capítulo.
   */
  {
    path: 'editar/:idObra/capitulo/:idCapitulo',
    component: EditarCapituloComponent,
    canActivate: [AuthGuard],
  },
  /**
   * Detalle público de una obra.
   * @param id ID de la obra a visualizar.
   */
  {
    path: 'obra/:id',
    component: DetalleObraComponent,
  },

  { path: '**', redirectTo: '' }, // Redirigir cualquier ruta desconocida al landing
];
