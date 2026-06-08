import { Component, OnInit , OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { OfflineService } from '../../../services/offline.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-taller-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './taller-layout.component.html',
  styleUrl: './taller-layout.component.css'
})
export class TallerLayoutComponent implements OnInit, OnDestroy {
  usuario: any;
  taller: any;
  estaOnline: boolean = true;
private conexionSub: Subscription | null = null;

  constructor(
  private router: Router,
  private api: ApiService,
 private offlineService: OfflineService
) {
  const data = localStorage.getItem('usuario');
  if (data) {
    this.usuario = JSON.parse(data);
  } else {
    this.router.navigate(['/login']);
  }

  // Leer taller desde localStorage para el primer render sincrónico
  const tallerData = localStorage.getItem('taller');
  if (tallerData) {
    this.taller = JSON.parse(tallerData);
  }
}
  ngOnInit() {
    this.cargarTaller();
    this.conexionSub = this.offlineService.hayConexion().subscribe(online => {
  this.estaOnline = online;
});
  }
ngOnDestroy() {
  this.conexionSub?.unsubscribe();
}
  cargarTaller() {
  this.api.obtenerTallerPorUsuario(this.usuario.id_usuario).subscribe({
    next: (data: any) => {
      this.taller = data;
      localStorage.setItem('taller', JSON.stringify(data));
    }
  });
}

  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('taller');
    this.router.navigate(['/login']);
  }
  
}