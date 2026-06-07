import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-tenant-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tenant-reportes.component.html',
  styleUrl: './tenant-reportes.component.css'
})
export class TenantReportesComponent implements OnInit {
  tenant: any;
  kpis: any = null;
  cargando = false;
  fechaInicio: string = '';
  fechaFin: string = '';
  sla: any = null;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    const data = localStorage.getItem('tenant');
    if (data) {
      this.tenant = JSON.parse(data);
      this.cargarKpis();
    }
  }

  cargarKpis() {
    this.cargando = true;
    const params: any = {};
    if (this.fechaInicio) params.fecha_inicio = new Date(this.fechaInicio).toISOString();
    if (this.fechaFin) params.fecha_fin = new Date(this.fechaFin).toISOString();

    this.api.obtenerKpisTenant(this.tenant.id_tenant, params).subscribe({
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

  aplicarFiltros() { 
    this.cargarKpis(); 
    this.cargarSla();
  }

  limpiarFiltros() {
    this.fechaInicio = '';
    this.fechaFin = '';
    this.cargarKpis();
    
  }
cargarSla() {
  const params: any = {};
  if (this.fechaInicio) params.fecha_inicio = new Date(this.fechaInicio).toISOString();
  if (this.fechaFin) params.fecha_fin = new Date(this.fechaFin).toISOString();

  this.api.obtenerSlaTenant(this.tenant.id_tenant, params).subscribe({
    next: (data: any) => {
      this.ngZone.run(() => {
        this.sla = data;
        this.cdr.detectChanges();
      });
    }
  });
}
  getBarWidth(valor: number): string {
    if (!this.kpis?.por_taller?.length) return '0%';
    const max = Math.max(...this.kpis.por_taller.map((t: any) => t.total));
    return max > 0 ? `${(valor / max) * 100}%` : '0%';
  }

  getBarWidthTipo(valor: number): string {
    if (!this.kpis?.incidentes_por_tipo?.length) return '0%';
    const max = Math.max(...this.kpis.incidentes_por_tipo.map((t: any) => t.total));
    return max > 0 ? `${(valor / max) * 100}%` : '0%';
  }
  exportarPDF() {
  if (!this.kpis) return;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setTextColor(44, 62, 80);
  doc.text(`Reporte KPIs - ${this.tenant?.nombre || 'Mi Red'}`, 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generado: ${new Date().toLocaleDateString('es-BO')}`, 14, 28);

  autoTable(doc, {
    startY: 35,
    head: [['Indicador', 'Valor']],
    body: [
      ['Total Emergencias', this.kpis.total_emergencias],
      ['Finalizadas', this.kpis.finalizadas],
      ['Canceladas', this.kpis.canceladas],
      ['Tasa Completado', `${this.kpis.tasa_completado_pct}%`],
      ['Ingresos Red', `Bs ${this.kpis.ingresos_total}`],
      ['Comisión Plataforma', `Bs ${this.kpis.comision_total}`],
    ],
    headStyles: { fillColor: [44, 62, 80] },
    alternateRowStyles: { fillColor: [245, 245, 245] }
  });

  if (this.kpis.por_taller?.length) {
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.text('Rendimiento por Taller', 14, finalY);
    autoTable(doc, {
      startY: finalY + 5,
      head: [['Taller', 'Total', 'Finalizadas']],
      body: this.kpis.por_taller.map((t: any) => [t.nombre_taller, t.total, t.finalizadas]),
      headStyles: { fillColor: [44, 62, 80] }
    });
  }

  doc.save(`kpis-${this.tenant?.nombre}-${new Date().toISOString().split('T')[0]}.pdf`);
}

exportarExcel() {
  if (!this.kpis) return;
  const wb = XLSX.utils.book_new();

  const metricas = [
    ['Indicador', 'Valor'],
    ['Total Emergencias', this.kpis.total_emergencias],
    ['Finalizadas', this.kpis.finalizadas],
    ['Canceladas', this.kpis.canceladas],
    ['Tasa Completado (%)', this.kpis.tasa_completado_pct],
    ['Ingresos Red (Bs)', this.kpis.ingresos_total],
    ['Comisión Plataforma (Bs)', this.kpis.comision_total],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(metricas), 'KPIs');

  if (this.kpis.por_taller?.length) {
    const talleres = [['Taller', 'Total', 'Finalizadas'], ...this.kpis.por_taller.map((t: any) => [t.nombre_taller, t.total, t.finalizadas])];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(talleres), 'Por Taller');
  }

  if (this.kpis.incidentes_por_tipo?.length) {
    const incidentes = [['Tipo', 'Total'], ...this.kpis.incidentes_por_tipo.map((i: any) => [i.tipo, i.total])];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(incidentes), 'Incidentes');
  }

  XLSX.writeFile(wb, `kpis-${this.tenant?.nombre}-${new Date().toISOString().split('T')[0]}.xlsx`);
}
exportarCSV() {
  if (!this.kpis) return;

  let csv = 'Indicador,Valor\n';
  csv += `Total Emergencias,${this.kpis.total_emergencias}\n`;
  csv += `Finalizadas,${this.kpis.finalizadas}\n`;
  csv += `Canceladas,${this.kpis.canceladas}\n`;
  csv += `Tasa Completado (%),${this.kpis.tasa_completado_pct}\n`;
  csv += `Ingresos Red (Bs),${this.kpis.ingresos_total}\n`;
  csv += `Comisión Plataforma (Bs),${this.kpis.comision_total}\n`;

  if (this.kpis.por_taller?.length) {
    csv += '\nTaller,Total,Finalizadas\n';
    this.kpis.por_taller.forEach((t: any) => {
      csv += `${t.nombre_taller},${t.total},${t.finalizadas}\n`;
    });
  }

  if (this.kpis.incidentes_por_tipo?.length) {
    csv += '\nTipo de Incidente,Total\n';
    this.kpis.incidentes_por_tipo.forEach((i: any) => {
      csv += `${i.tipo},${i.total}\n`;
    });
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kpis-${this.tenant?.nombre}-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
}