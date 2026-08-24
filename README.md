# Destino España Admin — CMS & Cloudflare R2 Architecture

Panel administrativo **Mobile-First** y API Serverless para la gestión en tiempo real del contenido de la aplicación móvil **Destino España**, sin base de datos tradicional, almacenando todos los datos estructurados en archivos JSON dentro de **Cloudflare R2** con versionado automático.

---

## 1. Arquitectura Técnica y Flujo de Datos

```
[ Panel Admin (CMS Web Mobile-First) ]
                │
                ▼ (HTTPS + JWT + Google OAuth)
[ Cloudflare Worker (API REST) ]
                │
                ▼ (Lectura / Escritura con auto-backup /versions/)
[ Cloudflare R2 (Object Storage S3-Compatible) ]
       /data/cintillo.json
       /data/promociones.json
       /data/calculadora-tramites.json
       /data/tramites.json
       /versions/{modulo}/{timestamp}.json
                │
                ▼ (Lectura pública ultrarrápida mediante Cloudflare CDN)
[ App Pública Móvil (Android WebView / Nativo) ]
```

### Características Principales
- **Zero-Database**: Sin PostgreSQL, MongoDB o MySQL. Toda la persistencia reside en objetos JSON inmutables en R2.
- **Seguridad Estricta**: Autenticación Google OAuth 2.0 validada en servidor para un único correo autorizado: `eblito.lopez@gmail.com`.
- **Versionado Automático**: Al guardar cambios, la versión anterior se archiva automáticamente en `/versions/{modulo}/{timestamp}.json` (máximo 20 versiones por módulo con depuración automática).
- **Mobile-First UX**: Interfaz optimizada para 390px con barra de navegación inferior, feedback táctil (mínimo 48px), vistas previas en tiempo real y toasts de estado.

---

## 2. Estructura de Archivos del Proyecto

```
destino-espana-cms/
├── worker/
│   ├── src/
│   │   ├── index.js           # Router principal del Worker y middleware de seguridad
│   │   ├── auth.js            # Google OAuth 2.0 y firma/verificación JWT con Web Crypto
│   │   ├── r2.js              # Operaciones de lectura y escritura en Cloudflare R2
│   │   ├── versions.js        # Sistema de versionado, histórico y restauración
│   │   └── routes/
│   │       ├── cintillo.js    # Endpoint /api/cintillo
│   │       ├── promociones.js # Endpoint /api/promociones
│   │       ├── calculadora.js # Endpoint /api/calculadora
│   │       └── tramites.js    # Endpoint /api/tramites
│   └── wrangler.toml          # Configuración y bindings de Cloudflare Workers
│
├── cms/
│   ├── index.html             # Single Page Application Mobile-First
│   ├── login.html             # Pantalla de acceso exclusivo con Google
│   ├── css/styles.css         # Estilos mobile-first (Navy #0B1D3A, Red #EC1313)
│   └── js/
│       ├── app.js             # Controlador principal y navegación
│       ├── auth.js            # Manejo de tokens y sesiones
│       ├── api.js             # Cliente HTTP hacia Cloudflare Worker
│       └── modules/
│           ├── dashboard.js   # Estado de R2 y resumen general
│           ├── cintillo.js    # Editor y preview en tiempo real del cintillo
│           ├── promociones.js # Carrusel, preview y editor enriquecido de popups
│           ├── calculadora.js # Editor de tiempos de resolución de trámites
│           ├── tramites.js    # Gestor jerárquico Categorías -> Trámites -> Subtrámites
│           └── versions.js    # Modal de historial de versiones y restauración
│
├── data/                      # Esquemas JSON de referencia
│   ├── cintillo.json
│   ├── promociones.json
│   ├── calculadora-tramites.json
│   └── tramites.json
│
└── README.md
```

---

## 3. Esquemas de Datos JSON

### 3.1 Cintillo (`/data/cintillo.json`)
```json
{
  "texto": "Consulado de España operando con normalidad. Citas consulares habilitadas.",
  "color": "verde",
  "actualizadoEn": "2026-08-24T13:00:00Z"
}
```
*Colores válidos:* `verde`, `amarillo`, `rojo`, `azul`, `blanco`, `negro`.

