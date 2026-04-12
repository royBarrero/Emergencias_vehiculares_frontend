import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-tecnicos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './tecnicos.component.html',
  styleUrl: './tecnicos.component.css'
})
export class TecnicosComponent implements OnInit {
  tecnicos: any[] = [];
  talleres: any[] = [];
  cargando: boolean = false;
  error: string = '';
  exito: string = '';
  menuAbierto: boolean = false;

  modalRegistrar: boolean = false;
  formRegistrar = {
    nombre: '',
    correo: '',
    contrasena: '',
    telefono: '',
    id_taller: null,
    especialidad: ''
  };

  modalDisponibilidad: boolean = false;
  tecnicoSeleccionado: any = null;
  nuevoEstado: string = '';

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando = true;
    this.api.obtenerTalleres().subscribe({
      next: (data: any) => {
        this.talleres = data;
        if (this.talleres.length > 0) {
          this.cargarTecnicos(this.talleres[0].id_taller);
        } else {
          this.cargando = false;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.error = 'Error al cargar los datos';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarTecnicos(id_taller: number) {
    this.api.obtenerTecnicosTaller(id_taller).subscribe({
      next: (data: any) => {
        this.tecnicos = [...this.tecnicos, ...data];
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  abrirRegistrar() {
    this.formRegistrar = {
      nombre: '', correo: '', contrasena: '',
      telefono: '', id_taller: null, especialidad: ''
    };
    this.modalRegistrar = true;
  }

  guardarTecnico() {
    this.api.registrarTecnico(this.formRegistrar).subscribe({
      next: () => {
        this.exito = 'Técnico registrado correctamente';
        this.modalRegistrar = false;
        this.tecnicos = [];
        this.cargarDatos();
        setTimeout(() => this.exito = '', 3000);
      },
      error: () => {
        this.error = 'Error al registrar el técnico';
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  abrirDisponibilidad(tecnico: any) {
    this.tecnicoSeleccionado = tecnico;
    this.nuevoEstado = tecnico.estado_disponibilidad;
    this.modalDisponibilidad = true;
  }

  guardarDisponibilidad() {
    this.api.cambiarDisponibilidad(
      this.tecnicoSeleccionado.id_tecnico,
      { estado_disponibilidad: this.nuevoEstado }
    ).subscribe({
      next: () => {
        this.exito = 'Disponibilidad actualizada correctamente';
        this.modalDisponibilidad = false;
        this.tecnicos = [];
        this.cargarDatos();
        setTimeout(() => this.exito = '', 3000);
      },
      error: () => {
        this.error = 'Error al actualizar disponibilidad';
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  getDisponibilidadClass(estado: string) {
    switch(estado) {
      case 'disponible': return 'estado-activo';
      case 'ocupado': return 'estado-pendiente';
      default: return 'estado-inactivo';
    }
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }
}