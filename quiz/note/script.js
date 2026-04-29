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

const noteMapTreble = {
  "ド": 95,
  "レ": 87,
  "ミ": 80,
  "ファ": 72,
  "ソ": 65,
  "ラ": 57,
  "シ": 50
};

const noteMapBass = {
  "ド": 65,
  "レ": 57,
  "ミ": 50,
  "ファ": 42,
  "ソ": 35,
  "ラ": 27,
  "シ": 20
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
// 初期化（音声解除用）
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

  document.getElementById("clefSelect").style.display = "none";
  document.getElementById("game").style.display = "block";

  questionCount = 0;
  score = 0;

  startTime = performance.now();

  timerInterval = setInterval(updateStatus, 50);

  nextQuestion();
}

// =====================
// 問題生成
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
// 状態表示
// =====================
function updateStatus() {
  const time = ((performance.now() - startTime) / 1000).toFixed(2);

  document.getElementById("status").textContent =
    `問題: ${Math.min(questionCount, 5)}/5  正解: ${score}  時間: ${time}秒`;
}

// =====================
// 終了
// =====================
function endGame() {
  clearInterval(timerInterval);

  const time = ((performance.now() - startTime) / 1000).toFixed(2);

  alert(`終了！\n正解: ${score}/5\n時間: ${time}秒`);

  location.reload();
}

// =====================
// 五線譜描画
// =====================
function drawStaff() {
  const canvas = document.getElementById("staff");
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const startY = 20;
  const gap = 15;

  // 五線
  ctx.strokeStyle = "#000";
  for (let i = 0; i < 5; i++) {
    const y = startY + i * gap;
    ctx.beginPath();
    ctx.moveTo(20, y);
    ctx.lineTo(280, y);
    ctx.stroke();
  }

  // 記号（ト音 / ヘ音）
  const gY = startY + gap * 2;
  ctx.fillStyle = "#000";
  ctx.font = "60px serif";
  ctx.fillText(clef === "treble" ? "𝄞" : "𝄢", 5, gY + 20);

  // 音符
  if (currentNote) {
    const y = (clef === "treble")
      ? noteMapTreble[currentNote]
      : noteMapBass[currentNote];

    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(150, y, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// =====================
// 正解音（ピアノ風）
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
// 失敗音（低音ドラム風）
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