### 3.2 Promociones (`/data/promociones.json`)
```json
{
  "promociones": [
    {
      "id": "promo-001",
      "titulo": "Apertura de Cuenta Bancaria en España",
      "subtitulo": "Sin comisiones y 100% online para no residentes",
      "textoBoton": "Saber más",
      "colorFondo": "#004481",
      "colorTexto": "#FFFFFF",
      "contenido": "<h2>Abre tu cuenta bancaria</h2><p>Accede a todos los servicios financieros.</p>",
      "activa": true,
      "orden": 1,
      "creadaEn": "2026-08-24T10:00:00Z",
      "actualizadaEn": "2026-08-24T12:00:00Z"
    }
  ]
}
```

### 3.3 Calculadora de Trámites (`/data/calculadora-tramites.json`)
```json
{
  "tramites": [
    {
      "id": "calc-001",
      "nombre": "Inscripción por LMD (Ley de Memoria Democrática)",
      "tiempoResolucion": 180
    },
    {
      "id": "calc-002",
      "nombre": "Credenciales de Matrimonio Consular",
      "tiempoResolucion": 60
    }
  ]
}
```

### 3.4 Categorías y Trámites (`/data/tramites.json`)
```json
{
  "categorias": [
    {
      "id": "cat-1724500000",
      "nombre": "Nacionalidad y Registro Civil",
      "color": "#0B3C6D",
      "tramites": [
        {
          "id": "tram-1724500001",
          "titulo": "Inscripción por Ley de Memoria Democrática (LMD)",
          "plazoResolucion": 180,
          "subtramites": [
            {
              "id": "sub-1724500002",
              "nombre": "Revisión preliminar de actas apostilladas",
              "tiempo": 15
            },
            {
              "id": "sub-1724500003",
              "nombre": "Cita y calificación consular",
              "tiempo": 120
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 4. Variables de Entorno Requeridas

Configurar en Cloudflare Workers Secrets (`wrangler secret put <NOMBRE>`):

| Variable | Descripción | Ejemplo |
|---|---|---|
| `ALLOWED_EMAIL` | Correo electrónico único autorizado | `eblito.lopez@gmail.com` |
| `GOOGLE_CLIENT_ID` | Client ID de Google OAuth 2.0 | `123456789.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Client Secret de Google OAuth 2.0 | `GOCSPX-abc123xyz` |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT (HMAC-SHA256) | `clave-super-secreta-destino-espana-2026` |
| `R2_ACCOUNT_ID` | ID de Cuenta de Cloudflare | `a1b2c3d4e5f6...` |
| `R2_BUCKET_NAME` | Nombre del Bucket R2 | `destino-espana-data` |

---

## 5. Instrucciones de Despliegue

### Despliegue del Backend (Cloudflare Worker)
1. Instalar Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```
2. Iniciar sesión en Cloudflare:
   ```bash
   wrangler login
   ```
3. Crear el bucket en R2:
   ```bash
   wrangler r2 bucket create destino-espana-data
   ```
4. Configurar secretos:
   ```bash
   wrangler secret put GOOGLE_CLIENT_ID
   wrangler secret put GOOGLE_CLIENT_SECRET
   wrangler secret put JWT_SECRET
   ```
5. Desplegar el Worker:
   ```bash
   cd worker
   wrangler deploy
   ```

### Despliegue del Frontend (Cloudflare Pages)
1. Conectar el repositorio de GitHub con Cloudflare Pages o subir mediante CLI:
   ```bash
   npx wrangler pages deploy cms --project-name destino-espana-admin
   ```
2. Configurar la URL de redirección en Google Cloud Console:
   - `https://<tu-worker>.workers.dev/api/auth/callback`

---

## 6. Cómo Añadir Nuevos Módulos

1. **Crear archivo de ruta en Worker**: `worker/src/routes/nuevo_modulo.js` exportando `handleGet` y `handlePut`.
2. **Vincular en router**: Añadir la ruta en `worker/src/index.js`.
3. **Crear vista en CMS**: Añadir `cms/js/modules/nuevo_modulo.js` con los métodos `render(container)` y `saveToR2()`.
4. **Registrar botón en Bottom Nav**: Añadir el ícono y botón en `cms/index.html` y asociarlo en `cms/js/app.js`.

---

## 7. Consumo en la Aplicación Móvil Pública

La app móvil pública (Android WebView o nativa) consume los datos directamente desde las URLs públicas de R2 o Cloudflare CDN sin requerir autenticación ni tokens:

- `GET https://pub-<r2-id>.r2.dev/data/cintillo.json`
- `GET https://pub-<r2-id>.r2.dev/data/promociones.json`
- `GET https://pub-<r2-id>.r2.dev/data/calculadora-tramites.json`
- `GET https://pub-<r2-id>.r2.dev/data/tramites.json`
