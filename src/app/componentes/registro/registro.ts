import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './registro.html'
})
export class Registro {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  private passwordPattern = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  
  archivoImagen: File | null = null;

  registroForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    username: ['', Validators.required],
    password: ['', [Validators.required, Validators.pattern(this.passwordPattern)]],
    repetirPassword: ['', Validators.required],
    fechaNacimiento: ['', Validators.required],
    descripcion: ['', Validators.maxLength(300)],
    perfil: ['usuario'] // Valor por defecto, oculto en el formulario
  }, { validators: this.passwordsMatchValidator });

  // Validador personalizado para comparar contraseñas
  passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const repetirPassword = control.get('repetirPassword')?.value;
    return password === repetirPassword ? null : { mismatch: true };
  }

  // Manejo del input tipo file (no se vincula directo con formControlName)
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.archivoImagen = file;
      console.log(this.archivoImagen);
    }
  }

  onSubmit() {
    if (this.registroForm.valid && this.archivoImagen) {
      // const payload = {
      //   ...this.registroForm.value,
      //   imagenPerfil: this.archivoImagen // Se enviará vía FormData al backend o a Supabase Storage
      // };
      // //Cambiar el URL a el de vercel cuando ya este listo
      // this.http.post('http://localhost:3000/auth/registro', payload)
      // .subscribe({
      //   next:(respuesta) => console.log('Registro Exitoso: ', respuesta),
      //   error: (err) => console.log('Error en registro: ', err)
      // });
      // 1. Crear el FormData
      const formData = new FormData();
      
      // 2. Adjuntar los textos
      formData.append('nombre', this.registroForm.get('nombre')?.value);
      formData.append('apellido', this.registroForm.get('apellido')?.value);
      formData.append('correo', this.registroForm.get('correo')?.value);
      formData.append('username', this.registroForm.get('username')?.value);
      formData.append('password', this.registroForm.get('password')?.value);
      formData.append('fechaNacimiento', this.registroForm.get('fechaNacimiento')?.value);
      formData.append('descripcion', this.registroForm.get('descripcion')?.value || '');
      
      // 3. Adjuntar la imagen (el nombre 'imagenPerfil' debe coincidir con el FileInterceptor del backend)
      formData.append('imagenPerfil', this.archivoImagen);

      this.http.post('http://localhost:3000/auth/registro', formData)
        .subscribe({
          next: (respuesta) => console.log('Registro exitoso:', respuesta),
          error: (err) => console.error('Error en registro:', err)
        });
    } else {
      this.registroForm.markAllAsTouched();
    }
  }

  esCampoInvalido(nombreCampo:string): boolean {
    //Doble signo de exclamacion significa que solo trabaja con false o true  
    const campo = this.registroForm.get(nombreCampo);
    return !!(campo?.invalid && campo.touched)
  }

  get campo() { return this.registroForm.controls; }
}