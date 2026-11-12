import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Publicacion} from '../publicacion/publicacion';
import { IPublicacion } from '../../interfaces/interfaces';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [CommonModule, Publicacion, ReactiveFormsModule, Sidebar],
  templateUrl: './publicaciones.html',
  styleUrls: ['./publicaciones.css']
})
export class Publicaciones implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private apiUrl = 'http://localhost:3000/publicaciones';


  publicaciones = signal<IPublicacion[]>([]);

  currentUserId: string = ''; // Esto vendrá de tu AuthGuard/LocalStorage
  
  // Paginación y Ordenamiento
  paginaActual: number = 1;
  limite: number = 2;
  orden: 'fecha' | 'likes' = 'fecha';

  nuevaPubForm: FormGroup = this.fb.group({
    texto: ['', [Validators.required, Validators.maxLength(500)]]
  });

  mostrarModal: boolean = false;
  archivoImagen: File | null = null;

  ngOnInit() {
    // Obtenemos el ID del usuario guardado en localStorage al hacer login
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      this.currentUserId = JSON.parse(usuarioStr)._id;
    }
    this.cargarPublicaciones();
  }

  cargarPublicaciones() {
    const url = `${this.apiUrl}?page=${this.paginaActual}&limit=${this.limite}&sort=${this.orden}`;
    
    this.http.get<IPublicacion[]>(url).subscribe({
      next: (data) => this.publicaciones.set(data),
      error: (err) => console.error('Error cargando publicaciones', err)
    });
  }

  cambiarOrden(evento: any) {
    this.orden = evento.target.value;
    this.paginaActual = 1; // Reiniciar a la primera página al cambiar el orden
    this.cargarPublicaciones();
  }

  cambiarPagina(direccion: number) {
    this.paginaActual += direccion;
    this.cargarPublicaciones();
  }

  manejarLike(idPublicacion: string) {
    // Actualizamos visualmente al instante (Optimistic UI)
    const pub = this.publicaciones().find(p => p._id === idPublicacion);
    if (pub) {
      const index = pub.likes.indexOf(this.currentUserId);
      if (index === -1) pub.likes.push(this.currentUserId); //Si no esta en el array de likes, Lo meto dentro
      else pub.likes.splice(index, 1);
    }

    // Impactamos en la base de datos de MongoDB
    this.http.post(`${this.apiUrl}/${idPublicacion}/like`, { userId: this.currentUserId })
      .subscribe({
        error: () => this.cargarPublicaciones() // Si falla, recargamos los datos reales
      });
  }

  manejarDelete(idPublicacion: string) {
    this.http.delete(`${this.apiUrl}/${idPublicacion}?userId=${this.currentUserId}`)
    .subscribe({
      next: () => {
        // Quitamos la publicación del HTML sin recargar la página
        this.publicaciones.set(this.publicaciones().filter(p => p._id !== idPublicacion));
      },
      error: (err) => console.error('Error al borrar', err)
    });
  }

  crearPublicacion() {
    if (this.nuevaPubForm.invalid || !this.currentUserId) return;

    // Usamos FormData porque ahora enviamos archivos
    const formData = new FormData();
    formData.append('texto', this.nuevaPubForm.value.texto);
    formData.append('userId', this.currentUserId);
    if (this.archivoImagen) {
      formData.append('imagen', this.archivoImagen);
    }

    this.http.post<IPublicacion>(this.apiUrl, formData).subscribe({
      next: (nuevaPub) => {
        this.publicaciones.update(pubs => [nuevaPub, ...pubs]);
        this.cerrarModal(); // Cierra el modal y limpia el formulario
      },
      error: (err) => console.error('Error al crear publicación', err)
    });
  }

  abrirModal() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.nuevaPubForm.reset();
    this.archivoImagen = null;
  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.archivoImagen = event.target.files[0];
    }
  }


}