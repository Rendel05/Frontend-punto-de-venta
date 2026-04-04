function renderFormOferta(oferta = null) {
  const container = document.getElementById("admin-content");
  const esEdicion = oferta !== null;

  container.innerHTML = `
    <div class="card p-4 shadow-sm">
      <h3 class="mb-3">${esEdicion ? "Editar oferta" : "Crear oferta"}</h3>

      <form id="form-oferta">

        <div class="mb-2">
          <label class="form-label">Producto</label>
          <select id="producto_id" name="producto_id" class="form-control" required>
            <option value="">Cargando productos...</option>
          </select>
        </div>
        <div class="mb-2">
        <p class="text-muted  ">Precio Regular: <span id="precio-regular"></span></p>
        </div>
        <div class="mb-2">
          <label class="form-label">Precio de Oferta</label>
          <input id="precio_oferta" name="precio_oferta" type="number" step="0.01" class="form-control"
            value="${oferta?.precio_oferta || ''}" required>
        </div>

        <div class="row">
          <div class="col-md-6 mb-2">
            <label class="form-label">Fecha Inicio</label>
            <input id="fecha_inicio" name="fecha_inicio" type="date" class="form-control"
              value="${oferta?.fecha_inicio ? oferta.fecha_inicio.split('T')[0] : ''}" required>
          </div>

          <div class="col-md-6 mb-2">
            <label class="form-label">Fecha Fin</label>
            <input id="fecha_fin" name="fecha_fin" type="date" class="form-control"
              value="${oferta?.fecha_fin ? oferta.fecha_fin.split('T')[0] : ''}" required>
          </div>
        </div>

        <div class="mb-3">
          ${esEdicion ? 
              '<label class="form-label">Estado</label>\
              <select id="activo" name="activo" class="form-control">\
                <option value="1" ${oferta?.activo == 1 ? "selected" : ""}>Activa</option>\
                <option value="0" ${oferta?.activo == 0 ? "selected" : ""}>Inactiva</option>\
              </select>'
            : ""}
        </div>

        <div class="d-flex gap-2">
          <button type="submit" class="btn btn-primary w-100">
            ${esEdicion ? "Actualizar" : "Crear"}
          </button>
          <button type="button" id="btn-cancelar" class="btn btn-secondary w-100">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  `;
  
  cargarProductosSelect(oferta?.producto_id);

  activarFormOferta(oferta?.oferta_id);
}

async function cargarProductosSelect(selectedId = null) {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}/products?page=1&limit=1000`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await res.json();

    const select = document.getElementById("producto_id");

    select.innerHTML = `
      <option value="">Selecciona un producto</option>
      ${data.data.map(p => `
        <option value="${p.producto_id}" 
          ${p.producto_id == selectedId ? "selected" : ""}>
          ${p.nombre}
        </option>
      `).join("")}
    `;

    select.addEventListener("change", (e) => {
      
      const productoId = e.target.value;
      const precio = document.getElementById("precio-regular");

      const producto = data.data.find(p => p.producto_id == productoId);

      if (producto) {
        precio.textContent = producto.precio_venta;
      } else {
        precio.textContent = "";
      }
    });
        if (selectedId) {
      select.dispatchEvent(new Event("change"));
    }

  } catch (error) {
    console.error(error);
    mostrarToast("Error cargando productos", "danger");
  }
}



function activarFormOferta(ofertaId = null) {
  const form = document.getElementById("form-oferta");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    const data = {
      product_id: parseInt(document.getElementById("producto_id").value),
      offer_price: parseFloat(document.getElementById("precio_oferta").value),
      start_date: document.getElementById("fecha_inicio").value,
      end_date: document.getElementById("fecha_fin").value,
    };
    
    if (ofertaId) {
      data.active = parseInt(document.getElementById("activo").value);
    }

    const method = ofertaId ? "PUT" : "POST";
    const url = ofertaId
      ? `${API_BASE}/offers/${ofertaId}`
      : `${API_BASE}/offers`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const resData = await response.json();

      if (response.ok) {
        mostrarToast(ofertaId ? "Oferta actualizada" : "Oferta creada", "success");
        setTimeout(() => { window.location.href = "admin.html"; }, 1200);
      } else {
        mostrarToast(resData.message || "Error al guardar", "danger");
      }

    } catch (error) {
      console.error(error);
      mostrarToast("Error de conexión", "danger");
    }
  });

  document.getElementById("btn-cancelar").addEventListener("click", () => {
    window.location.href = "admin.html";
  });
}

async function editarOferta(id) {
    const token = localStorage.getItem("token");
    try {
    const res = await fetch(`${API_BASE}/offers/${id}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    const oferta = await res.json();

    renderFormOferta(oferta);

  } catch (error) {
    console.error(error);
    mostrarToast("Error al cargar oferta", "danger");
  }
}