const API = 'https://backend-punto-de-venta-render.onrender.com/api'


export function getToken() {
  return localStorage.getItem('token')
}

export function logout() {
  localStorage.removeItem('token')
  window.location.href = './login.html'
}


export async function registrarCliente(datos) {

  try {

    const res = await fetch(`${API}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    })

    const data = await res.json()

    return {
      ok: res.ok,
      message: data.message || 'Error al registrar'
    }

  } catch {

    return { ok: false, message: 'Error de conexión' }

  }

}



export async function obtenerPerfil(userId, token) {

  try {

    const res = await fetch(`${API}/customers/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    const data = await res.json()

    if (res.ok) {
      return { ok: true, perfil: data }
    }

    return { ok: false, message: data.message || 'Error al obtener perfil' }

  } catch {

    return { ok: false, message: 'Error de conexión' }

  }

}


export async function actualizarPerfil(userId, campos, token) {

  try {

    const res = await fetch(`${API}/customers/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(campos)
    })

    const data = await res.json()

    return {
      ok: res.ok,
      message: data.message || 'Error al actualizar'
    }

  } catch {

    return { ok: false, message: 'Error de conexión' }

  }

}



export async function cambiarPassword(userId, password, token) {

  try {

    const res = await fetch(`${API}/customers/${userId}/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ password })
    })

    const data = await res.json()

    return {
      ok: res.ok,
      message: data.message || 'Error al cambiar contraseña'
    }

  } catch {

    return { ok: false, message: 'Error de conexión' }

  }

}
