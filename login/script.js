document.getElementById("loginForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

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

        document.getElementById("msg").style.color = "green";
        document.getElementById("msg").textContent = "ログイン成功";

        setTimeout(() => {
            window.location.href = "../home/index.html";
        }, 500);
    } else {
        document.getElementById("msg").style.color = "red";
        document.getElementById("msg").textContent = "失敗";
    }
});

// 新規登録
document.getElementById("registerBtn").addEventListener("click", async () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

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

    const msg = document.getElementById("msg");

    if (data.success) {
        msg.style.color = "green";
        msg.textContent = "登録成功";
    } else if (data.error === "exists") {
        msg.style.color = "red";
        msg.textContent = "そのユーザー名は既に存在";
    } else {
        msg.style.color = "red";
        msg.textContent = "登録失敗";
    }
});