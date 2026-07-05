import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Venta, ItemCarrito } from '../lib/types';

export function useVentas(soloDe?: string) {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [cargando, setCargando] = useState(true);

  const recargar = useCallback(async () => {
    setCargando(true);
    let q = supabase.from('ventas').select('*').order('fecha', { ascending: false });
    if (soloDe) q = q.eq('correo', soloDe);
    const { data } = await q;
    setVentas((data as Venta[]) ?? []);
    setCargando(false);
  }, [soloDe]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  return { ventas, cargando, recargar };
}

/**
 * Registra una compra completa: inserta una fila por item y
 * descuenta el stock de cada producto. Devuelve null si todo ok,
 * o un mensaje de error.
 */
export async function registrarCompra(
  items: ItemCarrito[],
  usuarioId: string,
  correo: string
): Promise<string | null> {
  // 1. Insertar las ventas
  const filas = items.map((i) => ({
    usuario_id: usuarioId,
    correo,
    producto_id: i.producto.id,
    producto: i.producto.nombre,
    cantidad: i.cantidad,
    precio: i.producto.precio,
    total: i.producto.precio * i.cantidad,
  }));

  const { error: errVenta } = await supabase.from('ventas').insert(filas);
  if (errVenta) return errVenta.message;

  // 2. Descontar stock producto por producto
  for (const i of items) {
    const nuevoStock = Math.max(0, i.producto.stock - i.cantidad);
    const { error } = await supabase
      .from('productos')
      .update({ stock: nuevoStock })
      .eq('id', i.producto.id);
    if (error) return error.message;
  }

  return null;
}
