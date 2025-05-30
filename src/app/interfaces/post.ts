export interface Author {
  username: string;
}

export interface Post {
  id: number; //id del libro
  title: string; //titulo del libro
  excerpt: string; //descripcion
  date: string;
  portada: string;
  author: {
    id: number;
    username: string;
    nombre: string;
    apellidos: string;
    pfp: string;
  };
  capituloTitulo: string;
  capituloOrden: number;
}
