import { Component, OnInit, inject, signal} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Usuario, IPublicacion } from '../../interfaces/interfaces';
import { Sidebar } from '../sidebar/sidebar';


@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, DatePipe, Sidebar],
  templateUrl: './mi-perfil.html',
  styleUrls: ['./mi-perfil.css']
})
export class MiPerfil implements OnInit {
  private http = inject(HttpClient);
  
  usuario!: Usuario;
  ultimasPublicaciones = signal<IPublicacion[]>([]);

  ngOnInit() {
    // 1. Recuperar los datos del usuario logueado
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      this.usuario = JSON.parse(usuarioStr);
      
      // 2. Pedir sus últimas 3 publicaciones a MongoDB
      const url = `http://localhost:3000/publicaciones/usuario/${this.usuario._id}?limit=3`;
      
      this.http.get<IPublicacion[]>(url).subscribe({
        next: (data) => this.ultimasPublicaciones.set(data),
        error: (err) => console.error('Error al cargar publicaciones del perfil', err)
      });
    }
  }
}

