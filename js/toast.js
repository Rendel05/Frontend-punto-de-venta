function mostrarToast(mensaje, tipo = 'success') {
  const container = document.getElementById('toast-container');

  const toastHTML = `
    <div class="toast align-items-center text-bg-${tipo} border-0 mb-2" role="alert">
      <div class="d-flex">
        <div class="toast-body">
          ${mensaje}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>
  `;

  container.insertAdjacentHTML('beforeend', toastHTML);

  const toastElement = container.lastElementChild;
  const toast = new bootstrap.Toast(toastElement, {
    delay: 2500
  });

  toast.show();

  toastElement.addEventListener('hidden.bs.toast', () => {
    toastElement.remove();
  });
}