import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-taller-solicitudes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './taller-solicitudes.component.html',
  styleUrl: './taller-solicitudes.component.css'
})
export class TallerSolicitudesComponent implements OnInit, OnDestroy {
  taller: any;
  // Pendientes = emergencias asignadas a este taller con estado 'pendiente'
  emergenciasPendientes: any[] = [];
  // Activas = emergencias con estado asignada/en_camino/atendiendo/finalizada
  emergenciasTaller: any[] = [];
  emergenciaSeleccionada: any = null;
  tecnicos: any[] = [];
  tabActiva: string = 'pendientes';
  cargando: boolean = false;
  idTecnicoSeleccionado: number | null = null;
  private wsSubscriptions: Map<number, Subscription> = new Map();
  private wsTallerSub: Subscription | null = null;

  cotizacionActual: any = null;
  mostrarFormCotizacion: boolean = false;
  enviandoCotizacion: boolean = false;
  tiempoEstimadoInput: string = '';
  enviandoTiempo: boolean = false;
  cotizacionRechazada: boolean = false;
  mostrarModal: boolean = false;
  formCotizacion = {
    monto_estimado: null as number | null,
    descripcion_servicio: '',
    tiempo_estimado: '',
    observacion: ''
  };

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    const data = localStorage.getItem('taller');
    if (data) {
      this.taller = JSON.parse(data);
      this.cargarEmergencias();
      this.cargarTecnicos();
      this.conectarWSTaller();
    } else {
      const intervalo = setInterval(() => {
        const retry = localStorage.getItem('taller');
        if (retry) {
          clearInterval(intervalo);
          this.taller = JSON.parse(retry);
          this.ngZone.run(() => {
            this.cargarEmergencias();
            this.cargarTecnicos();
            this.conectarWSTaller();
            this.cdr.detectChanges();
          });
        }
      }, 300);
    }
  }

  ngOnDestroy() {
    this.wsSubscriptions.forEach((sub, id) => {
      sub.unsubscribe();
      this.api.desconectarEmergenciaWS(id);
    });
    if (this.wsTallerSub) this.wsTallerSub.unsubscribe();
  }

  conectarWS(id_emergencia: number) {
    if (this.wsSubscriptions.has(id_emergencia)) return;
    const sub = this.api.conectarEmergenciaWS(id_emergencia).subscribe({
      next: (msg: any) => {
        this.ngZone.run(() => {
          if (msg.tipo === 'cambio_estado') {
            this.actualizarEmergenciaLocal(msg);
          }
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.wsSubscriptions.delete(id_emergencia);
      }
    });
    this.wsSubscriptions.set(id_emergencia, sub);
  }

  conectarWSTaller() {
  this.wsTallerSub = this.api.conectarTallerWS(this.taller.id_taller).subscribe({
    next: (msg: any) => {
      this.ngZone.run(() => {

        if (msg.tipo === 'nueva_emergencia') {
          this.cargarEmergencias();
        }

        if (msg.tipo === 'cambio_estado') {
          this.cargarEmergencias();
          if (msg.estado === 'asignada' && this.emergenciaSeleccionada?.id_emergencia === msg.id_emergencia) {
            this.emergenciaSeleccionada = { ...this.emergenciaSeleccionada, estado: 'asignada' };
            this.cargarCotizacion(msg.id_emergencia);
          }
        }

        if (msg.tipo === 'nueva_cotizacion') {
          if (this.emergenciaSeleccionada?.id_emergencia === msg.id_emergencia) {
            this.cargarCotizacion(msg.id_emergencia);
          }
          this.cargarEmergencias();
        }

        this.cdr.detectChanges();
      });
    },
    error: () => {
      setTimeout(() => this.conectarWSTaller(), 3000);
    }
  });
}

  actualizarEmergenciaLocal(msg: any) {
  const idxTaller = this.emergenciasTaller.findIndex(e => e.id_emergencia === msg.id_emergencia);
  if (idxTaller !== -1) {
    this.emergenciasTaller[idxTaller].estado = msg.estado;
  }

  const idxPendiente = this.emergenciasPendientes.findIndex(e => e.id_emergencia === msg.id_emergencia);
  if (idxPendiente !== -1 && msg.estado !== 'pendiente') {
    this.emergenciasPendientes.splice(idxPendiente, 1);
    this.cargarEmergencias();
  }

  // Actualizar detalle si está abierto
  if (this.emergenciaSeleccionada?.id_emergencia === msg.id_emergencia) {
    this.emergenciaSeleccionada = { ...this.emergenciaSeleccionada, estado: msg.estado };
    // Si pasó a asignada recargar para mover de pendientes a mis emergencias
    if (msg.estado === 'asignada') {
      this.cargarEmergencias();
    }
  }

  if (['finalizada', 'cancelada'].includes(msg.estado)) {
    const sub = this.wsSubscriptions.get(msg.id_emergencia);
    if (sub) sub.unsubscribe();
    this.wsSubscriptions.delete(msg.id_emergencia);
    this.api.desconectarEmergenciaWS(msg.id_emergencia);
  }
}

  cargarEmergencias() {
    // Solo emergencias de ESTE taller
    this.api.obtenerEmergenciasTaller(this.taller.id_taller).subscribe({
      next: (data: any) => {
        this.ngZone.run(() => {
          // Separar pendientes (nuevas solicitudes) de activas
          this.emergenciasPendientes = data.filter((e: any) => e.estado === 'pendiente');
          this.emergenciasTaller = data.filter((e: any) => 
            ['asignada', 'en_camino', 'atendiendo', 'finalizada', 'cancelada'].includes(e.estado)
          );
          // Conectar WS a emergencias activas
          data.forEach((e: any) => {
            if (!['finalizada', 'cancelada'].includes(e.estado)) {
              this.conectarWS(e.id_emergencia);
            }
          });
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
          this.cotizacionActual = null;
          this.mostrarFormCotizacion = false;
          this.cotizacionRechazada = false;
          this.cargarCotizacion(data.id_emergencia);
          this.conectarWS(data.id_emergencia);
          this.mostrarModal = true;
          this.cdr.detectChanges();
        });
      }
    });
  }

  cargarCotizacion(id_emergencia: number) {
    this.api.obtenerCotizacionEmergencia(id_emergencia).subscribe({
      next: (data: any) => {
        this.ngZone.run(() => {
          this.cotizacionActual = data;
          if (data?.estado === 'rechazada') {
            this.cotizacionRechazada = true;
            this.cotizacionActual = null;
          }
          this.cdr.detectChanges();
        });
      },
      error: () => {
        // No hay cotización aún, está bien
        this.cotizacionActual = null;
      }
    });
  }

  abrirFormCotizacion() {
    this.formCotizacion = {
      monto_estimado: null,
      descripcion_servicio: '',
      tiempo_estimado: '',
      observacion: ''
    };
    this.mostrarFormCotizacion = true;
  }

 crearYEnviarCotizacion() {
  if (!this.emergenciaSeleccionada || !this.formCotizacion.monto_estimado ||
    !this.formCotizacion.descripcion_servicio || !this.formCotizacion.tiempo_estimado) return;
  
  this.enviandoCotizacion = true;

  // Paso 1 — crear la cotización
  this.api.crearCotizacion(
    this.emergenciaSeleccionada.id_emergencia,
    this.taller.id_taller,
    {}
  ).subscribe({
    next: (cotizacion: any) => {
      // Paso 2 — responderla con los datos del form
      this.api.responderCotizacion(cotizacion.id_cotizacion, this.formCotizacion).subscribe({
        next: (data: any) => {
          this.ngZone.run(() => {
            this.cotizacionActual = data;
            this.mostrarFormCotizacion = false;
            this.enviandoCotizacion = false;
            this.cdr.detectChanges();
          });
        },
        error: () => { this.enviandoCotizacion = false; }
      });
    },
    error: () => { this.enviandoCotizacion = false; }
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

  cerrarDetalle() {
    this.emergenciaSeleccionada = null;
    this.cotizacionActual = null;
    this.mostrarFormCotizacion = false;
    this.cotizacionRechazada = false;
    this.mostrarModal = false;
  }

  actualizarTiempoEstimado() {
    if (!this.emergenciaSeleccionada || !this.tiempoEstimadoInput) return;
    this.enviandoTiempo = true;
    this.api.actualizarEstadoEmergencia(this.emergenciaSeleccionada.id_emergencia, {
      tiempo_estimado_reparacion: this.tiempoEstimadoInput
    }).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.emergenciaSeleccionada.tiempo_estimado_reparacion = this.tiempoEstimadoInput;
          this.tiempoEstimadoInput = '';
          this.enviandoTiempo = false;
          this.cdr.detectChanges();
        });
      },
      error: () => { this.enviandoTiempo = false; }
    });
  }

  finalizarEmergencia() {
    if (!this.emergenciaSeleccionada) return;
    this.api.actualizarEstadoEmergencia(this.emergenciaSeleccionada.id_emergencia, {
      estado: 'finalizada'
    }).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.emergenciaSeleccionada.estado = 'finalizada';
          this.cargarEmergencias();
          this.cdr.detectChanges();
        });
      }
    });
  }

  getColorPrioridad(prioridad: string): string {
    const colores: any = { baja: '#16a34a', media: '#d97706', alta: '#dc2626' };
    return colores[prioridad] || '#6b7280';
  }

  getColorEstado(estado: string): string {
    const colores: any = {
      pendiente: '#d97706',
      asignada: '#16a34a',
      en_camino: '#2563eb',
      atendiendo: '#d97706',
      finalizada: '#16a34a',
      cancelada: '#dc2626'
    };
    return colores[estado] || '#6b7280';
  }

  getColorCotizacion(estado: string): string {
    const colores: any = {
      solicitada: '#d97706',
      enviada: '#2563eb',
      aceptada: '#16a34a',
      rechazada: '#dc2626'
    };
    return colores[estado] || '#6b7280';
  }
}