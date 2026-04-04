const API = 'https://backend-punto-de-venta-render.onrender.com/api'
let filtroDias = 2;


async function cargarVistaVentas() {
  const content = document.getElementById('cashier-content');

  content.innerHTML = spinner("Cargando ventas...");

  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${API}/cashier/${window.USER_ID}/sales?days=${filtroDias}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (!res.ok) throw new Error("Error");

    const ventas = await res.json();

    let html = `
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap">
        <div>
          <h2 class="mb-0">Ventas recientes</h2>
          <small class="text-muted">Mostrando últimos ${filtroDias} días</small>
        </div>

        <div>
          <select class="form-select form-select-sm" style="width:auto"
            onchange="cambiarFiltro(this.value, 'ventas')">
            ${renderOpcionesFiltro()}
          </select>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead class="table-dark">
            <tr>
              <th>Total</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
    `;

    ventas.forEach(v => {
      html += `
        <tr>
          <td>$${v.total}</td>
          <td>${formatearFecha(v.fecha_hora)}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;

    content.innerHTML = html;

  } catch (err) {
    errorUI(content, "Error al cargar ventas");
  }
}


async function cargarVistaRetiros() {
  const content = document.getElementById('cashier-content');

  content.innerHTML = spinner("Cargando retiros...");

  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${API}/cashier/${window.USER_ID}/withdrawals?days=${filtroDias}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (!res.ok) throw new Error("Error");

    const retiros = await res.json();

    let html = `
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap">
        <div>
          <h2 class="mb-0">Retiros recientes</h2>
          <small class="text-muted">Mostrando últimos ${filtroDias} días</small>
        </div>

        <div>
          <select class="form-select form-select-sm" style="width:auto"
            onchange="cambiarFiltro(this.value, 'retiros')">
            ${renderOpcionesFiltro()}
          </select>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead class="table-dark">
            <tr>
              <th>Monto</th>
              <th>Motivo</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
    `;

    retiros.forEach(r => {
      html += `
        <tr>
          <td>$${r.monto}</td>
          <td>${r.descripcion || '—'}</td>
          <td>${formatearFecha(r.fecha_hora)}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;

    content.innerHTML = html;

  } catch (err) {
    errorUI(content, "Error al cargar retiros");
  }
}


function renderOpcionesFiltro() {
  const opciones = [2, 7, 15, 30];

  return opciones.map(d => `
    <option value="${d}" ${d == filtroDias ? 'selected' : ''}>
      ${d} días
    </option>
  `).join('');
}


function cambiarFiltro(valor, vista) {
  filtroDias = parseInt(valor);

  if (vista === 'ventas') {
    cargarVistaVentas();
  } else {
    cargarVistaRetiros();
  }
}

function spinner(texto) {
  return `
    <div class="d-flex justify-content-center align-items-center" style="height:50vh;">
      <div class="spinner-border text-primary"></div>
      <span class="ms-3">${texto}</span>
    </div>
  `;
}

function errorUI(container, msg) {
  container.innerHTML = `
    <div class="alert alert-danger mt-4">
      <i class="bi bi-exclamation-triangle"></i> ${msg}
    </div>
  `;
}

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleString('es-MX');
}