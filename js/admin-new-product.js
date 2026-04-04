function renderFormProducto(producto = null) {
  const container = document.getElementById("admin-content");
  const esEdicion = producto !== null;

  container.innerHTML = `
    <div class="card p-4 shadow-sm">
      <h3 class="mb-3">${esEdicion ? "Editar producto" : "Crear producto"}</h3>

      <form id="form-producto">
        <div class="mb-2">
          <label class="form-label">Nombre del Producto</label>
          <input id="name" name="name" class="form-control" placeholder="Ej: Monitor 24'" value="${producto?.nombre || ''}" required>
        </div>

        <div class="mb-2">
          <label class="form-label">Código</label>
          <input id="code" name="code" class="form-control" placeholder="Código de barras" value="${producto?.codigo || ''}" required>
        </div>

        <div class="mb-2">
          <label class="form-label">Descripción</label>
          <textarea id="description" name="description" class="form-control">${producto?.descripcion || ''}</textarea>
        </div>

        <div class="row">
          <div class="col-md-6 mb-2">
            <label class="form-label">Precio Compra</label>
            <input id="buy_price" name="buy_price" type="number" step="0.01" class="form-control" value="${producto?.precio_compra || ''}">
          </div>
          <div class="col-md-6 mb-2">
            <label class="form-label">Precio Venta</label>
            <input id="sell_price" name="sell_price" type="number" step="0.01" class="form-control" value="${producto?.precio_venta || ''}">
          </div>
        </div>

        <div class="row">
          <div class="col-md-4 mb-2">
            <label class="form-label">Stock</label>
            <input id="stock" name="stock" type="number" class="form-control" value="${producto?.stock || ''}">
          </div>
        <div class="col-md-4 mb-2">
          <label class="form-label">Categoría</label>
          <select id="cat_id" name="cat_id" class="form-control"></select>
        </div>

        <div class="col-md-4 mb-2">
          <label class="form-label">Proveedor</label>
          <select id="supp_id" name="supp_id" class="form-control"></select>
        </div>

        <div class="mb-2">
          <label class="form-label">Estado</label>
          <select id="status" name="status" class="form-control">
            <option value="1" ${producto?.activo == 1 ? "selected" : ""}>Activo</option>
            <option value="0" ${producto?.activo == 0 ? "selected" : ""}>Inactivo</option>
          </select>
        </div>

        <div class="mb-3">
          <label class="form-label">Imagen del Producto</label>
          <input id="image" name="image" type="file" class="form-control">
        </div>
                
        <input type="hidden" id="image_id" name="image_id" value="${producto?.imagen_url || ''}">
        <input type="hidden" id="public_image_id" name="public_image_id" value="${producto?.imagen_public_id || ''}">
        
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

  activarFormProducto(producto?.producto_id);
  cargarSelects(producto);
}

function activarFormProducto(productId = null) {
  const form = document.getElementById("form-producto");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const formData = new FormData(form);

    
    const method = productId ? "PUT" : "POST";
    const url = productId
        ? `${API_BASE}/products/${productId}`
        : `${API_BASE}/products`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        mostrarToast(productId ? "Producto actualizado" : "Producto creado", "success");
        setTimeout(() => { window.location.href = "admin.html"; }, 1200);
      } else {
        mostrarToast(data.message || "Error al guardar", "danger");
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


async function cargarSelects(producto = null) {
  try {
    const [catsRes, suppRes] = await Promise.all([
      fetch("https://backend-punto-de-venta-render.onrender.com/api/categories"),
      fetch("https://backend-punto-de-venta-render.onrender.com/api/suppliers")
    ]);

    const categorias = await catsRes.json();
    const proveedores = await suppRes.json();

    const catSelect = document.getElementById("cat_id");
    const suppSelect = document.getElementById("supp_id");

    catSelect.innerHTML = `<option value="">Selecciona categoría</option>`;
    suppSelect.innerHTML = `<option value="">Selecciona proveedor</option>`;

    categorias.forEach(cat => {
      const selected = producto?.categoria_id == cat.categoria_id ? "selected" : "";
      catSelect.innerHTML += `
        <option value="${cat.categoria_id}" ${selected}>
          ${cat.nombre}
        </option>
      `;
    });

    proveedores.forEach(supp => {
      const selected = producto?.proveedor_id == supp.proveedor_id ? "selected" : "";
      suppSelect.innerHTML += `
        <option value="${supp.proveedor_id}" ${selected}>
          ${supp.nombre}
        </option>
      `;
    });

  } catch (err) {
    console.error("Error cargando selects:", err);
  }
}


async function editarProducto(id) {

  try {
    const response = await fetch(`${API_BASE}/products/${id}`)
    const producto = await response.json();

    renderFormProducto(producto);

  } catch (error) {
    console.error(error);
    mostrarToast("Error al cargar producto", "danger");
  }
}
