import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';

import {RouterModule,RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, FormsModule,  RouterModule, RouterOutlet],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent implements OnInit {
  usuario: any;
  seccionActiva: string = 'inicio';
  tenants: any[] = [];
  talleres: any[] = [];
  tenantSeleccionado: any = null;
  estadisticas = { talleres: 0, conductores: 0, tecnicos: 0, roles: 0 };
  modalTenantAbierto: boolean = false;
  formTenant = { nombre: '', descripcion: '' };
  cargando: boolean = false;

  menuItems = [
    { label: 'Inicio', icon: '🏠', seccion: 'inicio' },
    { label: 'Tenants', icon: '🏢', seccion: 'tenants' },
    { label: 'Talleres', icon: '🔧', seccion: 'talleres' },
  ];

  constructor(
    private api: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    const data = localStorage.getItem('usuario');
    if (data) {
      this.usuario = JSON.parse(data);
    } else {
      this.router.navigate(['/login']);
    }
  }

  ngOnInit() {
    this.cargarEstadisticas();
    this.cargarTenants();
    this.cargarTalleres();
  }

  cambiarSeccion(seccion: string) {
    this.seccionActiva = seccion;
    if (seccion === 'tenants') this.cargarTenants();
  }

  cargarEstadisticas() {
    this.api.obtenerEstadisticas().subscribe({
      next: (data: any) => {
        this.ngZone.run(() => {
          this.estadisticas = data;
          this.cdr.detectChanges();
        });
      }
    });
  }

  cargarTenants() {
    this.cargando = true;
    this.api.listarTenants().subscribe({
      next: (data: any) => {
        this.ngZone.run(() => {
          this.tenants = data;
          this.cargando = false;
          this.cdr.detectChanges();
        });
      },
      error: () => { this.cargando = false; }
    });
  }
cargarTalleres() {
  this.api.obtenerTalleres().subscribe({
    next: (data: any) => {
      this.ngZone.run(() => {
        this.talleres = data;
        this.cdr.detectChanges();
      });
    }
  });
}
  verDetalleTenant(tenant: any) {
    this.api.obtenerTenant(tenant.id_tenant).subscribe({
      next: (data: any) => {
        this.ngZone.run(() => {
          this.tenantSeleccionado = data;
          this.cdr.detectChanges();
        });
      }
    });
  }

  abrirModalTenant() {
    this.formTenant = { nombre: '', descripcion: '' };
    this.modalTenantAbierto = true;
  }

  cerrarModalTenant() {
    this.modalTenantAbierto = false;
  }

  guardarTenant() {
    if (!this.formTenant.nombre) return;
    this.api.crearTenant(this.formTenant).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.cerrarModalTenant();
          this.cargarTenants();
          this.cdr.detectChanges();
        });
      }
    });
  }

  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}