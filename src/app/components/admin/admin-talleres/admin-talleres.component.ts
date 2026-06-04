import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-admin-talleres',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-talleres.component.html',
  styleUrl: './admin-talleres.component.css'
})
export class AdminTalleresComponent implements OnInit {
  talleres: any[] = [];
  cargando: boolean = false;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.cargarTalleres();
  }

  cargarTalleres() {
    this.cargando = true;
    this.api.obtenerTalleres().subscribe({
      next: (data: any) => {
        this.ngZone.run(() => {
          this.talleres = data;
          this.cargando = false;
          this.cdr.detectChanges();
        });
      },
      error: () => { this.cargando = false; }
    });
  }
}