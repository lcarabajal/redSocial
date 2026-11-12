import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  selector: 'app-publicacion-detalle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DatePipe,Sidebar], // Añadimos FormsModule para ngModel
  templateUrl: './publicacion-detalle.html',
  styleUrls: ['./publicacion-detalle.css']
})
export class PublicacionDetalle implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  currentUserId = JSON.parse(localStorage.getItem('usuario') || '{}')._id;
  usuarioLogueado = JSON.parse(localStorage.getItem('usuario') || '{}');
  esAdmin = this.usuarioLogueado.perfil === 'admin';

  publicacion = signal<any>(null);
  comentarios = signal<any[]>([]);
  
  paginaComentarios = signal<number>(1);
  comentariosPorPagina = 5;
  hayMasComentarios = signal<boolean>(true);

  comentarioEnEdicionId = signal<string | null>(null);
  textoEdicion = signal<string>('');

  comentarioForm: FormGroup = this.fb.group({ texto: ['', Validators.required] });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarPublicacion(id);
      this.cargarComentarios(id, true);
    }
  }

  darDeBajaPublicacion(idPublicacion: string) {
    if (confirm('¿Estás seguro de que deseas dar de baja esta publicación?')) {
      this.http.put(`http://localhost:3000/publicaciones/${idPublicacion}/baja`, {}).subscribe({
        next: () => {
          // Opciones: redirigir al inicio o actualizar el signal
          alert('Publicación dada de baja');
          // this.router.navigate(['/']); // Necesitas inyectar Router
        },
        error: (err) => alert('Error al dar de baja')
      });
    }
  }

  cargarPublicacion(id: string) {
    this.http.get(`http://localhost:3000/publicaciones/${id}`).subscribe({
      next: (data) => this.publicacion.set(data) // Emitir nuevo valor
    });
  }

  cargarComentarios(pubId: string, inicial = false) {
    if (inicial) {
      this.paginaComentarios.set(1);
      this.comentarios.set([]);
    }

    const url = `http://localhost:3000/publicaciones/${pubId}/comentarios?page=${this.paginaComentarios()}&limit=${this.comentariosPorPagina}`;
    
    this.http.get<any[]>(url).subscribe({
      next: (nuevos) => {
        // Combinamos los comentarios actuales con los nuevos sin perder reactividad
        this.comentarios.update(actuales => [...actuales, ...nuevos]); 
        console.log(nuevos);
        if (nuevos.length < this.comentariosPorPagina) {
          this.hayMasComentarios.set(false);
        }
      }
    });
  }

  cargarMas() {
    this.paginaComentarios.update(p => p + 1);
    const pub = this.publicacion(); // Leemos el valor del signal
    if (pub) this.cargarComentarios(pub._id);
  }

  escribirComentario() {
    if (this.comentarioForm.invalid) return;
    const payload = { 
      texto: this.comentarioForm.value.texto,
      userId: this.currentUserId 
    };
    const pub = this.publicacion();

    if (!pub) return;

    this.http.post(`http://localhost:3000/publicaciones/${pub._id}/comentarios`, payload).subscribe({
      next: (nuevoComentario) => {
        // Agregamos el nuevo comentario al inicio de la lista
        this.comentarios.update(actuales => [nuevoComentario, ...actuales]);
        this.comentarioForm.reset();
      }
    });
  }

  // --- LÓGICA DE EDICIÓN REACTIVA ---
  iniciarEdicion(comentario: any) {
    this.comentarioEnEdicionId.set(comentario._id);
    this.textoEdicion.set(comentario.texto);
  }

  guardarEdicion(comentarioId: string) {
    this.http.put(`http://localhost:3000/publicaciones/comentarios/${comentarioId}`, { texto: this.textoEdicion() }).subscribe({
      next: () => {
        // Actualizamos solo el comentario editado dentro del Signal
        this.comentarios.update(actuales => 
          actuales.map(c => 
            c._id === comentarioId 
              ? { ...c, texto: this.textoEdicion(), modificado: true } 
              : c
          )
        );
        this.comentarioEnEdicionId.set(null); // Cerramos edición
      }
    });
  }
}