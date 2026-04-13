async function iniciarPago() {
  const token = localStorage.getItem("token");
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const container = document.getElementById('content')
  const content = document.getElementById('dynamic-content');




  if (carrito.length === 0) {
    container.style.display='block';
    html=`
      <div class="icon"><i class="bi bi-cart-x"></i></div>
      <div class="title">Carrito vacío</div>
      <div class="subtitle">Tu carrito está vacío, llénalo con nuestros producto!</div>
    `
    content.innerHTML=html;
    setTimer()
    return
  }

  try {
    const response = await fetch(
      "https://backend-punto-de-venta-render.onrender.com/api/payment/create-preference",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ carrito })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al crear preferencia");
    }

    window.location.href = data.init_point;

  } catch (error) {
    console.error(error);
    container.style.display='block';
    html =`
      <div class="icon"><i class="bi bi-exclamation-circle"></i></div>
      <div class="title">Ha ocurrido un error</div>
      <div class="subtitle">Tu compra no se ha podido procesar correctamente, intenta de nuevo más tarde.</div>
    `
    content.innerHTML=html;
    setTimer()
  }
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