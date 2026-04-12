import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.css'
})
export class RolesComponent implements OnInit {
  roles: any[] = [];
  cargando: boolean = false;
  error: string = '';
  exito: string = '';
  menuAbierto: boolean = false;

  modalRegistrar: boolean = false;
  formRegistrar = {
    nombre: '',
    descripcion: ''
  };

  modalEditar: boolean = false;
  rolSeleccionado: any = null;
  formEditar = {
    nombre: '',
    descripcion: ''
  };

  modalAsignar: boolean = false;
  formAsignar = {
    id_usuario: null,
    id_rol: null
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.cargarRoles();
  }

  cargarRoles() {
    this.cargando = true;
    this.api.obtenerRoles().subscribe({
      next: (data: any) => {
        this.roles = data;
        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al cargar los roles';
        this.cargando = false;
      }
    });
  }

  abrirRegistrar() {
    this.formRegistrar = { nombre: '', descripcion: '' };
    this.modalRegistrar = true;
  }

  guardarRol() {
    this.api.crearRol(this.formRegistrar).subscribe({
      next: () => {
        this.exito = 'Rol creado correctamente';
        this.modalRegistrar = false;
        this.cargarRoles();
        setTimeout(() => this.exito = '', 3000);
      },
      error: () => {
        this.error = 'Error al crear el rol';
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  abrirEditar(rol: any) {
    this.rolSeleccionado = rol;
    this.formEditar = {
      nombre: rol.nombre,
      descripcion: rol.descripcion || ''
    };
    this.modalEditar = true;
  }

  guardarEdicion() {
    this.api.actualizarRol(this.rolSeleccionado.id_rol, this.formEditar).subscribe({
      next: () => {
        this.exito = 'Rol actualizado correctamente';
        this.modalEditar = false;
        this.cargarRoles();
        setTimeout(() => this.exito = '', 3000);
      },
      error: () => {
        this.error = 'Error al actualizar el rol';
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  abrirAsignar() {
    this.formAsignar = { id_usuario: null, id_rol: null };
    this.modalAsignar = true;
  }

  guardarAsignacion() {
    this.api.asignarRol(this.formAsignar).subscribe({
      next: () => {
        this.exito = 'Rol asignado correctamente';
        this.modalAsignar = false;
        setTimeout(() => this.exito = '', 3000);
      },
      error: () => {
        this.error = 'Error al asignar el rol';
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }
}