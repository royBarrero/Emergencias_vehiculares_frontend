import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-tenant-bitacora',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tenant-bitacora.component.html',
  styleUrl: './tenant-bitacora.component.css'
})
export class TenantBitacoraComponent implements OnInit {
  tenant: any;
  registros: any[] = [];
  cargando: boolean = false;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    const data = localStorage.getItem('tenant');
    if (data) {
      this.tenant = JSON.parse(data);
      this.cargarBitacora();
    }
  }

  cargarBitacora() {
    this.cargando = true;
    this.api.obtenerBitacoraTenant(this.tenant.id_tenant).subscribe({
      next: (data: any) => {
        this.ngZone.run(() => {
          this.registros = data;
          this.cargando = false;
          this.cdr.detectChanges();
        });
      },
      error: () => { this.cargando = false; }
    });
  }
}