import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

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
  return this.http.get(`${this.apiUrl}/talleres/`);
}

obtenerTaller(id: number) {
  return this.http.get(`${this.apiUrl}/talleres/${id}`);
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
  const token = localStorage.getItem('token');
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
}

