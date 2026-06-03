import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-taller-pagos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './taller-pagos.component.html',
  styleUrl: './taller-pagos.component.css'
})
export class TallerPagosComponent implements OnInit {
  taller: any;
  pagosHistorial: any[] = [];
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
      this.cargarPagos();
    }
  }

  cargarPagos() {
    this.cargando = true;
    this.api.obtenerEmergenciasTaller(this.taller.id_taller).subscribe({
      next: (emergencias: any) => {
        const finalizadas = emergencias.filter((e: any) => e.estado === 'finalizada');
        const pagos: any[] = [];
        finalizadas.forEach((e: any) => {
          this.api.obtenerPagoEmergencia(e.id_emergencia).subscribe({
            next: (pago: any) => {
              this.ngZone.run(() => {
                if (pago) {
                  pagos.push({
                    ...pago,
                    tipo_incidente: e.tipo_incidente,
                    nombre_tecnico: e.nombre_tecnico,
                    fecha: e.created_at
                  });
                  this.pagosHistorial = [...pagos];
                  this.cargando = false;
                  this.cdr.detectChanges();
                }
              });
            }
          });
        });
        if (finalizadas.length === 0) this.cargando = false;
      }
    });
  }

  getTotalBruto(): number {
    return Math.round(this.pagosHistorial.reduce((sum, p) => sum + p.monto_total, 0) * 100) / 100;
  }

  getTotalComision(): number {
    return Math.round(this.pagosHistorial.reduce((sum, p) => sum + p.comision, 0) * 100) / 100;
  }

  getTotalNeto(): number {
    return Math.round(this.pagosHistorial.reduce((sum, p) => sum + p.monto_neto, 0) * 100) / 100;
  }
}