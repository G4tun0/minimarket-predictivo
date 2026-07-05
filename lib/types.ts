export type Rol = 'encargado' | 'admin';

export interface Usuario {
  id: string;
  nombre: string;
  rol: Rol;
  created_at: string;
}

export interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  stock_actual: number;
  punto_reorden: number;
  created_at: string;
}

export interface Venta {
  id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  fecha: string;
  hora: string;
  registrado_por: string | null;
  created_at: string;
  producto?: Producto;
}

export interface Inventario {
  id: string;
  producto_id: string;
  stock_actual: number;
  stock_seguridad: number;
  ultima_actualizacion: string;
  producto?: Producto;
}

export interface Prediccion {
  id: string;
  producto_id: string;
  fecha: string;
  demanda_predicha: number;
  demanda_real: number | null;
  created_at: string;
  producto?: Producto;
}