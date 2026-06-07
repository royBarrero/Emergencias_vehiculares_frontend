import { Injectable } from '@angular/core';
import { fromEvent, merge, of, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class OfflineService {

  hayConexion(): Observable<boolean> {
    return merge(
      of(navigator.onLine),
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false))
    );
  }

  estaOnline(): boolean {
    return navigator.onLine;
  }

  guardarPendiente(key: string, datos: any) {
    const pendientes = this.obtenerPendientes();
    pendientes.push({ ...datos, timestamp: new Date().toISOString(), sincronizada: false });
    localStorage.setItem(key, JSON.stringify(pendientes));
  }

  obtenerPendientes(key: string = 'emergencias_offline'): any[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  limpiarPendientes(key: string = 'emergencias_offline') {
    localStorage.removeItem(key);
  }

  contarPendientes(key: string = 'emergencias_offline'): number {
    return this.obtenerPendientes(key).filter(e => !e.sincronizada).length;
  }
}