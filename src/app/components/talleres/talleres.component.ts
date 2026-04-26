import { Component, OnInit, ChangeDetectorRef , AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import * as L from 'leaflet';


@Component({
  selector: 'app-talleres',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './talleres.component.html',
  styleUrl: './talleres.component.css'
})
export class TalleresComponent implements OnInit {
  talleres: any[] = [];
  cargando: boolean = false;
  error: string = '';
  exito: string = '';
  menuAbierto: boolean = false;
  mapa: any = null;
  marcador: any = null;
  mapaInicializado: boolean = false;

  // Modal registrar
  modalRegistrar: boolean = false;
  formRegistrar = {
    nombre: '',
    correo: '',
    contrasena: '',
    telefono: '',
    nombre_taller: '',
    direccion: '',
    latitud: null,
    longitud: null,
    descripcion: '',
    servicios: [] as any[]
    
  };
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
  // Modal editar
  modalEditar: boolean = false;
  tallerSeleccionado: any = null;
  formEditar = {
    nombre_taller: '',
    direccion: '',
    telefono: '',
    descripcion: '',
    estado: ''
  };

  constructor(private api: ApiService , private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarTalleres();
  }

  cargarTalleres() {
    this.cargando = true;
    this.api.obtenerTalleres().subscribe({
      next: (data: any) => {
        this.talleres = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar los talleres';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirRegistrar() {
  this.abrirRegistrarConMapa();
}

  guardarTaller() {
    this.api.registrarTaller(this.formRegistrar).subscribe({
      next: () => {
        this.exito = 'Taller registrado correctamente';
        this.modalRegistrar = false;
        this.cargarTalleres();
        setTimeout(() => this.exito = '', 3000);
      },
      error: () => {
        this.error = 'Error al registrar el taller';
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  abrirEditar(taller: any) {
    this.tallerSeleccionado = taller;
    this.formEditar = {
      nombre_taller: taller.nombre_taller,
      direccion: taller.direccion || '',
      telefono: taller.telefono || '',
      descripcion: taller.descripcion || '',
      estado: taller.estado
    };
    this.modalEditar = true;
  }

  guardarEdicion() {
    this.api.actualizarTaller(
      this.tallerSeleccionado.id_taller,
      this.formEditar
    ).subscribe({
      next: () => {
        this.exito = 'Taller actualizado correctamente';
        this.modalEditar = false;
        this.cargarTalleres();
        setTimeout(() => this.exito = '', 3000);
      },
      error: () => {
        this.error = 'Error al actualizar el taller';
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  getEstadoClass(estado: string) {
    switch(estado) {
      case 'activo': return 'estado-activo';
      case 'inactivo': return 'estado-inactivo';
      default: return 'estado-pendiente';
    }
  }
  inicializarMapa() {
  setTimeout(() => {
    if (this.mapa) {
      this.mapa.remove();
      this.mapa = null;
    }

    this.mapa = L.map('mapa-registro').setView([-17.7834, -63.1821], 13);

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

      this.formRegistrar.latitud = lat;
      this.formRegistrar.longitud = lng;
      this.cdr.detectChanges();
    });

    this.mapaInicializado = true;
  }, 300);
}

abrirRegistrarConMapa() {
  this.formRegistrar = {
    nombre: '', correo: '', contrasena: '',
    telefono: '', nombre_taller: '', direccion: '',
    latitud: null, longitud: null, descripcion: '',
    servicios: []
  };
  this.marcador = null;
  this.modalRegistrar = true;
  this.inicializarMapa();
}
toggleServicio(servicio: string) {
  const index = this.formRegistrar.servicios.findIndex(
    (s: any) => s.nombre_servicio === servicio
  );
  if (index >= 0) {
    this.formRegistrar.servicios.splice(index, 1);
  } else {
    this.formRegistrar.servicios.push({
      nombre_servicio: servicio,
      descripcion: '',
      disponible: true
    });
  }
}

servicioSeleccionado(servicio: string): boolean {
  return this.formRegistrar.servicios.some(
    (s: any) => s.nombre_servicio === servicio
  );
}
}