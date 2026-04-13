let limite = 10;

async function cargarVistaProductos(page = 1) {
  const adminContent = document.getElementById('admin-content');

  adminContent.innerHTML = `
    <div class="d-flex justify-content-center align-items-center" style="height: 50vh;">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
  `;

try {
  const token = localStorage.getItem("token")

  const response = await fetch(
    `https://backend-punto-de-venta-render.onrender.com/api/products?page=${page}&limit=${limite}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
    const result = await response.json();

    const productos = result.data;
    const totalPages = result.totalPages;
    const paginaActual = result.page;
    const total = result.total;

    let html = `
      <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <div class="pt-3 pb-2 mb-3">
        <h1 class="h2">Inventario de Productos</h1>
        <p class="text-muted">Dashboard general de productos</p>
        </div>
        <div class="btn-toolbar mb-2 mb-md-0">
          <button type="button" onclick="renderFormProducto()" class="btn btn-sm btn-primary">
            <i class="bi bi-bag-plus"></i> Nuevo Producto
          </button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-striped table-hover align-middle">
          <thead class="table-dark">
            <tr>
              <th>Imagen</th>
              <th>Código</th>
              <th>Nombre</th>
              <th>Precio (Compra)</th>
              <th>Precio (Venta)</th>
              <th>Stock</th>
              <th>Activo</th>
              <th class="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
    `;

    productos.forEach(producto => {
      const imagenSrc = producto.imagen_url || '../assets/img/default.png';

      const stockBadge = producto.stock <= 20
        ? `<span class="badge bg-danger">${producto.stock}</span>`
        : `<span class="badge bg-success">${producto.stock}</span>`;

      const statusbadge = producto.activo == 1
        ? `<span class="badge bg-success">Activo</span>`
        : `<span class="badge bg-danger">Descontinuado</span>`;

      const [outline,icon,title] = productStatus(producto);

      html += `
        <tr>
          <td>
            <img src="${imagenSrc}" alt="${producto.nombre}" 
              class="img-thumbnail" 
              style="width: 50px; height: 50px; object-fit: cover;">
          </td>
          <td><span class="badge bg-secondary">${producto.codigo}</span></td>
          <td class="fw-bold">${producto.nombre}</td>
          <td>$${parseFloat(producto.precio_compra).toFixed(2)}</td>
          <td>$${parseFloat(producto.precio_venta).toFixed(2)}</td>
          <td>${stockBadge}</td>
          <td>${statusbadge}</td>
          <td class="text-center">
            <button onclick="editarProducto(${producto.producto_id})" class="btn btn-sm btn-outline-primary" title="Editar">
              <i class="bi bi-pencil-square"></i>
            </button>
            <button onclick="cambiarEstado(${producto.producto_id}, ${producto.activo == 1 ? 0 : 1})" class="btn btn-sm btn-outline-${outline}" title="${title}">
              <i class="${icon}"></i>
            </button>
          </td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>

      <div class="d-flex justify-content-between align-items-center mt-2">
        <small class="text-muted">
          Página ${paginaActual} de ${totalPages} | Total: ${total} productos
        </small>
      </div>

      <nav class="mt-3">
        <ul class="pagination justify-content-center">
    `;

    html += `
      <li class="page-item ${paginaActual === 1 ? 'disabled' : ''}">
        <button class="page-link" onclick="cargarVistaProductos(${paginaActual - 1})">
          &laquo;
        </button>
      </li>
    `;

    let start = Math.max(1, paginaActual - 2);
    let end = Math.min(totalPages, paginaActual + 2);

    for (let i = start; i <= end; i++) {
      html += `
        <li class="page-item ${i === paginaActual ? 'active' : ''}">
          <button class="page-link" onclick="cargarVistaProductos(${i})">
            ${i}
          </button>
        </li>
      `;
    }

    html += `
      <li class="page-item ${paginaActual === totalPages ? 'disabled' : ''}">
        <button class="page-link" onclick="cargarVistaProductos(${paginaActual + 1})">
          &raquo;
        </button>
      </li>
    `;

    html += `
        </ul>
      </nav>
    `;

    adminContent.innerHTML = html;

  } catch (error) {
    console.error("Error al obtener los productos:", error);
    adminContent.innerHTML = `
      <div class="alert alert-danger mt-4">
        <i class="bi bi-exclamation-triangle"></i> Error al cargar productos.
      </div>
    `;
  }
}


  function productStatus(producto){
  const activo = producto.activo == 1;

  return [
    outline =activo ? 'danger' : 'success',
    icon=activo ? 'bi bi-trash' : 'bi bi-power',
    title=activo ? 'Desactivar' : 'Reactivar'
  ]
}

async function cambiarEstado(id, estado){
  try {
    const token = localStorage.getItem('token');

    const response = await fetch(`https://backend-punto-de-venta-render.onrender.com/api/products/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ activo: estado })
    });

    if (!response.ok) throw new Error('Error en la petición');

    mostrarToast(
      estado === 1 ? "Producto reactivado" : "Producto desactivado",
      estado === 1 ? "success" : "warning"
    );

    cargarVistaProductos();

  } catch (error) {
    console.error(error);
    mostrarToast("No autorizado o error", "danger");
  }
}
 