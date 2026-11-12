import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('redSocial');
  private http = inject(HttpClient);
  private router = inject(Router);

  isAppLoading = signal(true); // Pantalla de carga inicial
  mostrarModalSesion = signal(false); // Modal de 10 min
  
  private temporizadorSesion: any;

  ngOnInit() {
    this.validarTokenInicial();
  }

  validarTokenInicial() {
    const token = localStorage.getItem('token');

    if (!token) {
      this.isAppLoading.set(false);
      this.router.navigate(['/login']);
      return;
    }

    // Validar el token contra el backend 
    this.http.post('http://localhost:3000/auth/autorizar', {}).subscribe({
      next: () => {
        this.isAppLoading.set(false);
        this.iniciarTemporizadorSesion();
        // Si la ruta actual es login/registro, lo mandamos al muro
        if (this.router.url.includes('login')) this.router.navigate(['/publicaciones']);
        
      },
      error: () => {
        this.isAppLoading.set(false);
        localStorage.clear();
        this.router.navigate(['/login']);
      }
    });
  }

  iniciarTemporizadorSesion() {
    clearTimeout(this.temporizadorSesion);
    // 10 minutos = 600,000 milisegundos
    this.temporizadorSesion = setTimeout(() => {
      this.mostrarModalSesion.set(true);
    }, 600000);
    console.log(this.temporizadorSesion);
  }

  extenderSesion() {
    // Petición para renovar el token
    this.http.post<{token: string}>('http://localhost:3000/auth/refrescar', {}).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        this.mostrarModalSesion.set(false);
        this.iniciarTemporizadorSesion(); // Reiniciar el reloj
      }
    });
  }

  cerrarSesion() {
    this.mostrarModalSesion.set(false);
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
