import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { Sidebar } from '../sidebar/sidebar';
import { AlertService } from '../../service/alert-service';

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
  private sweetAlert = inject(AlertService);
  private router = inject(Router);

  currentUserId = JSON.parse(localStorage.getItem('usuario') || '{}')._id;
  usuarioLogueado = JSON.parse(localStorage.getItem('usuario') || '{}');
  esAdmin = this.usuarioLogueado.perfil === 'admin';

  publicacion = signal<any>(null);

  publicacionId = '';
  comentarios = signal<any[]>([]);
  paginaActual = signal<number>(1);
  // hayMas = signal<boolean>(false);
  totalPaginas = signal<number>(1);
  totalComentarios = signal<number>(0);
  cargando = signal<boolean>(false);
  private readonly LIMITE = 5;
  

  comentarioEnEdicionId = signal<string | null>(null);
  textoEdicion = signal<string>('');


  comentarioForm: FormGroup = this.fb.group({ texto: ['', Validators.required] });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') || '';

    this.publicacionId = id;

    if(this.publicacionId){
      this.cargarComentarios(1);
      this.cargarPublicacion(id);
    }
  }

  async darDeBajaPublicacion(idPublicacion: string) {
    if (await this.sweetAlert.confirmar('¿Estás seguro de que deseas dar de baja esta publicación?','Esta acción no se podra revertir', 'Confirmar')) {
      this.http.put(`https://red-social-back-end.vercel.app/publicaciones/${idPublicacion}/baja`, {}).subscribe({
        next: () => {
          
          this.sweetAlert.exito('Publicación dada de baja');
          this.router.navigate(['/']); // Necesitas inyectar Router
        },
        error: (err) => this.sweetAlert.error('Error al dar de baja')
      });
    }
  }

  cargarPublicacion(id: string) {
    this.http.get(`https://red-social-back-end.vercel.app/publicaciones/${id}`).subscribe({
      next: (data) => this.publicacion.set(data) // Emitir nuevo valor
    });
  }

  cargarComentarios(pagina: number) {
    if (pagina < 1) return;
    this.cargando.set(true);

    this.obtenerComentarios(this.publicacionId, pagina, this.LIMITE)
      .subscribe({
        next: (res) => {
          this.comentarios.set(res.comentarios);
          this.paginaActual.set(res.paginaActual);
          this.totalComentarios.set(res.total);
          this.totalPaginas.set(Math.max(1, res.totalPaginas));
          this.cargando.set(false);

          console.log(this.comentarios());
        },
        error: () => this.cargando.set(false),
      });
  }

  cambiarPagina(nuevaPagina: number) {
    if (nuevaPagina < 1 || nuevaPagina > this.totalPaginas() || this.cargando()) {
      return;
    }
    this.cargarComentarios(nuevaPagina);
  }

  onComentarioCreado(nuevoComentario: any) {
    // Si estabas en página 1, podés actualizar al instante recortando a 5:
    if (this.paginaActual() === 1) {
      this.comentarios.update((actuales) =>
        [nuevoComentario, ...actuales].slice(0, this.LIMITE)
      );
      const nuevoTotal = this.totalComentarios() + 1;
      this.totalComentarios.set(nuevoTotal);
      this.totalPaginas.set(Math.ceil(nuevoTotal / this.LIMITE));
      return;
    }

    // Si estabas en página 2, 3, etc., volvés a la página 1 desde el back
    // para ver el comentario recién creado y reordenar las páginas
    this.cargarComentarios(1);
  }

  agregarComentarioALista(nuevoComentario: any) {
    this.comentarios.update((actuales) => [nuevoComentario, ...actuales]);
    this.totalComentarios.update((t) => t + 1);
  }

  obtenerComentarios(pubId: string, page: number = 1, limit: number = 5) {
    return this.http.get<{
      comentarios: any[];
      total: number;
      paginaActual: number;
      totalPaginas: number;
      hayMas: boolean;
    }>(`https://red-social-back-end.vercel.app/publicaciones/${pubId}/comentarios`, {
      params: { page, limit }
    });
  }

  escribirComentario() {
    if (this.comentarioForm.invalid) return;
    const payload = { 
      texto: this.comentarioForm.value.texto,
      userId: this.currentUserId 
    };
    const pub = this.publicacion();

    if (!pub) return;

    this.http.post(`https://red-social-back-end.vercel.app/publicaciones/${pub._id}/comentarios`, payload).subscribe({
      next: (nuevoComentario) => {
        this.onComentarioCreado(nuevoComentario);
      }
    });
  }

  // --- LÓGICA DE EDICIÓN REACTIVA ---
  iniciarEdicion(comentario: any) {
    this.comentarioEnEdicionId.set(comentario._id);
    this.textoEdicion.set(comentario.texto);
  }

  guardarEdicion(comentarioId: string) {
    this.http.put(`https://red-social-back-end.vercel.app/publicaciones/comentarios/${comentarioId}`, { texto: this.textoEdicion() }).subscribe({
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