import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { EmergenciasTallerComponent } from '../emergencias/emergencias-taller.component';

@Component({
  selector: 'app-taller-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule,EmergenciasTallerComponent],
  templateUrl: './taller-dashboard.component.html',
  styleUrl: './taller-dashboard.component.css'
  
})
export class TallerDashboardComponent implements OnInit {
  usuario: any;
  taller: any;
  tecnicos: any[] = [];
  menuAbierto: boolean = false;
  seccionActiva: string = 'inicio';

  constructor(
    private api: ApiService,
    private router: Router,
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
    this.cargarDatos();
  }

cargarDatos() {
  this.ngZone.run(() => {
    this.api.obtenerTallerPorUsuario(this.usuario.id_usuario).subscribe({
      next: (data: any) => {
        this.taller = data;
        this.cargarTecnicos(this.taller.id_taller);
        this.cdr.detectChanges();
      },
      error: () => {
        console.error('Error al cargar el taller');
      }
    });
  });
}
  cargarTecnicos(id_taller: number) {
    this.api.obtenerTecnicosTaller(id_taller).subscribe({
      next: (data: any) => {
        this.ngZone.run(() => {
          this.tecnicos = data;
          this.cdr.detectChanges();
        });
      },
      error: () => {}
    });
  }
 
  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  cambiarSeccion(seccion: string) {
    this.seccionActiva = seccion;
    this.menuAbierto = false;
  }
}