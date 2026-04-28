document.addEventListener("DOMContentLoaded", () => {

    const msg = document.getElementById("msg");

    // ===== ログイン =====
    document.getElementById("loginForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            const data = await res.json();

            if (data.success) {
                localStorage.setItem("user_id", data.user_id);
                localStorage.setItem("login_state", "in"); // ★追加

                document.cookie = "session=1; path=/; max-age=86400";

                msg.style.color = "green";
                msg.textContent = "ログイン成功";

                setTimeout(() => {
                    window.location.href = "../home/index.html";
                }, 500);
            } else {
                msg.style.color = "red";
                msg.textContent = "ログイン失敗";
            }

        } catch {
            msg.style.color = "red";
            msg.textContent = "通信エラー";
        }
    });

    // ===== 新規登録 =====
    document.getElementById("registerBtn").addEventListener("click", async () => {

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            const data = await res.json();

            if (data.success) {
                localStorage.setItem("user_id", data.user_id);
                localStorage.setItem("login_state", "in"); // ★追加

                document.cookie = "session=1; path=/; max-age=86400";

                msg.style.color = "green";
                msg.textContent = "登録成功（ログインしました）";

                setTimeout(() => {
                    window.location.href = "../home/index.html";
                }, 500);

            } else if (data.error === "exists") {
                msg.style.color = "red";
                msg.textContent = "そのユーザー名は既に存在";
            } else {
                msg.style.color = "red";
                msg.textContent = "登録失敗";
            }

        } catch {
            msg.style.color = "red";
            msg.textContent = "通信エラー";
        }
    });

});