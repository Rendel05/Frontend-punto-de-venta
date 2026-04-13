import {
  getToken,
  logout,
  getProfile,
  actualizarPerfil,
  cambiarPassword,
  obtenerOrdenes,
  obtenerDetalleOrden
} from './customer.js'



const token = getToken()

if (!token) window.location.href = './login.html'

function parsearToken(tkn) {
  try { return JSON.parse(atob(tkn.split('.')[1])) } catch { return null }
}

const payload = parsearToken(token)
if (!payload) window.location.href = './login.html'

const userId = payload.id



async function loadProfile() {
  const resultado = await getProfile(userId, token);

  document.getElementById('cargando').style.display = 'none';

  if (!resultado.ok) {
    // Caso 1: Sesión expirada o falta de permisos
    if (resultado.status === 403 || resultado.status === 401) {
      Swal.fire({
        icon: 'warning',
        title: 'Sesión expirada',
        text: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
        confirmButtonText: 'Ir al login'
      }).then(() => {
        localStorage.removeItem('token');
        window.location.href = './login.html';
      });
      return;
    }


    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: result.data?.message || 'Ocurrió un error al cargar el perfil.',
      confirmButtonText: 'Aceptar'
    });
    return;
  }

  const p = resultado.perfil

  document.getElementById('perfilAlias').textContent         = p.alias
  document.getElementById('perfilRol').textContent           = p.rol
  document.getElementById('perfilFechaRegistro').textContent =
    p.fecha_registro ? new Date(p.fecha_registro).toLocaleDateString('es-MX') : '—'

  document.getElementById('edit_nickname').value   = p.alias             || ''
  document.getElementById('edit_name').value       = p.nombre            || ''
  document.getElementById('edit_last_name').value  = p.apellido          || ''
  document.getElementById('edit_email').value      = p.email             || ''
  document.getElementById('edit_phone').value      = p.telefono          || ''
  document.getElementById('edit_address').value    = p.direccion         || ''
  document.getElementById('edit_birth_date').value = p.fecha_nacimiento
    ? p.fecha_nacimiento.slice(0, 10)
    : ''

  document.getElementById('contenidoPerfil').style.display = 'block'
}

loadProfile()


const TABS = {
  datos:    document.getElementById('tabDatos'),
  password: document.getElementById('tabPassword'),
  compras:  document.getElementById('tabCompras')
}

document.querySelectorAll('#perfilTabs .nav-link').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#perfilTabs .nav-link').forEach(b => b.classList.remove('active'))
    btn.classList.add('active')

    const tab = btn.dataset.tab
    Object.entries(TABS).forEach(([key, el]) => {
      el.style.display = key === tab ? 'block' : 'none'
    })

    if (tab === 'compras') cargarCompras()
  })
})



const perfilForm = document.getElementById('perfilForm')
const perfilMsg  = document.getElementById('perfilMsg')
const btnGuardar = document.getElementById('btnGuardar')

perfilForm.addEventListener('submit', async (e) => {
  e.preventDefault()

  perfilMsg.style.color  = 'red'
  perfilMsg.textContent  = ''
  btnGuardar.disabled    = true
  btnGuardar.textContent = 'Guardando...'

  const campos = {
    nickname:   document.getElementById('edit_nickname').value.trim(),
    name:       document.getElementById('edit_name').value.trim(),
    last_name:  document.getElementById('edit_last_name').value.trim(),
    e_mail:     document.getElementById('edit_email').value.trim(),
    phone:      document.getElementById('edit_phone').value.trim(),
    address:    document.getElementById('edit_address').value.trim(),
    birth_date: document.getElementById('edit_birth_date').value || null
  }

  const resultado = await actualizarPerfil(userId, campos, token)

  if (resultado.ok) {
    perfilMsg.style.color = 'green'
    perfilMsg.textContent = 'Datos actualizados correctamente'
    document.getElementById('perfilAlias').textContent = campos.nickname
    document.getElementById('navAlias').textContent    = campos.nickname
  } else {
    perfilMsg.textContent = resultado.message
  }

  btnGuardar.disabled    = false
  btnGuardar.textContent = 'Guardar cambios'
})

const passwordForm = document.getElementById('passwordForm')
const passwordMsg  = document.getElementById('passwordMsg')
const btnPassword  = document.getElementById('btnPassword')

passwordForm.addEventListener('submit', async (e) => {
  e.preventDefault()

  passwordMsg.style.color = 'red'
  passwordMsg.textContent = ''

  const nueva    = document.getElementById('new_password').value
  const confirma = document.getElementById('confirm_password').value

  if (nueva !== confirma) {
    passwordMsg.textContent = 'Las contraseñas no coinciden'
    return
  }
  if (nueva.length < 6) {
    passwordMsg.textContent = 'La contraseña debe tener al menos 6 caracteres'
    return
  }

  btnPassword.disabled    = true
  btnPassword.textContent = 'Guardando...'

  const resultado = await cambiarPassword(userId, nueva, token)

  if (resultado.ok) {
    passwordMsg.style.color = 'green'
    passwordMsg.textContent = 'Contraseña actualizada correctamente'
    passwordForm.reset()
  } else {
    passwordMsg.textContent = resultado.message
  }

  btnPassword.disabled    = false
  btnPassword.textContent = 'Cambiar contraseña'
})


// Lógica para el renderizado de compras


let comprasCargadas = false   

