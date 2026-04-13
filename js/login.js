const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {

  e.preventDefault();

  const nickname = document.getElementById("nickname").value;
  const password = document.getElementById("password").value;

  try {

    const res = await fetch("https://backend-punto-de-venta-render.onrender.com/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ nickname, password })
    });

    const data = await res.json();

    if (res.ok) {

      localStorage.setItem("token", data.token);
      let cart=sessionStorage.getItem('redirectAfterLogin')

      const payload = JSON.parse(atob(data.token.split('.')[1]));
      
      switch (payload.role) {
        case "Admin":
          sessionStorage.removeItem('redirectAfterLogin')
          window.location.href = "./admin.html";
          break;
        case "Cajero":
          sessionStorage.removeItem('redirectAfterLogin')
          window.location.href = "./cashier.html";
          break;
        default:
          if(cart){
            sessionStorage.removeItem('redirectAfterLogin')
            window.location.href='./cart.html'
          }
          else{
            window.location.href = "../index.html";
          }
      }

    } else {
      document.getElementById("loginMsg").textContent = data.message;
    }

  } catch {
    document.getElementById("loginMsg").textContent = "Error de conexión";
  }

});