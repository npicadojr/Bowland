# Analisis tecnico del sistema Bowland

Fecha de revision: 2026-05-21

## Resumen ejecutivo

Bowland es una aplicacion web de una sola pagina para promocionar el venue Bowland Panama, mostrar el menu completo, exponer canales de contacto, administrar productos desde Supabase y ofrecer un chatbot conectado a OpenAI. El frontend esta construido con React sobre Vite. El backend de produccion es un servidor HTTP Node para Railway que sirve la version compilada, expone `/health` y atiende `/api/chat`.

La base es simple, funcional y de bajo acoplamiento. El mayor riesgo tecnico no esta en la complejidad del codigo, sino en la ausencia de pruebas automatizadas y la dependencia de configuracion externa correcta para Supabase, OpenAI y Railway.

## Estructura del proyecto

```text
.
├── api/
│   └── chat.js              # Funcion serverless heredada del deploy anterior
├── docs/
│   └── ANALISIS_TECNICO.md  # Este documento
├── lib/
│   └── chatContext.js       # Prompt, limites y helpers compartidos del chatbot
├── public/
│   ├── assets/
│   │   └── bowland-logo.png # Logo publico
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── App.jsx              # Aplicacion React, vistas y chatbot
│   ├── App.css              # Estilos principales
│   ├── components/          # Vistas principales, header, admin y chatbot
│   ├── hooks/               # Hooks de menu y promociones
│   ├── index.css            # Estilos base
│   ├── lib/                 # Cliente Supabase del frontend
│   ├── main.jsx             # Entrada de React
│   └── menuData.js          # Datos completos del menu
├── railway.json             # Build, start y healthcheck para Railway
├── server.mjs               # Servidor de produccion con estaticos, /health y /api/chat
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

El estado de navegacion vive en `App.jsx` y se sincroniza con `window.location.hash`. No se usa React Router, lo cual es razonable para el tamano actual del proyecto.

### Menu

El menu publico se carga desde Supabase cuando `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estan configuradas. Si Supabase no esta disponible, usa el fallback local de `src/menuData.js`.

El menu se filtra en cliente por categoria y busqueda textual. La normalizacion elimina acentos para mejorar la busqueda. El CMS permite editar categorias, productos, disponibilidad, visibilidad e imagenes.

### Chatbot

El widget de chat esta embebido en `App.jsx` y consume `POST /api/chat`. El endpoint:

- Requiere `OPENAI_API_KEY`.
- Usa `OPENAI_MODEL` o `gpt-4.1-mini` por defecto.
- Limita entrada a 500 caracteres por mensaje.
- Incluye hasta 8 mensajes previos.
- Restringe la respuesta con un prompt de sistema basado en contexto local.
- Usa el menu completo como contexto.
- Limita salida a 90 tokens.

Hay dos implementaciones casi iguales:

- `server.mjs`: endpoint activo en Railway y en la ejecucion local de produccion.
- `api/chat.js`: funcion serverless heredada del despliegue anterior.

La logica comun de prompt, limites, normalizacion de historial y extraccion de respuesta vive en `lib/chatContext.js`.

## Variables de entorno

El archivo `.env.example` define:

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
PORT=5174
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Uso:

- `OPENAI_API_KEY`: obligatoria para activar el chatbot.
- `OPENAI_MODEL`: opcional; define el modelo usado por la Responses API.
- `PORT`: usado por `server.mjs`; Railway lo define automaticamente en produccion.
- `VITE_SUPABASE_URL`: URL publica del proyecto Supabase.
- `VITE_SUPABASE_ANON_KEY`: anon key publica de Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: solo para scripts administrativos como `npm run db:seed`.

## Scripts disponibles

```bash
npm run dev        # Servidor Vite de desarrollo
npm run build      # Build de produccion en dist/
npm run lint       # Revision ESLint
npm run preview    # Preview de Vite sobre dist/
npm start          # Servidor Node de produccion para Railway
npm run serve:chat # Build y servidor Node con /api/chat
```

## Despliegue en Railway

El despliegue esta definido en `railway.json`:

- Builder: Railpack.
- Build Command: `npm run build`.
- Start Command: `npm start`.
- Healthcheck: `/health`.

`server.mjs` lee `process.env.PORT` y escucha en `0.0.0.0` por defecto para que Railway pueda exponer el servicio publicamente.

## Estado de verificacion

Comandos ejecutados durante el analisis:

```bash
npm run lint
npm run build
```

Resultado:

- `npm run lint`: pasa sin errores.
- `npm run build`: pasa sin errores.
- Build generado: JS aproximado de 252.38 kB, CSS aproximado de 21.02 kB.

No hay pruebas unitarias, de integracion ni end-to-end configuradas.

## Riesgos tecnicos y observaciones

1. Documentacion operativa

   El README ya cubre Railway, variables, CMS y chatbot, pero debe mantenerse sincronizado con cambios de infraestructura.

2. Dependencia de Supabase

   El menu y CMS dependen de que Auth, Postgres, RLS y Storage esten configurados con el esquema del repositorio.

3. Dependencia de imagenes externas

   Si hay productos con URLs externas, esos recursos pueden romperse si el proveedor cambia rutas, bloquea hotlinking o cae.

4. Sin pruebas de regresion

   Playwright esta instalado, pero no existen specs. El flujo de menu, navegacion y chatbot deberia tener al menos pruebas basicas.

5. Manejo limitado de errores del chatbot

   El frontend muestra un mensaje generico cuando falla `/api/chat`. No distingue falta de configuracion, rate limit, error de red o error del proveedor.

6. Accesibilidad mejorable

   La UI tiene varios `aria-label`, botones reales y textos alternativos principales. Aun asi, conviene revisar foco visible, contraste en estados secundarios y textos alternativos de productos si el menu requiere comunicacion visual accesible.

## Recomendaciones prioritarias

1. Agregar pruebas Playwright minimas

   Cubrir:

   - Navegacion `Inicio`, `Menu`, `Contacto`.
   - Busqueda de un producto conocido.
   - Render de tarjetas del menu.
   - Apertura/cierre del chatbot.
   - Estado de error del chatbot sin `OPENAI_API_KEY`.
   - Healthcheck `/health`.

2. Fortalecer operacion de Supabase

   Documentar el alta de administradores, politicas RLS, bucket de imagenes y proceso de seed por ambiente.

3. Mejorar observabilidad

   Agregar logs estructurados para errores de `/api/chat`, fallos de Supabase y healthchecks de produccion.

4. Limpiar CSS y assets no usados

   Remover estilos y assets heredados si no forman parte del producto actual. Esto reduce ruido y hace mas segura la evolucion del frontend.

## Propuesta de roadmap tecnico

### Corto plazo

- Mantener README actualizado.
- Agregar pruebas Playwright smoke.
- Validar el primer deploy en Railway con variables reales.
- Probar login de `/#admin` contra Supabase de produccion.

### Mediano plazo

- Crear un esquema de datos para menu y validar duplicados, precios nulos e imagenes faltantes.
- Agregar monitoreo basico de errores de API.

### Largo plazo

- Administrar menu desde una fuente editable por negocio.
- Incorporar analitica de busquedas y preguntas frecuentes.
- Implementar cache o fallback de imagenes criticas.
- Revisar SEO con metadata especifica, Open Graph y schema local business.
