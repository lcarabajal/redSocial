import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { IPublicacion } from '../../interfaces/interfaces';
import { Sidebar } from '../sidebar/sidebar';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-publicacion',
  standalone: true,
  imports: [CommonModule, DatePipe, Sidebar, RouterLink],
  templateUrl: './publicacion.html',
  styleUrls: ['./publicacion.css']
})
export class Publicacion {
  @Input({ required: true }) publicacion!: IPublicacion;
  @Input({ required: true }) currentUserId!: string;
  
  @Output() onLike = new EventEmitter<string>();
  @Output() onDelete = new EventEmitter<string>();

  get hasLiked(): boolean {
    return this.publicacion.likes.includes(this.currentUserId);
  }

  toggleLike() {
    this.onLike.emit(this.publicacion._id);
  }

  eliminar() {
    if (confirm('¿Estás seguro de eliminar esta publicación?')) {
      this.onDelete.emit(this.publicacion._id);
    }
  }
}