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

  openSignup.onclick = () => (signupModal.style.display = "flex");
  openLogin.onclick = () => (loginModal.style.display = "flex");
  closeSignup.onclick = () => (signupModal.style.display = "none");
  closeLogin.onclick = () => (loginModal.style.display = "none");

  window.onclick = (event) => {
    if (event.target === signupModal) signupModal.style.display = "none";
    if (event.target === loginModal) loginModal.style.display = "none";
  };

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

        alert(`Welcome, ${window.username}!\nHigh Score: ${window.highScore}\nRank: ${window.rank}`);
        loginModal.style.display = "none";
      } else {
        alert(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      alert("Error logging in");
    }
  });

  // Start Game button
  document.getElementById("startGameBtn").addEventListener("click", () => {
    if (!window.token) {
      alert("You must log in to play!");
      return;
    }
    startGame(); // calls function from game.js
  });
});
