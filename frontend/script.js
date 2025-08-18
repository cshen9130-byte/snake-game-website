const API = "https://snake-game-website.onrender.com"; // your backend URL
let token = null;
let username = null;

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const signupLink = document.getElementById("signupLink");
  const loginLink = document.getElementById("loginLink");

  // Toggle forms
  signupLink.addEventListener("click", (e) => {
    e.preventDefault();
    loginForm.style.display = "none";
    signupForm.style.display = "block";
  });

  loginLink.addEventListener("click", (e) => {
    e.preventDefault();
    signupForm.style.display = "none";
    loginForm.style.display = "block";
  });

  // Handle login
  document.getElementById("login").addEventListener("submit", async (e) => {
    e.preventDefault();
    const usernameInput = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const res = await fetch(API + "/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: usernameInput, password })
    });

    const data = await res.json();
    if (res.ok) {
      token = data.token;
      username = data.username;
      alert(`Welcome, ${username}!`);
    } else {
      alert(data.message);
    }
  });

  // Handle signup
  document.getElementById("signup").addEventListener("submit", async (e) => {
    e.preventDefault();
    const newUsername = document.getElementById("newUsername").value;
    const newPassword = document.getElementById("newPassword").value;

    const res = await fetch(API + "/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: newUsername, password: newPassword })
    });

    const data = await res.json();
    alert(data.message);
  });
});
