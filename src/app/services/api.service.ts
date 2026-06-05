import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
@Injectable({
  providedIn: 'root'
})
export class ApiService {

 private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // AUTH
  login(datos: any) {
    return this.http.post(`${this.apiUrl}/auth/login`, datos);
  }

  // TALLERES
 registrarTaller(datos: any) {
  return this.http.post(`${this.apiUrl}/talleres/`, datos);
}

obtenerTalleres() {
  return this.http.get(`${this.apiUrl}/talleres/`, this.getAuthHeaders());
}

obtenerTaller(id: number) {
  return this.http.get(`${this.apiUrl}/talleres/${id}`, this.getAuthHeaders());
}

actualizarTaller(id: number, datos: any) {
  return this.http.put(`${this.apiUrl}/talleres/${id}`, datos);
}
obtenerTallerPorUsuario(id_usuario: number) {
  return this.http.get(`${this.apiUrl}/talleres/por-usuario/${id_usuario}`);
}
  // TECNICOS
  registrarTecnico(datos: any) {
  return this.http.post(`${this.apiUrl}/tecnicos/`, datos);
}
 obtenerTecnicosTaller(id_taller: number) {
  return this.http.get(`${this.apiUrl}/tecnicos/taller/${id_taller}`);
}
  actualizarTecnico(id: number, datos: any) {
    return this.http.put(`${this.apiUrl}/tecnicos/${id}`, datos);
  }

