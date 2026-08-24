/**
 * Destino España Admin - Ruta Módulo 2: Promociones
 * Ruta JSON: /data/promociones.json
 */

import { readR2Json, writeR2Json } from '../r2.js';
import { createVersion } from '../versions.js';

export async function handleGetPromociones(env, corsHeaders) {
  try {
    const data = await readR2Json(env, 'promociones.json');
    return new Response(JSON.stringify(data || { promociones: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Error al leer promociones', detail: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

export async function handlePutPromociones(request, env, user, corsHeaders) {
  try {
    const body = await request.json();
    const promociones = body.promociones;

    if (!Array.isArray(promociones)) {
      return new Response(JSON.stringify({ error: 'El cuerpo debe contener una lista "promociones"' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const now = new Date().toISOString();
    const validatedPromos = [];

    for (let i = 0; i < promociones.length; i++) {
      const p = promociones[i];
      if (!p.titulo || !p.titulo.trim()) {
        return new Response(JSON.stringify({ error: `La promoción #${i + 1} no tiene título obligatorio.` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
      if (!p.textoBoton || !p.textoBoton.trim()) {
        return new Response(JSON.stringify({ error: `La promoción "${p.titulo}" no tiene texto de botón.` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
      if (!p.colorFondo || !/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(p.colorFondo)) {
        return new Response(JSON.stringify({ error: `La promoción "${p.titulo}" tiene un color de fondo hexadecimal inválido.` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
      if (!p.colorTexto || !/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(p.colorTexto)) {
        return new Response(JSON.stringify({ error: `La promoción "${p.titulo}" tiene un color de texto hexadecimal inválido.` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
      if (!p.contenido || !p.contenido.trim()) {
        return new Response(JSON.stringify({ error: `La promoción "${p.titulo}" debe incluir contenido HTML modal.` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      validatedPromos.push({
        id: p.id || `promo-${Date.now()}-${i}`,
        titulo: p.titulo.trim(),
        subtitulo: (p.subtitulo || '').trim(),
        textoBoton: p.textoBoton.trim(),
        colorFondo: p.colorFondo.trim(),
        colorTexto: p.colorTexto.trim(),
        contenido: p.contenido.trim(),
        activa: Boolean(p.activa),
        orden: Number.isInteger(p.orden) ? p.orden : i + 1,
        creadaEn: p.creadaEn || now,
        actualizadaEn: now,
      });
    }

    // Ordenar por campo 'orden'
    validatedPromos.sort((a, b) => a.orden - b.orden);

    // 1. Leer actual
    const currentData = await readR2Json(env, 'promociones.json');

    // 2. Guardar versión
    if (currentData) {
      await createVersion(env, 'promociones', currentData, user.email);
    }

    // 3. Escribir nuevo
    const newPayload = { promociones: validatedPromos };
    await writeR2Json(env, 'promociones.json', newPayload);

    return new Response(JSON.stringify({
      success: true,
      message: 'Promociones guardadas correctamente.',
      data: newPayload,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Error al guardar promociones', detail: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}
