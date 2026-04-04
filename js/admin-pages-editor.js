const API_BASE = "https://backend-punto-de-venta-render.onrender.com/api";

async function cargarVistaPaginas() {
  const adminContent = document.getElementById('admin-content');
  adminContent.innerHTML = `<div class="text-center mt-5"><div class="spinner-border text-primary"></div></div>`;

  try {
    const response = await fetch(`${API_BASE}/pages`);
    const paginas = await response.json();

    let html = `
      <div class="pt-3 pb-2 mb-3 border-bottom">
        <h1 class="h2">Editor de Páginas</h1>
        <p class="text-muted">Selecciona una página para editar sus bloques de contenido.</p>
      </div>
      <div class="row">
    `;

    paginas.filter(p => p.id !== 4).forEach(pag => {
      html += `
        <div class="col-md-4 mb-4">
          <div class="card h-100 shadow-sm">
            <div class="card-body">
              <h5 class="card-title">${pag.titulo}</h5>
              <h6 class="card-subtitle mb-2 text-muted">/${pag.slug}</h6>
              <p class="small text-secondary">Última actualización: <br>${new Date(pag.ultima_actualizacion).toLocaleString()}</p>
              <button class="btn btn-primary w-100" onclick="cargarEditorPagina(${pag.id}, '${pag.titulo}')">
                <i class="bi bi-pencil-fill me-1"></i> Editar Contenido
              </button>
            </div>
          </div>
        </div>
      `;
    });

    html += `</div>`;
    adminContent.innerHTML = html;

  } catch (error) {
    adminContent.innerHTML = `<div class="alert alert-danger">Error al conectar con la API de páginas.</div>`;
  }
}

async function cargarEditorPagina(pageId, titulo) {
  const adminContent = document.getElementById('admin-content');
  adminContent.innerHTML = `<div class="text-center mt-5"><div class="spinner-border text-primary"></div></div>`;

  try {
    const response = await fetch(`${API_BASE}/pages/${pageId}`);
    const bloques = await response.json(); 

    let html = `
      <div class="d-flex justify-content-between align-items-center pt-3 pb-2 mb-3 border-bottom">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item"><a href="#" onclick="cargarVistaPaginas()">Páginas</a></li>
            <li class="breadcrumb-item active">${titulo}</li>
          </ol>
        </nav>
        <button class="btn btn-success btn-sm" onclick="nuevoBloque(${pageId})">
          <i class="bi bi-plus-circle me-1"></i> Añadir Bloque
        </button>
      </div>
      <div id="lista-bloques">
    `;

    bloques.forEach((bloque) => {
      html += `
        <div class="card mb-3 border-start border-primary border-4 shadow-sm" id="bloque-container-${bloque.id}">
          <div class="card-header bg-light d-flex justify-content-between align-items-center">
            <span class="fw-bold text-muted small">Orden: ${bloque.order || bloque.orden}</span>
            <div>
              <button class="btn btn-sm btn-outline-primary me-1" onclick="activarEditor(${bloque.id})">
                <i class="bi bi-pencil"></i> Editar
              </button>
              <button class="btn btn-sm btn-outline-danger" onclick="eliminarBloque(${bloque.id}, ${pageId}, '${titulo}')">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
          <div class="card-body" id="bloque-body-${bloque.id}">
            <div class="contenido-estatico">${bloque.contenido}</div>
          </div>
        </div>
      `;
    });

    html += `</div>`;
    adminContent.innerHTML = html;

  } catch (error) {
    adminContent.innerHTML = `<div class="alert alert-danger">Error al cargar los bloques.</div>`;
  }
}

function activarEditor(bloqueId) {
  const container = document.getElementById(`bloque-body-${bloqueId}`);
  const contenidoPrevio = container.querySelector('.contenido-estatico').innerHTML;

  container.dataset.original = contenidoPrevio;

  container.innerHTML = `
    <textarea id="editor-${bloqueId}" class="editor-temp">${contenidoPrevio}</textarea>
    <div class="mt-2 d-flex gap-2">
      <button class="btn btn-sm btn-primary" onclick="guardarCambiosBloque(${bloqueId})">Guardar</button>
      <button class="btn btn-sm btn-secondary" onclick="cancelarEdicion(${bloqueId})">Cancelar</button>
    </div>
  `;

  tinymce.init({
    selector: `#editor-${bloqueId}`,
    height: 250,
    menubar: false,
    plugins: 'lists link',
    toolbar: 'blocks | bold italic underline | bullist numlist | link | removeformat',
    setup: function (editor) {
      editor.on('init', () => editor.focus());
    }
  });
}

function cancelarEdicion(bloqueId) {
  const container = document.getElementById(`bloque-body-${bloqueId}`);
  const contenidoOriginal = container.dataset.original;
  
  tinymce.remove(`#editor-${bloqueId}`);
  container.innerHTML = `<div class="contenido-estatico">${contenidoOriginal}</div>`;
}

async function guardarCambiosBloque(bloqueId) {
  const nuevoContenido = tinymce.get(`editor-${bloqueId}`).getContent();
  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`${API_BASE}/pages/content/${bloqueId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ content: nuevoContenido })
    });

    if (response.ok) {
      tinymce.remove(`#editor-${bloqueId}`);
      const container = document.getElementById(`bloque-body-${bloqueId}`);
      container.innerHTML = `<div class="contenido-estatico">${nuevoContenido}</div>`;
      

      mostrarToast('Cambios guardados correctamente');
    } else {
      mostrarToast('Error al guardar: Sesión inválida o error de red', 'danger');
    }
  } catch (error) {
    mostrarToast('Error de conexión al servidor', 'danger');
  }
}


async function nuevoBloque(pageId) {
  const token = localStorage.getItem('token');
  const tituloPagina = document.querySelector('.breadcrumb-item.active').textContent;

  const nuevoDato = {
    page_id: pageId,
    content: "<p>Nuevo bloque de contenido...</p>"
  };

  try {
    const response = await fetch(`${API_BASE}/pages/content`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(nuevoDato)
    });

    if (response.ok) {
      await cargarEditorPagina(pageId, tituloPagina);
      mostrarToast('Nuevo bloque añadido'); 
    }
  } catch (error) {
    mostrarToast('No se pudo crear el bloque', 'danger');
  }
}

async function eliminarBloque(bloqueId, pageId, titulo) {
  const result = await Swal.fire({
    title: '¿Eliminar este bloque?',
    text: "Esta acción no se puede deshacer",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (!result.isConfirmed) return;

  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`${API_BASE}/pages/content/${bloqueId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      await cargarEditorPagina(pageId, titulo);
      mostrarToast('Bloque eliminado correctamente', 'warning');
    } else {
      mostrarToast('Error al eliminar el bloque', 'danger');
    }
  } catch (error) {
    mostrarToast('Error al eliminar el bloque', 'danger');
    console.error(error);
  }
}