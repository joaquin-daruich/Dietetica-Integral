import { supabase } from './supabaseClient';

export async function iniciarSesion(email, clave) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: clave,
  });

  if (error) {
    return false;
  }

  return !!data.session;
}

export async function estaLogueado() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return !!session;
}

export async function cerrarSesion() {
  await supabase.auth.signOut();
}