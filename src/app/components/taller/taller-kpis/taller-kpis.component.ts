import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-taller-kpis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './taller-kpis.component.html',
  styleUrl: './taller-kpis.component.css'
})
export class TallerKpisComponent implements OnInit {
  taller: any;
  kpis: any = null;
  cargando = false;
  fechaInicio: string = '';
  fechaFin: string = '';
  tipoIncidente: string = '';
  sla: any = null;

  tiposIncidente = [
    'Pinchazo', 'Falla de motor', 'Batería descargada',
    'Falla de frenos', 'Transmisión', 'Sobrecalentamiento', 'Accidente'
  ];

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

    ngOnInit() {
      const data = localStorage.getItem('taller');
      if (data) {
        this.taller = JSON.parse(data);
        this.cargarKpis();
      }
    }

  cargarKpis() {
    this.cargando = true;
    const params: any = {};
    if (this.fechaInicio) params.fecha_inicio = new Date(this.fechaInicio).toISOString();
    if (this.fechaFin) params.fecha_fin = new Date(this.fechaFin).toISOString();
    if (this.tipoIncidente) params.tipo_incidente = this.tipoIncidente;

    this.api.obtenerKpisTaller(this.taller.id_taller, params).subscribe({
      next: (data: any) => {
        this.ngZone.run(() => {
          this.kpis = data;
          this.cargarSla();
          this.cargando = false;
          this.cdr.detectChanges();
        });
      },
      error: () => { this.cargando = false; }
    });
    
  }
  cargarSla() {
  const params: any = {};
  if (this.fechaInicio) params.fecha_inicio = new Date(this.fechaInicio).toISOString();
  if (this.fechaFin) params.fecha_fin = new Date(this.fechaFin).toISOString();

  this.api.obtenerSlaTaller(this.taller.id_taller, params).subscribe({
    next: (data: any) => {
      this.ngZone.run(() => {
        this.sla = data;
        this.cdr.detectChanges();
      });
    }
  });
}

  aplicarFiltros() {
    this.cargarKpis();
    this.cargarSla();
  }

  limpiarFiltros() {
    this.fechaInicio = '';
    this.fechaFin = '';
    this.tipoIncidente = '';
    this.cargarKpis();
    this.cargarSla();
  }

  getBarWidth(valor: number): string {
    if (!this.kpis?.incidentes_por_tipo?.length) return '0%';
    const max = Math.max(...this.kpis.incidentes_por_tipo.map((i: any) => i.total));
    return max > 0 ? `${(valor / max) * 100}%` : '0%';
  }
  exportarPDF() {
  if (!this.kpis) return;
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.setTextColor(44, 62, 80);
  doc.text('Reporte KPIs - ' + (this.taller?.nombre_taller || 'Taller'), 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generado: ${new Date().toLocaleDateString('es-BO')}`, 14, 28);

  // Métricas principales
  autoTable(doc, {
    startY: 35,
    head: [['Indicador', 'Valor']],
    body: [
      ['Total Emergencias', this.kpis.total_emergencias],
      ['Finalizadas', this.kpis.finalizadas],
      ['Canceladas', this.kpis.canceladas],
      ['Tiempo Prom. Asignación', `${this.kpis.tiempo_promedio_asignacion_min} min`],
      ['Nivel SLA', `${this.kpis.nivel_sla_pct}%`],
      ['Ingresos Totales', `Bs ${this.kpis.ingresos_total}`],
      ['Comisión Plataforma', `Bs ${this.kpis.comision_total}`],
    ],
    headStyles: { fillColor: [44, 62, 80] },
    alternateRowStyles: { fillColor: [245, 245, 245] }
  });

  // Incidentes por tipo
  if (this.kpis.incidentes_por_tipo?.length) {
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.text('Incidentes por Tipo', 14, finalY);
    autoTable(doc, {
      startY: finalY + 5,
      head: [['Tipo', 'Total']],
      body: this.kpis.incidentes_por_tipo.map((i: any) => [i.tipo, i.total]),
      headStyles: { fillColor: [44, 62, 80] }
    });
  }

  // Técnicos
  if (this.kpis.tecnicos_eficientes?.length) {
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.text('Técnicos más Eficientes', 14, finalY);
    autoTable(doc, {
      startY: finalY + 5,
      head: [['#', 'Nombre', 'Emergencias Atendidas']],
      body: this.kpis.tecnicos_eficientes.map((t: any, i: number) => [i + 1, t.nombre, t.emergencias_atendidas]),
      headStyles: { fillColor: [44, 62, 80] }
    });
  }

  doc.save(`kpis-${this.taller?.nombre_taller}-${new Date().toISOString().split('T')[0]}.pdf`);
}

exportarExcel() {
  if (!this.kpis) return;

  const wb = XLSX.utils.book_new();

  // Hoja métricas
  const metricas = [
    ['Indicador', 'Valor'],
    ['Total Emergencias', this.kpis.total_emergencias],
    ['Finalizadas', this.kpis.finalizadas],
    ['Canceladas', this.kpis.canceladas],
    ['Tiempo Prom. Asignación (min)', this.kpis.tiempo_promedio_asignacion_min],
    ['Nivel SLA (%)', this.kpis.nivel_sla_pct],
    ['Ingresos Totales (Bs)', this.kpis.ingresos_total],
    ['Comisión Plataforma (Bs)', this.kpis.comision_total],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(metricas), 'KPIs');

  // Hoja incidentes
  if (this.kpis.incidentes_por_tipo?.length) {
    const incidentes = [['Tipo', 'Total'], ...this.kpis.incidentes_por_tipo.map((i: any) => [i.tipo, i.total])];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(incidentes), 'Incidentes');
  }

  // Hoja técnicos
  if (this.kpis.tecnicos_eficientes?.length) {
    const tecnicos = [['Nombre', 'Emergencias Atendidas'], ...this.kpis.tecnicos_eficientes.map((t: any) => [t.nombre, t.emergencias_atendidas])];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(tecnicos), 'Técnicos');
  }

  XLSX.writeFile(wb, `kpis-${this.taller?.nombre_taller}-${new Date().toISOString().split('T')[0]}.xlsx`);
}
}