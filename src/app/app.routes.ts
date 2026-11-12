import { Routes } from '@angular/router';
import { Login } from './componentes/login/login';
import { Registro } from './componentes/registro/registro';
import { Publicaciones } from './componentes/publicaciones/publicaciones';
import { MiPerfil } from './componentes/mi-perfil/mi-perfil';
import { ErrorComponente } from './componentes/error/error';
import { PublicacionDetalle } from './componentes/publicacion-detalle/publicacion-detalle';
import { adminGuard } from './guards/admin-guard';
import { DashboardUsuarios } from './componentes/dashboard-usuarios/dashboard-usuarios';
import { DashboardEstadisticas } from './componentes/dashboard-estadisticas/dashboard-estadisticas';

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
    children:[
      {
        path:'',
        component: Publicaciones
      },
      {
        path:':id',
        component: PublicacionDetalle
      }
    ]
  },
  { 
    path: 'mi-perfil', 
    component: MiPerfil
  },
  { 
    path: 'dashboard', 
    component: DashboardUsuarios, 
    canActivate: [adminGuard] 
  },
  { 
    path: 'dashboard/estadisticas', 
    component: DashboardEstadisticas, 
    canActivate: [adminGuard] 
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
