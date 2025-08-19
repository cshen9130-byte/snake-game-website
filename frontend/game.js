const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let snake = [{ x: 10, y: 10 }];
let direction = "RIGHT";
let score = 0;
let gameInterval = null;
let food = null;

// Start game
function startGame() {
  if (!window.token) {      
    alert("You must log in to play!");
    return;
  }

  // Show game and scoreboard
  document.getElementById("gameContainer").style.display = "block";
  document.getElementById("scoreBoard").style.display = "block";

  resetGame();
  spawnFood();
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, 100);
}

// Main game loop
function gameLoop() {
  moveSnake();
  checkCollision();
  drawGame();
}

// Move snake
function moveSnake() {
  let head = { ...snake[0] };

  if (direction === "RIGHT") head.x++;
  if (direction === "LEFT") head.x--;
  if (direction === "UP") head.y--;
  if (direction === "DOWN") head.y++;

  snake.unshift(head);

  // Check if snake eats food
  if (head.x === food.x && head.y === food.y) {
    score++;
    spawnFood();
  } else {
    snake.pop(); // only remove tail if not eating
  }
}

// Draw snake and food
function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw snake
  ctx.fillStyle = "green";
  snake.forEach(segment =>
    ctx.fillRect(segment.x * 20, segment.y * 20, 20, 20)
  );

  // Draw food
  if (food) {
    ctx.fillStyle = "red";
    ctx.fillRect(food.x * 20, food.y * 20, 20, 20);
  }

  document.getElementById("score").innerText = `Score: ${score}`;
}

// Spawn food randomly, not on the snake
function spawnFood() {
  do {
    food = {
      x: Math.floor(Math.random() * (canvas.width / 20)),
      y: Math.floor(Math.random() * (canvas.height / 20))
    };
  } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
}

// Check collisions
function checkCollision() {
  const head = snake[0];

  // Hit wall
  if (
    head.x < 0 ||
    head.x >= canvas.width / 20 ||
    head.y < 0 ||
    head.y >= canvas.height / 20
  ) {
    gameOver();
  }

  // Hit self
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      gameOver();
    }
  }
}

// Game over
function gameOver() {
  clearInterval(gameInterval);
  alert(`Game Over! Your score: ${score}`);
  sendScoreToBackend(score);
}

// Reset game
function resetGame() {
  snake = [{ x: 10, y: 10 }];
  direction = "RIGHT";
  score = 0;
  food = null;
}

// Send score to backend
async function sendScoreToBackend(score) {
  if (!window.token) return;

  try {
    const res = await fetch("https://snake-game-website.onrender.com/save-score", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${window.token}`,
      },
      body: JSON.stringify({ score }),
    });

    const data = await res.json();
    if (res.ok) {
      window.highScore = data.highScore;
      window.rank = data.rank;

      // Update user info div
      const userInfoDiv = document.getElementById("userInfo");
      if (userInfoDiv) {
        userInfoDiv.innerHTML = `
          Welcome, ${window.username}! 
          High Score: ${window.highScore} 
          Rank: ${window.rank}
        `;
      }
    } else {
      console.error(data.message || "Error saving score");
    }
  } catch (err) {
    console.error(err);
  }
}

// Keyboard controls
document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
  if (event.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  if (event.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  if (event.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
});
