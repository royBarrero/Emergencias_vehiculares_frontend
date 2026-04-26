import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { EmergenciasTallerComponent } from '../emergencias/emergencias-taller.component';

@Component({
  selector: 'app-taller-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule,EmergenciasTallerComponent],
  templateUrl: './taller-dashboard.component.html',
  styleUrl: './taller-dashboard.component.css'
  
})
export class TallerDashboardComponent implements OnInit {
  usuario: any;
  taller: any;
  tecnicos: any[] = [];
  menuAbierto: boolean = false;
  seccionActiva: string = 'inicio';
  solicitudesPendientes: number = 0;
  serviciosAtendidos: number = 0;
  modalTecnicoAbierto: boolean = false;
  historial: any[] = [];
historialCargando: boolean = false;
tecnicoEditando: any = null;
formTecnico: any = {
  nombre: '',
  correo: '',
  contrasena: '',
  telefono: '',
  especialidad: '',
  estado_disponibilidad: 'disponible'
};
servicios: any[] = [];
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
    this.cargarDatos();
  }

cargarDatos() {
  this.ngZone.run(() => {
    this.api.obtenerTallerPorUsuario(this.usuario.id_usuario).subscribe({
      next: (data: any) => {
        this.taller = data;
        this.servicios = data.servicios || []; 
        this.cargarTecnicos(this.taller.id_taller);
        this.cdr.detectChanges();
        this.cargarEstadisticasEmergencias(this.taller.id_taller);
      },
      error: () => {
        console.error('Error al cargar el taller');
      }
    });
  });
}
  cargarTecnicos(id_taller: number) {
    this.api.obtenerTecnicosTaller(id_taller).subscribe({
      next: (data: any) => {
        this.ngZone.run(() => {
          this.tecnicos = data;
          this.cdr.detectChanges();
        });
      },
      error: () => {}
    });
  }
  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  cambiarSeccion(seccion: string) {
  this.seccionActiva = seccion;
  this.menuAbierto = false;
  if (seccion === 'historial') {
    this.cargarHistorial();
  }
}
  cargarEstadisticasEmergencias(id_taller: number) {
  // Emergencias asignadas al taller (finalizadas)
  this.api.obtenerEmergenciasTaller(id_taller).subscribe({
    next: (data: any) => {
      this.ngZone.run(() => {
        this.serviciosAtendidos = data.filter((e: any) => e.estado === 'finalizada').length;
        this.cdr.detectChanges();
      });
    }
  });

  // Emergencias pendientes globales
  this.api.obtenerEmergenciasPendientes().subscribe({
    next: (data: any) => {
      this.ngZone.run(() => {
        this.solicitudesPendientes = data.length;
        this.cdr.detectChanges();
      });
    }
  });
}
abrirModalTecnico() {
  this.tecnicoEditando = null;
  this.formTecnico = {
    nombre: '',
    correo: '',
    contrasena: '',
    telefono: '',
    especialidad: '',
    estado_disponibilidad: 'disponible'
  };
  this.modalTecnicoAbierto = true;
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
  this.modalTecnicoAbierto = true;
}

cerrarModalTecnico() {
  this.modalTecnicoAbierto = false;
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
        // Si cambió disponibilidad la actualizamos por separado
        if (this.formTecnico.estado_disponibilidad !== this.tecnicoEditando.estado_disponibilidad) {
          this.api.cambiarDisponibilidad(this.tecnicoEditando.id_tecnico, {
            estado_disponibilidad: this.formTecnico.estado_disponibilidad
          }).subscribe({
            next: () => {
              this.ngZone.run(() => {
                this.cerrarModalTecnico();
                this.cargarTecnicos(this.taller.id_taller);
                this.cdr.detectChanges();
              });
            }
          });
        } else {
          this.ngZone.run(() => {
            this.cerrarModalTecnico();
            this.cargarTecnicos(this.taller.id_taller);
            this.cdr.detectChanges();
          });
        }
      },
      error: () => alert('Error al actualizar el técnico')
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
      next: () => {
        this.ngZone.run(() => {
          this.cerrarModalTecnico();
          this.cargarTecnicos(this.taller.id_taller);
          this.cdr.detectChanges();
        });
      },
      error: () => alert('Error al registrar el técnico')
    });
  }
}

eliminarTecnico(id: number) {
  if (!confirm('¿Estás seguro de eliminar este técnico?')) return;
  this.api.eliminarTecnico(id).subscribe({
    next: () => {
      this.ngZone.run(() => {
        this.cargarTecnicos(this.taller.id_taller);
        this.cdr.detectChanges();
      });
    },
    error: () => alert('Error al eliminar el técnico')
  });
}
cargarHistorial() {
  this.historialCargando = true;
  this.api.obtenerEmergenciasTaller(this.taller.id_taller).subscribe({
    next: (data: any) => {
      this.ngZone.run(() => {
        this.historial = data.filter((e: any) => e.estado === 'finalizada');
        this.historialCargando = false;
        this.cdr.detectChanges();
      });
    },
    error: () => { this.historialCargando = false; }
  });
}
getColorPrioridad(prioridad: string): string {
  const colores: any = { baja: '#4CAF50', media: '#FF9800', alta: '#E53935' };
  return colores[prioridad] || '#999';
}
// SERVICIOS DEL TALLER
cargarServicios() {
  this.api.obtenerTallerPorUsuario(this.usuario.id_usuario).subscribe({
    next: (data: any) => {
      this.ngZone.run(() => {
        this.servicios = data.servicios || [];
        this.cdr.detectChanges();
      });
    }
  });
}

tieneServicio(nombre: string): boolean {
  return this.servicios.some(s => s.nombre_servicio === nombre);
}

toggleServicioDashboard(nombre: string) {
  if (this.tieneServicio(nombre)) {
    const servicio = this.servicios.find(s => s.nombre_servicio === nombre);
    if (!servicio) return;
    this.api.eliminarServicio(this.taller.id_taller, servicio.id_servicio).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.servicios = this.servicios.filter(s => s.id_servicio !== servicio.id_servicio);
          this.taller.servicios = this.servicios;
          this.cdr.detectChanges();
        });
      }
    });
  } else {
    this.api.agregarServicio(this.taller.id_taller, {
      nombre_servicio: nombre,
      descripcion: '',
      disponible: true
    }).subscribe({
      next: (data: any) => {
        this.ngZone.run(() => {
          this.servicios.push(data);
          this.taller.servicios = this.servicios;
          this.cdr.detectChanges();
        });
      }
    });
  }
}
}