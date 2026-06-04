import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-tenant-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tenant-reportes.component.html',
  styleUrl: './tenant-reportes.component.css'
})
export class TenantReportesComponent implements OnInit {
  tenant: any;
  talleres: any[] = [];
  reportes: any[] = [];
  cargando: boolean = false;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    const data = localStorage.getItem('tenant');
    if (data) {
      this.tenant = JSON.parse(data);
      this.cargarReportes();
    }
  }

  cargarReportes() {
    this.cargando = true;
    this.api.obtenerTalleresPorTenant(this.tenant.id_tenant).subscribe({
      next: (talleres: any) => {
        this.talleres = talleres;
        talleres.forEach((t: any) => {
          this.api.obtenerEmergenciasTaller(t.id_taller).subscribe({
            next: (emergencias: any) => {
              this.ngZone.run(() => {
                const finalizadas = emergencias.filter((e: any) => e.estado === 'finalizada');
                const existente = this.reportes.find(r => r.id_taller === t.id_taller);
                if (!existente) {
                  this.reportes.push({
                    id_taller: t.id_taller,
                    nombre_taller: t.nombre_taller,
                    total_emergencias: emergencias.length,
                    finalizadas: finalizadas.length,
                    calificacion: t.calificacion_promedio
                  });
                }
                this.cargando = false;
                this.cdr.detectChanges();
              });
            }
          });
        });
        if (talleres.length === 0) this.cargando = false;
      }
    });
  }

  getTotalEmergencias(): number {
    return this.reportes.reduce((sum, r) => sum + r.total_emergencias, 0);
  }

  getTotalFinalizadas(): number {
    return this.reportes.reduce((sum, r) => sum + r.finalizadas, 0);
  }
}