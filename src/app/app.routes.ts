import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegistroTallerComponent } from './components/registro-taller/registro-taller.component';
import { AdminLayoutComponent } from './components/admin/admin-layout/admin-layout.component';
import { AdminInicioComponent } from './components/admin/admin-inicio/admin-inicio.component';
import { AdminTenantsComponent } from './components/admin/admin-tenants/admin-tenants.component';
import { TallerLayoutComponent } from './components/taller/taller-layout/taller-layout.component';
import { AdminTalleresComponent } from './components/admin/admin-talleres/admin-talleres.component';

import { TallerInicioComponent } from './components/taller/taller-inicio/taller-inicio.component';
import { TallerSolicitudesComponent } from './components/taller/taller-solicitudes/taller-solicitudes.component';
import { TallerTecnicosComponent } from './components/taller/taller-tecnicos/taller-tecnicos.component';
import { TallerHistorialComponent } from './components/taller/taller-historial/taller-historial.component';
import { TallerPagosComponent } from './components/taller/taller-pagos/taller-pagos.component';
import { TallerServiciosComponent } from './components/taller/taller-servicios/taller-servicios.component';
import { TallerPerfilComponent } from './components/taller/taller-perfil/taller-perfil.component';
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroTallerComponent },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'inicio', component: AdminInicioComponent },
      { path: 'tenants', component: AdminTenantsComponent },
      { path: 'talleres', component: AdminTalleresComponent }
    ]
  },
  {
  path: 'taller',
  component: TallerLayoutComponent,
  children: [
    { path: '', redirectTo: 'inicio', pathMatch: 'full' },
    { path: 'inicio', component: TallerInicioComponent },
    { path: 'solicitudes', component: TallerSolicitudesComponent },
    { path: 'tecnicos', component: TallerTecnicosComponent },
    { path: 'historial', component: TallerHistorialComponent },
    { path: 'pagos', component: TallerPagosComponent },
    { path: 'servicios', component: TallerServiciosComponent },
    { path: 'perfil', component: TallerPerfilComponent },
  ]
},
  { path: '**', redirectTo: 'login' }
];