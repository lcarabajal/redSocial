import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.html'
})
export class Login{
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router)

  // Regex: Al menos 8 caracteres, una mayúscula y un número
  private passwordPattern = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

  loginForm: FormGroup = this.fb.group({
    identificador: ['', [Validators.required]], 
    password: ['', [Validators.required, Validators.pattern(this.passwordPattern)]]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      this.http.post('http://localhost:3000/auth/login', this.loginForm.value)
        .subscribe({
          next: (respuesta: any) => {
            // 1. Guardar todos los datos del usuario (incluyendo el _id) en el navegador      
            localStorage.setItem('token', respuesta.token); 
            localStorage.setItem('usuario', JSON.stringify(respuesta.usuario));
            
            // 2. Redirigir al muro de publicaciones
            this.router.navigate(['/publicaciones']);
          },
          error: (err) => {
            console.error('Error en login:', err);
            alert('Usuario o contraseña incorrectos');
          }
        });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  // Getter para facilitar el acceso en el HTML
  get campo() { return this.loginForm.controls; }

  esCampoInvalido(nombreCampo:string): boolean {
    //Doble signo de exclamacion significa que solo trabaja con false o true  
    const campo = this.loginForm.get(nombreCampo);
    return !!(campo?.invalid && campo.touched)
  }
}