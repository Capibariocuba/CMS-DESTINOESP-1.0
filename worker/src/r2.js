/**
 * Destino España Admin - R2 Storage Client
 * Lectura y escritura de JSONs en Cloudflare R2
 */

export async function readR2Json(env, path) {
  const fullPath = path.startsWith('data/') || path.startsWith('versions/') ? path : `data/${path}`;

  // 1. Usar binding nativo de Cloudflare R2 si está presente
  if (env.R2_BUCKET) {
    const object = await env.R2_BUCKET.get(fullPath);
    if (!object) return null;
    const text = await object.text();
    return JSON.parse(text);
  }

  // 2. Fallback de desarrollo con datos por defecto en caso de ejecución local sin R2
  return getFallbackData(path);
}

export async function writeR2Json(env, path, data, customMetadata = {}) {
  const fullPath = path.startsWith('data/') || path.startsWith('versions/') ? path : `data/${path}`;
  const content = JSON.stringify(data, null, 2);

  if (env.R2_BUCKET) {
    await env.R2_BUCKET.put(fullPath, content, {
      httpMetadata: {
        contentType: 'application/json; charset=utf-8',
        cacheControl: 'no-cache',
      },
      customMetadata,
    });
    return true;
  }

  return true;
}

export async function listR2Prefix(env, prefix) {
  if (env.R2_BUCKET) {
    const listed = await env.R2_BUCKET.list({
      prefix: prefix.startsWith('/') ? prefix.substring(1) : prefix,
    });
    return listed.objects || [];
  }
  return [];
}

export async function deleteR2Object(env, key) {
  if (env.R2_BUCKET) {
    await env.R2_BUCKET.delete(key);
    return true;
  }
  return true;
}

export async function handleGetStatus(env) {
  const bucketName = env.R2_BUCKET_NAME || 'destino-espana-data';
  let isR2Connected = false;
  let objectsCount = 0;

  try {
    if (env.R2_BUCKET) {
      const list = await env.R2_BUCKET.list({ limit: 10 });
      isR2Connected = true;
      objectsCount = list.objects ? list.objects.length : 0;
    } else {
      isR2Connected = true; // Simulado
    }
  } catch (e) {
    console.error('R2 status error:', e);
    isR2Connected = false;
  }

  // Leer estadísticas de módulos
  let promoCount = 0;
  let promoActiveCount = 0;
  let catCount = 0;
  let tramCount = 0;
  let calcCount = 0;
  let lastUpdate = null;

  try {
    const cintillo = await readR2Json(env, 'cintillo.json');
    if (cintillo?.actualizadoEn) lastUpdate = { modulo: 'Cintillo', timestamp: cintillo.actualizadoEn };

    const promos = await readR2Json(env, 'promociones.json');
    if (promos?.promociones) {
      promoCount = promos.promociones.length;
      promoActiveCount = promos.promociones.filter(p => p.activa).length;
    }

    const calc = await readR2Json(env, 'calculadora-tramites.json');
    if (calc?.tramites) {
      calcCount = calc.tramites.length;
    }

    const tramitesData = await readR2Json(env, 'tramites.json');
    if (tramitesData?.categorias) {
      catCount = tramitesData.categorias.length;
      tramitesData.categorias.forEach(c => {
        if (c.tramites) tramCount += c.tramites.length;
      });
    }
  } catch (e) {
    console.warn('Error computing module stats:', e);
  }

  return {
    connected: isR2Connected,
    bucketName: bucketName,
    lastSync: new Date().toISOString(),
    lastChange: lastUpdate || { modulo: 'Sistema', timestamp: new Date().toISOString() },
    stats: {
      promociones: { total: promoCount, activas: promoActiveCount },
      calculadora: { total: calcCount },
      tramites: { categorias: catCount, tramites: tramCount },
    },
    objectsCount,
  };
}

function getFallbackData(path) {
  if (path.includes('cintillo')) {
    return {
      texto: 'Consulado de España operando con normalidad. Citas consulares habilitadas.',
      color: 'verde',
      actualizadoEn: new Date().toISOString(),
    };
  }
  if (path.includes('promociones')) {
    return {
      promociones: [
        {
          id: 'promo-001',
          titulo: 'Apertura de Cuenta Bancaria en España',
          subtitulo: 'Sin comisiones y 100% online para no residentes',
          textoBoton: 'Saber más',
          colorFondo: '#004481',
          colorTexto: '#FFFFFF',
          contenido: '<h2>Abre tu cuenta bancaria</h2><p>Servicios financieros para tu estancia en España.</p>',
          activa: true,
          orden: 1,
          creadaEn: new Date().toISOString(),
          actualizadaEn: new Date().toISOString(),
        }
      ]
    };
  }
  if (path.includes('calculadora')) {
    return {
      tramites: [
        { id: 'calc-001', nombre: 'Inscripción por LMD', tiempoResolucion: 180 },
        { id: 'calc-002', nombre: 'Credenciales de Matrimonio', tiempoResolucion: 60 },
      ]
    };
  }
  if (path.includes('tramites')) {
    return {
      categorias: [
        {
          id: 'cat-1724500000',
          nombre: 'Nacionalidad y Registro Civil',
          color: '#0B3C6D',
          tramites: [
            {
              id: 'tram-1724500001',
              titulo: 'Inscripción por LMD',
              plazoResolucion: 180,
              subtramites: [
                { id: 'sub-1724500002', nombre: 'Presentación de documentación', tiempo: 15 },
                { id: 'sub-1724500003', nombre: 'Resolución preliminar', tiempo: 90 },
              ]
            }
          ]
        }
      ]
    };
  }
  return null;
}
