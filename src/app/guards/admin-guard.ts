import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  // Verificamos si existe el usuario y su rol es admin
  if (usuario && usuario.perfil === 'admin') {
    return true; // Le abrimos la puerta
  }

  // Si no es admin, lo pateamos al inicio
  router.navigate(['/']);
  return false;
};
