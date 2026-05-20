# Bowland Panama

Sitio web React/Vite para Bowland Panama: portada, galeria, menu completo, informacion de contacto y chatbot conectado a OpenAI.

## Stack

- React 19
- Vite 8
- JavaScript ESM
- CSS plano
- lucide-react
- Supabase Auth y Postgres para menu administrable
- Node.js HTTP nativo para servir build local con chat
- Funcion serverless en `api/chat.js`
- OpenAI Responses API para el asistente virtual

## Requisitos

- Node.js compatible con Vite 8
- npm
- `OPENAI_API_KEY` para activar el chatbot

## Configuracion

Copia `.env.example` a `.env` y configura las variables necesarias:

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
PORT=5174
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`OPENAI_API_KEY` es obligatoria para `/api/chat`. Sin esa variable, el backend devuelve error de configuracion y el frontend muestra un mensaje de fallback.

`VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` activan el menu conectado a Supabase y el panel `#admin`. `SUPABASE_SERVICE_ROLE_KEY` solo se usa para `npm run db:seed`; nunca debe exponerse en el frontend.

## CMS visual

1. Ejecuta `supabase/schema.sql` en Supabase SQL Editor.
2. Crea usuarios administradores en Supabase Auth con email y contraseña.
3. Opcionalmente carga el menu inicial con `npm run db:seed`.
4. Entra a `/#admin`, inicia sesion y administra categorias/productos.

Los productos con `available = true` aparecen en el menu publico. Los cambios se guardan en Supabase y el menu publico se refresca al cargar la pagina; si Realtime esta habilitado para esas tablas, tambien escucha cambios en vivo.

## Scripts

```bash
npm run dev        # Desarrollo con Vite
npm run build      # Build de produccion en dist/
npm run lint       # Lint del proyecto
npm run preview    # Preview de Vite
npm run serve:chat # Build + servidor Node con /api/chat
```

## Estructura

```text
api/chat.js          Funcion serverless del chatbot
server.mjs           Servidor local de produccion con endpoint de chat
src/App.jsx          UI principal, vistas y widget de chat
src/menuData.js      Categorias y productos del menu
src/components/AdminPage.jsx CMS visual para editar el menu
src/App.css          Estilos principales
public/assets/       Assets publicos
docs/                Documentacion tecnica
```

## Chatbot

El chatbot consume `POST /api/chat` con:

```json
{
  "message": "Cual es el horario?",
  "messages": []
}
```

El backend arma un contexto con datos de Bowland, contacto, horario y menu completo. Las respuestas estan limitadas para no inventar precios, promociones, reservas ni disponibilidad en tiempo real.

## Documentacion

El analisis tecnico completo esta en:

- [`docs/ANALISIS_TECNICO.md`](docs/ANALISIS_TECNICO.md)

## Verificacion

Estado al 2026-05-20:

- `npm run lint`: pasa.
- `npm run build`: pasa.

Actualmente no hay pruebas unitarias ni end-to-end configuradas.
