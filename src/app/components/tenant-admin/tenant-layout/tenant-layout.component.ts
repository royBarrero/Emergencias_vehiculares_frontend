import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-tenant-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './tenant-layout.component.html',
  styleUrl: './tenant-layout.component.css'
})
export class TenantLayoutComponent implements OnInit {
  usuario: any;
  tenant: any;

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
  }

  ngOnInit() {
    this.cargarTenant();
  }

  cargarTenant() {
    this.api.obtenerTenantPorAdmin(this.usuario.id_usuario).subscribe({
      next: (data: any) => {
        this.tenant = data;
        localStorage.setItem('tenant', JSON.stringify(data));
      },
      error: () => {}
    });
  }

  cerrarSesion() {
  this.api.logout().subscribe({
    next: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      localStorage.removeItem('tenant');
      this.router.navigate(['/login']);
    },
    error: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      localStorage.removeItem('tenant');
      this.router.navigate(['/login']);
    }
  });
}
}