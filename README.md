# Punto de Venta — Frontend

Frontend del sistema **Punto de Venta**, encargado de renderizar las vistas del sistema y consumir la API del backend para mostrar y gestionar la información.

Este proyecto implementa la interfaz para usuarios públicos y la vista administrativa para gestión del negocio.

---

## Descripción

El frontend se encarga de:

* Renderizar las páginas del sistema.
* Consumir la API del backend mediante peticiones HTTP.
* Implementar la lógica de negocio en el cliente para las distintas vistas.
* Gestionar la autenticación mediante tokens.
* Proporcionar una interfaz administrativa para la gestión del sistema.

El sistema se divide en dos grandes áreas:

### Vistas públicas

Permiten a los usuarios navegar por el catálogo y consultar productos.

### Vista administrativa

Permite a administradores autenticados realizar tareas de gestión como:

* Administración de productos
* Administración de categorías
* Administración de usuarios
* Visualización de información del sistema

---

## Tecnologías utilizadas

* **HTML5**
* **CSS3**
* **JavaScript (ES Modules)**
* **Bootstrap 5**
* **Fetch API**

El frontend consume una API REST desarrollada en el backend del proyecto.

---

## Estructura del proyecto

```
frontend/
│
├── assets/
│   ├── favicon/
│   └── img/
│
├── css/
│   ├── admin.css
│   ├── login-styles.css
│   └── styles.css
│
├── js/
│   ├── auth.js
│   ├── login.js
│   ├── main.js
│   ├── navbar-search.js
│   ├── products.js
│   └── subnavbar-categories.js
│
├── pages/
│   ├── about.html
│   ├── admin.html
│   ├── contact.html
│   ├── login.html
│   └── products.html
│
├── index.html
└── README.md
```

---

## Funcionamiento

1. El usuario accede a las páginas públicas del sistema.
2. El frontend consulta la API del backend para obtener datos.
3. La información recibida se renderiza dinámicamente en las vistas.
4. Los administradores pueden autenticarse mediante el formulario de login.
5. Tras autenticarse, se almacena un **token de sesión** que permite acceder al panel administrativo.

---

## Autenticación

La autenticación se realiza mediante **token almacenado en localStorage**.

El flujo básico es:

```
Login → API → Token → localStorage → Acceso al panel admin
```

Las rutas administrativas verifican la existencia del token antes de permitir el acceso.

---

## Backend

Este frontend consume la API del backend del sistema Punto de Venta.

La API se encarga de:

* Autenticación
* Gestión de productos
* Gestión de categorías
* Gestión de usuarios
* Operaciones del sistema

---

## Estado del proyecto

Proyecto en desarrollo como parte de un **proyecto integrador universitario** para la implementación de un sistema de punto de venta.

---

## Licencia

Este proyecto se distribuye bajo la licencia incluida en el repositorio.
