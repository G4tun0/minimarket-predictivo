import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { ItemCarrito, Producto } from '../lib/types';

interface CartContextValue {
  items: ItemCarrito[];
  total: number;
  cantidadItems: number;
  agregar: (producto: Producto, cantidad: number) => void;
  quitar: (productoId: number) => void;
  cambiarCantidad: (productoId: number, cantidad: number) => void;
  vaciar: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>([]);

  const agregar = useCallback((producto: Producto, cantidad: number) => {
    setItems((prev) => {
      const existe = prev.find((i) => i.producto.id === producto.id);
      if (existe) {
        return prev.map((i) =>
          i.producto.id === producto.id
            ? { ...i, cantidad: i.cantidad + cantidad }
            : i
        );
      }
      return [...prev, { producto, cantidad }];
    });
  }, []);

  const quitar = useCallback((productoId: number) => {
    setItems((prev) => prev.filter((i) => i.producto.id !== productoId));
  }, []);

  const cambiarCantidad = useCallback((productoId: number, cantidad: number) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.producto.id === productoId ? { ...i, cantidad } : i
        )
        .filter((i) => i.cantidad > 0)
    );
  }, []);

  const vaciar = useCallback(() => setItems([]), []);

  const total = useMemo(
    () => items.reduce((acc, i) => acc + i.producto.precio * i.cantidad, 0),
    [items]
  );

  const cantidadItems = useMemo(
    () => items.reduce((acc, i) => acc + i.cantidad, 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, total, cantidadItems, agregar, quitar, cambiarCantidad, vaciar }),
    [items, total, cantidadItems, agregar, quitar, cambiarCantidad, vaciar]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return ctx;
}