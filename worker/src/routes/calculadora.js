/**
 * Destino España Admin - Ruta Módulo 3: Calculadora de Trámites
 * Ruta JSON: /data/calculadora-tramites.json
 */

import { readR2Json, writeR2Json } from '../r2.js';
import { createVersion } from '../versions.js';

export async function handleGetCalculadora(env, corsHeaders) {
  try {
    const data = await readR2Json(env, 'calculadora-tramites.json');
    return new Response(JSON.stringify(data || { tramites: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Error al leer calculadora de trámites', detail: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

export async function handlePutCalculadora(request, env, user, corsHeaders) {
  try {
    const body = await request.json();
    const tramites = body.tramites;

    if (!Array.isArray(tramites)) {
      return new Response(JSON.stringify({ error: 'El cuerpo debe contener una lista "tramites"' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const validatedTramites = [];

    for (let i = 0; i < tramites.length; i++) {
      const t = tramites[i];
      if (!t.nombre || !t.nombre.trim()) {
        return new Response(JSON.stringify({ error: `El trámite #${i + 1} no tiene nombre.` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      const tiempo = parseInt(t.tiempoResolucion, 10);
      if (isNaN(tiempo) || tiempo < 0) {
        return new Response(JSON.stringify({ error: `El trámite "${t.nombre}" debe tener un tiempo de resolución numérico entero mayor o igual a 0 días.` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      validatedTramites.push({
        id: t.id || `calc-${Date.now()}-${i}`,
        nombre: t.nombre.trim(),
        tiempoResolucion: tiempo,
      });
    }

    // 1. Leer actual
    const currentData = await readR2Json(env, 'calculadora-tramites.json');

    // 2. Guardar versión
    if (currentData) {
      await createVersion(env, 'calculadora', currentData, user.email);
    }

    // 3. Escribir nuevo
    const newPayload = { tramites: validatedTramites };
    await writeR2Json(env, 'calculadora-tramites.json', newPayload);

    return new Response(JSON.stringify({
      success: true,
      message: 'Calculadora de trámites guardada correctamente.',
      data: newPayload,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Error al guardar calculadora', detail: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}
