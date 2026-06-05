import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-admin-bitacora',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-bitacora.component.html',
  styleUrl: './admin-bitacora.component.css'
})
export class AdminBitacoraComponent implements OnInit {
  registros: any[] = [];
  registrosFiltrados: any[] = [];
  registrosPagina: any[] = [];
  cargando = false;

  // Filtros
  fechaInicio: string = '';
  fechaFin: string = '';
  accionFiltro: string = '';

  // Paginación
  paginaActual: number = 1;
  registrosPorPagina: number = 20;
  totalPaginas: number = 1;

  acciones = ['LOGIN', 'LOGOUT', 'CREAR', 'EDITAR', 'ELIMINAR'];

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.cargarBitacora();
  }

  cargarBitacora() {
    this.cargando = true;
    this.api.obtenerBitacoraCompleta().subscribe({
      next: (data: any) => {
        this.ngZone.run(() => {
          this.registros = data;
          this.aplicarFiltros();
          this.cargando = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          console.error('Error:', err);
          this.cargando = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  aplicarFiltros() {
    let resultado = [...this.registros];

    if (this.fechaInicio) {
      const inicio = new Date(this.fechaInicio);
      resultado = resultado.filter(r => new Date(r.fecha) >= inicio);
    }
    if (this.fechaFin) {
      const fin = new Date(this.fechaFin);
      fin.setHours(23, 59, 59);
      resultado = resultado.filter(r => new Date(r.fecha) <= fin);
    }
    if (this.accionFiltro) {
      resultado = resultado.filter(r => r.accion === this.accionFiltro);
    }

    this.registrosFiltrados = resultado;
    this.paginaActual = 1;
    this.totalPaginas = Math.ceil(resultado.length / this.registrosPorPagina);
    this.actualizarPagina();
  }

  actualizarPagina() {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    this.registrosPagina = this.registrosFiltrados.slice(inicio, inicio + this.registrosPorPagina);
  }

  cambiarPagina(pagina: number) {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.actualizarPagina();
  }

  limpiarFiltros() {
    this.fechaInicio = '';
    this.fechaFin = '';
    this.accionFiltro = '';
    this.aplicarFiltros();
  }

  getPaginas(): number[] {
    const paginas = [];
    const inicio = Math.max(1, this.paginaActual - 2);
    const fin = Math.min(this.totalPaginas, this.paginaActual + 2);
    for (let i = inicio; i <= fin; i++) paginas.push(i);
    return paginas;
  }

  getBadgeClass(accion: string): string {
    const clases: any = {
      'LOGIN':    'bg-green-100 text-green-700',
      'LOGOUT':   'bg-gray-100 text-gray-700',
      'CREAR':    'bg-blue-100 text-blue-700',
      'EDITAR':   'bg-yellow-100 text-yellow-700',
      'ELIMINAR': 'bg-red-100 text-red-700'
    };
    return clases[accion] || 'bg-gray-100 text-gray-700';
  }
}