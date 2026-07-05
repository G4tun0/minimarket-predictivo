    import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Venta } from '@/lib/types';

export function useVentas() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ventas')
      .select('*, producto:productos(*)')
      .order('created_at', { ascending: false })
      .limit(20);
    if (!error && data) setVentas(data as any);
    setLoading(false);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function registrarVenta(productoId: string, cantidad: number, precioUnitario: number, userId: string) {
    const { error } = await supabase.from('ventas').insert({
      producto_id: productoId,
      cantidad,
      precio_unitario: precioUnitario,
      registrado_por: userId,
    });
    if (!error) cargar();
    return { error };
  }

  return { ventas, loading, recargar: cargar, registrarVenta };
}