function renderFormUsuario(usuario = null) {
  const container = document.getElementById("admin-content");
  const esEdicion = usuario !== null;

  container.innerHTML = `
    <div class="card p-4 shadow-sm border-0">
      <div class="d-flex align-items-center mb-4">
        <button class="btn btn-sm btn-outline-secondary me-3" onclick="window.location.href='admin.html'">
          <i class="bi bi-arrow-left"></i>
        </button>
        <h3 class="m-0">${esEdicion ? "Editar Perfil de Usuario" : "Registrar Nuevo Usuario"}</h3>
      </div>

      <form id="form-usuario">
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label fw-bold">Nickname / Usuario</label>
            <input type="text" id="nickname" name="nickname" class="form-control" 
              placeholder="Ej: admin_pedro" value="${usuario?.alias || ''}" required>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label fw-bold">Rol en el Sistema</label>
            <select id="rol" name="rol" class="form-select" required>
              <option value="" disabled ${!esEdicion ? 'selected' : ''}>Seleccione un rol...</option>
              <option value="Admin" ${usuario?.rol === 'Admin' ? 'selected' : ''}>Administrador</option>
              <option value="Cajero" ${usuario?.rol === 'Cajero' ? 'selected' : ''}>Cajero</option>
            </select>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label fw-bold">Contraseña</label>
            <input type="password" id="password" name="password" class="form-control" 
              placeholder="${esEdicion ? 'Dejar vacío para mantener actual' : 'Mínimo 6 caracteres'}" 
              ${esEdicion ? '' : 'required'}>
            ${esEdicion ? '<div class="form-text text-muted small">Solo escribe si deseas cambiarla.</div>' : ''}
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label fw-bold">Estado de Cuenta</label>
            <select id="status" name="status" class="form-select">
              <option value="1" ${usuario?.activo == 1 ? 'selected' : ''}>Activo (Acceso total)</option>
              <option value="0" ${usuario?.activo == 0 ? 'selected' : ''}>Suspendido (Bloqueado)</option>
            </select>
          </div>
        </div>

        <div class="d-flex gap-2 mt-4">
          <button type="submit" class="btn btn-primary px-4">
            ${esEdicion ? "Actualizar Datos" : "Crear Usuario"}
          </button>
          <button type="button" id="btn-cancelar-user" class="btn btn-light px-4">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  `;

  activarFormUsuario(usuario?.usuario_id);
}

function activarFormUsuario(userId = null) {
  const form = document.getElementById("form-usuario");

  form.onsubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    data.role = data.rol;
    delete data.rol;

    data.status = Number(data.status);

    if (userId && !data.password) {
      delete data.password;
    }

    const method = userId ? "PUT" : "POST";
    const url = userId ? `${API_BASE}/users/${userId}` : `${API_BASE}/users`;

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const resData = await response.json();

      if (response.ok) {
        mostrarToast(userId ? "Usuario actualizado correctamente" : "Usuario registrado con éxito", "success");
        setTimeout(() => { window.location.href = "admin.html"; }, 1200);
      } else {
        mostrarToast(resData.message || "Error al procesar la solicitud", "danger");
      }
    } catch (error) {
      console.error("Error en Fetch:", error);
      mostrarToast("Error de conexión con el servidor", "danger");
    }
  };

  document.getElementById("btn-cancelar-user").onclick = () => {
    window.location.href = "admin.html";
  };
}

async function editarUsuario(id) {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${API_BASE}/users/${id}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!response.ok) throw new Error("No se pudo obtener el usuario");

    const usuario = await response.json();
    renderFormUsuario(usuario);

  } catch (error) {
    console.error(error);
    mostrarToast("Error al cargar los datos del usuario", "danger");
  }
}