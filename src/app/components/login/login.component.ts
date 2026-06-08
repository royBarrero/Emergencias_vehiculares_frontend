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

      // Esperar un momento para que OneSignal esté listo
      setTimeout(() => {
        try {
          const OneSignalDeferred = (window as any).OneSignalDeferred || [];
          OneSignalDeferred.push(async (OneSignal: any) => {
            // Esperar a que la suscripción esté activa
            const subscription = OneSignal.User.pushSubscription;
            const userId = subscription?.id;
            console.log('OneSignal subscription ID:', userId);

            if (userId && taller.id_taller) {
              this.api.actualizarOnesignalId(taller.id_taller, userId).subscribe({
                next: () => console.log('✅ OneSignal ID guardado:', userId),
                error: (e) => console.error('❌ Error guardando OneSignal:', e)
              });
            } else {
              console.warn('⚠️ OneSignal ID no disponible aún, id:', userId);
            }
          });
        } catch (e) {
          console.error('Error OneSignal:', e);
        }
      }, 3000); // 3 segundos para que OneSignal inicialice
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