async function cargarCompras() {
  if (comprasCargadas) return
  comprasCargadas = true

  const container = document.getElementById('tabCompras')
  container.innerHTML = `
    <div class="text-center py-4">
      <div class="spinner-border spinner-border-sm text-secondary" role="status"></div>
      <p class="mt-2 text-muted small">Cargando compras...</p>
    </div>`

  const resultado = await obtenerOrdenes(token)

  if (!resultado.ok) {
    container.innerHTML = `<p class="text-danger">${resultado.message}</p>`
    return
  }

  const ordenes = resultado.ordenes

  if (!ordenes || ordenes.length === 0) {
    container.innerHTML = `
      <div class="text-center py-5 text-muted">
        <i class="bi bi-bag-x" style="font-size:2.5rem;"></i>
        <p class="mt-3">Aún no tienes compras registradas.</p>
      </div>`
    return
  }

  container.innerHTML = `
    <div id="listaCompras"></div>
    <div id="detalleCompra" style="display:none;"></div>`

  renderLista(ordenes)
}

function estadoBadge(estado) {
  const mapa = {
    aprobado:   'success'
  }
  const color = mapa[(estado || '').toLowerCase()] || 'secondary'
  return `<span class="badge bg-${color}">${estado || 'Sin estado'}</span>`
}

function renderLista(ordenes) {
  const lista = document.getElementById('listaCompras')

  lista.innerHTML = ordenes.map(o => `
    <div class="compra-card" data-id="${o.venta_id}" role="button" tabindex="0"
         style="cursor:pointer; border:1px solid #dee2e6; border-radius:8px;
                padding:14px 16px; margin-bottom:10px;
                transition: box-shadow .15s, border-color .15s;">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <span class="text-muted small ms-2">
            ${o.fecha ? new Date(o.fecha).toLocaleDateString('es-MX') : '—'}
          </span>
        </div>
        <div class="d-flex align-items-center gap-2">
          ${estadoBadge(o.estado)}
          <span class="fw-bold">$${Number(o.total).toFixed(2)}</span>
          <i class="bi bi-chevron-right text-muted"></i>
        </div>
      </div>
    </div>`
  ).join('')

  lista.querySelectorAll('.compra-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.boxShadow  = '0 2px 8px rgba(0,0,0,.1)'
      card.style.borderColor = '#adb5bd'
    })
    card.addEventListener('mouseleave', () => {
      card.style.boxShadow  = ''
      card.style.borderColor = '#dee2e6'
    })
    card.addEventListener('click',   () => abrirDetalle(card.dataset.id))
    card.addEventListener('keydown', e => { if (e.key === 'Enter') abrirDetalle(card.dataset.id) })
  })
}

async function abrirDetalle(ordenId) {
  const lista   = document.getElementById('listaCompras')
  const detalle = document.getElementById('detalleCompra')

  lista.style.display   = 'none'
  detalle.style.display = 'block'
  detalle.innerHTML     = `
    <div class="text-center py-4">
      <div class="spinner-border spinner-border-sm text-secondary" role="status"></div>
    </div>`

  const resultado = await obtenerDetalleOrden(ordenId, token)

  if (!resultado.ok) {
    detalle.innerHTML = `
      <button class="btn btn-sm btn-link ps-0 mb-3" id="btnVolver">
        <i class="bi bi-arrow-left"></i> Volver
      </button>
      <p class="text-danger">${resultado.message}</p>`
    detalle.querySelector('#btnVolver').addEventListener('click', () => volverLista())
    return
  }

  const o = resultado.orden

  detalle.innerHTML = `
    <button class="btn btn-sm btn-link ps-0 mb-3" id="btnVolver">
      <i class="bi bi-arrow-left"></i> Volver a mis compras
    </button>

    <div style="border:1px solid #dee2e6; border-radius:8px; padding:20px;">

      <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
        <div>
          <h6 class="mb-1 fw-bold">Orden #${o.venta_id}</h6>
          <small class="text-muted">
            ${o.fecha ? new Date(o.fecha).toLocaleDateString('es-MX', { day:'2-digit', month:'long', year:'numeric' }) : '—'}
          </small>
        </div>
        ${o.referencia ? `<small class="text-muted">Ref: <code>${o.referencia}</code></small>` : ''}
      </div>

      <table class="table table-sm mb-3">
        <thead class="table-light">
          <tr>
            <th>Producto</th>
            <th class="text-center">Cant.</th>
            <th class="text-end">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${o.productos.map(p => `
            <tr>
              <td class="d-flex align-items-center gap-2">
                ${p.imagen_url
                  ? `<img src="${p.imagen_url}" alt="${p.nombre}"
                         style="width:36px;height:36px;object-fit:cover;border-radius:4px; cursor:pointer !important;"
                         onclick="location.href='./product.html?id=${p.id}';">`
                  : `<span style="width:36px;height:36px;background:#f0f0f0;border-radius:4px;
                               display:inline-block;"></span>`}
                <span>${p.nombre}</span>
              </td>
              <td class="text-center">${p.cantidad}</td>
              <td class="text-end">$${Number(p.precio).toFixed(2)}</td>
            </tr>`).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" class="text-end fw-bold">Total</td>
            <td class="text-end fw-bold">$${Number(o.total).toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    <small>Presenta este comprobante en sucursal para recoger tu pedido</small>
    </div>`

  detalle.querySelector('#btnVolver').addEventListener('click', () => volverLista())
}

function volverLista() {
  document.getElementById('listaCompras').style.display  = 'block'
  document.getElementById('detalleCompra').style.display = 'none'
}