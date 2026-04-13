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
    return { ok: res.ok, message: data.message || 'Error al registrar' }
  } catch {
    return { ok: false, message: 'Error de conexión' }
  }
}


export async function getProfile(userId, token) {
  try {
    const response = await fetch(`${API}/customers/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const data = await response.json();

    return { 
      ok: response.ok, 
      status: response.status, 
      perfil: data 
    };
  } catch (error) {
    return { ok: false, status: 500, message: 'Error de conexión' };
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
    return { ok: res.ok, message: data.message || 'Error al actualizar' }
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
    return { ok: res.ok, message: data.message || 'Error al cambiar contraseña' }
  } catch {
    return { ok: false, message: 'Error de conexión' }
  }
}


export async function obtenerOrdenes(token) {
  try {
    const res = await fetch(`${API}/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const json = await res.json()
    
    if (res.ok) return { ok: true, ordenes: json.data || [] }
    
    return { ok: false, message: json.message || 'Error al obtener órdenes' }
  } catch {
    return { ok: false, message: 'Error de conexión' }
  }
}


export async function obtenerDetalleOrden(orderId, token) {
  try {
    const res = await fetch(`${API}/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    if (res.ok) return { ok: true, orden: data }
    return { ok: false, message: data.message || 'Error al obtener detalle' }
  } catch {
    return { ok: false, message: 'Error de conexión' }
  }
}