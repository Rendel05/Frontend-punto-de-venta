let paginaActual = 1;
let categoriaActual = null;
let busquedaActual = null;
const limite = 12;

const params = new URLSearchParams(window.location.search);

if(params.get("cat")){
  categoriaActual = params.get("cat");
}

if(params.get("search")){
  busquedaActual = params.get("search");
}

async function cargarCatalogo(){

  let url;

  if(busquedaActual){

    url = `https://backend-punto-de-venta-render.onrender.com/api/products/search?search=${busquedaActual}&page=${paginaActual}&limit=${limite}`;

  }else if(categoriaActual){

    url = `https://backend-punto-de-venta-render.onrender.com/api/products/category/${categoriaActual}?page=${paginaActual}&limit=${limite}`;

  }else{

    url = `https://backend-punto-de-venta-render.onrender.com/api/products/active?page=${paginaActual}&limit=${limite}`;

  }

  const res = await fetch(url);
  const datos = await res.json();

  const productos = datos.data || datos;

  registrarProductos(productos);

  const grid = document.getElementById("catalogo-grid");

  grid.innerHTML = "";

  productos.forEach(prod => {

    const imagen = prod.imagen_url || `../assets/img/default.png`;

    const card = document.createElement("div");

    card.className = "col-6 col-md-4 col-lg-3";
    card.dataset.product = prod.producto_id;

    card.innerHTML = `
      <div class="card product-card h-100 shadow-sm">

        <img src="${imagen}" class="card-img-top">

        <div class="card-body d-flex flex-column">

          <h6>${prod.nombre}</h6>

          <p class="small text-muted flex-grow-1">
            ${prod.descripcion}
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

      </div>
    `;
      card.onclick = () => {
        window.location.href = `./product.html?id=${prod.producto_id}`;
      }
    grid.appendChild(card);

  });

  if(datos.totalPages){
    renderPaginacion(datos.totalPages);
  }

}

function renderPaginacion(totalPages){

  const cont = document.getElementById("paginacion");

  cont.innerHTML = "";

  for(let i=1;i<=totalPages;i++){

    const li = document.createElement("li");

    li.className = `page-item ${i === paginaActual ? "active":""}`;

    li.innerHTML = `
      <a class="page-link">${i}</a>
    `;

    li.onclick = () => {

      paginaActual = i;
      cargarCatalogo();

      window.scrollTo({top:0,behavior:"smooth"});

    };

    cont.appendChild(li);

  }

}

async function cargarFiltros(){
  const res = await fetch("https://backend-punto-de-venta-render.onrender.com/api/categories");
  const categorias = await res.json();
  const lista = document.getElementById("filtro-categorias");

  const chipTodos = document.createElement("button");
  chipTodos.className = "btn btn-sm rounded-pill " + (!categoriaActual ? "btn-primary" : "btn-outline-secondary");
  chipTodos.textContent = "Todos";
  chipTodos.onclick = () => {
    categoriaActual = null;
    busquedaActual = null;
    paginaActual = 1;
    actualizarChipActivo(chipTodos);
    cargarCatalogo();
  };
  lista.appendChild(chipTodos);

  categorias.forEach(cat => {
    const chip = document.createElement("button");
    chip.className = "btn btn-sm rounded-pill btn-outline-secondary flex-shrink-0";
    chip.textContent = cat.nombre;
    chip.onclick = () => {
      categoriaActual = cat.categoria_id;
      busquedaActual = null;
      paginaActual = 1;
      actualizarChipActivo(chip);
      cargarCatalogo();
    };
    lista.appendChild(chip);
  });
}

function actualizarChipActivo(chipActivo){
  document.querySelectorAll("#filtro-categorias .btn").forEach(c => {
    c.classList.remove("btn-primary");
    c.classList.add("btn-outline-secondary");
  });
  chipActivo.classList.add("btn-primary");
  chipActivo.classList.remove("btn-outline-secondary");
}


/* AUTOLLENAR BUSQUEDA */

if(busquedaActual){

  const input = document.getElementById("buscador");

  if(input){
    input.value = busquedaActual;
  }

}

cargarFiltros();
cargarCatalogo();