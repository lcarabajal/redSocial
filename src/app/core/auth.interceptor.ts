import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const router = inject(Router);

  // 1. Inyectar el token en la cabecera
  let peticionClonada = req;
  if (token) {
    peticionClonada = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  // 2. Capturar respuestas
  return next(peticionClonada).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el backend responde 401 (No autorizado / Token vencido)
      if (error.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        
        router.navigate(['/login']); // Redirigir al login
      }
      return throwError(() => error);
    })
  );
};