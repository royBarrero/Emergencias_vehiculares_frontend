import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-admin-bitacora',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-bitacora.component.html',
  styleUrl: './admin-bitacora.component.css'
})
export class AdminBitacoraComponent implements OnInit {
  registros: any[] = [];
  cargando = false;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.cargarBitacora();
  }

  cargarBitacora() {
    this.cargando = true;
    this.api.obtenerBitacoraCompleta().subscribe({
      next: (data: any) => {
  console.log('datos bitacora:', data);
  this.registros = data;
  this.cargando = false;
},
      error: (err) => {
        console.error('Error:', err);
        this.cargando = false;
      }
    });
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