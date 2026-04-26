import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-registro-taller',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registro-taller.component.html',
  styleUrl: './registro-taller.component.css'
})
export class RegistroTallerComponent implements OnInit {
  paso: number = 1;
  cargando: boolean = false;
  error: string = '';
  mapa: any = null;
  marcador: any = null;

  serviciosPredefinidos = [
    'Mecánica general',
    'Chaperio y pintura',
    'Electricidad automotriz',
    'Llantas y alineación',
    'Frenos',
    'Transmisión y caja',
    'Motor',
    'Aire acondicionado',
    'Soldadura',
    'Grúa y remolque'
  ];

  form = {
    nombre: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
    telefono: '',
    nombre_taller: '',
    direccion: '',
    latitud: null as number | null,
    longitud: null as number | null,
    descripcion: '',
    servicios: [] as any[],
    aceptaComision: false
  };

  constructor(
    private api: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {}

  siguientePaso() {
    if (this.paso === 1) {
      if (!this.form.nombre || !this.form.correo || !this.form.contrasena) {
        this.error = 'Completa todos los campos obligatorios';
        return;
      }
      if (this.form.contrasena !== this.form.confirmarContrasena) {
        this.error = 'Las contraseñas no coinciden';
        return;
      }
      this.error = '';
      this.paso = 2;
      setTimeout(() => this.inicializarMapa(), 300);
    } else if (this.paso === 2) {
      if (!this.form.latitud || !this.form.longitud) {
        this.error = 'Marca la ubicación de tu taller en el mapa';
        return;
      }
      if (!this.form.nombre_taller) {
        this.error = 'Ingresa el nombre del taller';
        return;
      }
      this.error = '';
      this.paso = 3;
    }
  }

  anteriorPaso() {
    if (this.paso > 1) {
      this.paso--;
      if (this.paso === 2) {
        setTimeout(() => this.inicializarMapa(), 300);
      }
    }
  }

  inicializarMapa() {
    if (this.mapa) {
      this.mapa.remove();
      this.mapa = null;
    }

    this.mapa = L.map('mapa-registro-publico').setView([-17.7834, -63.1821], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.mapa);

    this.mapa.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      if (this.marcador) {
        this.marcador.setLatLng([lat, lng]);
      } else {
        this.marcador = L.marker([lat, lng]).addTo(this.mapa);
      }
      this.form.latitud = lat;
      this.form.longitud = lng;
      this.cdr.detectChanges();
    });
  }

  toggleServicio(servicio: string) {
    const index = this.form.servicios.findIndex(
      (s: any) => s.nombre_servicio === servicio
    );
    if (index >= 0) {
      this.form.servicios.splice(index, 1);
    } else {
      this.form.servicios.push({
        nombre_servicio: servicio,
        descripcion: '',
        disponible: true
      });
    }
  }

  servicioSeleccionado(servicio: string): boolean {
    return this.form.servicios.some((s: any) => s.nombre_servicio === servicio);
  }

  registrar() {
  if (!this.form.aceptaComision) {
    this.error = 'Debes aceptar los términos de la plataforma';
    return;
  }
  if (this.form.servicios.length === 0) {
    this.error = 'Selecciona al menos un servicio';
    return;
  }

  this.cargando = true;
  this.error = '';

  const datos = {
    nombre: this.form.nombre,
    correo: this.form.correo,
    contrasena: this.form.contrasena,
    telefono: this.form.telefono,
    nombre_taller: this.form.nombre_taller,
    direccion: this.form.direccion,
    latitud: this.form.latitud,
    longitud: this.form.longitud,
    descripcion: this.form.descripcion,
    servicios: this.form.servicios
  };

  this.api.registrarTaller(datos).subscribe({
    next: () => {
  console.log('Registro exitoso');
  this.cargando = false;
  this.paso = 4;
  this.cdr.detectChanges();
},
error: () => {
  this.error = 'Error al registrar. El correo puede estar en uso.';
  this.cargando = false;
}
  });
}
}