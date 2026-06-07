import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = environment.apiUrl;
  private wsConnections: Map<number, WebSocket> = new Map();
  private wsTallerSocket: WebSocket | null = null;

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

  actualizarOnesignalId(id_taller: number, onesignal_id: string) {
    return this.http.patch(
      `${this.apiUrl}/talleres/${id_taller}/onesignal`,
      { onesignal_id },
      this.getAuthHeaders()
    );
  }

  // TECNICOS
  registrarTecnico(datos: any) {
    return this.http.post(`${this.apiUrl}/tecnicos/`, datos, this.getAuthHeaders());
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

  // COTIZACIONES
  obtenerCotizacionesTaller(id_taller: number) {
    return this.http.get(`${this.apiUrl}/cotizaciones/taller/${id_taller}`, this.getAuthHeaders());
  }

  obtenerCotizacionEmergencia(id_emergencia: number) {
    return this.http.get(`${this.apiUrl}/cotizaciones/emergencia/${id_emergencia}`, this.getAuthHeaders());
  }

  responderCotizacion(id_cotizacion: number, datos: any) {
    return this.http.put(`${this.apiUrl}/cotizaciones/${id_cotizacion}/responder`, datos, this.getAuthHeaders());
  }

  // KPIs
  obtenerKpisTaller(id_taller: number, params?: any) {
    let url = `${this.apiUrl}/kpis/taller/${id_taller}`;
    const p = new URLSearchParams();
    if (params?.fecha_inicio) p.append('fecha_inicio', params.fecha_inicio);
    if (params?.fecha_fin) p.append('fecha_fin', params.fecha_fin);
    if (params?.tipo_incidente) p.append('tipo_incidente', params.tipo_incidente);
    if (p.toString()) url += `?${p.toString()}`;
    return this.http.get(url, this.getAuthHeaders());
  }

  obtenerKpisAdmin(params?: any) {
    let url = `${this.apiUrl}/kpis/admin`;
    const p = new URLSearchParams();
    if (params?.fecha_inicio) p.append('fecha_inicio', params.fecha_inicio);
    if (params?.fecha_fin) p.append('fecha_fin', params.fecha_fin);
    if (p.toString()) url += `?${p.toString()}`;
    return this.http.get(url, this.getAuthHeaders());
  }

  obtenerKpisTenant(id_tenant: number, params?: any) {
    let url = `${this.apiUrl}/kpis/tenant/${id_tenant}`;
    const p = new URLSearchParams();
    if (params?.fecha_inicio) p.append('fecha_inicio', params.fecha_inicio);
    if (params?.fecha_fin) p.append('fecha_fin', params.fecha_fin);
    if (p.toString()) url += `?${p.toString()}`;
    return this.http.get(url, this.getAuthHeaders());
  }

  obtenerGeoTenant(id_tenant: number, params?: any) {
    let url = `${this.apiUrl}/kpis/geo/tenant/${id_tenant}`;
    const p = new URLSearchParams();
    if (params?.fecha_inicio) p.append('fecha_inicio', params.fecha_inicio);
    if (params?.fecha_fin) p.append('fecha_fin', params.fecha_fin);
    if (params?.tipo_incidente) p.append('tipo_incidente', params.tipo_incidente);
    if (p.toString()) url += `?${p.toString()}`;
    return this.http.get(url, this.getAuthHeaders());
  }

  obtenerGeoAdmin(params?: any) {
    let url = `${this.apiUrl}/kpis/geo/admin`;
    const p = new URLSearchParams();
    if (params?.fecha_inicio) p.append('fecha_inicio', params.fecha_inicio);
    if (params?.fecha_fin) p.append('fecha_fin', params.fecha_fin);
    if (params?.tipo_incidente) p.append('tipo_incidente', params.tipo_incidente);
    if (p.toString()) url += `?${p.toString()}`;
    return this.http.get(url, this.getAuthHeaders());
  }

  obtenerSlaTaller(id_taller: number, params?: any) {
    let url = `${this.apiUrl}/kpis/sla/taller/${id_taller}`;
    const p = new URLSearchParams();
    if (params?.fecha_inicio) p.append('fecha_inicio', params.fecha_inicio);
    if (params?.fecha_fin) p.append('fecha_fin', params.fecha_fin);
    if (p.toString()) url += `?${p.toString()}`;
    return this.http.get(url, this.getAuthHeaders());
  }

  obtenerSlaTenant(id_tenant: number, params?: any) {
    let url = `${this.apiUrl}/kpis/sla/tenant/${id_tenant}`;
    const p = new URLSearchParams();
    if (params?.fecha_inicio) p.append('fecha_inicio', params.fecha_inicio);
    if (params?.fecha_fin) p.append('fecha_fin', params.fecha_fin);
    if (p.toString()) url += `?${p.toString()}`;
    return this.http.get(url, this.getAuthHeaders());
  }

  obtenerSlaAdmin(params?: any) {
    let url = `${this.apiUrl}/kpis/sla/admin`;
    const p = new URLSearchParams();
    if (params?.fecha_inicio) p.append('fecha_inicio', params.fecha_inicio);
    if (params?.fecha_fin) p.append('fecha_fin', params.fecha_fin);
    if (p.toString()) url += `?${p.toString()}`;
    return this.http.get(url, this.getAuthHeaders());
  }

  // WEBSOCKETS
  conectarEmergenciaWS(id_emergencia: number): Observable<any> {
    return new Observable(observer => {
      const wsUrl = `ws://localhost:8000/ws/emergencia/${id_emergencia}`;
      const ws = new WebSocket(wsUrl);
      this.wsConnections.set(id_emergencia, ws);
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          observer.next(data);
        } catch (e) {}
      };
      ws.onerror = (error) => observer.error(error);
      ws.onclose = () => observer.complete();
      return () => {
        ws.close();
        this.wsConnections.delete(id_emergencia);
      };
    });
  }

  desconectarEmergenciaWS(id_emergencia: number) {
    const ws = this.wsConnections.get(id_emergencia);
    if (ws) {
      ws.close();
      this.wsConnections.delete(id_emergencia);
    }
  }

  conectarTallerWS(id_taller: number): Observable<any> {
    return new Observable(observer => {
      const wsUrl = `ws://localhost:8000/ws/taller/${id_taller}`;
      const ws = new WebSocket(wsUrl);
      this.wsTallerSocket = ws;
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          observer.next(data);
        } catch (e) {}
      };
      ws.onerror = (error) => observer.error(error);
      ws.onclose = () => observer.complete();
      return () => ws.close();
    });
  }
}