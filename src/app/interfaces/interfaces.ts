export interface Usuario {
  _id: string;
  nombre: string;
  apellido: string;
  correo: string;
  username: string;
  imagenPerfilUrl: string;
  descripcion: string;
  fechaNacimiento: Date;
}

export interface Comentario {
  _id: string;
  texto: string;
  usuario: Usuario;
  fecha: Date;
}

export interface IPublicacion {
  _id: string;
  texto: string;
  usuario: Usuario;
  fecha: Date;
  likes: string[]; 
  comentarios: Comentario[];
  imagenUrl?:string;
}