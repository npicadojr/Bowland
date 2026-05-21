# Analisis tecnico del sistema Bowland

Fecha de revision: 2026-05-21

## Resumen ejecutivo

Bowland es una aplicacion web de una sola pagina para promocionar el venue Bowland Panama, mostrar el menu completo, exponer canales de contacto, administrar productos desde Supabase y ofrecer un chatbot conectado a OpenAI. El frontend esta construido con React sobre Vite. El backend Node/Railway fue reemplazado por Cloudflare Pages Functions.

## Estructura del proyecto

```text
.
├── functions/
│   └── api/
│       └── chat.js          # Cloudflare Pages Function para POST /api/chat
├── docs/
│   └── ANALISIS_TECNICO.md  # Este documento
├── lib/
│   └── chatContext.js       # Prompt, limites y helpers compartidos del chatbot
├── public/
├── src/
│   ├── App.jsx              # Aplicacion React, vistas y chatbot
│   ├── components/          # Vistas principales, header, admin y chatbot
│   ├── hooks/               # Hooks de menu y promociones
│   ├── lib/                 # Cliente Supabase del frontend
│   ├── main.jsx             # Entrada de React
│   └── menuData.js          # Datos completos del menu
├── package.json             # Scripts y dependencias
├── vite.config.js           # Configuracion Vite
└── eslint.config.js         # Configuracion ESLint
```

## Arquitectura funcional

### Frontend

La aplicacion React funciona como SPA con navegacion por hash:

- `#inicio`: portada, carrusel de fotos y seccion de experiencia.
- `#menu`: buscador y filtro por categorias del menu.
- `#promociones`: promociones publicas.
- `#contacto`: mapa, telefono, email, Instagram, horario y planes.
- `#admin`: CMS visual protegido por Supabase Auth.

Supabase se mantiene en el frontend mediante `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.

### Chatbot

El widget consume `POST /api/chat` con una ruta relativa, compatible con Cloudflare Pages. La function:

- Lee `OPENAI_API_KEY` y `OPENAI_MODEL` desde el binding `env` de Cloudflare.
- Usa `gpt-4.1-mini` como modelo por defecto.
- Limita entrada a 500 caracteres por mensaje.
- Incluye hasta 8 mensajes previos.
- Rechaza bodies mayores a 8000 caracteres.
- Usa el prompt y menu completo definidos en `lib/chatContext.js`.
- Llama a OpenAI Responses API.
- Limita salida a 90 tokens.

La logica comun de prompt, limites, normalizacion de historial y extraccion de respuesta vive en `lib/chatContext.js`.

## Variables de entorno

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Uso:

- `OPENAI_API_KEY`: obligatoria para activar el chatbot. Solo debe existir como variable de Cloudflare Pages o `.env` local.
- `OPENAI_MODEL`: opcional; define el modelo usado por la Responses API.
- `VITE_SUPABASE_URL`: URL publica del proyecto Supabase.
- `VITE_SUPABASE_ANON_KEY`: anon key publica de Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: solo para scripts administrativos como `npm run db:seed`.

## Scripts disponibles

```bash
npm run dev      # Servidor Vite de desarrollo
npm run build    # Build de produccion en dist/
npm run lint     # Revision ESLint
npm run preview  # Preview estatico de Vite
npm run db:seed  # Seed local de Supabase
```

## Despliegue en Cloudflare Pages

Configuracion recomendada:

- Framework preset: Vite.
- Build command: `npm run build`.
- Build output directory: `dist`.
- Functions directory: `functions`.

Cloudflare sirve el frontend estatico y ejecuta `functions/api/chat.js` para `/api/chat`.

## Estado de verificacion

Comandos recomendados antes de desplegar:

```bash
npm run lint
npm run build
```

No hay pruebas unitarias, de integracion ni end-to-end configuradas.

## Riesgos tecnicos y observaciones

1. Dependencia de configuracion externa

   Supabase, OpenAI y Cloudflare Pages deben tener variables correctas por ambiente.

2. Dependencia de Supabase

   El menu y CMS dependen de que Auth, Postgres, RLS y Storage esten configurados con el esquema del repositorio.

3. Sin pruebas de regresion

   Playwright esta instalado, pero no existen specs. El flujo de menu, navegacion y chatbot deberia tener al menos pruebas basicas.

4. Manejo limitado de errores del chatbot

   El frontend muestra un mensaje generico cuando falla `/api/chat`. No distingue falta de configuracion, rate limit, error de red o error del proveedor.

## Recomendaciones prioritarias

1. Agregar pruebas Playwright minimas para navegacion, menu, chatbot y admin.
2. Documentar alta de administradores, politicas RLS, bucket de imagenes y proceso de seed por ambiente.
3. Agregar logs estructurados para errores de `/api/chat` y fallos de Supabase.
