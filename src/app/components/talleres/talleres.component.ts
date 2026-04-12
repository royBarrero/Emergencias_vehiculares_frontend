import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

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

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.cargarTalleres();
  }

  cargarTalleres() {
    this.cargando = true;
    this.api.obtenerTalleres().subscribe({
      next: (data: any) => {
        this.talleres = data;
        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al cargar los talleres';
        this.cargando = false;
      }
    });
  }

  abrirRegistrar() {
    this.formRegistrar = {
      nombre: '', correo: '', contrasena: '',
      telefono: '', nombre_taller: '', direccion: '',
      latitud: null, longitud: null, descripcion: '',
      servicios: []
    };
    this.modalRegistrar = true;
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
}