/**
 * Destino España Admin - Sistema de Versiones
 * Guarda versiones previas en /versions/{modulo}/{timestamp}.json y permite restauración
 * Máximo 20 versiones por módulo (depuración automática)
 */

import { readR2Json, writeR2Json, listR2Prefix, deleteR2Object } from './r2.js';

const MAX_VERSIONS = 20;

export async function createVersion(env, modulo, currentData, userEmail) {
  try {
    if (!currentData) return;

    const timestamp = Date.now();
    const isoDate = new Date(timestamp).toISOString();
    const versionPath = `versions/${modulo}/${timestamp}.json`;

    const versionPayload = {
      modulo,
      timestamp: isoDate,
      autor: userEmail || 'eblito.lopez@gmail.com',
      data: currentData,
    };

    // Guardar versión
    await writeR2Json(env, versionPath, versionPayload, {
      modulo,
      timestamp: isoDate,
      autor: userEmail,
    });

    // Purgar versiones antiguas (> 20)
    await purgeOldVersions(env, modulo);
  } catch (err) {
    console.error(`Error creating version for ${modulo}:`, err);
  }
}

export async function handleGetVersions(env, modulo, corsHeaders) {
  try {
    const prefix = `versions/${modulo}/`;
    const objects = await listR2Prefix(env, prefix);

    // Ordenar de más reciente a más antiguo
    const sorted = objects.sort((a, b) => {
      const timeA = parseInt(a.key.split('/').pop().replace('.json', ''), 10) || 0;
      const timeB = parseInt(b.key.split('/').pop().replace('.json', ''), 10) || 0;
      return timeB - timeA;
    });

    const versions = [];
    for (const obj of sorted.slice(0, MAX_VERSIONS)) {
      const versionContent = await readR2Json(env, obj.key);
      if (versionContent) {
        versions.push({
          key: obj.key,
          timestamp: versionContent.timestamp || obj.uploaded?.toISOString() || new Date().toISOString(),
          autor: versionContent.autor || 'Administrador',
          modulo: versionContent.modulo || modulo,
          data: versionContent.data,
        });
      }
    }

    return new Response(JSON.stringify({ modulo, total: versions.length, versions }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err) {
    console.error('Error fetching versions:', err);
    return new Response(JSON.stringify({ error: 'Error al recuperar versiones', detail: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

export async function handleRestoreVersion(request, env, modulo, user, corsHeaders) {
  try {
    const body = await request.json();
    const versionKey = body.versionKey;

    if (!versionKey) {
      return new Response(JSON.stringify({ error: 'versionKey es obligatorio para restaurar' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // 1. Leer la versión a restaurar
    const versionObj = await readR2Json(env, versionKey);
    if (!versionObj || !versionObj.data) {
      return new Response(JSON.stringify({ error: 'Versión no encontrada o corrupta' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // 2. Leer los datos actuales para respaldarlos como versión antes de sobrescribir
    const currentFilename = getModuleFilename(modulo);
    const currentData = await readR2Json(env, currentFilename);
    if (currentData) {
      await createVersion(env, modulo, currentData, `Auto-backup antes de restaurar por ${user.email}`);
    }

    // 3. Escribir los datos restaurados en el archivo activo
    const restoredData = versionObj.data;
    if (restoredData.actualizadoEn !== undefined) {
      restoredData.actualizadoEn = new Date().toISOString();
    }

    await writeR2Json(env, currentFilename, restoredData);

    return new Response(JSON.stringify({
      success: true,
      message: `Módulo ${modulo} restaurado correctamente a la versión de ${versionObj.timestamp}`,
      restoredData,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (err) {
    console.error('Error restoring version:', err);
    return new Response(JSON.stringify({ error: 'Error al restaurar versión', detail: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

async function purgeOldVersions(env, modulo) {
  try {
    const prefix = `versions/${modulo}/`;
    const objects = await listR2Prefix(env, prefix);
    if (objects.length <= MAX_VERSIONS) return;

    // Ordenar de más antiguo a más nuevo
    const sortedAsc = objects.sort((a, b) => {
      const timeA = parseInt(a.key.split('/').pop().replace('.json', ''), 10) || 0;
      const timeB = parseInt(b.key.split('/').pop().replace('.json', ''), 10) || 0;
      return timeA - timeB;
    });

    const excessCount = objects.length - MAX_VERSIONS;
    const toDelete = sortedAsc.slice(0, excessCount);

    for (const item of toDelete) {
      await deleteR2Object(env, item.key);
    }
  } catch (e) {
    console.warn('Error purging old versions:', e);
  }
}

function getModuleFilename(modulo) {
  switch (modulo) {
    case 'cintillo': return 'cintillo.json';
    case 'promociones': return 'promociones.json';
    case 'calculadora': return 'calculadora-tramites.json';
    case 'tramites': return 'tramites.json';
    default: return `${modulo}.json`;
  }
}
