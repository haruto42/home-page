document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // 仮チェック（まだDB連携なし）
    if (username === "admin" && password === "2013") {
        document.getElementById("msg").style.color = "green";
        document.getElementById("msg").textContent = "ログイン成功";

        // 例：ホームへ移動
        setTimeout(() => {
            window.location.href = "../home/index.html";
        }, 500);

    } else {
        document.getElementById("msg").style.color = "red";
        document.getElementById("msg").textContent = "失敗";
    }
});