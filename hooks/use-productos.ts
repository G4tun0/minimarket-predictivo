import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Producto } from '../lib/types';

export function useProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);

  const recargar = useCallback(async () => {
    setCargando(true);
    const { data } = await supabase
      .from('productos')
      .select('*')
      .order('nombre', { ascending: true });
    setProductos((data as Producto[]) ?? []);
    setCargando(false);
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const crear = useCallback(
    async (p: Omit<Producto, 'id' | 'creado_en'>) => {
      const { error } = await supabase.from('productos').insert({
        ...p,
        stock_inicial: p.stock_inicial || p.stock,
      });
      if (!error) await recargar();
      return error?.message ?? null;
    },
    [recargar]
  );

  const actualizarStock = useCallback(
    async (id: number, nuevoStock: number) => {
      const { error } = await supabase
        .from('productos')
        .update({ stock: nuevoStock })
        .eq('id', id);
      if (!error) await recargar();
      return error?.message ?? null;
    },
    [recargar]
  );

  const eliminar = useCallback(
    async (id: number) => {
      const { error } = await supabase.from('productos').delete().eq('id', id);
      if (!error) await recargar();
      return error?.message ?? null;
    },
    [recargar]
  );

  return { productos, cargando, recargar, crear, actualizarStock, eliminar };
}
