import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-tenant-inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tenant-inicio.component.html',
  styleUrl: './tenant-inicio.component.css'
})
export class TenantInicioComponent implements OnInit {
  tenant: any;
  talleres: any[] = [];
  totalTecnicos: number = 0;
  totalEmergencias: number = 0;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
  const data = localStorage.getItem('tenant');
  if (data) {
    this.tenant = JSON.parse(data);
    this.cargarTalleres();
  } else {
    // Esperar a que el layout guarde el tenant
    const intervalo = setInterval(() => {
      const retry = localStorage.getItem('tenant');
      if (retry) {
        clearInterval(intervalo);
        this.tenant = JSON.parse(retry);
        this.ngZone.run(() => {
          this.cargarTalleres();
          this.cdr.detectChanges();
        });
      }
    }, 300);
  }
}

  cargarTalleres() {
    this.api.obtenerTalleresPorTenant(this.tenant.id_tenant).subscribe({
      next: (data: any) => {
        this.ngZone.run(() => {
          this.talleres = data;
          this.calcularTotales();
          this.cdr.detectChanges();
        });
      }
    });
  }

  calcularTotales() {
    this.talleres.forEach(t => {
      this.api.obtenerTecnicosTaller(t.id_taller).subscribe({
        next: (tecnicos: any) => {
          this.ngZone.run(() => {
            this.totalTecnicos += tecnicos.length;
            this.cdr.detectChanges();
          });
        }
      });
      this.api.obtenerEmergenciasTaller(t.id_taller).subscribe({
        next: (emergencias: any) => {
          this.ngZone.run(() => {
            this.totalEmergencias += emergencias.length;
            this.cdr.detectChanges();
          });
        }
      });
    });
  }
}