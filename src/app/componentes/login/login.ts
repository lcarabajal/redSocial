import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html'
})
export class Login{
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  // Regex: Al menos 8 caracteres, una mayúscula y un número
  private passwordPattern = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

  loginForm: FormGroup = this.fb.group({
    identificador: ['', [Validators.required]], 
    password: ['', [Validators.required, Validators.pattern(this.passwordPattern)]]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      console.log('Datos de login:', this.loginForm.value);
      this.http.post('http://localhost:3000/auth/login', this.loginForm.value)
      .subscribe({
        next:(respuesta) => console.log('Login exitoso: ', respuesta),
        error:(err) => console.error('Error en login: ', err)
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