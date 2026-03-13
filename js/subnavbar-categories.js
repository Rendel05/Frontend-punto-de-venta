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
        <a href="./products.html?cat=${cat.categoria_id}">
          ${cat.nombre}
        </a>
      `;

      lista.appendChild(li);

    });

  }catch(error){

    console.error("Error cargando categorías:", error);

  }

}

cargarCategorias();