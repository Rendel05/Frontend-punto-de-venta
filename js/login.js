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

      const payload = JSON.parse(atob(data.token.split('.')[1]));

      switch (payload.rol) {
        case "Admin":
          window.location.href = "./admin.html";
          break;
        case "Cajero":
          window.location.href = "./cashier.html";
          break;
        default:
          window.location.href = "../index.html";
      }

    } else {
      document.getElementById("loginMsg").textContent = data.message;
    }

  } catch {
    document.getElementById("loginMsg").textContent = "Error de conexión";
  }

});