import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() usuario: any;
  @Input() menuItems: { label: string, icon: string, seccion: string }[] = [];
  @Input() seccionActiva: string = '';
  @Output() seccionCambiada = new EventEmitter<string>();
  @Output() cerrarSesionEvt = new EventEmitter<void>();

  cambiarSeccion(seccion: string) {
    this.seccionCambiada.emit(seccion);
  }

  cerrarSesion() {
    this.cerrarSesionEvt.emit();
  }
}