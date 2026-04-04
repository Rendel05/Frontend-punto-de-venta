const CARRITO_STORAGE_KEY = "carrito";

function getCarrito() {
  try {
    const raw = localStorage.getItem(CARRITO_STORAGE_KEY);
    const carrito = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(carrito)) return [];

    return carrito.filter(item => item && item.producto_id != null && Number(item.cantidad) > 0);
  } catch {
    return [];
  }
}

function saveCarrito(carrito) {
  localStorage.setItem(CARRITO_STORAGE_KEY, JSON.stringify(carrito));
}

function normalizarProducto(producto) {
  const precioFinal = Number(producto.precio_final);

  return {
    producto_id: producto.producto_id,
    nombre: producto.nombre,
    precio_unitario: Number.isFinite(precioFinal) ? precioFinal : 0,
    cantidad: 1,
    imagen: producto.imagen_url || "../assets/img/default.png"
  };
}

function agregarAlCarrito(producto) {
  const carrito = getCarrito();
  const idx = carrito.findIndex(item => String(item.producto_id) === String(producto.producto_id));

  if (idx >= 0) {
    carrito[idx].cantidad += 1;
  } else {
    carrito.push(normalizarProducto(producto));
  }

  saveCarrito(carrito);
  actualizarCarritoUI();
  return carrito;
}

function quitarDelCarrito(producto_id) {
  const carrito = getCarrito().filter(item => String(item.producto_id) !== String(producto_id));
  saveCarrito(carrito);
  actualizarCarritoUI();
  return carrito;
}

function actualizarCantidad(producto_id, cantidad) {
  const cantidadNueva = Number(cantidad);
  const carrito = getCarrito();
  const idx = carrito.findIndex(item => String(item.producto_id) === String(producto_id));

  if (idx < 0) return carrito;

  if (!Number.isFinite(cantidadNueva) || cantidadNueva <= 0) {
    carrito.splice(idx, 1);
  } else {
    carrito[idx].cantidad = Math.floor(cantidadNueva);
  }

  saveCarrito(carrito);
  actualizarCarritoUI();
  return carrito;
}

function getTotal() {
  return getCarrito().reduce((acc, item) => {
    return acc + Number(item.precio_unitario) * Number(item.cantidad);
  }, 0);
}

function actualizarCarritoUI() {
  const carrito = getCarrito();
  const totalCantidad = carrito.reduce((acc, item) => acc + Number(item.cantidad), 0);
  const total = getTotal();

  const countText = totalCantidad > 9 ? "+9" : String(totalCantidad);
  const totalText = total > 99999 ? "$+99999" : `$${total.toFixed(2)}`;

  document.querySelectorAll(".cart-count").forEach(el => {
    el.textContent = countText;
  });

  document.querySelectorAll(".cart-total").forEach(el => {
    el.textContent = totalText;
  });
}

function getProductoEnCatalogo(producto_id) {
  if (!Array.isArray(window.productos)) return null;

  return window.productos.find(prod => String(prod.producto_id) === String(producto_id)) || null;
}

function renderBotonCantidad(producto) {
  const carrito = getCarrito();
  const item = carrito.find(p => String(p.producto_id) === String(producto.producto_id));

  if (!item) {
    return `
      <button class="btn btn-sm btn-primary btn-add" data-product-id="${producto.producto_id}">
        Agregar
      </button>
    `;
  }

  return `
    <div class="cart-qty-controls" data-product-id="${producto.producto_id}">
      <button class="btn btn-sm btn-outline-secondary btn-minus" data-product-id="${producto.producto_id}">-</button>
      <span class="qty-value">${item.cantidad}</span>
      <button class="btn btn-sm btn-outline-secondary btn-plus" data-product-id="${producto.producto_id}">+</button>
    </div>
  `;
}

function rerenderProducto(producto_id) {
  const producto = getProductoEnCatalogo(producto_id);

  if (!producto) return;

  const card = document.querySelector(`[data-product="${producto_id}"]`);
  if (!card) return;

  const zona = card.querySelector("[data-cart-zone]");
  if (!zona) return;

  zona.innerHTML = renderBotonCantidad(producto);
}

function registrarProductos(productos = []) {
  const base = Array.isArray(window.productos) ? window.productos : [];
  const mapa = new Map(base.map(p => [String(p.producto_id), p]));

  productos.forEach(prod => {
    if (prod && prod.producto_id != null) {
      mapa.set(String(prod.producto_id), prod);
    }
  });

  window.productos = Array.from(mapa.values());
}

function configurarEventosCarrito() {
  if (document.body.dataset.cartEventsReady === "1") return;
  document.body.dataset.cartEventsReady = "1";

  document.addEventListener("click", e => {
    const btnAdd = e.target.closest(".btn-add");
    if (btnAdd) {
      e.preventDefault();
      e.stopPropagation();

      const { productId } = btnAdd.dataset;
      const producto = getProductoEnCatalogo(productId);
      if (!producto) return;

      agregarAlCarrito(producto);
      rerenderProducto(productId);
      return;
    }

    const btnPlus = e.target.closest(".btn-plus");
    if (btnPlus) {
      e.preventDefault();
      e.stopPropagation();

      const { productId } = btnPlus.dataset;
      const carrito = getCarrito();
      const item = carrito.find(p => String(p.producto_id) === String(productId));
      if (!item) return;

      actualizarCantidad(productId, Number(item.cantidad) + 1);
      rerenderProducto(productId);
      return;
    }

    const btnMinus = e.target.closest(".btn-minus");
    if (btnMinus) {
      e.preventDefault();
      e.stopPropagation();

      const { productId } = btnMinus.dataset;
      const carrito = getCarrito();
      const item = carrito.find(p => String(p.producto_id) === String(productId));
      if (!item) return;

      actualizarCantidad(productId, Number(item.cantidad) - 1);
      rerenderProducto(productId);
    }
  });
}

function initCarrito() {
  actualizarCarritoUI();
  configurarEventosCarrito();
}

window.getCarrito = getCarrito;
window.saveCarrito = saveCarrito;
window.agregarAlCarrito = agregarAlCarrito;
window.quitarDelCarrito = quitarDelCarrito;
window.actualizarCantidad = actualizarCantidad;
window.getTotal = getTotal;
window.actualizarCarritoUI = actualizarCarritoUI;
window.renderBotonCantidad = renderBotonCantidad;
window.rerenderProducto = rerenderProducto;
window.registrarProductos = registrarProductos;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCarrito);
} else {
  initCarrito();
}
