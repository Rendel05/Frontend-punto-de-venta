function getUserFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    return null;
  }
}

function renderUserBox() {

  const user = getUserFromToken();
  const isInPages = location.pathname.includes("/pages/");
  const basePath = isInPages ? "." : "./pages";

  const detail = document.getElementById("user-detail");
  const detail2 = document.getElementById("user-detail2");
  const menu = document.getElementById("user-menu");
  const btn = document.getElementById("user-btn");
  const userBox = document.querySelector(".user-box");

  if (!detail || !detail2 || !menu || !btn || !userBox) return;

  if (user) {

    detail.textContent = `Hola, ${user.nickname}`;
    detail2.textContent = "Perfil";

    let menuOptions = `
      <a href="#" id="logout-btn">Cerrar sesión</a>
    `;

    if (user.rol === "Cliente") {
      menuOptions += `<a href="${basePath}/profile.html">Mi perfil</a>`;
    }

    if (user.rol === "Admin") {
      menuOptions += `<a href="${basePath}/admin.html">Panel admin</a>`;
    }

    if (user.rol === "Cajero") {
      menuOptions += `<a href="${basePath}/cashier.html">Caja</a>`;
    }

    menu.innerHTML = menuOptions;

    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("token");
        location.reload();
      });
    }
    btn.onclick = (e) => {
      e.preventDefault();
      menu.classList.toggle("show");
      btn.classList.toggle("active");
    };

    document.addEventListener("click", (e) => {
      if (!userBox.contains(e.target)) {
        menu.classList.remove("show");
        btn.classList.remove("active");
      }
    });

  } else {

    detail.textContent = "Iniciar sesión";
    detail2.textContent = "Login";
    menu.innerHTML = "";

    btn.onclick = () => {
      window.location.href = `${basePath}/login.html`;
    };
  }
}