# Bowland Panama

Sitio web React/Vite para Bowland Panama: portada, galeria, menu publico, informacion de contacto, CMS visual con Supabase y chatbot conectado a OpenAI mediante Cloudflare Pages Functions.

## Stack

- React 19
- Vite 8
- JavaScript ESM
- CSS plano
- lucide-react
- Supabase Auth y Postgres para menu administrable
- Cloudflare Pages para hosting del frontend
- Cloudflare Pages Functions para `POST /api/chat`
- OpenAI Responses API para el asistente virtual

## Requisitos

- Node.js compatible con Vite 8
- npm
- Proyecto Supabase con Auth y Postgres
- Proyecto Cloudflare Pages conectado al repositorio
- `OPENAI_API_KEY` configurada en Cloudflare Pages para activar el chatbot

## Configuracion

El proyecto usa dos tipos de variables:

- Variables locales en `.env`. No se suben al repositorio.
- Variables de Cloudflare Pages para produccion y previews.

Copia `.env.example` a `.env` y configura los valores reales:

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Variables:

- `OPENAI_API_KEY`: obligatoria para `/api/chat`. Se usa solo en la Pages Function.
- `OPENAI_MODEL`: opcional. Si no se define, usa `gpt-4.1-mini`.
- `VITE_SUPABASE_URL`: URL publica del proyecto Supabase.
- `VITE_SUPABASE_ANON_KEY`: anon key publica de Supabase. Se usa en el frontend.
- `SUPABASE_SERVICE_ROLE_KEY`: solo para scripts locales como `npm run db:seed`. No debe exponerse en el frontend.

En Cloudflare Pages, configura:

```text
Settings -> Environment variables
```

Variables recomendadas:

```text
OPENAI_API_KEY
OPENAI_MODEL
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

## Deploy en Cloudflare Pages

Configuracion recomendada:

```text
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Functions directory: functions
```

Cloudflare Pages sirve el build estatico desde `dist/` y publica automaticamente `functions/api/chat.js` como `POST /api/chat`.

## CMS visual

1. Ejecuta `supabase/schema.sql` en Supabase SQL Editor.
2. Crea usuarios administradores en Supabase Auth con email y contraseña.
3. Agrega esos usuarios a `menu_admins`.
4. Opcionalmente carga el menu inicial con `npm run db:seed`.
5. Entra a `/#admin`, inicia sesion y administra categorias/productos.

El acceso al admin no aparece en el header publico. Se entra directamente por URL:

```text
/#admin
```

## Scripts

```bash
npm run dev      # Desarrollo frontend con Vite
npm run build    # Build de produccion en dist/
npm run lint     # Lint del proyecto
npm run preview  # Preview local del build estatico de Vite
npm run db:seed  # Carga inicial del menu usando service role local
```

## Estructura

```text
functions/api/chat.js  Pages Function del chatbot
lib/chatContext.js     Prompt, limites, historial y helpers compartidos
src/App.jsx            UI principal, vistas y widget de chat
src/menuData.js        Categorias y productos del menu
src/hooks/useMenu.js   Carga del menu desde Supabase con fallback local
src/lib/               Cliente Supabase del frontend
src/components/        Vistas, header, admin y chatbot
src/App.css            Estilos principales
public/assets/         Assets publicos
supabase/schema.sql    Tablas, funciones, politicas RLS y bucket de imagenes
supabase/seed.js       Carga inicial del menu usando service role
docs/                  Documentacion tecnica
```

## Chatbot

El frontend consume `POST /api/chat` con:

```json
{
  "message": "Cual es el horario?",
  "messages": []
}
```

La Pages Function arma el contexto con datos de Bowland, contacto, horario y menu completo. Mantiene limites de entrada, historial reciente, prompt de sistema y limite de salida para reducir costo y evitar respuestas inventadas.

## Seguridad y mantenimiento

- No subir `.env` al repositorio.
- No poner `OPENAI_API_KEY` ni `SUPABASE_SERVICE_ROLE_KEY` en codigo frontend.
- Solo las variables con prefijo `VITE_` llegan al frontend.
- Si una key se filtra, rotarla en OpenAI o Supabase, actualizar Cloudflare Pages y redeployar.
- Para cambios de menu, usar `/#admin` con un usuario registrado en `menu_admins`.
- Para cambios de codigo, validar con `npm run lint` y `npm run build` antes de hacer push.

## Documentacion

El analisis tecnico completo esta en:

- [`docs/ANALISIS_TECNICO.md`](docs/ANALISIS_TECNICO.md)
