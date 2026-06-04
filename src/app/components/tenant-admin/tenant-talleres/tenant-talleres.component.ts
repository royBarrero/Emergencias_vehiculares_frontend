import { Component, OnInit, ChangeDetectorRef, NgZone,AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-tenant-talleres',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tenant-talleres.component.html',
  styleUrl: './tenant-talleres.component.css'
})
export class TenantTalleresComponent implements OnInit, AfterViewChecked {
  tenant: any;
  talleres: any[] = [];
  tallerSeleccionado: any = null;
  tecnicos: any[] = [];
  cargando: boolean = false;
  modalEditarAbierto: boolean = false;
  modalNuevoAbierto: boolean = false;
  serviciosExpandido: boolean = false;
  usarAdminExistente: boolean = false;
  mapaInicializado: boolean = false;
  mapa: any = null;
  marcador: any = null;

  formEditar: any = {
    nombre_taller: '',
    direccion: '',
    telefono: '',
    descripcion: '',
    estado: 'activo'
  };

  formNuevo: any = {
    nombre_taller: '',
    direccion: '',
    latitud: null,
    longitud: null,
    telefono: '',
    descripcion: '',
    correo_existente: '',
    nombre_admin: '',
    correo_admin: '',
    contrasena_admin: '',
    telefono_admin: '',
    servicios: []
  };

  serviciosPredefinidos = [
    'Mecánica general', 'Chaperio y pintura', 'Electricidad automotriz',
    'Llantas y alineación', 'Frenos', 'Transmisión y caja',
    'Motor', 'Aire acondicionado', 'Soldadura', 'Grúa y remolque'
  ];

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    const data = localStorage.getItem('tenant');
    if (data) {
      this.tenant = JSON.parse(data);
      this.cargarTalleres();
    }
  }

  cargarTalleres() {
    this.cargando = true;
    this.api.obtenerTalleresPorTenant(this.tenant.id_tenant).subscribe({
      next: (data: any) => {
        this.ngZone.run(() => {
          this.talleres = data;
          this.cargando = false;
          this.cdr.detectChanges();
        });
      },
      error: () => { this.cargando = false; }
    });
  }

  verDetalle(taller: any) {
    this.api.detalleTallerTenant(this.tenant.id_tenant, taller.id_taller).subscribe({
      next: (data: any) => {
        this.ngZone.run(() => {
          this.tallerSeleccionado = data;
          this.cdr.detectChanges();
        });
      }
    });
    this.api.obtenerTecnicosTaller(taller.id_taller).subscribe({
      next: (data: any) => {
        this.ngZone.run(() => {
          this.tecnicos = data;
          this.cdr.detectChanges();
        });
      }
    });
  }

  abrirModalEditar() {
    this.formEditar = {
      nombre_taller: this.tallerSeleccionado.nombre_taller,
      direccion: this.tallerSeleccionado.direccion,
      telefono: this.tallerSeleccionado.telefono,
      descripcion: this.tallerSeleccionado.descripcion,
      estado: this.tallerSeleccionado.estado
    };
    this.modalEditarAbierto = true;
  }

  guardarEditar() {
    this.api.editarTallerTenant(this.tenant.id_tenant, this.tallerSeleccionado.id_taller, this.formEditar).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.modalEditarAbierto = false;
          this.cargarTalleres();
          this.verDetalle(this.tallerSeleccionado);
          this.cdr.detectChanges();
        });
      }
    });
  }

  abrirModalNuevo() {
  this.formNuevo = {
    nombre_taller: '', direccion: '', latitud: null, longitud: null,
    telefono: '', descripcion: '', correo_existente: '',
    nombre_admin: '', correo_admin: '', contrasena_admin: '',
    telefono_admin: '', servicios: []
  };
  this.usarAdminExistente = false;
  this.serviciosExpandido = false;
  if (this.mapa) {
    this.mapa.remove();
    this.mapa = null;
  }
  this.marcador = null;
  this.mapaInicializado = false;
  this.modalNuevoAbierto = true;
}

cerrarModalNuevo() {
  this.modalNuevoAbierto = false;
  this.mapaInicializado = false;
  if (this.mapa) {
    this.mapa.remove();
    this.mapa = null;
  }
}

  inicializarMapa() {
  const el = document.getElementById('mapa-nuevo-taller');
  if (!el) return;
  if (this.mapa) {
    this.mapa.remove();
    this.mapa = null;
  }
  this.mapa = L.map('mapa-nuevo-taller', {
  center: [-17.7834, -63.1821],
  zoom: 13
});
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(this.mapa);
setTimeout(() => {
  this.mapa.invalidateSize(true);
}, 100);
setTimeout(() => {
  this.mapa.invalidateSize(true);
}, 500);
  this.mapa.on('click', async (e: any) => {
    const { lat, lng } = e.latlng;
    if (this.marcador) {
      this.marcador.setLatLng([lat, lng]);
    } else {
      this.marcador = L.marker([lat, lng]).addTo(this.mapa);
    }
    this.formNuevo.latitud = lat;
    this.formNuevo.longitud = lng;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();
      if (data && data.display_name) {
        this.formNuevo.direccion = data.display_name;
      }
    } catch {}
    this.cdr.detectChanges();
  });
}

  toggleServicio(nombre: string) {
    const idx = this.formNuevo.servicios.indexOf(nombre);
    if (idx > -1) {
      this.formNuevo.servicios.splice(idx, 1);
    } else {
      this.formNuevo.servicios.push(nombre);
    }
  }

  tieneServicio(nombre: string): boolean {
    return this.formNuevo.servicios.includes(nombre);
  }

  guardarNuevo() {
    const datos = { ...this.formNuevo };
    if (this.usarAdminExistente) {
      delete datos.nombre_admin;
      delete datos.correo_admin;
      delete datos.contrasena_admin;
      delete datos.telefono_admin;
    } else {
      delete datos.correo_existente;
    }
    this.api.crearTallerTenant(this.tenant.id_tenant, datos).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.modalNuevoAbierto = false;
          this.cargarTalleres();
          this.cdr.detectChanges();
        });
      }
    });
  }
  ngAfterViewChecked() {
  if (this.modalNuevoAbierto && !this.mapaInicializado) {
    const el = document.getElementById('mapa-nuevo-taller');
    if (el && el.offsetWidth > 0) {
      this.mapaInicializado = true;
      this.inicializarMapa();
    }
  }
}
}