  cambiarDisponibilidad(id: number, datos: any) {
    return this.http.patch(`${this.apiUrl}/tecnicos/${id}/disponibilidad`, datos);
  }
listarTodosTecnicos() {
  return this.http.get(`${this.apiUrl}/tecnicos/`);
}
eliminarTecnico(id: number) {
  return this.http.delete(`${this.apiUrl}/tecnicos/${id}`);
}
  // ROLES
  obtenerRoles() {
    return this.http.get(`${this.apiUrl}/roles`);
  }
  crearRol(datos: any) {
  return this.http.post(`${this.apiUrl}/roles/`, datos);
}

actualizarRol(id: number, datos: any) {
  return this.http.put(`${this.apiUrl}/roles/${id}`, datos);
}

asignarRol(datos: any) {
  return this.http.post(`${this.apiUrl}/roles/asignar`, datos);
}
// CONDUCTORES
  actualizarConductor(id: number, datos: any) {
  return this.http.put(`${this.apiUrl}/conductores/${id}`, datos);
}
  listarConductores() {
  return this.http.get(`${this.apiUrl}/conductores/`);
}

eliminarConductor(id: number) {
  return this.http.delete(`${this.apiUrl}/conductores/${id}`);
}
obtenerEstadisticas() {
  return this.http.get(`${this.apiUrl}/estadisticas`);
}
// EMERGENCIAS
getAuthHeaders() {
  const usuario = localStorage.getItem('usuario');
  const token = localStorage.getItem('token');
  console.log('TOKEN ANGULAR:', token); // agregar para debug
  return { headers: { Authorization: `Bearer ${token}` } };
}
obtenerEmergenciasPendientes() {
  return this.http.get(`${this.apiUrl}/emergencias/pendientes`, this.getAuthHeaders());
}

obtenerEmergenciasTaller(id_taller: number) {
  return this.http.get(`${this.apiUrl}/emergencias/taller/${id_taller}`, this.getAuthHeaders());
}

obtenerEmergencia(id: number) {
  return this.http.get(`${this.apiUrl}/emergencias/${id}`, this.getAuthHeaders());
}

actualizarEstadoEmergencia(id: number, datos: any) {
  return this.http.patch(`${this.apiUrl}/emergencias/${id}`, datos, this.getAuthHeaders());
}
// SERVICIOS
obtenerServiciosTaller(id_taller: number) {
  return this.http.get(`${this.apiUrl}/talleres/${id_taller}`);
}

agregarServicio(id_taller: number, datos: any) {
  return this.http.post(`${this.apiUrl}/talleres/${id_taller}/servicios`, datos);
}

eliminarServicio(id_taller: number, id_servicio: number) {
  return this.http.delete(`${this.apiUrl}/talleres/${id_taller}/servicios/${id_servicio}`);
}
obtenerTalleresCercanos(id_emergencia: number) {
  return this.http.get(`${this.apiUrl}/talleres/cercanos/${id_emergencia}`);
}
registrarPago(datos: any) {
  const token = localStorage.getItem('token');
  return this.http.post(`${this.apiUrl}/pagos/`, datos, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

obtenerPagoEmergencia(id_emergencia: number) {
  const token = localStorage.getItem('token');
  return this.http.get(`${this.apiUrl}/pagos/emergencia/${id_emergencia}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}
// TENANTS
listarTenants() {
  return this.http.get(`${this.apiUrl}/tenants/`, this.getAuthHeaders());
}

obtenerTenant(id: number) {
  return this.http.get(`${this.apiUrl}/tenants/${id}`, this.getAuthHeaders());
}

crearTenant(datos: any) {
  return this.http.post(`${this.apiUrl}/tenants/`, datos, this.getAuthHeaders());
}

actualizarTenant(id: number, datos: any) {
  return this.http.patch(`${this.apiUrl}/tenants/${id}`, datos, this.getAuthHeaders());
}

eliminarTenant(id: number) {
  return this.http.delete(`${this.apiUrl}/tenants/${id}`, this.getAuthHeaders());
}
obtenerTenantPorAdmin(id_usuario: number) {
  return this.http.get(`${this.apiUrl}/tenants/por-admin/${id_usuario}`, this.getAuthHeaders());
}
obtenerTalleresPorTenant(id_tenant: number) {
  return this.http.get(`${this.apiUrl}/tenants/${id_tenant}/talleres`, this.getAuthHeaders());
}
obtenerBitacoraTenant(id_tenant: number) {
  return this.http.get(`${this.apiUrl}/bitacora/tenant/${id_tenant}`, this.getAuthHeaders());
}
obtenerBitacoraCompleta() {
  return this.http.get(`${this.apiUrl}/bitacora/`, this.getAuthHeaders());
}
detalleTallerTenant(id_tenant: number, id_taller: number) {
  return this.http.get(`${this.apiUrl}/tenants/${id_tenant}/talleres/${id_taller}/detalle`, this.getAuthHeaders());
}

editarTallerTenant(id_tenant: number, id_taller: number, datos: any) {
  return this.http.patch(`${this.apiUrl}/tenants/${id_tenant}/talleres/${id_taller}`, datos, this.getAuthHeaders());
}

crearTallerTenant(id_tenant: number, datos: any) {
  return this.http.post(`${this.apiUrl}/tenants/${id_tenant}/talleres`, datos, this.getAuthHeaders());
}
private wsSubjects: Map<number, WebSocketSubject<any>> = new Map();

conectarEmergenciaWS(id_emergencia: number): WebSocketSubject<any> {
  if (!this.wsSubjects.has(id_emergencia)) {
    const wsUrl = this.apiUrl.replace('http', 'ws') + `/ws/emergencia/${id_emergencia}`;
    const subject = webSocket({
      url: wsUrl,
      openObserver: {
        next: () => console.log(`WS conectado: emergencia ${id_emergencia}`)
      },
      closeObserver: {
        next: () => {
          console.log(`WS desconectado: emergencia ${id_emergencia}`);
          this.wsSubjects.delete(id_emergencia);
        }
      }
    });
    this.wsSubjects.set(id_emergencia, subject);
  }
  return this.wsSubjects.get(id_emergencia)!;
}

desconectarEmergenciaWS(id_emergencia: number) {
  if (this.wsSubjects.has(id_emergencia)) {
    this.wsSubjects.get(id_emergencia)!.complete();
    this.wsSubjects.delete(id_emergencia);
  }
}
conectarTallerWS(id_taller: number): WebSocketSubject<any> {
  const wsUrl = this.apiUrl.replace('http', 'ws') + `/ws/taller/${id_taller}`;
  return webSocket({
    url: wsUrl,
    openObserver: {
      next: () => console.log(`WS taller ${id_taller} conectado`)
    }
  });
}
}

