const API = "http://localhost:5000"; // change to your backend URL
let token = null;
let userId = null;
let username = null;
let score = 0;
let snake, food, dx, dy, interval;

async function register() {
  const u = document.getElementById("username").value;
  const p = document.getElementById("password").value;
  const res = await fetch(API + "/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: u, password: p })
  });
  document.getElementById("authStatus").innerText = await res.text();
}

async function login() {
  const u = document.getElementById("username").value;
  const p = document.getElementById("password").value;
  const res = await fetch(API + "/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: u, password: p })
  });
  if (res.ok) {
    const data = await res.json();
    token = data.token;
    userId = data.userId;
    username = data.username;
    document.getElementById("authStatus").innerText = "Logged in as " + username;
    loadLeaderboard();
  } else {
    document.getElementById("authStatus").innerText = await res.text();
  }
}

function startGame() {
  snake = [{ x: 200, y: 200 }];
  dx = 20; dy = 0;
  food = randomFood();
  score = 0;
  document.getElementById("score").innerText = score;
  clearInterval(interval);
  interval = setInterval(gameLoop, 100);
}

function gameLoop() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  // collision
  if (head.x < 0 || head.y < 0 || head.x >= 400 || head.y >= 400 ||
      snake.some(p => p.x === head.x && p.y === head.y)) {
    clearInterval(interval);
    saveScore();
    return;
  }

  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score++;
    document.getElementById("score").innerText = score;
    food = randomFood();
  } else {
    snake.pop();
  }

  draw();
}

function draw() {
  const ctx = document.getElementById("gameCanvas").getContext("2d");
  ctx.clearRect(0, 0, 400, 400);

  ctx.fillStyle = "green";
  snake.forEach(p => ctx.fillRect(p.x, p.y, 20, 20));

  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, 20, 20);
}

function randomFood() {
  return {
    x: Math.floor(Math.random() * 20) * 20,
    y: Math.floor(Math.random() * 20) * 20
  };
}

document.addEventListener("keydown", e => {
  if (e.key === "ArrowUp" && dy === 0) { dx = 0; dy = -20; }
  if (e.key === "ArrowDown" && dy === 0) { dx = 0; dy = 20; }
  if (e.key === "ArrowLeft" && dx === 0) { dx = -20; dy = 0; }
  if (e.key === "ArrowRight" && dx === 0) { dx = 20; dy = 0; }
});

async function saveScore() {
  if (!token) return;
  await fetch(API + "/save-score", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ score })
  });
  loadLeaderboard();
}

async function loadLeaderboard() {
  const res = await fetch(API + "/leaderboard");
  const data = await res.json();
  const list = document.getElementById("leaderboard");
  list.innerHTML = "";
  data.forEach(u => {
    const li = document.createElement("li");
    li.innerText = `${u.username}: ${u.score}`;
    list.appendChild(li);
  });
}
