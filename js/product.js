
const API_URL_PROD = "https://backend-punto-de-venta-render.onrender.com/api/products/";
const API_URL_REV = "https://backend-punto-de-venta-render.onrender.com/api/reviews/";

function obtenerIdProducto() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}
document.addEventListener("DOMContentLoaded", () => {
    const id = obtenerIdProducto();
    if (id) {
        cargarDetallesProducto(id);
        cargarResenas(id);
        renderReviewForm();
        setupReviewFormHandler(id);
    } else {
        console.error("No se encontró el ID del producto");
    }
})


//Render del producto
async function cargarDetallesProducto(id) {
    try {
        const res = await fetch(API_URL_PROD + id);
        const producto = await res.json();
        renderProducto(producto);
    } catch (error) {
        console.error("Error cargando producto:", error);
    }
}
function renderProducto(p) {
    document.getElementById("producto-nombre").textContent = p.nombre;
    document.getElementById("producto-descripcion").textContent = p.descripcion;

const precioContainer = document.getElementById("producto-precio");

if (p.tiene_oferta) {
  precioContainer.innerHTML = `
    <span class="precio-original">$${parseFloat(p.precio_venta).toLocaleString()}</span>
    <span class="precio-oferta">$${parseFloat(p.precio_final).toLocaleString()}</span>
  `;
} else {
  precioContainer.innerHTML = `
    <span class="precio-normal">$${parseFloat(p.precio_venta).toLocaleString()}</span>
  `;
}
    document.getElementById("producto-stock").textContent = `Stock disponible: ${p.stock} unidades`;
    document.getElementById("producto-categoria").textContent = p.categoria_nombre || "General";
    
    if (p.imagen_url) {
        document.getElementById("producto-img").src = p.imagen_url;
    }
}


//Render de las reseñas
async function cargarResenas(id) {
    try {
        const res = await fetch(API_URL_REV + id);
        const data = await res.json();
        
        document.getElementById("producto-rating").innerHTML = generarEstrellas(data.average);
        document.getElementById("resenas-count").textContent = `(${data.total} reseñas)`;
        
        renderReviews(data.reviews);
    } catch (error) {
        console.error("Error cargando reseñas:", error);
    }
}
function renderReviews(reviews) {
    const container = document.getElementById("reviews-container");
    const currentUser = getUserFromToken();

    if (!reviews || reviews.length === 0) {
        container.innerHTML = `<p class="text-muted italic">Aún no hay reseñas para este producto. ¡Sé el primero en opinar!</p>`;
        return;
    }

    container.innerHTML = reviews.map(r => {
        const isOwner = currentUser && currentUser.id === r.cliente_id;

        return `
        <div class="card mb-3 border-0 border-bottom rounded-0 pb-3">
            <div class="card-body px-0">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <strong class="text-capitalize">${r.usuario}</strong>
                        <div class="text-warning small">${generarEstrellas(r.calificacion)}</div>
                    </div>
                    <div class="text-end">
                        <span class="text-muted small d-block">${new Date(r.fecha).toLocaleDateString()}</span>
                        ${isOwner ? `<button onclick="eliminarResena('${r.resena_id}')" class="btn btn-link btn-sm text-danger p-0 mt-1" style="text-decoration:none;">Eliminar</button>` : ''}
                    </div>
                </div>
                <p class="card-text text-secondary">${r.comentario}</p>
            </div>
        </div>
    `}).join("");
}

function renderReviewForm() {
  const container = document.getElementById("review-form-container");
  const user = getUserFromToken();

  if (!user) {
    container.innerHTML = `
      <div class="alert alert-info small">
        Debes iniciar sesión para poder dejar reseñas.
        <br><a href="login.html" class="alert-link">Iniciar sesión</a>
      </div>`;
    return;
  }

  if (user.rol !== "Cliente") {
    container.innerHTML = `
      <div class="alert alert-warning small">
        Solo los clientes pueden publicar reseñas.
      </div>`;
    return;
  }

  container.innerHTML = `
    <form id="review-form">
      <div class="mb-3">
        <label class="form-label">Calificación</label>
        <select id="rev-rating" class="form-select shadow-none">
          <option value="5">5 estrellas (Excelente)</option>
          <option value="4">4 estrellas (Muy bueno)</option>
          <option value="3">3 estrellas (Normal)</option>
          <option value="2">2 estrellas (Regular)</option>
          <option value="1">1 estrella (Malo)</option>
        </select>
      </div>
      <div class="mb-3">
        <label class="form-label">Tu comentario</label>
        <textarea id="rev-comment" class="form-control shadow-none" rows="3" placeholder="¿Qué te pareció el producto?" required></textarea>
      </div>
      <button type="submit" class="btn btn-dark w-100">Publicar Reseña</button>
    </form>
  `;
}

function setupReviewFormHandler(id) {
    const form = document.getElementById("review-form");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const comentario = document.getElementById("rev-comment").value;
        const calificacion = document.getElementById("rev-rating").value;

        try {
            const res = await fetch(API_URL_REV, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    producto_id: id,
                    comentario,
                    calificacion: parseInt(calificacion)
                })
            });

            if (res.ok) {
                    Swal.fire({
                    icon: "success",
                    title: "Reseña publicada",
                    text: "Tu opinión se guardó correctamente",
                    confirmButtonText: "OK"
                    }).then(() => {
                    cargarResenas(obtenerIdProducto());
                    })
            } else {
                const err = await res.json();
                    Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: err.message || "No se pudo publicar la reseña"
                    })
            }
        } catch (error) {
            console.error("Error:", error);
        }
    });
}

async function eliminarResena(reviewId) {
    const result = await Swal.fire({
        title: "¿Eliminar reseña?",
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
        });

        if (!result.isConfirmed) return;

    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`${API_URL_REV}${reviewId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (res.ok) {
            Swal.fire({
                icon: "success",
                title: "Eliminada",
                text: "Tu reseña fue eliminada"
            }).then(() => {
                    cargarResenas(obtenerIdProducto());
            });
            } else {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo eliminar la reseña"
            });
    }
    } catch (error) {
        console.error("Error eliminando reseña:", error);
    }
}




//Helpers

function getUserFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}