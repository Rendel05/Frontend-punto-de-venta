async function cargarVistaUsuarios() {
  const adminContent = document.getElementById('admin-content');
  
  adminContent.innerHTML = `
    <div class="d-flex justify-content-center align-items-center" style="height: 50vh;">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando usuarios...</span>
      </div>
    </div>
  `;

  try {
      const token = localStorage.getItem("token")
        const response = await fetch(
            `https://backend-punto-de-venta-render.onrender.com/api/users`,
            {
            headers: {
                Authorization: `Bearer ${token}`
            }
            }
        )
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        
    const usuarios = await response.json(); 

    let html = `
      <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
      <div class="pt-3 pb-2 mb-3">  
      <h1 class="h2">Gestión de Usuarios</h1>
      <p class="text-muted">Zona de gestión de usuarios</p>
      </div>
        <div class="btn-toolbar mb-2 mb-md-0">
          <button type="button" onclick="renderFormUsuario()" class="btn btn-sm btn-primary">
            <i class="bi bi-person-plus"></i> Nuevo Usuario
          </button>
        </div>
      </div>
      
      <div class="table-responsive">
        <table class="table table-striped table-hover align-middle">
          <thead class="table-dark">
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Alias (Usuario)</th>
              <th scope="col">Rol</th>
              <th scope="col">Estado</th>
              <th scope="col" class="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
    `;

    usuarios.forEach(usuario => {
      const rolBadgeClass = usuario.rol === 'Admin' ? 'bg-primary' : 'bg-secondary text-white';
      
      const estadoBadge = usuario.activo === 1 
        ? `<span class="badge bg-success"><i class="bi bi-check-circle me-1"></i>Activo</span>` 
        : `<span class="badge bg-danger"><i class="bi bi-x-circle me-1"></i>Inactivo</span>`;

        const estado = userStatus(usuario);

      html += `
        <tr>
          <td class="fw-normal">${usuario.usuario_id}</td>
          <td class="fw-bold">${usuario.alias}</td>
          <td><span class="badge ${rolBadgeClass}">${usuario.rol}</span></td>
          <td>${estadoBadge}</td>
          <td class="text-center">
            <button class="btn btn-sm btn-outline-primary" onclick="editarUsuario(${usuario.usuario_id})"title="Editar">
                <i class="bi bi-pencil-square"></i>
            </button>

            <button 
                class="btn btn-sm btn-outline-${estado.outline}" 
                onclick="cambiarEstadoUsuario(${usuario.usuario_id}, ${usuario.activo == 1 ? 0 : 1})"
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
    `;

    adminContent.innerHTML = html;

  } catch (error) {
    console.error("Error al obtener los usuarios:", error);
    adminContent.innerHTML = `
      <div class="alert alert-danger mt-4" role="alert">
        <i class="bi bi-exclamation-triangle"></i> Hubo un error al cargar la lista de usuarios. Por favor, revisa tu conexión o intenta más tarde.
      </div>
    `;
  }
}


function userStatus(usuario){
  const activo = usuario.activo == 1;

  return {
    outline: activo ? 'danger' : 'success',
    icon: activo ? 'bi bi-trash' : 'bi bi-power',
    title: activo ? 'Desactivar' : 'Reactivar'
  };
}

async function cambiarEstadoUsuario(id, estado){
  try {
    const token = localStorage.getItem('token');

    const response = await fetch(`https://backend-punto-de-venta-render.onrender.com/api/users/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ activo: estado })
    });

    if (!response.ok) throw new Error('Error en la petición');

    mostrarToast(
      estado === 1 ? "Usuario reactivado" : "Usuario desactivado",
      estado === 1 ? "success" : "warning"
    );

    cargarVistaUsuarios();

  } catch (error) {
    console.error(error);
    mostrarToast("Error al actualizar usuario", "danger");
  }
}