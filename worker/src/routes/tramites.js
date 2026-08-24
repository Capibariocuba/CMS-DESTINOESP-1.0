/**
 * Destino España Admin - Ruta Módulos 4 & 5: Categorías y Trámites
 * Ruta JSON: /data/tramites.json
 * Estructura jerárquica: Categoría -> Trámite -> Subtrámite
 */

import { readR2Json, writeR2Json } from '../r2.js';
import { createVersion } from '../versions.js';

export async function handleGetTramites(env, corsHeaders) {
  try {
    const data = await readR2Json(env, 'tramites.json');
    return new Response(JSON.stringify(data || { categorias: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Error al leer trámites', detail: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

export async function handlePutTramites(request, env, user, corsHeaders) {
  try {
    const body = await request.json();
    const categorias = body.categorias;

    if (!Array.isArray(categorias)) {
      return new Response(JSON.stringify({ error: 'El cuerpo debe contener una lista "categorias"' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const validatedCategorias = [];

    for (let i = 0; i < categorias.length; i++) {
      const cat = categorias[i];
      if (!cat.nombre || !cat.nombre.trim()) {
        return new Response(JSON.stringify({ error: `La categoría #${i + 1} no tiene nombre.` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
      if (!cat.color || !/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(cat.color)) {
        return new Response(JSON.stringify({ error: `La categoría "${cat.nombre}" tiene un color hexadecimal inválido.` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      const catId = cat.id || `cat-${Date.now() + i}`;
      const validatedTramites = [];

      const tramitesList = Array.isArray(cat.tramites) ? cat.tramites : [];
      for (let j = 0; j < tramitesList.length; j++) {
        const tram = tramitesList[j];
        if (!tram.titulo || !tram.titulo.trim()) {
          return new Response(JSON.stringify({ error: `El trámite #${j + 1} en categoría "${cat.nombre}" no tiene título.` }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        const plazo = parseInt(tram.plazoResolucion, 10);
        if (isNaN(plazo) || plazo < 0) {
          return new Response(JSON.stringify({ error: `El trámite "${tram.titulo}" debe tener un plazo numérico en días.` }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        const tramId = tram.id || `tram-${Date.now() + i * 100 + j}`;
        const validatedSubtramites = [];

        const subtramitesList = Array.isArray(tram.subtramites) ? tram.subtramites : [];
        for (let k = 0; k < subtramitesList.length; k++) {
          const sub = subtramitesList[k];
          if (!sub.nombre || !sub.nombre.trim()) {
            return new Response(JSON.stringify({ error: `Un subtrámite en "${tram.titulo}" no tiene nombre.` }), {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }
          const subTiempo = parseInt(sub.tiempo, 10);
          if (isNaN(subTiempo) || subTiempo < 0) {
            return new Response(JSON.stringify({ error: `El subtrámite "${sub.nombre}" debe tener un tiempo numérico en días.` }), {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }

          validatedSubtramites.push({
            id: sub.id || `sub-${Date.now() + i * 1000 + j * 100 + k}`,
            nombre: sub.nombre.trim(),
            tiempo: subTiempo,
          });
        }

        validatedTramites.push({
          id: tramId,
          titulo: tram.titulo.trim(),
          plazoResolucion: plazo,
          subtramites: validatedSubtramites,
        });
      }

      validatedCategorias.push({
        id: catId,
        nombre: cat.nombre.trim(),
        color: cat.color.trim(),
        tramites: validatedTramites,
      });
    }

    // 1. Leer actual
    const currentData = await readR2Json(env, 'tramites.json');

    // 2. Guardar versión
    if (currentData) {
      await createVersion(env, 'tramites', currentData, user.email);
    }

    // 3. Escribir nuevo
    const newPayload = { categorias: validatedCategorias };
    await writeR2Json(env, 'tramites.json', newPayload);

    return new Response(JSON.stringify({
      success: true,
      message: 'Categorías y trámites guardados correctamente.',
      data: newPayload,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Error al guardar trámites', detail: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}
