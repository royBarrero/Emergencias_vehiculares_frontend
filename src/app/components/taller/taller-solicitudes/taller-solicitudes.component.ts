import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-taller-solicitudes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './taller-solicitudes.component.html',
  styleUrl: './taller-solicitudes.component.css'
})
export class TallerSolicitudesComponent implements OnInit, OnDestroy {
  taller: any;
  emergenciasPendientes: any[] = [];
  emergenciasTaller: any[] = [];
  emergenciaSeleccionada: any = null;
  tecnicos: any[] = [];
  tabActiva: string = 'pendientes';
  cargando: boolean = false;
  idTecnicoSeleccionado: number | null = null;
  private intervalo: any;

  // Cotización
  cotizacionActual: any = null;
  mostrarFormCotizacion: boolean = false;
  enviandoCotizacion: boolean = false;
  tiempoEstimadoInput: string = '';
  enviandoTiempo: boolean = false;
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
  ) {}

  ngOnInit() {
    const data = localStorage.getItem('taller');
    if (data) {
      this.taller = JSON.parse(data);
      this.cargarEmergencias();
      this.cargarTecnicos();
      this.intervalo = setInterval(() => this.cargarEmergencias(), 15000);
    }
  }

  ngOnDestroy() {
    if (this.intervalo) clearInterval(this.intervalo);
  }

  cargarEmergencias() {
    this.api.obtenerEmergenciasPendientes().subscribe({
      next: (data: any) => {
        this.ngZone.run(() => {
          this.emergenciasPendientes = data;
          this.cdr.detectChanges();
        });
      }
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
          this.cotizacionActual = null;
          this.mostrarFormCotizacion = false;
          this.cargarCotizacion(data.id_emergencia);
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
          this.cdr.detectChanges();
        });
      },
      error: () => {
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

  enviarCotizacion() {
    if (!this.cotizacionActual || !this.formCotizacion.monto_estimado ||
        !this.formCotizacion.descripcion_servicio || !this.formCotizacion.tiempo_estimado) return;
    this.enviandoCotizacion = true;
    this.api.responderCotizacion(this.cotizacionActual.id_cotizacion, this.formCotizacion).subscribe({
      next: (data: any) => {
        this.ngZone.run(() => {
          this.cotizacionActual = data;
          this.mostrarFormCotizacion = false;
          this.enviandoCotizacion = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.enviandoCotizacion = false;
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

  cerrarDetalle() {
    this.emergenciaSeleccionada = null;
    this.cotizacionActual = null;
    this.mostrarFormCotizacion = false;
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
  actualizarTiempoEstimado() {
  if (!this.emergenciaSeleccionada || !this.tiempoEstimadoInput) return;
  this.enviandoTiempo = true;
  this.api.actualizarEstadoEmergencia(this.emergenciaSeleccionada.id_emergencia, {
    tiempo_estimado_reparacion: this.tiempoEstimadoInput
  }).subscribe({
    next: (data: any) => {
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
}