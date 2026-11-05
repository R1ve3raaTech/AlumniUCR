// Verificación de sesión para las RUTAS DE API DE NEXT (app/api/*).
//
// Por qué existe: esas rutas corren en el servidor de Next, no en el BackEnd
// Express, así que no pueden usar su middleware `autenticarUsuario`. Estaban
// todas abiertas, y cada una llama a la API de Claude, que se paga por uso: sin
// sesión, cualquiera podía gastar el presupuesto de la asociación.
//
// En vez de duplicar la validación del JWT acá, se delega en el BackEnd
// (GET /auth/perfil ya valida el token contra Supabase y devuelve el rol).
// Así queda una sola fuente de verdad sobre qué token es válido.

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface SesionServidor {
  id: string;
  rol: string;
}

/**
 * Valida el Bearer token de la petición contra el BackEnd.
 * @returns el perfil mínimo si el token es válido, o null si no lo es.
 */
export async function verificarSesion(req: Request): Promise<SesionServidor | null> {
  const cabecera = req.headers.get('authorization');
  if (!cabecera) return null;

  const token = cabecera.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/auth/perfil`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;

    const cuerpo = await res.json().catch(() => null);
    const perfil = cuerpo?.data;
    if (!perfil?.id) return null;

    return {
      id: perfil.id,
      rol: String(perfil.roles?.nombre ?? '').toLowerCase().trim(),
    };
  } catch {
    // Si el BackEnd no responde, se falla cerrado: mejor negar el acceso que
    // dejar la ruta de pago abierta.
    return null;
  }
}

/** Respuesta estándar 401 para estas rutas. */
export function noAutorizado() {
  return new Response(JSON.stringify({ error: 'Necesitás iniciar sesión.' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Respuesta estándar 403 para estas rutas. */
export function prohibido() {
  return new Response(JSON.stringify({ error: 'No tenés permiso para esta acción.' }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  });
}
