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
 * descuenta el stock via la funcion RPC descontar_stock (que corre
 * con permisos elevados, ya que el cliente no tiene permiso directo
 * de UPDATE sobre productos por RLS). Devuelve null si todo ok,
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

  // 2. Descontar stock producto por producto via RPC (bypassa RLS de forma segura)
  for (const i of items) {
    const { error } = await supabase.rpc('descontar_stock', {
      p_producto_id: i.producto.id,
      p_cantidad: i.cantidad,
    });
    if (error) return error.message;
  }

  return null;
}