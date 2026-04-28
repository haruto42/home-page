const timetable = {
  "月": ["道徳", "国語", "社会", "体育", "理科", "技術"],
  "火": ["理科", "美術", "数学", "音楽", "英語", "国語"],
  "水": ["英語", "国語", "体育", "数学", "社会", "家庭科"],
  "木": ["理科", "英語", "音楽/美術", "数学", "学活", ""],
  "金": ["英語", "数学", "国語", "体育", "社会", "総合"]
};

const days = ["日", "月", "火", "水", "木", "金", "土"];

const now = new Date();
const weekday = days[now.getDay()];

const subjects = timetable[weekday] || [];

const el = document.getElementById("today-info");

if (subjects.length === 0) {
  el.textContent = `今日は${weekday}曜日（授業なし）`;
} else {
  el.textContent = `今日は${weekday}曜日：${subjects.join(" / ")}`;
}