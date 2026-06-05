import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-admin-mapa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-mapa.component.html',
  styleUrl: './admin-mapa.component.css'
})
export class AdminMapaComponent implements OnInit, AfterViewInit, OnDestroy {
  mapa: any;
  cargando = false;
  fechaInicio: string = '';
  fechaFin: string = '';
  tipoIncidente: string = '';
  totalEmergencias: number = 0;
  zonaCritica: string = 'Sin datos';
  talleresActivos: number = 0;

  tiposIncidente = [
    'Pinchazo', 'Falla de motor', 'Batería descargada',
    'Falla de frenos', 'Transmisión', 'Sobrecalentamiento', 'Accidente'
  ];

  private marcadores: any[] = [];

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.inicializarMapa();
      this.cargarDatos();
    }, 300);
  }

  ngOnDestroy() {
    if (this.mapa) this.mapa.remove();
  }

  inicializarMapa() {
    if (this.mapa) return;
    this.mapa = L.map('mapa-geo-admin').setView([-17.7833, -63.1821], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.mapa);
  }

  cargarDatos() {
    this.cargando = true;
    const params: any = {};
    if (this.fechaInicio) params.fecha_inicio = new Date(this.fechaInicio).toISOString();
    if (this.fechaFin) params.fecha_fin = new Date(this.fechaFin).toISOString();
    if (this.tipoIncidente) params.tipo_incidente = this.tipoIncidente;

    this.api.obtenerGeoAdmin(params).subscribe({
      next: (data: any) => {
        this.ngZone.run(() => {
          this.limpiarMarcadores();
          this.renderizarEmergencias(data.emergencias);
          this.renderizarTalleres(data.talleres);
          this.calcularResumen(data.emergencias, data.talleres);
          this.cargando = false;
          this.cdr.detectChanges();
        });
      },
      error: () => { this.cargando = false; }
    });
  }

  limpiarMarcadores() {
    this.marcadores.forEach(m => this.mapa.removeLayer(m));
    this.marcadores = [];
  }

  renderizarEmergencias(emergencias: any[]) {
    const zonas: any = {};
    emergencias.forEach(e => {
      const key = `${e.latitud.toFixed(2)},${e.longitud.toFixed(2)}`;
      if (!zonas[key]) zonas[key] = { lat: e.latitud, lng: e.longitud, count: 0, tipos: {} };
      zonas[key].count++;
      zonas[key].tipos[e.tipo_incidente] = (zonas[key].tipos[e.tipo_incidente] || 0) + 1;
    });

    Object.values(zonas).forEach((zona: any) => {
      const color = zona.count >= 10 ? '#dc2626' : zona.count >= 5 ? '#d97706' : '#16a34a';
      const radio = Math.min(10 + zona.count * 3, 40);

      const circulo = L.circleMarker([zona.lat, zona.lng], {
        radius: radio,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.7
      });

      const tiposHtml = Object.entries(zona.tipos)
        .map(([tipo, cnt]) => `<div>${tipo}: <b>${cnt}</b></div>`).join('');

      circulo.bindPopup(`
        <div style="min-width:150px">
          <b style="color:#2c3e50">${zona.count} incidentes</b>
          <hr style="margin:6px 0"/>
          ${tiposHtml}
        </div>
      `);

      circulo.addTo(this.mapa);
      this.marcadores.push(circulo);
    });
  }

  renderizarTalleres(talleres: any[]) {
    talleres.forEach(t => {
      const marker = L.marker([t.latitud, t.longitud]);
      marker.bindPopup(`
        <div style="min-width:150px;font-family:sans-serif">
          <b style="color:#1e40af;font-size:13px">🔧 ${t.nombre_taller}</b>
          <hr style="margin:6px 0;border-color:#e5e7eb"/>
          <div style="font-size:11px;color:#6b7280">Taller registrado</div>
        </div>
      `);
      marker.addTo(this.mapa);
      this.marcadores.push(marker);
    });
  }

  calcularResumen(emergencias: any[], talleres: any[]) {
    this.totalEmergencias = emergencias.length;
    this.talleresActivos = talleres.length;
    const zonas: any = {};
    emergencias.forEach(e => {
      const key = `${e.latitud.toFixed(2)},${e.longitud.toFixed(2)}`;
      zonas[key] = (zonas[key] || 0) + 1;
    });
    const maxZona = Object.entries(zonas).sort((a: any, b: any) => b[1] - a[1])[0];
    this.zonaCritica = maxZona ? `${maxZona[1]} incidentes` : 'Sin datos';
  }

  aplicarFiltros() { this.cargarDatos(); }

  limpiarFiltros() {
    this.fechaInicio = '';
    this.fechaFin = '';
    this.tipoIncidente = '';
    this.cargarDatos();
  }
}