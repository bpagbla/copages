export interface Author {
  username: string;
}

export interface Post {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  author: {
    id: number;
    username: string;
    nombre: string;
    apellidos: string;
  };
  capituloTitulo: string;
  capituloOrden: number;
}