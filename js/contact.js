let globalId = 2
async function cargarVista() {
    const aboutContent = document.getElementById("contact-page")

    try{
    const response = await fetch(
      `https://backend-punto-de-venta-render.onrender.com/api/pages/${globalId}`
    );
    const contenidos = await response.json();
    let html=``;
    
    contenidos.forEach(bloque => {
        html += `
        <div>${bloque.contenido}</div>
        `
    });

    aboutContent.innerHTML=html;
    

    }catch(error){
        console.error("Error al obtener los contenidos:", error);
        aboutContent.innerHTML = `
      <div class="alert alert-danger mt-4">
        <i class="bi bi-exclamation-triangle"></i> Error al cargar los contenidos
      </div>
    `;
    }
    
}

cargarVista()