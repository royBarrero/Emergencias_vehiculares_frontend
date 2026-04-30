import { Component, OnInit,OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-emergencias-taller',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './emergencias-taller.component.html',
  styleUrl: './emergencias-taller.component.css'
})
export class EmergenciasTallerComponent implements OnInit,OnDestroy {
  emergenciasPendientes: any[] = [];
  emergenciasTaller: any[] = [];
  emergenciaSeleccionada: any = null;
  tecnicos: any[] = [];
  taller: any;
  usuario: any;
  cargando = false;
  tabActiva: string = 'pendientes';
  ultimaCantidadPendientes: number = 0;
  notificacionesActivas: boolean = false;
  private intervalo: any;

  // Para asignar técnico
  idTecnicoSeleccionado: number | null = null;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    const data = localStorage.getItem('usuario');
    if (data) this.usuario = JSON.parse(data);
  }

  ngOnInit() {
  this.cargarDatos();
  this.activarNotificaciones();
  this.intervalo = setInterval(() => {
    this.cargarEmergencias();
  }, 15000);
}
ngOnDestroy() {
  if (this.intervalo) {
    clearInterval(this.intervalo);
  }
}
  cargarDatos() {
    this.api.obtenerTallerPorUsuario(this.usuario.id_usuario).subscribe({
      next: (data: any) => {
        this.ngZone.run(() => {
          this.taller = data;
          this.cargarEmergencias();
          this.cargarTecnicos();
          this.cdr.detectChanges();
        });
      }
    });
  }

cargarEmergencias() {
  this.cargando = true;

  this.api.obtenerEmergenciasPendientes().subscribe({
    next: (data: any) => {
      this.ngZone.run(() => {
        const nuevasCantidad = data.length;
        
        // Si hay más emergencias que antes notificar
        if (this.ultimaCantidadPendientes > 0 && 
            nuevasCantidad > this.ultimaCantidadPendientes) {
          const nuevas = nuevasCantidad - this.ultimaCantidadPendientes;
          this.enviarNotificacion(
            '🚨 Nueva emergencia',
            `Tienes ${nuevas} nueva${nuevas > 1 ? 's' : ''} solicitud${nuevas > 1 ? 'es' : ''} pendiente${nuevas > 1 ? 's' : ''}`
          );
        }
        
        this.ultimaCantidadPendientes = nuevasCantidad;
        this.emergenciasPendientes = data;
        this.cargando = false;
        this.cdr.detectChanges();
      });
    },
    error: () => { this.cargando = false; }
  });

  this.api.obtenerEmergenciasTaller(this.taller.id_taller).subscribe({
    next: (data: any) => {
      this.ngZone.run(() => {
        this.emergenciasTaller = data;
        this.cdr.detectChanges();
      });
    }
  });
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

  verDetalle(emergencia: any) {
    this.api.obtenerEmergencia(emergencia.id_emergencia).subscribe({
      next: (data: any) => {
        this.ngZone.run(() => {
          this.emergenciaSeleccionada = data;
          this.idTecnicoSeleccionado = null;
          this.cdr.detectChanges();
        });
      }
    });
  }

  aceptarEmergencia() {
    if (!this.emergenciaSeleccionada) return;
    this.api.actualizarEstadoEmergencia(this.emergenciaSeleccionada.id_emergencia, {
      estado: 'asignada',
      id_taller: this.taller.id_taller
    }).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.emergenciaSeleccionada.estado = 'asignada';
          this.cargarEmergencias();
          this.cdr.detectChanges();
        });
      }
    });
  }

  rechazarEmergencia() {
    if (!this.emergenciaSeleccionada) return;
    this.api.actualizarEstadoEmergencia(this.emergenciaSeleccionada.id_emergencia, {
      estado: 'cancelada'
    }).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.emergenciaSeleccionada = null;
          this.cargarEmergencias();
          this.cdr.detectChanges();
        });
      }
    });
  }

  asignarTecnico() {
    if (!this.emergenciaSeleccionada || !this.idTecnicoSeleccionado) return;
    this.api.actualizarEstadoEmergencia(this.emergenciaSeleccionada.id_emergencia, {
      estado: 'en_camino',
      id_tecnico: this.idTecnicoSeleccionado
    }).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.emergenciaSeleccionada.estado = 'en_camino';
          this.cargarEmergencias();
          this.cdr.detectChanges();
        });
      }
    });
  }

  actualizarEstado(nuevoEstado: string) {
    if (!this.emergenciaSeleccionada) return;
    this.api.actualizarEstadoEmergencia(this.emergenciaSeleccionada.id_emergencia, {
      estado: nuevoEstado
    }).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.emergenciaSeleccionada.estado = nuevoEstado;
          this.cargarEmergencias();
          this.cdr.detectChanges();
        });
      }
    });
  }

  cerrarDetalle() {
    this.emergenciaSeleccionada = null;
  }

  cambiarTab(tab: string) {
    this.tabActiva = tab;
  }

  getColorPrioridad(prioridad: string): string {
    const colores: any = { baja: '#4CAF50', media: '#FF9800', alta: '#E53935' };
    return colores[prioridad] || '#999';
  }

  getColorEstado(estado: string): string {
    const colores: any = {
      pendiente: '#FF9800',
      buscando_taller: '#2196F3',
      asignada: '#4CAF50',
      en_camino: '#2196F3',
      atendiendo: '#FF9800',
      finalizada: '#4CAF50',
      cancelada: '#E53935'
    };
    return colores[estado] || '#999';
  }
  abrirFoto(url: string) {
  window.open(url, '_blank');
}

abrirMapa() {
  if (!this.emergenciaSeleccionada) return;
  const lat = this.emergenciaSeleccionada.latitud;
  const lng = this.emergenciaSeleccionada.longitud;
  window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
}
async activarNotificaciones() {
  if (!('Notification' in window)) return;
  
  const permiso = await Notification.requestPermission();
  if (permiso === 'granted') {
    this.notificacionesActivas = true;
  }
}

enviarNotificacion(titulo: string, mensaje: string) {
  if (!this.notificacionesActivas) return;
  if (Notification.permission !== 'granted') return;
  
  new Notification(titulo, {
    body: mensaje,
    icon: '/favicon.ico'
  });
}
}