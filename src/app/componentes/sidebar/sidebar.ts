import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebar implements OnInit {
  private router = inject(Router);
  imagenPerfil: string = '';
  perfilUsuario : string = '';

  ngOnInit() {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      this.imagenPerfil = JSON.parse(usuarioStr).imagenPerfilUrl;
      this.perfilUsuario = JSON.parse(usuarioStr).perfil;
      console.log(this.perfilUsuario);
    }
  }

  cerrarSesion(){
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}