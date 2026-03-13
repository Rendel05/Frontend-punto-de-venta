const form = document.getElementById("loginForm");
const token = localStorage.getItem("token");

if (token) {
  window.location.href = "./admin.html";
}

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
      body: JSON.stringify({
        nickname,
        password
      })
    });

    const data = await res.json();

    if (res.ok) {

      localStorage.setItem("token", data.token);

      window.location.href = "./admin.html";

    } else {

      document.getElementById("loginMsg").textContent = data.message;

    }

  } catch (error) {

    document.getElementById("loginMsg").textContent = "Error de conexión";

  }

});