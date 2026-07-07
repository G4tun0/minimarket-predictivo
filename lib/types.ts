export type Rol = 'Administrador' | 'Cliente';

export interface Usuario {
  id: string;
  correo: string;
  nombre: string;
  rol: Rol;
  creado_en?: string;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
  stock: number;
  stock_inicial: number;
  creado_en?: string;
}

export interface Venta {
  id: number;
  fecha: string;
  usuario_id: string | null;
  correo: string;
  producto_id: number | null;
  producto: string;
  cantidad: number;
  precio: number;
  total: number;
}

export interface Prediccion {
  id: number;
  producto: string;
  vendidos_30d: number;
  prediccion: number;
  generado_en: string;
}

// Item del carrito (solo en memoria, no en BD)
export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

// Niveles de criticidad de stock (mismos umbrales del .aia)
export type Criticidad = 'CRITICO' | 'BAJO' | 'MEDIO' | 'OK';

export function calcularCriticidad(stock: number, stockInicial: number): Criticidad {
  if (stockInicial <= 0) return 'OK';
  const pct = (stock / stockInicial) * 100;
  if (pct <= 5) return 'CRITICO';
  if (pct <= 25) return 'BAJO';
  if (pct <= 50) return 'MEDIO';
  return 'OK';
}

export const COLORES_CRITICIDAD: Record<Criticidad, string> = {
  CRITICO: '#dc2626',
  BAJO: '#ea580c',
  MEDIO: '#ca8a04',
  OK: '#16a34a',
};
