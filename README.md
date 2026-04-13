# Punto de Venta — Frontend (Tienda Oly)

Frontend web del sistema **Punto de Venta Tienda Oly**. Implementa la experiencia pública de e-commerce (catálogo, carrito, checkout, perfil) y los paneles internos para **Administración** y **Caja**, consumiendo una API REST externa.

## Descripción

Este repositorio contiene una aplicación web construida con HTML, CSS y JavaScript vanilla (sin framework SPA) que:

- Muestra catálogo, categorías, ofertas y detalle de producto.
- Permite autenticación por roles (Cliente, Admin, Cajero).
- Gestiona carrito en `localStorage`.
- Integra flujo de pago con **Mercado Pago** vía backend.
- Incluye panel administrativo para productos, usuarios, ofertas, páginas dinámicas, cortes de caja y analítica/predicción.

Su objetivo es centralizar las operaciones de una tienda en una interfaz simple, de fácil despliegue y orientada a demostración académica/profesional.

## Key features

### Público / Cliente
- Home con hero de oferta, categorías, productos populares y ofertas activas.
- Catálogo con filtros por categoría, búsqueda y paginación.
- Detalle de producto con reseñas (crear/eliminar para clientes autenticados).
- Carrito persistente en navegador con control de cantidad y stock.
- Registro/login de clientes.
- Perfil de cliente: edición de datos, cambio de contraseña e historial/detalle de compras.
- Checkout con redirección a Mercado Pago y páginas de resultado (`success` / `failure`).

### Backoffice
- **Admin panel**:
  - Dashboard de crecimiento de clientes con gráfica (Chart.js) y predicción exponencial.
  - CRUD de productos (incluye carga de imagen y relación categoría/proveedor).
  - CRUD de ofertas con activación/desactivación.
  - Gestión de usuarios internos (Admin/Cajero) con estado.
  - Editor de páginas CMS (About, Contact, Legal) por bloques con TinyMCE.
  - Corte de caja y consulta de movimientos.
- **Cajero panel**:
  - Consulta de ventas recientes por rango de días.
  - Consulta de retiros recientes por rango de días.

## Tech stack

### Frontend
- HTML5
- CSS3
- JavaScript (ES Modules + scripts vanilla)
- Bootstrap 5
- Bootstrap Icons
- SweetAlert2
- Chart.js
- TinyMCE (CDN)

### Backend (consumido externamente)
- API REST en: `https://backend-punto-de-venta-render.onrender.com/api`
- Autenticación por JWT (guardado en `localStorage`)

### Integraciones
- Mercado Pago (flujo de preferencia de pago vía backend)

### Base de datos
- **No incluida en este repositorio** (se gestiona en el backend).

## Architecture overview

Arquitectura de frontend desacoplado + API:

1. Las vistas HTML (`index.html` y `pages/*.html`) renderizan la estructura base.
2. Los módulos JS consumen la API REST con `fetch`.
3. La sesión se maneja con JWT en `localStorage` y validación de rol en cliente.
4. El carrito se administra localmente y se envía al backend al iniciar checkout.
5. El backend responde con URLs de pago de Mercado Pago y datos de negocio.

> No hay servidor Node dentro de este repo; es un sitio estático que depende de la API remota.

## Estructura del proyecto

```text
.
├── index.html
├── pages/
│   ├── products.html
│   ├── product.html
│   ├── cart.html
│   ├── checkout.html
│   ├── success.html
│   ├── failure.html
│   ├── login.html
│   ├── register.html
│   ├── profile.html
│   ├── admin.html
│   ├── cashier.html
│   ├── about.html
│   ├── contact.html
│   └── legal.html
├── js/
├── css/
├── assets/
└── helpers/
```

## Installation steps

### Requisitos
- Navegador moderno (Chrome/Edge/Firefox).
- Servidor HTTP estático local (recomendado para evitar problemas de rutas/CORS de `file://`).

