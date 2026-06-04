import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-admin-tenants',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-tenants.component.html',
  styleUrl: './admin-tenants.component.css'
})
export class AdminTenantsComponent implements OnInit {
  tenants: any[] = [];
  tenantSeleccionado: any = null;
  modalAbierto: boolean = false;
  cargando: boolean = false;
  formTenant = { nombre: '', descripcion: '' };

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.cargarTenants();
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

  verDetalle(tenant: any) {
    this.api.obtenerTenant(tenant.id_tenant).subscribe({
      next: (data: any) => {
        this.ngZone.run(() => {
          this.tenantSeleccionado = data;
          this.cdr.detectChanges();
        });
      }
    });
  }

  abrirModal() {
    this.formTenant = { nombre: '', descripcion: '' };
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  guardarTenant() {
    if (!this.formTenant.nombre) return;
    this.api.crearTenant(this.formTenant).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.cerrarModal();
          this.cargarTenants();
          this.cdr.detectChanges();
        });
      }
    });
  }
}