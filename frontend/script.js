console.log("script.js loaded");

const API = "https://snake-game-website.onrender.com"; // backend URL
let token = null;
let username = null;

document.addEventListener("DOMContentLoaded", () => {
  // Modals
  const signupModal = document.getElementById("signupModal");
  const loginModal = document.getElementById("loginModal");
  const openSignup = document.getElementById("openSignup");
  const openLogin = document.getElementById("openLogin");
  const closeSignup = document.getElementById("closeSignup");
  const closeLogin = document.getElementById("closeLogin");

  // Open modals
  openSignup.onclick = () => signupModal.style.display = "flex";
  openLogin.onclick = () => loginModal.style.display = "flex";

  // Close modals
  closeSignup.onclick = () => signupModal.style.display = "none";
  closeLogin.onclick = () => loginModal.style.display = "none";

  // Close if clicking outside modal
  window.onclick = (event) => {
    if (event.target === signupModal) signupModal.style.display = "none";
    if (event.target === loginModal) loginModal.style.display = "none";
  };

  // Handle signup
  document.getElementById("signupBtn").addEventListener("click", async () => {
    const newUsername = document.getElementById("newUsername").value;
    const newPassword = document.getElementById("newPassword").value;

    try {
      const res = await fetch(API + "/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername, password: newPassword })
      });

      const text = await res.text();
      alert(text);
      signupModal.style.display = "none";
    } catch (err) {
      console.error(err);
      alert("Error signing up");
    }
  });

  // Handle login
  document.getElementById("loginBtn").addEventListener("click", async () => {
    const usernameInput = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
      const res = await fetch(API + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameInput, password })
      });

      const data = await res.json();
      if (res.ok && data.username) {
        token = data.token || null;
        username = data.username;
        alert(`Welcome, ${username}!`);
        loginModal.style.display = "none";
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error logging in");
    }
  });
});
