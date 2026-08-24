/**
 * Destino España Admin - Ruta Módulo 1: Cintillo
 * Ruta JSON: /data/cintillo.json
 */

import { readR2Json, writeR2Json } from '../r2.js';
import { createVersion } from '../versions.js';

const VALID_COLORS = ['verde', 'amarillo', 'rojo', 'azul', 'blanco', 'negro'];

export async function handleGetCintillo(env, corsHeaders) {
  try {
    const data = await readR2Json(env, 'cintillo.json');
    return new Response(JSON.stringify(data || {
      texto: '',
      color: 'verde',
      actualizadoEn: new Date().toISOString(),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Error al leer cintillo', detail: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

export async function handlePutCintillo(request, env, user, corsHeaders) {
  try {
    const body = await request.json();
    const texto = (body.texto || '').trim();
    const color = (body.color || '').toLowerCase().trim();

    // Validaciones
    if (!texto) {
      return new Response(JSON.stringify({ error: 'El campo "texto" es obligatorio' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (!VALID_COLORS.includes(color)) {
      return new Response(JSON.stringify({
        error: `Color inválido. Opciones permitidas: ${VALID_COLORS.join(', ')}`
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // 1. Leer JSON actual
    const currentData = await readR2Json(env, 'cintillo.json');

    // 2. Guardar versión previa
    if (currentData) {
      await createVersion(env, 'cintillo', currentData, user.email);
    }

    // 3. Escribir nuevo JSON
    const newPayload = {
      texto,
      color,
      actualizadoEn: new Date().toISOString(),
    };

    await writeR2Json(env, 'cintillo.json', newPayload);

    return new Response(JSON.stringify({
      success: true,
      message: 'Cintillo guardado correctamente.',
      data: newPayload,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Error al guardar cintillo', detail: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}