### Instalación y ejecución
1. Clona el repositorio.
2. Entra a la carpeta del proyecto.
3. Levanta un servidor estático.

Ejemplo con Python:

```bash
git clone <tu-repo>
cd Frontend-punto-de-venta
python3 -m http.server 5500
```

4. Abre en el navegador:

- `http://localhost:5500/`

## Environment variables

Este frontend **no usa variables de entorno** ni proceso de build actualmente.

Configuración importante detectada:
- La URL de API está **hardcodeada** en múltiples archivos JS:
  - `https://backend-punto-de-venta-render.onrender.com/api`

Si deseas cambiar entorno (dev/staging/prod), actualmente debes actualizar esas constantes manualmente.

## Usage

### Flujo público
1. Entrar a `index.html`.
2. Navegar a catálogo o usar buscador.
3. Agregar productos al carrito.
4. Iniciar sesión (si no hay sesión) para pagar.
5. Proceder a checkout y completar pago en Mercado Pago.
6. Revisar compras en `profile.html`.

### Roles internos
- **Admin**: iniciar sesión y entrar a `pages/admin.html`.
- **Cajero**: iniciar sesión y entrar a `pages/cashier.html`.

El redireccionamiento por rol se hace automáticamente tras login.

## API overview

Principales grupos de endpoints consumidos por el frontend:

- Auth:
  - `POST /login`

- Catálogo:
  - `GET /categories`
  - `GET /products/active`
  - `GET /products/popular`
  - `GET /products/:id`
  - `GET /products/search`
  - `GET /products/category/:id`

- Ofertas:
  - `GET /offers/active`
  - `GET /offers` (admin)
  - `POST /offers` / `PUT /offers/:id` / `PUT /offers/:id/status`

- Clientes y perfil:
  - `POST /customers` (registro)
  - `GET /customers/:id`
  - `PUT /customers/:id`
  - `PUT /customers/:id/password`

- Órdenes:
  - `GET /orders`
  - `GET /orders/:id`

- Reseñas:
  - `GET /reviews/:productId`
  - `POST /reviews`
  - `DELETE /reviews/:reviewId`

- Administración:
  - `GET /users`, `POST /users`, `PUT /users/:id`, `PUT /users/:id/status`
  - `GET /products` (admin), `POST/PUT products`, `PUT /products/:id/status`
  - `GET /suppliers`
  - `GET /pages`, `GET /pages/:id`, `POST/PUT/DELETE /pages/content...`
  - `GET/POST /cashOut`
  - `GET /cashier/:userId/sales`
  - `GET /cashier/:userId/withdrawals`
  - `GET /prediction/resumen`, `POST /prediction`

## Payment integration details

La integración de pagos se implementa así:

1. El frontend toma el carrito desde `localStorage`.
2. Envía `POST /payment/create-preference` con JWT y carrito.
3. El backend devuelve `init_point` de Mercado Pago.
4. El cliente es redirigido a Mercado Pago.
5. Mercado Pago redirige a:
   - `pages/success.html` (flujo aprobado)
   - `pages/failure.html` (cancelado/error)

Notas:
- En `success.html` se limpia el carrito local cuando el retorno es válido.
- La validación final del pago depende del backend y de Mercado Pago.

## Project status

- **Estado funcional:** implementado y utilizable en entorno de demostración.
- **Producción:** requiere endurecimiento adicional (configuración por entorno, manejo centralizado de errores, pruebas automatizadas, hardening de seguridad frontend).

## Notes / limitations

- API URL hardcodeada en varios módulos JS.
- Sin pipeline de build/lint/test en este repositorio.
- Sin backend ni esquema de BD incluidos aquí.
- Autorización en frontend por JWT decodificado en cliente (la seguridad real depende del backend).
- Algunas vistas dependen completamente de contenido dinámico del backend (CMS de páginas).

## Licencia

Consulta el archivo `LICENCE` del repositorio.
