export interface Obra {
  ID: number;
  TITULO: string;
  DESCRIPCION: string;
  PORTADA: string;
  AUTOR: string;
  esCompartida: boolean;
  coautor?: string;
}
