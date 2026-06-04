import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-taller-inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './taller-inicio.component.html',
  styleUrl: './taller-inicio.component.css'
})
export class TallerInicioComponent implements OnInit {
  taller: any;
  tecnicos: any[] = [];
  servicios: any[] = [];
  solicitudesPendientes: number = 0;
  serviciosAtendidos: number = 0;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    const data = localStorage.getItem('taller');
    if (data) {
      this.taller = JSON.parse(data);
      this.servicios = this.taller.servicios || [];
      this.cargarTecnicos();
      this.cargarEstadisticas();
    }
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

  cargarEstadisticas() {
    this.api.obtenerEmergenciasTaller(this.taller.id_taller).subscribe({
      next: (data: any) => {
        this.ngZone.run(() => {
          this.serviciosAtendidos = data.filter((e: any) => e.estado === 'finalizada').length;
          this.cdr.detectChanges();
        });
      }
    });

    this.api.obtenerEmergenciasPendientes().subscribe({
      next: (data: any) => {
        this.ngZone.run(() => {
          this.solicitudesPendientes = data.length;
          this.cdr.detectChanges();
        });
      }
    });
  }
}