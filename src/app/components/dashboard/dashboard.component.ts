import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  usuario: any;
  menuAbierto: boolean = false;
  estadisticas = {
    talleres: 0,
    conductores: 0,
    tecnicos: 0,
    roles: 0
  };

  constructor(
    private router: Router,
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    const data = localStorage.getItem('usuario');
    if (data) {
      this.usuario = JSON.parse(data);
    } else {
      this.router.navigate(['/login']);
    }
  }

  ngOnInit() {
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    this.ngZone.run(() => {
      this.api.obtenerEstadisticas().subscribe({
        next: (data: any) => {
          this.estadisticas = data;
          this.cdr.detectChanges();
        },
        error: () => {}
      });
    });
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}