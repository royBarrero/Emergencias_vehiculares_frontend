import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-taller-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './taller-layout.component.html',
  styleUrl: './taller-layout.component.css'
})
export class TallerLayoutComponent implements OnInit {
  usuario: any;
  taller: any;

  constructor(
  private router: Router,
  private api: ApiService
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