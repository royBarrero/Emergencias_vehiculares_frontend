import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-taller-tecnicos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './taller-tecnicos.component.html',
  styleUrl: './taller-tecnicos.component.css'
})
export class TallerTecnicosComponent implements OnInit {
  taller: any;
  tecnicos: any[] = [];
  modalAbierto: boolean = false;
  tecnicoEditando: any = null;
  formTecnico: any = {
    nombre: '',
    correo: '',
    contrasena: '',
    telefono: '',
    especialidad: '',
    estado_disponibilidad: 'disponible'
  };

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    const data = localStorage.getItem('taller');
    if (data) {
      this.taller = JSON.parse(data);
      this.cargarTecnicos();
    }
  }

  cargarTecnicos() {
    this.api.obtenerTecnicosTaller(this.taller.id_taller).subscribe({
      next: (data: any) => {
        this.ngZone.run(() => {
          this.tecnicos = data;
          this.cdr.detectChanges();
        });
      }
    });
  }

  abrirModal() {
    this.tecnicoEditando = null;
    this.formTecnico = { nombre: '', correo: '', contrasena: '', telefono: '', especialidad: '', estado_disponibilidad: 'disponible' };
    this.modalAbierto = true;
  }
mostrarPassword: boolean = false;

togglePassword() {
  this.mostrarPassword = !this.mostrarPassword;
}
get especialidades(): string[] {
  return (this.taller?.servicios || []).map((s: any) => s.nombre_servicio);
}
  editarTecnico(tecnico: any) {
    this.tecnicoEditando = tecnico;
    this.formTecnico = {
      nombre: tecnico.nombre,
      correo: tecnico.correo,
      telefono: tecnico.telefono || '',
      especialidad: tecnico.especialidad || '',
      contrasena: '',
      estado_disponibilidad: tecnico.estado_disponibilidad
    };
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.tecnicoEditando = null;
  }

  guardarTecnico() {
    if (!this.formTecnico.nombre || !this.formTecnico.correo) {
      alert('Nombre y correo son obligatorios');
      return;
    }

    if (this.tecnicoEditando) {
      const datos: any = {
        nombre: this.formTecnico.nombre,
        telefono: this.formTecnico.telefono,
        especialidad: this.formTecnico.especialidad,
      };
      this.api.actualizarTecnico(this.tecnicoEditando.id_tecnico, datos).subscribe({
        next: () => {
          if (this.formTecnico.estado_disponibilidad !== this.tecnicoEditando.estado_disponibilidad) {
            this.api.cambiarDisponibilidad(this.tecnicoEditando.id_tecnico, {
              estado_disponibilidad: this.formTecnico.estado_disponibilidad
            }).subscribe({ next: () => { this.cerrarModal(); this.cargarTecnicos(); } });
          } else {
            this.cerrarModal();
            this.cargarTecnicos();
          }
        },
        error: () => alert('Error al actualizar')
      });
    } else {
      const datos = {
        nombre: this.formTecnico.nombre,
        correo: this.formTecnico.correo,
        contrasena: this.formTecnico.contrasena,
        telefono: this.formTecnico.telefono,
        especialidad: this.formTecnico.especialidad,
        id_taller: this.taller.id_taller,
        estado_disponibilidad: 'disponible'
      };
      this.api.registrarTecnico(datos).subscribe({
        next: () => { this.cerrarModal(); this.cargarTecnicos(); },
        error: () => alert('Error al registrar')
      });
    }
  }

  eliminarTecnico(id: number) {
    if (!confirm('¿Eliminar este técnico?')) return;
    this.api.eliminarTecnico(id).subscribe({
      next: () => this.cargarTecnicos()
    });
  }
}