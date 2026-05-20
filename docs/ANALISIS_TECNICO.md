# Analisis tecnico del sistema Bowland

Fecha de revision: 2026-05-20

## Resumen ejecutivo

Bowland es una aplicacion web de una sola pagina para promocionar el venue Bowland Panama, mostrar el menu completo, exponer canales de contacto y ofrecer un chatbot conectado a OpenAI. El frontend esta construido con React sobre Vite. El backend es minimo y existe en dos variantes: una funcion serverless para despliegue tipo Vercel y un servidor HTTP local para servir la version compilada con el mismo endpoint de chat.

La base es simple, funcional y de bajo acoplamiento. El mayor riesgo tecnico no esta en la complejidad del codigo, sino en la duplicacion de logica del chatbot, la ausencia de pruebas automatizadas y la dependencia de datos e imagenes externas sin una estrategia de actualizacion o fallback.

## Estructura del proyecto

```text
.
├── api/
│   └── chat.js              # Funcion serverless del chatbot
├── docs/
│   └── ANALISIS_TECNICO.md  # Este documento
├── public/
│   ├── assets/
│   │   └── bowland-logo.png # Logo publico
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── App.jsx              # Aplicacion React, vistas y chatbot
│   ├── App.css              # Estilos principales
│   ├── index.css            # Estilos base
│   ├── main.jsx             # Entrada de React
│   └── menuData.js          # Datos completos del menu
├── server.mjs               # Servidor local de produccion con endpoint de chat
├── package.json             # Scripts y dependencias
├── vite.config.js           # Configuracion Vite
└── eslint.config.js         # Configuracion ESLint
```

## Arquitectura funcional

### Frontend

La aplicacion React funciona como SPA con navegacion por hash:

- `#inicio`: portada, carrusel de fotos y seccion de experiencia.
- `#menu`: buscador y filtro por categorias del menu.
- `#contacto`: mapa, telefono, email, Instagram, horario y planes.

El estado de navegacion vive en `App.jsx` y se sincroniza con `window.location.hash`. No se usa React Router, lo cual es razonable para el tamano actual del proyecto.

### Menu

Los datos viven en `src/menuData.js` como arrays exportados:

- `menuCategories`: 15 categorias.
- `menuProducts`: 139 productos.
- Todos los productos tienen imagen.
- 3 productos tienen precio no confirmado o no valido.
- No se detectaron productos marcados como agotados.

El menu se filtra en cliente por categoria y busqueda textual. La normalizacion elimina acentos para mejorar la busqueda.

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

- `api/chat.js`: para funciones serverless.
- `server.mjs`: para ejecutar localmente una build de produccion.

Esta duplicacion es util para despliegue flexible, pero conviene extraer la logica compartida a un modulo comun para reducir inconsistencias.

## Variables de entorno

El archivo `.env.example` define:

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
PORT=5174
```

Uso:

- `OPENAI_API_KEY`: obligatoria para activar el chatbot.
- `OPENAI_MODEL`: opcional; define el modelo usado por la Responses API.
- `PORT`: usado por `server.mjs` al ejecutar `npm run serve:chat`.

## Scripts disponibles

```bash
npm run dev        # Servidor Vite de desarrollo
npm run build      # Build de produccion en dist/
npm run lint       # Revision ESLint
npm run preview    # Preview de Vite sobre dist/
npm run serve:chat # Build y servidor Node con /api/chat
```

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

1. Duplicacion de backend del chatbot

   `api/chat.js` y `server.mjs` repiten prompt, formateo de precios, normalizacion de historial, llamada a OpenAI y extraccion de respuesta. Cualquier cambio futuro podria quedar aplicado en un archivo y no en el otro.

2. Documentacion previa insuficiente

   El README original era la plantilla de Vite y no explicaba Bowland, el chatbot, variables de entorno ni despliegue.

3. Datos del menu hardcodeados

   El menu esta versionado en codigo. Esto facilita un sitio rapido y estable, pero requiere despliegue para actualizar precios, disponibilidad o productos.

4. Dependencia de imagenes externas

   Gran parte del contenido visual viene de URLs remotas. Si el proveedor cambia rutas, bloquea hotlinking o cae, la UI pierde contenido visual.

5. Sin pruebas de regresion

   Playwright esta instalado, pero no existen specs. El flujo de menu, navegacion y chatbot deberia tener al menos pruebas basicas.

6. Manejo limitado de errores del chatbot

   El frontend muestra un mensaje generico cuando falla `/api/chat`. No distingue falta de configuracion, rate limit, error de red o error del proveedor.

7. CSS con estilos no usados

   Existen clases como `menu-section`, `visit-section`, `category-rail`, `menu-card` y `hero-media` que no parecen renderizarse desde `App.jsx`. Pueden ser restos de iteraciones previas.

8. Accesibilidad mejorable

   La UI tiene varios `aria-label`, botones reales y textos alternativos principales. Aun asi, conviene revisar foco visible, contraste en estados secundarios y textos alternativos de productos si el menu requiere comunicacion visual accesible.

## Recomendaciones prioritarias

1. Extraer logica compartida del chat

   Crear un modulo, por ejemplo `src/chatContext.js` o `lib/chat.js`, que centralice:

   - Construccion de `MENU_CONTEXT`.
   - `SITE_CONTEXT` y `CHATBOT_PROMPT`.
   - Normalizacion del historial.
   - Extraccion de respuesta.
   - Constantes de limites.

2. Agregar pruebas Playwright minimas

   Cubrir:

   - Navegacion `Inicio`, `Menu`, `Contacto`.
   - Busqueda de un producto conocido.
   - Render de tarjetas del menu.
   - Apertura/cierre del chatbot.
   - Estado de error del chatbot sin `OPENAI_API_KEY`.

3. Definir fuente de verdad para el menu

   Si el menu cambia seguido, mover datos a CMS, JSON remoto versionado, base de datos o una integracion con la fuente del menu digital.

4. Mejorar documentacion operacional

   Documentar despliegue, variables por ambiente, actualizacion del menu, verificacion visual y procedimiento para rotar `OPENAI_API_KEY`.

5. Limpiar CSS y assets no usados

   Remover estilos y assets heredados si no forman parte del producto actual. Esto reduce ruido y hace mas segura la evolucion del frontend.

## Propuesta de roadmap tecnico

### Corto plazo

- Mantener README actualizado.
- Extraer modulo compartido del chatbot.
- Agregar pruebas Playwright smoke.
- Validar que las 3 entradas sin precio esten intencionalmente sin monto.

### Mediano plazo

- Separar componentes React por dominio: `Header`, `MenuPage`, `ContactPage`, `ChatbotWidget`.
- Crear un esquema de datos para menu y validar duplicados, precios nulos e imagenes faltantes.
- Agregar monitoreo basico de errores de API.

### Largo plazo

- Administrar menu desde una fuente editable por negocio.
- Incorporar analitica de busquedas y preguntas frecuentes.
- Implementar cache o fallback de imagenes criticas.
- Revisar SEO con metadata especifica, Open Graph y schema local business.
