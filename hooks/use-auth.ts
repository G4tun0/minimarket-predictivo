import { useEffect, useState, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Usuario } from '../lib/types';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [perfil, setPerfil] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  const cargarPerfil = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single();
    setPerfil((data as Usuario) ?? null);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) cargarPerfil(data.session.user.id).finally(() => setCargando(false));
      else setCargando(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      if (sess) cargarPerfil(sess.user.id);
      else setPerfil(null);
    });

    return () => sub.subscription.unsubscribe();
  }, [cargarPerfil]);

  const login = useCallback(async (correo: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: correo,
      password,
    });
    return error?.message ?? null;
  }, []);

  const registrar = useCallback(
    async (correo: string, password: string, nombre: string) => {
      const { error } = await supabase.auth.signUp({
        email: correo,
        password,
        options: { data: { nombre } },
      });
      return error?.message ?? null;
    },
    []
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return {
    session,
    perfil,
    cargando,
    esAdmin: perfil?.rol === 'Administrador',
    login,
    registrar,
    logout,
  };
}
