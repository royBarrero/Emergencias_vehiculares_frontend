import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TalleresComponent } from './components/talleres/talleres.component';
import { TecnicosComponent } from './components/tecnicos/tecnicos.component';
import { RolesComponent } from './components/roles/roles.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { TallerDashboardComponent } from './components/taller-dashboard/taller-dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'talleres', component: TalleresComponent },
  { path: 'tecnicos', component: TecnicosComponent },
  { path: 'roles', component: RolesComponent },
  {path: 'usuarios', component: UsuariosComponent },
  { path: 'taller-dashboard', component: TallerDashboardComponent },
  { path: '**', redirectTo: 'login' }
  
];