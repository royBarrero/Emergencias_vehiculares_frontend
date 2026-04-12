import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit {
  conductores: any[] = [];
  cargando: boolean = false;
  error: string = '';
  exito: string = '';
  menuAbierto: boolean = false;

  // Modal editar
  modalEditar: boolean = false;
  conductorSeleccionado: any = null;
  formEditar = {
    nombre: '',
    telefono: '',
    licencia: '',
    direccion: ''
  };

  // Modal eliminar
  modalEliminar: boolean = false;
  conductorAEliminar: any = null;

  constructor(private api: ApiService ,private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarConductores();
  }

  cargarConductores() {
    this.cargando = true;
    this.api.listarConductores().subscribe({
      next: (data: any) => {
        this.conductores = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar los conductores';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirEditar(conductor: any) {
    this.conductorSeleccionado = conductor;
    this.formEditar = {
      nombre: conductor.nombre,
      telefono: conductor.telefono || '',
      licencia: conductor.licencia || '',
      direccion: conductor.direccion || ''
    };
    this.modalEditar = true;
  }

  guardarEdicion() {
    this.api.actualizarConductor(
      this.conductorSeleccionado.id_conductor,
      this.formEditar
    ).subscribe({
      next: () => {
        this.exito = 'Conductor actualizado correctamente';
        this.modalEditar = false;
        this.cargarConductores();
        setTimeout(() => this.exito = '', 3000);
      },
      error: () => {
        this.error = 'Error al actualizar el conductor';
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  abrirEliminar(conductor: any) {
    this.conductorAEliminar = conductor;
    this.modalEliminar = true;
  }

  confirmarEliminar() {
    this.api.eliminarConductor(this.conductorAEliminar.id_conductor).subscribe({
      next: () => {
        this.exito = 'Conductor eliminado correctamente';
        this.modalEliminar = false;
        this.cargarConductores();
        setTimeout(() => this.exito = '', 3000);
      },
      error: () => {
        this.error = 'Error al eliminar el conductor';
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }
}