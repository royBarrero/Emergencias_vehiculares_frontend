import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  correo: string = '';
  contrasena: string = '';
  error: string = '';
  cargando: boolean = false;

  constructor(private api: ApiService, private router: Router) {}

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
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = 'Correo o contraseña incorrectos';
        this.cargando = false;
      }
    });
  }
}