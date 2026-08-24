/**
 * Destino España Admin - Módulo de Autenticación
 * Google OAuth 2.0 y firma/verificación de JWT con Web Crypto API
 */

const JWT_HEADER = { alg: 'HS256', typ: 'JWT' };
const SESSION_EXPIRATION_SECONDS = 8 * 60 * 60; // 8 horas

// Helper base64url
function base64UrlEncode(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

// Crear clave HMAC-SHA256
async function getCryptoKey(secret) {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    'raw',
    enc.encode(secret || 'destino-espana-jwt-super-secret-key-2026'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

// Firmar JWT
export async function signJWT(payload, secret) {
  const headerEncoded = base64UrlEncode(JSON.stringify(JWT_HEADER));
  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
  const data = `${headerEncoded}.${payloadEncoded}`;

  const key = await getCryptoKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));

  let binary = '';
  const bytes = new Uint8Array(signature);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const signatureEncoded = btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return `${data}.${signatureEncoded}`;
}

// Verificar JWT
export async function verifyJWT(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    const data = `${headerB64}.${payloadB64}`;

    let sigStr = signatureB64.replace(/-/g, '+').replace(/_/g, '/');
    while (sigStr.length % 4) sigStr += '=';
    const sigBinary = atob(sigStr);
    const sigBytes = new Uint8Array(sigBinary.length);
    for (let i = 0; i < sigBinary.length; i++) {
      sigBytes[i] = sigBinary.charCodeAt(i);
    }

    const key = await getCryptoKey(secret);
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      new TextEncoder().encode(data)
    );

    if (!valid) return null;

    const payload = JSON.parse(base64UrlDecode(payloadB64));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Expirado
    }

    return payload;
  } catch (e) {
    console.error('JWT verification error:', e);
    return null;
  }
}

// Iniciar flujo OAuth de Google
export async function handleGoogleAuth(request, env) {
  const clientId = env.GOOGLE_CLIENT_ID;
  const redirectUri = new URL('/api/auth/callback', request.url).toString();

  if (!clientId) {
    return new Response(JSON.stringify({
      error: 'GOOGLE_CLIENT_ID no configurado en variables de entorno del Worker.'
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  const scope = encodeURIComponent('openid email profile');
  const state = base64UrlEncode(JSON.stringify({ redirectUri, ts: Date.now() }));

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}&prompt=select_account`;

  return Response.redirect(authUrl, 302);
}

// Callback OAuth de Google
export async function handleGoogleCallback(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error || !code) {
    return new Response(`Error en autenticación de Google: ${error || 'Código faltante'}`, { status: 400 });
  }

  const clientId = env.GOOGLE_CLIENT_ID;
  const clientSecret = env.GOOGLE_CLIENT_SECRET;
  const redirectUri = new URL('/api/auth/callback', request.url).toString();

  // Intercambiar código por tokens
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    return new Response(`Error al canjear token de Google: ${errorText}`, { status: 400 });
  }

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  // Obtener info del usuario de Google
  const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!userResponse.ok) {
    return new Response('Error al obtener perfil de usuario', { status: 400 });
  }

  const googleUser = await userResponse.json();
  const userEmail = (googleUser.email || '').toLowerCase().trim();
  const allowedEmail = (env.ALLOWED_EMAIL || 'eblito.lopez@gmail.com').toLowerCase().trim();

  // Verificación OBLIGATORIA del email en el Worker
  if (userEmail !== allowedEmail) {
    return new Response(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Acceso no autorizado - Destino España</title>
        <style>
          body { font-family: system-ui, sans-serif; background: #0B1D3A; color: white; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; text-align: center; }
          .card { background: #162A4D; padding: 32px 24px; border-radius: 16px; max-width: 360px; box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
          h1 { color: #EC1313; font-size: 20px; margin-top: 0; }
          p { font-size: 14px; line-height: 1.5; color: #E0E0E0; }
          .btn { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #EC1313; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>⛔ Acceso no autorizado</h1>
          <p>La cuenta <strong>${userEmail}</strong> no tiene permisos de administración para Destino España Admin.</p>
          <p>Solo el administrador autorizado puede acceder a este panel.</p>
          <a href="/login.html" class="btn">Volver al login</a>
        </div>
      </body>
      </html>
    `, { status: 403, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }

  // Generar JWT
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    email: userEmail,
    name: googleUser.name || 'Administrador',
    picture: googleUser.picture || '',
    iat: now,
    exp: now + SESSION_EXPIRATION_SECONDS,
  };

  const jwt = await signJWT(payload, env.JWT_SECRET);

  // Redirigir al panel con Cookie HttpOnly
  const clientOrigin = url.origin;
  const destination = `${clientOrigin}/index.html#auth_token=${jwt}`;

  return new Response(null, {
    status: 302,
    headers: {
      Location: destination,
      'Set-Cookie': `destino_session=${jwt}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_EXPIRATION_SECONDS}`,
    },
  });
}

// Extraer y validar sesión del request
export async function verifySession(request, env) {
  let token = null;

  // 1. Cabecera Authorization: Bearer <token>
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // 2. Cookie destino_session
  if (!token) {
    const cookieHeader = request.headers.get('Cookie');
    if (cookieHeader) {
      const match = cookieHeader.match(/destino_session=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }
  }

  if (!token) return null;

  return await verifyJWT(token, env.JWT_SECRET);
}

// Cerrar sesión
export function logoutUser(corsHeaders) {
  return new Response(JSON.stringify({ success: true, message: 'Sesión finalizada' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'destino_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
      ...corsHeaders,
    },
  });
}
