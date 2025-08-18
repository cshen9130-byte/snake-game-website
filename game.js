const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let snake = [{ x: 10, y: 10 }];
let direction = "RIGHT";
let score = 0;

function gameLoop() {
    moveSnake();
    drawGame();
    checkCollision();
}

function moveSnake() {
    let head = { ...snake[0] };
    if (direction === "RIGHT") head.x++;
    if (direction === "LEFT") head.x--;
    if (direction === "UP") head.y--;
    if (direction === "DOWN") head.y++;

    snake.unshift(head);
    snake.pop();
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "green";
    snake.forEach(segment => ctx.fillRect(segment.x * 20, segment.y * 20, 20, 20));

    document.getElementById("score").innerText = `Score: ${score}`;
}

function checkCollision() {
    if (snake[0].x < 0 || snake[0].x >= 20 || snake[0].y < 0 || snake[0].y >= 20) {
        alert("Game Over!");
        resetGame();
    }
}

function resetGame() {
    snake = [{ x: 10, y: 10 }];
    score = 0;
    direction = "RIGHT";
}

document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
    if (event.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
    if (event.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
    if (event.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
});

setInterval(gameLoop, 100);

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const signupLink = document.getElementById("signupLink");
    const loginLink = document.getElementById("loginLink");

    // Toggle to sign up form
    signupLink.addEventListener("click", (e) => {
        e.preventDefault();
        loginForm.style.display = "none";
        signupForm.style.display = "block";
    });

    // Toggle back to login form
    loginLink.addEventListener("click", (e) => {
        e.preventDefault();
        signupForm.style.display = "none";
        loginForm.style.display = "block";
    });

    // Handle login submit
    document.getElementById("login").addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        const res = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        alert(data.message);
    });

    // Handle signup submit
    document.getElementById("signup").addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("newUsername").value;
        const password = document.getElementById("newPassword").value;

        const res = await fetch("/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        alert(data.message);
    });
});

