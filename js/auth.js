export function getToken() {
  return localStorage.getItem("token");
}

export function getPayload() {
  const token = getToken();

  if (!token) return null;

  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export function getRole() {
  const payload = getPayload();
  return payload ? payload.role : null;
}

export function requireAuth(rolEsperado) {

  const payload = getPayload();

  if (!payload) {
    window.location.href = "./login.html";
    return;
  }

  if (rolEsperado && payload.role !== rolEsperado) {
    window.location.href = "./login.html";
  }

}

export function getNickname() {
  const payload = getPayload();
  return payload ? payload.nickname : null;
}

export function getUserId() {
  const payload = getPayload();
  return payload ? payload.id : null;
}

export function logout() {
  localStorage.removeItem("token");
  window.location.href = "./login.html";
}