/* =================================================================
   Nishaan — FSC & MDCAT prep
   Client-side demo auth. Accounts live only in this browser's
   localStorage — there is no real backend here.
================================================================= */
(function () {
  "use strict";

  const USERS_KEY = "nishaan_users";
  const SESSION_KEY = "nishaan_session";

  const authGate = document.getElementById("auth-gate");
  const site = document.getElementById("site");

  const tabs = document.querySelectorAll(".auth-tab");
  const forms = {
    login: document.getElementById("login-form"),
    signup: document.getElementById("signup-form"),
  };

  const loginError = document.getElementById("login-error");
  const signupError = document.getElementById("signup-error");
  const demoBtn = document.getElementById("demo-login");
  const logoutBtn = document.getElementById("logout-btn");
  const userNameEl = document.getElementById("user-name");

  // ---------- storage helpers ----------
  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function setSession(email, name) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ email, name }));
  }

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY));
    } catch (e) {
      return null;
    }
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  // very light obfuscation so a password isn't sitting in plain text;
  // this is a static demo, not real security.
  function hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (h << 5) - h + str.charCodeAt(i);
      h |= 0;
    }
    return String(h);
  }

  // ---------- gate <-> site ----------
  function enterSite(name) {
    userNameEl.textContent = name || "Student";
    authGate.classList.add("is-hidden");
    site.hidden = false;
    document.body.style.overflow = "";
  }

  function showGate() {
    site.hidden = true;
    authGate.classList.remove("is-hidden");
    document.body.style.overflow = "hidden";
  }

  // ---------- tabs ----------
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");

      Object.values(forms).forEach((f) => f.classList.remove("is-active"));
      forms[tab.dataset.tab].classList.add("is-active");

      loginError.textContent = "";
      signupError.textContent = "";
    });
  });

  // ---------- signup ----------
  forms.signup.addEventListener("submit", (e) => {
    e.preventDefault();
    signupError.textContent = "";

    const data = new FormData(forms.signup);
    const name = data.get("name").trim();
    const email = data.get("email").trim().toLowerCase();
    const target = data.get("target");
    const password = data.get("password");

    if (!name || !email || !target || !password) {
      signupError.textContent = "Please fill in every field.";
      return;
    }
    if (password.length < 6) {
      signupError.textContent = "Password needs at least 6 characters.";
      return;
    }

    const users = getUsers();
    if (users[email]) {
      signupError.textContent = "An account with that email already exists — log in instead.";
      return;
    }

    users[email] = { name, target, passwordHash: hash(password) };
    saveUsers(users);
    setSession(email, name);
    forms.signup.reset();
    enterSite(name);
  });

  // ---------- login ----------
  forms.login.addEventListener("submit", (e) => {
    e.preventDefault();
    loginError.textContent = "";

    const data = new FormData(forms.login);
    const email = data.get("email").trim().toLowerCase();
    const password = data.get("password");

    const users = getUsers();
    const user = users[email];

    if (!user || user.passwordHash !== hash(password)) {
      loginError.textContent = "That email and password don't match an account here.";
      return;
    }

    setSession(email, user.name);
    forms.login.reset();
    enterSite(user.name);
  });

  // ---------- demo account ----------
  demoBtn.addEventListener("click", () => {
    const email = "demo@nishaan.app";
    const users = getUsers();
    if (!users[email]) {
      users[email] = { name: "Demo Student", target: "mdcat", passwordHash: hash("demo123") };
      saveUsers(users);
    }
    setSession(email, users[email].name);
    enterSite(users[email].name);
  });

  // ---------- logout ----------
  logoutBtn.addEventListener("click", () => {
    clearSession();
    showGate();
  });

  // ---------- boot ----------
  const session = getSession();
  if (session && session.email) {
    enterSite(session.name);
  } else {
    document.body.style.overflow = "hidden";
  }
})();
