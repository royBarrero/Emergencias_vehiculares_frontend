import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-tenant-talleres',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tenant-talleres.component.html',
  styleUrl: './tenant-talleres.component.css'
})
export class TenantTalleresComponent implements OnInit {
  tenant: any;
  talleres: any[] = [];
  tallerSeleccionado: any = null;
  tecnicos: any[] = [];
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
      this.cargarTalleres();
    }
  }

  cargarTalleres() {
    this.cargando = true;
    this.api.obtenerTalleresPorTenant(this.tenant.id_tenant).subscribe({
      next: (data: any) => {
        this.ngZone.run(() => {
          this.talleres = data;
          this.cargando = false;
          this.cdr.detectChanges();
        });
      },
      error: () => { this.cargando = false; }
    });
  }

  verDetalle(taller: any) {
    this.tallerSeleccionado = taller;
    this.api.obtenerTecnicosTaller(taller.id_taller).subscribe({
      next: (data: any) => {
        this.ngZone.run(() => {
          this.tecnicos = data;
          this.cdr.detectChanges();
        });
      }
    });
  }
}