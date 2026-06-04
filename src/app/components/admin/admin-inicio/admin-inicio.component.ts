import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-admin-inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-inicio.component.html',
  styleUrl: './admin-inicio.component.css'
})
export class AdminInicioComponent implements OnInit {
  estadisticas = { talleres: 0, conductores: 0, tecnicos: 0, roles: 0 };
  tenants: any[] = [];
  cargando = false;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.cargarEstadisticas();
    this.cargarTenants();
  }

  cargarEstadisticas() {
    this.api.obtenerEstadisticas().subscribe({
      next: (data: any) => {
        this.ngZone.run(() => {
          this.estadisticas = data;
          this.cdr.detectChanges();
        });
      }
    });
  }

  cargarTenants() {
    this.cargando = true;
    this.api.listarTenants().subscribe({
      next: (data: any) => {
        this.ngZone.run(() => {
          this.tenants = data;
          this.cargando = false;
          this.cdr.detectChanges();
        });
      },
      error: () => { this.cargando = false; }
    });
  }
}