# Bowland Panama

Sitio web React/Vite para Bowland Panama: portada, galeria, menu publico, informacion de contacto, CMS visual para editar productos y chatbot conectado a OpenAI.

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
- Proyecto Supabase con Auth y Postgres
- Proyecto Vercel conectado al repositorio
- `OPENAI_API_KEY` para activar el chatbot en produccion

## Configuracion

El proyecto usa dos tipos de archivos/variables:

- `.env`: variables reales para desarrollo local. No se sube al repositorio.
- `.env.example`: plantilla/documentacion de las variables necesarias.

Copia `.env.example` a `.env` y configura los valores reales:

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
PORT=5174
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Variables:

- `OPENAI_API_KEY`: obligatoria para `/api/chat`. Sin esta variable, el chatbot muestra un mensaje de fallback.
- `OPENAI_MODEL`: opcional. Si no se define, usa `gpt-4.1-mini`.
- `PORT`: puerto del servidor local con chat (`npm run serve:chat`).
- `VITE_SUPABASE_URL`: URL publica del proyecto Supabase.
- `VITE_SUPABASE_ANON_KEY`: anon key publica de Supabase. Se usa en el frontend.
- `SUPABASE_SERVICE_ROLE_KEY`: solo para scripts locales como `npm run db:seed`. No debe exponerse en el frontend.

En Vercel, configura las variables en:

```text
Project Settings -> Environment Variables
```

Variables recomendadas en Vercel:

```text
OPENAI_API_KEY
OPENAI_MODEL
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Despues de agregar o cambiar variables en Vercel, ejecuta un nuevo deploy o usa `Redeploy` desde el dashboard.

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

El CMS incluye:

- Login con Supabase Auth para administradores autorizados.
- Listado de productos agrupado por categoria.
- Categorias colapsables: por defecto todas inician cerradas y se despliegan manualmente.
- Edicion, creacion, visibilidad publica y eliminacion de productos.
- Edicion y creacion de categorias.
- Subida de imagenes de producto desde archivo o pegando una URL.

### Agregar administradores

1. En Supabase, ve a `Authentication -> Users`.
2. Crea el usuario con email y password.
3. Copia el `User UID`.
4. Ejecuta esto en Supabase SQL Editor:

```sql
insert into menu_admins (user_id)
values ('UUID_DEL_USUARIO')
on conflict (user_id) do nothing;
```

Los productos con `available = true` aparecen en el menu publico. Los cambios se guardan en Supabase y el menu publico se refresca al cargar la pagina; si Realtime esta habilitado para esas tablas, tambien escucha cambios en vivo.

El CMS permite subir imagenes de productos a Supabase Storage. El esquema crea el bucket publico:

```text
menu-product-images
```

Las imagenes pueden leerse publicamente, pero solo usuarios registrados en `menu_admins` pueden subir, actualizar o borrar archivos en ese bucket.

Desde el formulario de producto se puede:

- Subir una imagen local al bucket `menu-product-images`.
- Pegar una URL externa en `URL de imagen`.
- Ver una previsualizacion antes de guardar el producto.

El upload desde archivo valida que sea una imagen y limita el tamano a 5 MB.

Las politicas publicas de lectura:

```text
public read categories
public read products
```

permiten ver el menu publico. No permiten editar datos.

## Deploy en Vercel

El proyecto esta pensado para deploy automatico desde el repositorio conectado en Vercel.

Flujo recomendado:

```bash
npm run lint
npm run build
git add .
git commit -m "Describe el cambio"
git push
```

Vercel detecta el `git push`, instala dependencias, ejecuta el build de Vite y publica la nueva version.

Configuracion esperada en Vercel:

- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

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
src/hooks/useMenu.js Carga del menu desde Supabase con fallback local
src/lib/              Cliente Supabase del frontend
src/components/AdminPage.jsx CMS visual para editar el menu
src/components/Header.jsx Navegacion publica
src/App.css          Estilos principales
public/assets/       Assets publicos
supabase/schema.sql  Tablas, funciones, politicas RLS y bucket de imagenes
supabase/seed.js     Carga inicial del menu usando service role
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

La API key de OpenAI se lee desde:

```text
process.env.OPENAI_API_KEY
```

En produccion la usa `api/chat.js` dentro de Vercel. En local la usa `server.mjs` cuando corres `npm run serve:chat`.

## Seguridad y mantenimiento

- No subir `.env` al repositorio.
- No poner `SUPABASE_SERVICE_ROLE_KEY` en codigo frontend.
- No usar la service role key desde componentes React.
- Si una key se filtra, rotarla en OpenAI o Supabase, actualizar Vercel y hacer `Redeploy`.
- Para cambios de menu, usar `/#admin` con un usuario registrado en `menu_admins`.
- Para cambios de codigo, validar con `npm run lint` y `npm run build` antes de hacer push.

## Documentacion

El analisis tecnico completo esta en:

- [`docs/ANALISIS_TECNICO.md`](docs/ANALISIS_TECNICO.md)

## Verificacion

Estado al 2026-05-21:

- `npm run lint`: pasa.
- `npm run build`: pasa.

Actualmente no hay pruebas unitarias ni end-to-end configuradas.
