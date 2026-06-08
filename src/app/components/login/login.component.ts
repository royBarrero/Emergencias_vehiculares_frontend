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

  constructor(private api: ApiService, private router: Router) { }

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
        switch (respuesta.id_rol) {
          case 5:
            this.router.navigate(['/tenant-admin']);
            break;
          case 4:
            this.router.navigate(['/admin']);
            break;
        case 2:
  this.api.obtenerTallerPorUsuario(respuesta.id_usuario).subscribe({
    next: (taller: any) => {
      localStorage.setItem('taller', JSON.stringify(taller));
      this.router.navigate(['/taller']);

      try {
        const OneSignalDeferred = (window as any).OneSignalDeferred || [];
       OneSignalDeferred.push(async (OneSignal: any) => {
  try {
    // Escuchar cuando el ID esté disponible
    OneSignal.User.pushSubscription.optIn();
    
    setTimeout(() => {
      const token = OneSignal.User?.pushSubscription?.token;
      const id = OneSignal.User?.pushSubscription?.id;
      console.log('token:', token, 'id:', id);
      
      const userId = id || token;
      if (userId && taller.id_taller) {
        this.api.actualizarOnesignalId(taller.id_taller, userId).subscribe({
          next: () => console.log('✅ OneSignal ID guardado:', userId),
        });
      }
    }, 5000);
  } catch(e) {
    console.error('Error OneSignal:', e);
  }
});
      } catch (e) {
        console.error('Error OneSignal:', e);
      }
    }
  });
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