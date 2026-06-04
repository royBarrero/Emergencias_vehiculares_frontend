import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent {
  @Input() titulo: string = '';
  @Input() usuario: any;
  @Output() cerrarSesionEvt = new EventEmitter<void>();

  cerrarSesion() {
    this.cerrarSesionEvt.emit();
  }
}