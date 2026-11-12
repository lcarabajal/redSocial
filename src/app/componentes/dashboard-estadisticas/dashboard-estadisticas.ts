import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-estadisticas',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './dashboard-estadisticas.html',
  styleUrls: ['./dashboard-estadisticas.css']
})
export class DashboardEstadisticas implements OnInit {
  private http = inject(HttpClient);
  
  // Por defecto, lapso del último mes
  fechaFin: string = new Date().toISOString().split('T')[0];
  fechaInicio: string = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0];

  chartBarras: any;
  chartLineas: any;
  chartTorta: any;

  ngOnInit() {
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    const url = `http://localhost:3000/estadisticas?inicio=${this.fechaInicio}&fin=${this.fechaFin}`;
    
    this.http.get<any>(url).subscribe(data => {
      console.log(data);
      this.renderizarGraficoBarras(data.pubsPorUsuario);
      this.renderizarGraficoLineas(data.comentariosPorDia);
      this.renderizarGraficoTorta(data.comentariosPorPub);
    });
  }

  renderizarGraficoBarras(datos: any[]) {
    console.log(datos);
    if (this.chartBarras) this.chartBarras.destroy(); // Limpia el gráfico anterior
    
    this.chartBarras = new Chart('chartBarras', {
      type: 'bar',
      data: {
        labels: datos.map(d => d.nombre),
        datasets: [{
          label: 'Cantidad de Publicaciones',
          data: datos.map(d => d.cantidad),
          backgroundColor: '#00d2ff'
        }]
      }
    });
  }

  renderizarGraficoLineas(datos: any[]) {
    console.log(datos);
    if (this.chartLineas) this.chartLineas.destroy();
    
    this.chartLineas = new Chart('chartLineas', {
      type: 'line',
      data: {
        labels: datos.map(d => d._id), // Las fechas
        datasets: [{
          label: 'Comentarios Diarios',
          data: datos.map(d => d.cantidad),
          borderColor: '#7c3aed',
          tension: 0.4
        }]
      }
    });
  }

  renderizarGraficoTorta(datos: any[]) {
    console.log(datos);
    if (this.chartTorta) this.chartTorta.destroy();
    
    this.chartTorta = new Chart('chartTorta', {
      type: 'doughnut', // Variante visual de la torta
      data: {
        labels: datos.map(d => `Post ID: ${d._id.substring(0,6)}`),
        datasets: [{
          data: datos.map(d => d.cantidad),
          backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']
        }]
      }
    });
  }
}