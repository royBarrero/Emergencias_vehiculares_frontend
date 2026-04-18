import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  correo: string = '';
  contrasena: string = '';
  error: string = '';
  cargando: boolean = false;
  mostrarPassword: boolean = false;

  constructor(private api: ApiService, private router: Router) {}

  togglePassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  login() {
  if (!this.correo || !this.contrasena) {
    this.error = 'Por favor completa todos los campos';
    return;
  }

  this.cargando = true;
  this.error = '';

  this.api.login({ correo: this.correo, contrasena: this.contrasena }).subscribe({
    next: (respuesta: any) => {
      localStorage.setItem('token', respuesta.access_token);
      localStorage.setItem('usuario', JSON.stringify(respuesta));
      this.cargando = false;

      // Redirigir según el rol
      switch(respuesta.id_rol) {
        case 4:
          this.router.navigate(['/dashboard']);
          break;
        case 2:
          this.router.navigate(['/taller-dashboard']);
          break;
        case 3:
          this.router.navigate(['/tecnico-dashboard']);
          break;
        default:
          this.router.navigate(['/dashboard']);
      }
    },
    error: () => {
      this.error = 'Correo o contraseña incorrectos';
      this.cargando = false;
    }
  });
}
}