async function renderizarError() {
  const token = localStorage.getItem("token");
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const container = document.getElementById('content')
  const content = document.getElementById('dynamic-content');

  const urlParams = new URLSearchParams(window.location.search);
  const status = urlParams.get('collection_status');

  if (!status || status === 'null') {
    container.style.display='block';
    html=`
      <div class="icon"><i class="bi bi-bag-x"></i></div>
      <div class="title">Compra cancelada</div>
      <div class="subtitle">Parece que regresaste antes de terminar.</div>
    `
    content.innerHTML=html;
    setTimer()
    return
  }
  else {
    container.style.display='block';
    html =`
      <div class="icon"><i class="bi bi-exclamation-circle"></i></div>
      <div class="title">Ha ocurrido un error</div>
      <div class="subtitle">Tu compra no se ha podido procesar correctamente, intenta de nuevo más tarde.</div>
    `
    content.innerHTML=html;
    setTimer()
  }


    function setTimer() {
        let seconds = 5;
        const countdownEl = document.getElementById('countdown');
        const interval = setInterval(() => {
        seconds--;
        countdownEl.textContent = seconds;

        if(seconds <= 0){
          clearInterval(interval);
          window.location.href = './cart.html';
        }
      }, 1000);
    }
}

renderizarError()