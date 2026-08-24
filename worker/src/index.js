/**
 * Destino España Admin - Cloudflare Worker API
 * Router principal y manejo de CORS y seguridad
 */

import { handleGoogleAuth, handleGoogleCallback, verifySession, logoutUser, getUserInfo } from './auth.js';
import { handleGetStatus } from './r2.js';
import { handleGetVersions, handleRestoreVersion } from './versions.js';
import { handleGetCintillo, handlePutCintillo } from './routes/cintillo.js';
import { handleGetPromociones, handlePutPromociones } from './routes/promociones.js';
import { handleGetCalculadora, handlePutCalculadora } from './routes/calculadora.js';
import { handleGetTramites, handlePutTramites } from './routes/tramites.js';

// Cabeceras CORS estándar
function getCorsHeaders(origin = '*') {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };
}

function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...headers,
    },
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '*';
    const corsHeaders = getCorsHeaders(origin);

    // Preflight OPTIONS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    try {
      // 1. Rutas Públicas de Autenticación
      if (url.pathname === '/api/auth/google') {
        return handleGoogleAuth(request, env);
      }
      if (url.pathname === '/api/auth/callback') {
        return handleGoogleCallback(request, env);
      }

      // Rutas públicas de lectura de datos (para app Android pública sin credenciales)
      if (url.pathname.startsWith('/public/data/')) {
        const moduleName = url.pathname.replace('/public/data/', '').replace('.json', '');
        return handlePublicData(moduleName, env, corsHeaders);
      }

      // 2. Verificación de Autenticación para rutas del CMS (/api/*)
      const user = await verifySession(request, env);
      if (!user) {
        return jsonResponse(
          { error: 'Acceso no autorizado', message: 'Sesión inválida o expirada. Por favor inicie sesión.' },
          401,
          corsHeaders
        );
      }

      // 3. Verificación estricta de correo autorizado en servidor
      const allowedEmail = env.ALLOWED_EMAIL || 'eblito.lopez@gmail.com';
      if (user.email.toLowerCase() !== allowedEmail.toLowerCase()) {
        return jsonResponse(
          { error: 'Acceso no autorizado', message: `El correo ${user.email} no tiene permisos administrativos.` },
          403,
          corsHeaders
        );
      }

      // 4. Rutas protegidas del CMS
      // Info de usuario y sesión
      if (url.pathname === '/api/auth/user') {
        return jsonResponse({ user }, 200, corsHeaders);
      }
      if (url.pathname === '/api/auth/logout') {
        return logoutUser(corsHeaders);
      }

      // Dashboard y estado R2
      if (url.pathname === '/api/status' && request.method === 'GET') {
        const status = await handleGetStatus(env);
        return jsonResponse(status, 200, corsHeaders);
      }

      // Módulo 1: Cintillo
      if (url.pathname === '/api/cintillo') {
        if (request.method === 'GET') return handleGetCintillo(env, corsHeaders);
        if (request.method === 'PUT') return handlePutCintillo(request, env, user, corsHeaders);
      }

      // Módulo 2: Promociones
      if (url.pathname === '/api/promociones') {
        if (request.method === 'GET') return handleGetPromociones(env, corsHeaders);
        if (request.method === 'PUT') return handlePutPromociones(request, env, user, corsHeaders);
      }

      // Módulo 3: Calculadora de Trámites
      if (url.pathname === '/api/calculadora') {
        if (request.method === 'GET') return handleGetCalculadora(env, corsHeaders);
        if (request.method === 'PUT') return handlePutCalculadora(request, env, user, corsHeaders);
      }

      // Módulos 4 & 5: Categorías y Trámites
      if (url.pathname === '/api/tramites') {
        if (request.method === 'GET') return handleGetTramites(env, corsHeaders);
        if (request.method === 'PUT') return handlePutTramites(request, env, user, corsHeaders);
      }

      // Sistema de Versiones
      if (url.pathname.startsWith('/api/versions/')) {
        const parts = url.pathname.split('/').filter(Boolean); // ['api', 'versions', ':modulo', (optional) 'restore']
        const modulo = parts[2];
        const isRestore = parts[3] === 'restore';

        if (isRestore && request.method === 'POST') {
          return handleRestoreVersion(request, env, modulo, user, corsHeaders);
        }
        if (request.method === 'GET') {
          return handleGetVersions(env, modulo, corsHeaders);
        }
      }

      // 404 No encontrado
      return jsonResponse({ error: 'Ruta no encontrada', path: url.pathname }, 404, corsHeaders);

    } catch (err) {
      console.error('Error Worker execution:', err);
      return jsonResponse(
        { error: 'Error interno del servidor', detail: err.message || 'Excepción no controlada' },
        500,
        corsHeaders
      );
    }
  },
};

async function handlePublicData(moduleName, env, corsHeaders) {
  const { readR2Json } = await import('./r2.js');
  const filename = `${moduleName}.json`;
  const data = await readR2Json(env, filename);
  if (!data) {
    return jsonResponse({ error: `Archivo ${filename} no encontrado en R2` }, 404, corsHeaders);
  }
  return jsonResponse(data, 200, {
    ...corsHeaders,
    'Cache-Control': 'public, max-age=60, s-maxage=120',
  });
}
