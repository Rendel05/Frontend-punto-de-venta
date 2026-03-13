export function checkAuth() {

  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "../login.html";
  }

}

export function logout() {

  localStorage.removeItem("token");
  window.location.href = "../login.html";

}

export function getToken() {
  return localStorage.getItem("token");
}