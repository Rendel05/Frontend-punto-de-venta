const CART_PAGE_ID = "cart-page";

function initCartPage() {
  const container = document.getElementById(CART_PAGE_ID);
  if (!container) return;

  renderCartPage(container);
  configurarEventosCartPage(container);
}

function renderCartPage(container) {
  const carrito = getCarrito();

  if (!carrito.length) {
    container.innerHTML = renderCarritoVacio();
    return;
  }

  const productosHTML = carrito.map(item => renderItemCarrito(item)).join("");
  const total = getTotal().toFixed(2);
  const totalItems = carrito.reduce((acc, i) => acc + i.cantidad, 0);

  container.innerHTML = `
    <div class="cart-container">

      <h2>Tu carrito</h2>
      <div class="mb-3 d-flex align-items-center">
        <i class="icon-pickup"></i>
        <small class="text-muted">
          Disponible para pickup en sucursal
        </small>
      </div>

      <div class="d-flex gap-4 flex-wrap align-items-start">

        <div class="cart-items">
          ${productosHTML}
        </div>

        <div class="cart-summary-panel">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="fw-semibold" style="font-size:.9rem;color:var(--muted)">
              ${totalItems} ${totalItems === 1 ? 'producto' : 'productos'}
            </span>
          </div>

          <div class="d-flex justify-content-between mb-2" style="font-size:.9rem;color:var(--muted)">
            <span>Subtotal</span>
            <span>$${total}</span>
          </div>
          <!--
          <div class="d-flex justify-content-between mb-3" style="font-size:.9rem;color:var(--muted)">
            <span>Envío</span>
            <span class="text-success fw-semibold">Gratis</span>
          </div>
          -->
          <hr style="border-color:#f0f0f0; margin: .75rem 0">

          <h4>
            <span>Total</span>
            <strong>$${total}</strong>
          </h4>

          <button class="btn btn-primary w-100" id="btn-checkout">
            Proceder al pago
          </button>

          <small class="checkout-note">
            <i class="bi bi-exclamation-circle"></i>
            Precio tentativo, el precio final puede cambiar
          </small>
        </div>

      </div>
    </div>
  `;
}

//Carrito vacío
function renderCarritoVacio() {
  return `
        <div class="d-flex flex-column justify-content-center align-items-center text-center">
        <img src="../assets/img/empty_cart.png" alt="Carrito vacío" style="max-width:400px;">
        <h3 class="fw-bold">Tu carrito está vacío</h3>
        <p class="text-muted fw-light" style="margin-top:-5px; font-size:15px">Todo muy tranquilo por aquí</p>
        <a href="./products.html" class="btn btn-primary">Explorar el catálogo</a>
        </div>
  `;
}

function renderItemCarrito(item) {
  const subtotal = (item.precio_unitario * item.cantidad).toFixed(2);

  const stock = Number(item.stock);
  const maxStockAlcanzado = Number.isFinite(stock) && item.cantidad >= stock;

  return `
    <div class="cart-item d-flex gap-3" data-product-id="${item.producto_id}">

      <img
        src="${item.imagen}"
        alt="${item.nombre}"
        onclick="window.location.href='./product.html?id=${item.producto_id}'"
      >

      <div class="flex-grow-1 d-flex flex-column justify-content-between">
        <div>
          <h6>${item.nombre}</h6>
          <p class="mb-1">$${item.precio_unitario.toFixed(2)}</p>
        </div>

        <div class="cart-qty-controls" data-product-id="${item.producto_id}">
          <button class="btn-minus" data-product-id="${item.producto_id}">−</button>
          <span class="qty-value">${item.cantidad}</span>
          <button 
            class="btn-plus ${maxStockAlcanzado ? 'disabled-btn' : ''}" 
            data-product-id="${item.producto_id}"
            ${maxStockAlcanzado ? "disabled" : ""}
          >+</button>
        </div>
      </div>

      <div class="d-flex flex-column align-items-end justify-content-between">
        <p style="font-size:1rem;font-weight:700;color:var(--orange-dark);margin:0">
          $${subtotal}
        </p>
        <button class="btn-remove" data-product-id="${item.producto_id}" title="Eliminar">
          <i class="bi bi-trash"></i>
        </button>
      </div>

    </div>
  `;
}

function configurarEventosCartPage(container) {
  container.addEventListener("click", e => {

    const btnRemove = e.target.closest(".btn-remove");
    if (btnRemove) {
      const productId = btnRemove.dataset.productId;
      quitarDelCarrito(productId);
      renderCartPage(container);
      return;
    }

    const btnCheckout = e.target.closest("#btn-checkout");
    if (btnCheckout) {
      manejarCheckout();
    }
  });

  document.addEventListener("click", e => {
    if (
      e.target.closest(".btn-plus") ||
      e.target.closest(".btn-minus")
    ) {
      setTimeout(() => {
        renderCartPage(container);
      }, 0);
    }
  });
}

function manejarCheckout() {
  const token = localStorage.getItem("token");

  if (!token) {
    sessionStorage.setItem("redirectAfterLogin", "./cart.html");
    window.location.href = "./login.html";
    return;
  }

  window.location.href = "./checkout.html";
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCartPage);
} else {
  initCartPage();
}
