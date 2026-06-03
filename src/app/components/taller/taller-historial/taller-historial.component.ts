import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-taller-historial',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './taller-historial.component.html',
  styleUrl: './taller-historial.component.css',
  providers: []
})
export class TallerHistorialComponent implements OnInit {
  taller: any;
  historial: any[] = [];
  pagoSeleccionado: any = null;
  cargando: boolean = false;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    const data = localStorage.getItem('taller');
    if (data) {
      this.taller = JSON.parse(data);
      this.cargarHistorial();
    }
  }

  cargarHistorial() {
    this.cargando = true;
    this.api.obtenerEmergenciasTaller(this.taller.id_taller).subscribe({
      next: (data: any) => {
        this.ngZone.run(() => {
          this.historial = data.filter((e: any) => e.estado === 'finalizada');
          this.cargando = false;
          this.cdr.detectChanges();
        });
      },
      error: () => { this.cargando = false; }
    });
  }

  verPago(id_emergencia: number) {
    this.api.obtenerPagoEmergencia(id_emergencia).subscribe({
      next: (data: any) => {
        this.ngZone.run(() => {
          this.pagoSeleccionado = data;
          this.cdr.detectChanges();
        });
      },
      error: () => { this.pagoSeleccionado = null; }
    });
  }

  getColorPrioridad(prioridad: string): string {
    const colores: any = { baja: '#16a34a', media: '#d97706', alta: '#dc2626' };
    return colores[prioridad] || '#6b7280';
  }
}