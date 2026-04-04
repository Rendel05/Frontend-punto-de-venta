const API_URL = "https://backend-punto-de-venta-render.onrender.com/api/categories";

const btn = document.getElementById("btnCat");
const menu = document.getElementById("menuCat");

if (btn && menu) {
  btn.addEventListener("click", () => {
    menu.classList.toggle("show");
    btn.classList.toggle("menu-open");
  });
}


async function cargarCategorias(){

  try{

    const res = await fetch(API_URL);
    const categorias = await res.json();

    const lista = document.getElementById("categories-list");

    categorias.forEach(cat => {

      const li = document.createElement("li");

      li.innerHTML = `
        <a href="./pages/products.html?cat=${cat.categoria_id}">
          ${cat.nombre}
        </a>
      `;

      lista.appendChild(li);

    });

  }catch(error){

    console.error("Error cargando categorías:", error);

  }

}

async function cargarHeroOferta(){

  const URL = "https://backend-punto-de-venta-render.onrender.com/api/offers/active";

  try{

    const res = await fetch(URL);
    const ofertas = await res.json();

    if(!ofertas.length) return;

    const randomIndex = Math.floor(Math.random() * ofertas.length);
    const oferta = ofertas[randomIndex];
    const descuento = Math.round(
      100 - (oferta.precio_oferta / oferta.precio_venta) * 100
    );
    renderHero(oferta,descuento);

  }catch(err){
    console.error("Error cargando ofertas:", err);
  }

}


function renderHero(oferta,descuento) {
  const hero = document.getElementById("hero");

  const imagen = oferta.imagen_url || "./assets/img/default.png";

  hero.innerHTML = `
  <div class="hero-container d-flex align-items-center justify-content-between">

    <div class="hero-content">

      <p class="hero-eyebrow">Oferta del día</p>

      <h1 class="hero-title">${oferta.nombre}</h1>

      <p class="hero-pricing">
        <span class="price-original">$${oferta.precio_venta}</span>
        <strong class="price-offer">$${oferta.precio_oferta}</strong>
        <span class="badge-offer">${descuento}% OFF</span>
      </p>

      <div class="hero-actions">
        <a href="./pages/product.html?id=${oferta.producto_id}" class="btn hero-btn">
          Ver producto
        </a>

        <a href="./pages/products.html" class="btn hero-btn-secondary">
          Ver más ofertas
        </a>
      </div>

    </div>

    <img src="${imagen}" alt="${oferta.nombre}" class="hero-image">

  </div>
`;
}


async function cargarProductos(){

  const URL = "https://backend-punto-de-venta-render.onrender.com/api/products/popular"

  try{

    const res = await fetch(URL)
    const productos = await res.json()

    registrarProductos(productos);

    const contenedor = document.getElementById("productos-scroll")

    contenedor.innerHTML = ""

    productos.slice(0,10).forEach(prod => {

      const imagen = prod.imagen_url || "./assets/img/default.png";
      const card = document.createElement("div")

      card.className = "card product-card shadow-sm"
      card.dataset.product = prod.producto_id;

      card.innerHTML = `
        <img src="${imagen}" class="card-img-top" alt="${prod.nombre}">

        <div class="card-body d-flex flex-column">

          <h6 class="card-title">${prod.nombre}</h6>

          <p class="text-muted small flex-grow-1">
            ${prod.descripcion || ""}
          </p>

          <div class="d-flex justify-content-between align-items-center gap-2">

            <div class="product-price">
              ${renderPrecioHTML(prod)}
            </div>
            ${renderBadgeHTML(prod)}

            <div data-cart-zone>
              ${renderBotonCantidad(prod)}
            </div>

          </div>

        </div>
      `

      card.onclick = () => {
        window.location.href = `./pages/product.html?id=${prod.producto_id}`;
      }

      contenedor.appendChild(card)

    })

  }catch(err){

    console.error("Error cargando productos:", err)

  }

}

async function cargarOfertas(){

  const URL_OFERTAS = "https://backend-punto-de-venta-render.onrender.com/api/offers/active"

  try{

    const res = await fetch(URL_OFERTAS)
    const ofertas = await res.json()

    const contenedor = document.getElementById("ofertas-scroll")

    contenedor.innerHTML = ""

    ofertas.slice(0,8).forEach(oferta => {

      const imagen = oferta.imagen_url || "./assets/img/default.png";

      const card = document.createElement("div")

      card.className = "card product-card shadow-sm position-relative"

      card.innerHTML = `
        <span class="badge badge-oferta">OFERTA</span>

        <img src="${imagen}" class="card-img-top" alt="${oferta.nombre}">

        <div class="card-body d-flex flex-column">

          <h6 class="card-title">${oferta.nombre}</h6>

          <div>

            <span class="precio-original">
              $${oferta.precio_venta}
            </span>

            <br>

            <span class="precio-oferta">
              $${oferta.precio_oferta}
            </span>

          </div>

        </div>
      `
      card.onclick = () => {
        window.location.href = `./pages/product.html?id=${oferta.producto_id}`;
      }
      contenedor.appendChild(card)

    })

  }catch(err){

    console.error("Error cargando ofertas:", err)

  }

}

async function cargarCategoriasHome(){

  const URL = "https://backend-punto-de-venta-render.onrender.com/api/categories";

  try{

    const res = await fetch(URL);
    const categorias = await res.json();

    const contenedor = document.getElementById("categorias-scroll");

    if(!contenedor) return;

    contenedor.innerHTML = "";

    categorias.forEach(cat => {
      const imagen = `./assets/img/${cat.nombre} (1).jpg`;

      const card = document.createElement("div");

      card.className = "categoria-card";

      card.innerHTML = `
        <div class="categoria-img">
          <img src="${imagen}" alt="${cat.nombre}">
        </div>

        <div class="categoria-nombre">
          ${cat.nombre}
        </div>
      `;

      card.onclick = () => {
        window.location.href = `./pages/products.html?cat=${cat.categoria_id}`;
      };

      contenedor.appendChild(card);

    });

  }catch(err){

    console.error("Error cargando categorías:", err);

  }

}
cargarHeroOferta();
cargarCategoriasHome();
cargarOfertas();
cargarProductos();
cargarCategorias();



