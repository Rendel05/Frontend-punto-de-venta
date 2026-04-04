
function renderCorteCaja() {
const container = document.getElementById("admin-content");

container.innerHTML = ` <div class="card p-4 shadow-sm"> <h3 class="mb-3">Corte de Caja</h3>
  <div class="mb-3">
    <h5>Movimientos del día</h5>
    <div class="table-responsive">
      <table class="table table-sm table-bordered">
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Monto</th>
            <th>Fecha</th>
            <th>Descripción</th>
          </tr>
        </thead>
        <tbody id="tabla-movimientos">
          <tr><td colspan="4">Cargando...</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <form id="form-corte">
    <div class="mb-2">
      <label class="form-label">Saldo Inicial</label>
      <input id="saldo_inicial" type="number" step="0.01" class="form-control" required>
    </div>

    <div class="mb-3">
      <label class="form-label">Observaciones</label>
      <textarea id="observaciones" class="form-control"></textarea>
    </div>

    <div class="d-flex gap-2">
      <button type="submit" class="btn btn-danger w-100">
        Realizar Corte
      </button>
      <button type="button" id="btn-cancelar" class="btn btn-secondary w-100">
        Cancelar
      </button>
    </div>
  </form>
</div>

`;

cargarMovimientos();
activarFormCorte();
}

async function cargarMovimientos() {
try {
const token = localStorage.getItem("token");

const res = await fetch(`${API_BASE}/cashOut`, {
  headers: {
    "Authorization": `Bearer ${token}`
  }
});

const data = await res.json();

const tbody = document.getElementById("tabla-movimientos");

tbody.innerHTML = data.data.map(m => `
  <tr>
    <td>${m.tipo}</td>
    <td>$${m.monto}</td>
    <td>${new Date(m.fecha_hora).toLocaleString()}</td>
    <td>${m.descripcion}</td>
  </tr>
`).join("");


} catch (error) {
console.error(error);
mostrarToast("Error cargando movimientos", "danger");
}
}

function activarFormCorte() {
  const form = document.getElementById("form-corte");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    Swal.fire({
      title: 'Confirmar corte de caja',
      text: 'Solo puedes hacer un corte por día. ¿Deseas continuar?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, hacer corte',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem("token");

        const data = {
          saldo_inicial: parseFloat(document.getElementById("saldo_inicial").value),
          observaciones: document.getElementById("observaciones").value
        };

        try {
          const res = await fetch(`${API_BASE}/cashOut`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data)
          });

          const resultData = await res.json();

          if (res.ok) {
            mostrarToast("Corte realizado correctamente", "success");
            setTimeout(() => { window.location.href = "admin.html"; }, 1200);
          } else {
            mostrarToast(resultData.message || "Error al realizar corte", "danger");
          }

        } catch (error) {
          console.error(error);
          mostrarToast("Error de conexión", "danger");
        }
      }
    });
  });

  document.getElementById("btn-cancelar").addEventListener("click", () => {
    window.location.href = "admin.html";
  });
}