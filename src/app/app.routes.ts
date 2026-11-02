import { Routes } from '@angular/router';
import { Login } from './componentes/login/login';
import { Registro } from './componentes/registro/registro';
import { Publicaciones } from './componentes/publicaciones/publicaciones';
import { MiPerfil } from './componentes/mi-perfil/mi-perfil';
import { ErrorComponente } from './componentes/error/error';

export const routes: Routes = [
  { 
    path: 'login', 
    component: Login
  },
  { 
    path: 'registro', 
    component: Registro
  },
  { 
    path: 'publicaciones', 
    component: Publicaciones
  },
  { 
    path: 'mi-perfil', 
    component: MiPerfil
  },
  { 
    path: '', 
    redirectTo: '/login', 
    pathMatch: 'full' 
  },
  {
    path:'**',
    component:ErrorComponente
  }
];
