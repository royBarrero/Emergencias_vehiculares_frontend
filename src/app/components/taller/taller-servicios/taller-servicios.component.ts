import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-taller-servicios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './taller-servicios.component.html',
  styleUrl: './taller-servicios.component.css'
})
export class TallerServiciosComponent implements OnInit {
  taller: any;
  servicios: any[] = [];
  serviciosPredefinidos = [
    'Mecánica general', 'Chaperio y pintura', 'Electricidad automotriz',
    'Llantas y alineación', 'Frenos', 'Transmisión y caja',
    'Motor', 'Aire acondicionado', 'Soldadura', 'Grúa y remolque'
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
      this.servicios = this.taller.servicios || [];
    }
  }

  tieneServicio(nombre: string): boolean {
    return this.servicios.some(s => s.nombre_servicio === nombre);
  }

  toggleServicio(nombre: string) {
    if (this.tieneServicio(nombre)) {
      const servicio = this.servicios.find(s => s.nombre_servicio === nombre);
      if (!servicio) return;
      this.api.eliminarServicio(this.taller.id_taller, servicio.id_servicio).subscribe({
        next: () => {
          this.ngZone.run(() => {
            this.servicios = this.servicios.filter(s => s.id_servicio !== servicio.id_servicio);
            this.cdr.detectChanges();
          });
        }
      });
    } else {
      this.api.agregarServicio(this.taller.id_taller, {
        nombre_servicio: nombre,
        descripcion: '',
        disponible: true
      }).subscribe({
        next: (data: any) => {
          this.ngZone.run(() => {
            this.servicios.push(data);
            this.cdr.detectChanges();
          });
        }
      });
    }
  }
}