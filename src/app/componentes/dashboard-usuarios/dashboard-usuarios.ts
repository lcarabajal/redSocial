import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard-usuarios.html'
})
export class DashboardUsuarios implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  private passwordPattern = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

  usuarios = signal<any[]>([]);

  archivoImagen: File | null = null;

  // Formulario con el campo 'rol' para los radio buttons
  usuarioForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],  
    username: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.pattern(this.passwordPattern)]],
    repetirPassword: ['', Validators.required],
    fechaNacimiento: ['', Validators.required],
    descripcion: ['', Validators.maxLength(300)],
    perfil: ['', Validators.required], 
   
  },{ validators: this.passwordsMatchValidator });

  ngOnInit() {
    this.cargarUsuarios();
  }
  
  passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const repetirPassword = control.get('repetirPassword')?.value;
    return password === repetirPassword ? null : { mismatch: true };
  }

  cargarUsuarios() {
    this.http.get<any[]>('http://localhost:3000/auth/usuarios').subscribe({
      next: (data) => this.usuarios.set(data)
    });
  }

  cambiarEstado(usuario: any) {
    // Si está activo (true) -> llamamos a DELETE para dar de baja
    // Si está inactivo (false) -> llamamos a POST para rehabilitar
    const peticion$ = usuario.activo
      ? this.http.delete(`http://localhost:3000/usuarios/${usuario._id}`)
      : this.http.post(`http://localhost:3000/usuarios/${usuario._id}/rehabilitar`, {});

    peticion$.subscribe({
      next: (usuarioActualizado: any) => {
        this.usuarios.update(users =>
          users.map(u => u._id === usuario._id ? { ...u, activo: usuarioActualizado.activo } : u)
        );
      },
      error: (err) => alert(err.error?.message || 'Error al cambiar el estado del usuario')
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.archivoImagen = file;
      console.log(this.archivoImagen);
    }
  }
  
  esCampoInvalido(nombreCampo:string): boolean {
    //Doble signo de exclamacion significa que solo trabaja con false o true  
    const campo = this.usuarioForm.get(nombreCampo);
    return !!(campo?.invalid && campo.touched)
  }

  get campo() { return this.usuarioForm.controls; }

  crearUsuario() {
  if (this.usuarioForm.invalid) return;

  const formData = new FormData();
  
  // Agregamos todos los campos de texto del formulario
  Object.keys(this.usuarioForm.value).forEach(key => {
    formData.append(key, this.usuarioForm.value[key]);
  });

  // Agregamos el archivo con la clave 'imagen' (igual que en FileInterceptor('imagen'))
  if (this.archivoImagen) {
    formData.append('imagen', this.archivoImagen);
  }

  this.http.post('http://localhost:3000/usuarios', formData).subscribe({
    next: (nuevo) => {
      this.usuarios.update(users => [...users, nuevo]);
      this.usuarioForm.reset({ perfil: 'usuario' });
      this.archivoImagen = null;
      alert('Usuario creado exitosamente');
    },
    error: (err) => alert(err.error?.message || 'Error al crear usuario')
  });
}
}