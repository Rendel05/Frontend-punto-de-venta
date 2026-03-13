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


async function cargarProductos(){

  const URL = "https://backend-punto-de-venta-render.onrender.com/api/products/popular"

  try{

    const res = await fetch(URL)
    const productos = await res.json()

    const contenedor = document.getElementById("productos-scroll")

    contenedor.innerHTML = ""

    productos.slice(0,10).forEach(prod => {

      const imagen = `assets/img/logo.png`

      const card = document.createElement("div")

      card.className = "card product-card shadow-sm"

      card.innerHTML = `
        <img src="${imagen}" class="card-img-top" alt="${prod.nombre}">

        <div class="card-body d-flex flex-column">

          <h6 class="card-title">${prod.nombre}</h6>

          <p class="text-muted small flex-grow-1">
            ${prod.descripcion || ""}
          </p>

          <div class="d-flex justify-content-between align-items-center">

            <span class="product-price">
              $${prod.precio_venta}
            </span>

            <button class="btn btn-sm btn-primary">
              +
            </button>

          </div>

        </div>
      `

      contenedor.appendChild(card)

    })

  }catch(err){

    console.error("Error cargando productos:", err)

  }

}

async function cargarOfertas(){

  const URL_OFERTAS = "https://backend-punto-de-venta-render.onrender.com/api/active"

  try{

    const res = await fetch(URL_OFERTAS)
    const ofertas = await res.json()

    const contenedor = document.getElementById("ofertas-scroll")

    contenedor.innerHTML = ""

    ofertas.slice(0,8).forEach(oferta => {

      const imagen = "assets/img/logo.png"

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

      const imagen = `./assets/img/${cat.nombre}.webp`;

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

cargarCategoriasHome();
cargarOfertas();
cargarProductos();
cargarCategorias();



