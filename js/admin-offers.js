let limiteOfertas = 10;

async function cargarVistaOfertas(page = 1) {
  const adminContent = document.getElementById('admin-content');

  adminContent.innerHTML = `
    <div class="d-flex justify-content-center align-items-center" style="height: 50vh;">
      <div class="spinner-border text-primary"></div>
    </div>
  `;

  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `https://backend-punto-de-venta-render.onrender.com/api/offers?page=${page}&limit=${limiteOfertas}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    const ofertas = result.data;
    const totalPages = result.totalPages;
    const paginaActual = result.page;
    const total = result.total;
    let html = `
      <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
      <div class="pt-3 pb-2 mb-3">  
      <h1 class="h2">Gestión de Ofertas</h1>
      <p class="text-muted">Zona de gestión de ofertas</p>
      </div>
        <div class="btn-toolbar mb-2 mb-md-0">
          <button type="button" onclick="renderFormOferta()" class="btn btn-sm btn-primary">
            <i class="bi bi-patch-plus"></i> Nueva Oferta
          </button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-striped table-hover align-middle">
          <thead class="table-dark">
            <tr>
              <th>ID Oferta</th>
              <th>ID Producto</th>
              <th>Producto</th>
              <th>Precio Oferta</th>
              <th>Fecha Inicio</th>
              <th>Fecha Fin</th>
              <th>Estado</th>
              <th class="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
    `;

    ofertas.forEach(oferta => {
      const fechaInicio = new Date(oferta.fecha_inicio).toLocaleDateString('es-MX', { timeZone: 'UTC' });
      const fechaFin = new Date(oferta.fecha_fin).toLocaleDateString('es-MX', { timeZone: 'UTC' });

      const estadoBadge = oferta.activo === 1 
        ? `<span class="badge bg-success">Activa</span>` 
        : `<span class="badge bg-danger">Inactiva</span>`;
        const estado = offerStatus(oferta);

      html += `
        <tr>
          <td class="fw-bold">${oferta.oferta_id}</td>
          <td>
            <span class="badge bg-secondary">Prod #${oferta.producto_id}</span>
          </td>
          <td class="fw-bold">${oferta.nombre}</td>
          <td class="fw-bold text-success">$${parseFloat(oferta.precio_oferta).toFixed(2)}</td>
          <td>${fechaInicio}</td>
          <td>${fechaFin}</td>
          <td>${estadoBadge}</td>
          <td class="text-center">
            <button onclick="editarOferta(${oferta.oferta_id})" class="btn btn-sm btn-outline-primary" title="Editar">
              <i class="bi bi-pencil-square"></i>
            </button>
            <button class="btn btn-sm btn-outline-${estado.outline}" 
                onclick="cambiarEstadoOferta(${oferta.oferta_id}, ${oferta.activo == 1 ? 0 : 1})"
                title="${estado.title}">
                <i class="${estado.icon}"></i>
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
          Página ${paginaActual} de ${totalPages} | Total: ${total} ofertas
        </small>
      </div>

      <nav class="mt-3">
        <ul class="pagination justify-content-center">
    `;

    html += `
      <li class="page-item ${paginaActual === 1 ? 'disabled' : ''}">
        <button class="page-link" onclick="cargarVistaOfertas(${paginaActual - 1})">
          &laquo;
        </button>
      </li>
    `;

    let start = Math.max(1, paginaActual - 2);
    let end = Math.min(totalPages, paginaActual + 2);

    for (let i = start; i <= end; i++) {
      html += `
        <li class="page-item ${i === paginaActual ? 'active' : ''}">
          <button class="page-link" onclick="cargarVistaOfertas(${i})">
            ${i}
          </button>
        </li>
      `;
    }

    html += `
      <li class="page-item ${paginaActual === totalPages ? 'disabled' : ''}">
        <button class="page-link" onclick="cargarVistaOfertas(${paginaActual + 1})">
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
    console.error("Error al obtener las ofertas:", error);
    adminContent.innerHTML = `
      <div class="alert alert-danger mt-4">
        <i class="bi bi-exclamation-triangle"></i> Error al cargar ofertas.
      </div>
    `;
  }
}


function offerStatus(oferta){
  const activo = oferta.activo == 1;

  return {
    outline: activo ? 'danger' : 'success',
    icon: activo ? 'bi bi-trash' : 'bi bi-power',
    title: activo ? 'Desactivar' : 'Reactivar'
  };
}

async function cambiarEstadoOferta(id, estado){
  try {
    const token = localStorage.getItem('token');

    const response = await fetch(`https://backend-punto-de-venta-render.onrender.com/api/offers/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ activo: estado })
    });

    if (!response.ok) throw new Error('Error en la petición');

    mostrarToast(
      estado === 1 ? "Oferta reactivada" : "Oferta desactivada",
      estado === 1 ? "success" : "warning"
    );

    cargarVistaOfertas();

  } catch (error) {
    console.error(error);
    mostrarToast("Error al actualizar oferta", "danger");
  }
}