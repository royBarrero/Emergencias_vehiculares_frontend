import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-taller-perfil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './taller-perfil.component.html',
  styleUrl: './taller-perfil.component.css'
})
export class TallerPerfilComponent implements OnInit {
  taller: any;
  usuario: any;

  ngOnInit() {
    const tallerData = localStorage.getItem('taller');
    const usuarioData = localStorage.getItem('usuario');
    if (tallerData) this.taller = JSON.parse(tallerData);
    if (usuarioData) this.usuario = JSON.parse(usuarioData);
  }
}