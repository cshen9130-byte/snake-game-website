console.log("script.js loaded");

const API = "https://snake-game-website.onrender.com"; // backend URL
window.token = null;
window.username = null;
window.userId = null;
window.highScore = 0;
window.rank = 0;

document.addEventListener("DOMContentLoaded", () => {
  const signupModal = document.getElementById("signupModal");
  const loginModal = document.getElementById("loginModal");
  const openSignup = document.getElementById("openSignup");
  const openLogin = document.getElementById("openLogin");
  const closeSignup = document.getElementById("closeSignup");
  const closeLogin = document.getElementById("closeLogin");
  const startBtn = document.getElementById("startGameBtn");
  const userInfoDiv = document.getElementById("userInfo");

  openSignup.onclick = () => (signupModal.style.display = "flex");
  openLogin.onclick = () => (loginModal.style.display = "flex");
  closeSignup.onclick = () => (signupModal.style.display = "none");
  closeLogin.onclick = () => (loginModal.style.display = "none");

  window.onclick = (event) => {
    if (event.target === signupModal) signupModal.style.display = "none";
    if (event.target === loginModal) loginModal.style.display = "none";
  };

  // Signup
  document.getElementById("signupBtn").addEventListener("click", async () => {
    const newUsername = document.getElementById("newUsername").value;
    const newPassword = document.getElementById("newPassword").value;

    try {
      const res = await fetch(API + "/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername, password: newPassword }),
      });
      const text = await res.text();
      alert(text);
      if (res.ok) signupModal.style.display = "none";
    } catch (err) {
      console.error(err);
      alert("Error signing up");
    }
  });

  // Login
  document.getElementById("loginBtn").addEventListener("click", async () => {
    const usernameInput = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
      const res = await fetch(API + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameInput, password }),
      });
      const data = await res.json();

      if (res.ok) {
        window.token = data.token;
        window.username = data.username;
        window.userId = data.userId;
        window.highScore = data.highScore;
        window.rank = data.rank;

        loginModal.style.display = "none";

        // Show info on page
        userInfoDiv.innerHTML = `
          Welcome, ${window.username}! 
          High Score: ${window.highScore} 
          Rank: ${window.rank}
        `;

        // Enable Start Game button
        startBtn.disabled = false;
      } else {
        alert(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      alert("Error logging in");
    }
  });

  // Start game button
  startBtn.disabled = true; // disabled until login
  startBtn.addEventListener("click", () => {
    startGame(); // function from game.js
  });
});

