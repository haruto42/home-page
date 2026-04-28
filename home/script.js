function hasSessionCookie() {
  return document.cookie.split(";").some(c => c.trim().startsWith("session="));
}

window.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("user_id");
  const state = localStorage.getItem("login_state");
  const loginBtn = document.querySelector(".login-btn");

  // ★ ログアウト状態なら強制ログアウト
  if (state !== "in") {
    localStorage.removeItem("user_id");

    if (loginBtn) {
      loginBtn.textContent = "ログイン";
      loginBtn.href = "../login/login.html";
    }
    return;
  }

  // ★ cookieが無い場合もログアウト
  if (!hasSessionCookie()) {
    localStorage.setItem("login_state", "out");
    localStorage.removeItem("user_id");

    if (loginBtn) {
      loginBtn.textContent = "ログイン";
      loginBtn.href = "../login/login.html";
    }
    return;
  }

  // ★ ログイン状態
  if (userId && loginBtn) {
    loginBtn.textContent = "UserID: " + userId;
    loginBtn.href = "#";
  }
});