let mode = "5q";
let clef = "treble";

let questionCount = 0;
let score = 0;

let startTime = 0;
let timerInterval = null;

let currentNote = null;

// =====================
// 音声
// =====================
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// =====================
// 音階
// =====================
const notes = ["ド", "レ", "ミ", "ファ", "ソ", "ラ", "シ"];

const noteIndex = {
  "ド": 0,
  "レ": 1,
  "ミ": 2,
  "ファ": 3,
  "ソ": 4,
  "ラ": 5,
  "シ": 6
};

const freqMap = {
  "ド": 523.3,
  "レ": 587.3,
  "ミ": 659.3,
  "ファ": 698.5,
  "ソ": 784.0,
  "ラ": 880.0,
  "シ": 987.8
};

// =====================
// 五線基準（ここが最重要）
// =====================
const startY = 20;
const gap = 15;

// 1線目（一番下）を基準
const staffCenterY = startY + gap * 4;

// ト音・ヘ音の基準位置
const clefBase = {
  treble: 2, // ドの位置
  bass: -3   // ドの位置
};

// =====================
// デバッグ
// =====================
function logNote(note, y, base) {
  console.log(`[note] ${note} index=${noteIndex[note]} base=${base} y=${y}`);
}

// =====================
// クッキー操作関数
// =====================
function setCookie(name, value, days = 365) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${d.toUTCString()}; path=/`;
}

function getCookie(name) {
  const cookies = document.cookie.split("; ");
  for (const c of cookies) {
    const [k, v] = c.split("=");
    if (k === name) return v;
  }
  return null;
}

// =====================
// ログインチェック
// =====================
function isLoggedIn() {
  return localStorage.getItem("login_state") === "in";
}

// =====================
// ホームに戻る
// =====================
function goHome() {
  location.href = "/home";
}

// =====================
// 初期化
// =====================
function showGameUI() {
  document.getElementById("result").style.display = "none";
  document.getElementById("modeSelect").style.display = "none";
  document.getElementById("clefSelect").style.display = "none";

  const game = document.getElementById("game");
  game.style.display = "flex";

  document.getElementById("buttons").style.display = "block";
  document.getElementById("status").style.display = "block";
  document.getElementById("staff").style.display = "block";

  // ★重要：レイアウト再適用
  game.style.textAlign = "flex";
}

// =====================
// モード選択に戻る
// =====================
function backToMenu() {
  location.reload();
}

// =====================
// Y計算（完全安定版）
// =====================
function getY(note, clefType) {
  const index = noteIndex[note];
  const base = clefBase[clefType];

  const y = staffCenterY - (index - base) * (gap / 2);

  logNote(note, y, base);

  return y;
}

// =====================
// 音声初期化
// =====================
document.body.addEventListener("click", () => {
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}, { once: true });

// =====================
// モード選択
// =====================
function selectMode(m) {
  mode = m;
  document.getElementById("modeSelect").style.display = "none";
  document.getElementById("clefSelect").style.display = "block";
}

// =====================
// ゲーム開始
// =====================
function startGame(c) {
  clef = c;

  questionCount = 0;
  score = 0;

  startTime = performance.now();
  timerInterval = setInterval(updateStatus, 50);

  showGameUI();

  nextQuestion();
}

// =====================
// リスタート
// =====================
function retry() {
  questionCount = 0;
  score = 0;

  startTime = performance.now();

  clearInterval(timerInterval);
  timerInterval = setInterval(updateStatus, 50);

  showGameUI();

  nextQuestion();
}

// =====================
// 問題
// =====================
function nextQuestion() {
  currentNote = notes[Math.floor(Math.random() * notes.length)];
  questionCount++;

  drawStaff();
  updateStatus();

  if (questionCount > 5) {
    endGame();
  }
}

// =====================
// 回答
// =====================
function answer(n) {
  if (n === currentNote) {
    score++;
    playCorrect(n);
  } else {
    playWrong();
  }

  if (questionCount >= 5) {
    endGame();
    return;
  }

  nextQuestion();
}

// =====================
// 状態
// =====================
function updateStatus() {
  const time = ((performance.now() - startTime) / 1000).toFixed(2);

  document.getElementById("status").textContent =
    `問題: ${Math.min(questionCount, 5)}/5  正解: ${score}  時間: ${time}秒`;
}

// =====================
// 終了
// =====================
async function endGame() {
  clearInterval(timerInterval);

  const time = parseFloat(((performance.now() - startTime) / 1000).toFixed(2));

  const loggedIn = isLoggedIn();
  const userId = localStorage.getItem("user_id");

  let serverBest = null;
  let worldBest = null;

  // =====================
  // クッキー（未ログイン用）
  // =====================
  const bestScore = parseInt(getCookie("bestScore") || "0");
  const bestTime = parseFloat(getCookie("bestTime") || "9999");

  const isRecord =
    score > bestScore || (score === bestScore && time < bestTime);

  if (isRecord) {
    setCookie("bestScore", score);
    setCookie("bestTime", time);
  }

  // =====================
  // サーバー処理（ログイン時）
  // =====================
  if (loggedIn) {
    // 保存
    try {
      await fetch("/api/score/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            user_id: userId,
            score,
            time,
            mode: "5q"
        })
      });
    } catch (e) {
      console.error("save failed", e);
    }

    // 自己ベスト
    try {
      const res = await fetch(`/api/score/me?user_id=${userId}`);
      const data = await res.json();
      if (data.success) serverBest = data.best;
    } catch (e) {
      console.error("me fetch failed", e);
    }

    // 世界ランキング
    try {
      const res = await fetch("/api/score/ranking");
      const data = await res.json();
      if (data.success && data.ranking.length > 0) {
        worldBest = data.ranking[0];
      }
    } catch (e) {
      console.error("ranking fetch failed", e);
    }
  }

  // =====================
  // 表示生成
  // =====================
  let html = "";

  if (isRecord) {
    html += `<div style="color:gold; font-weight:bold;">🏆 最高記録更新！</div><br>`;
  }

  html += `
    <div>終了！</div>
    <div>正解: ${score}/5</div>
    <div>時間: ${time}秒</div>
    <br>
  `;

  const finalBestScore = isRecord ? score : bestScore;
  const finalBestTime = isRecord ? time : bestTime;

  if (!loggedIn) {
    html += `
      <div style="color:red;">⚠ ログインするとランキングに登録できます</div>
      <div>最高記録: ${finalBestScore}問 / ${finalBestTime.toFixed(2)}秒</div>
    `;
  } else {
    if (serverBest) {
      html += `
        <div>自己ベスト: ${serverBest.score}問 / ${serverBest.time.toFixed(2)}秒</div>
      `;
    } else {
      html += `<div>自己ベスト: なし</div>`;
    }

    if (worldBest) {
      html += `
        <div>世界ベスト: ${worldBest.name}（${worldBest.score}問 / ${worldBest.time.toFixed(2)}秒）</div>
      `;
    } else {
      html += `<div>世界ベスト: なし</div>`;
    }
  }

  // =====================
  // UI反映
  // =====================
  document.getElementById("result").style.display = "block";
  document.getElementById("resultText").innerHTML = html;

  document.getElementById("buttons").style.display = "none";
  document.getElementById("status").style.display = "none";
  document.getElementById("staff").style.display = "none";
}

// =====================
// 描画（←これが無かった）
// =====================
function drawStaff() {
  const canvas = document.getElementById("staff");
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 五線
  ctx.strokeStyle = "#000";
  for (let i = 0; i < 5; i++) {
    const y = startY + i * gap;
    ctx.beginPath();
    ctx.moveTo(20, y);
    ctx.lineTo(280, y);
    ctx.stroke();
  }

  // 記号
  const gY = startY + gap * 2;
  ctx.fillStyle = "#000";
  ctx.font = "60px serif";
  ctx.fillText(clef === "treble" ? "𝄞" : "𝄢", 5, gY + 20);

  // 音符
  if (currentNote) {
    const y = getY(currentNote, clef);

    ctx.beginPath();
    ctx.ellipse(150, y, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// =====================
// 正解音
// =====================
function playCorrect(note) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.value = freqMap[note];

  gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.8);
}

// =====================
// 失敗音
// =====================
function playWrong() {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "square";
  osc.frequency.value = 80;

  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 1.2);
}