import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from
  "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from
  "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


// ============================================================
// FIREBASE CONFIG
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyCmoqqwzWdCNUdj68s73NuTI9bWK62cDkg",
  authDomain: "nishan-57d56.firebaseapp.com",
  projectId: "nishan-57d56",
  storageBucket: "nishan-57d56.firebasestorage.app",
  messagingSenderId: "505242463982",
  appId: "1:505242463982:web:ba2d220fcaf74077d18dff"
};
// ============================================================
// INITIALIZE FIREBASE
// ============================================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


// ============================================================
// DOM ELEMENTS
// ============================================================

const authGate = document.getElementById("auth-gate");

const site = document.getElementById("site");

const tabs = document.querySelectorAll(".auth-tab");

const forms = {
  login: document.getElementById("login-form"),
  signup: document.getElementById("signup-form")
};

const loginError =
  document.getElementById("login-error");

const signupError =
  document.getElementById("signup-error");

const logoutBtn =
  document.getElementById("logout-btn");

const userNameEl =
  document.getElementById("user-name");


// ============================================================
// SHOW WEBSITE
// ============================================================

function enterSite(name) {

  userNameEl.textContent = name || "Student";

  authGate.classList.add("is-hidden");

  site.hidden = false;

  document.body.style.overflow = "";
}


// ============================================================
// SHOW LOGIN SCREEN
// ============================================================

function showGate() {

  site.hidden = true;

  authGate.classList.remove("is-hidden");

  document.body.style.overflow = "hidden";
}


// ============================================================
// AUTH TABS
// ============================================================

tabs.forEach((tab) => {

  tab.addEventListener("click", () => {

    tabs.forEach((t) => {

      t.classList.remove("is-active");

      t.setAttribute(
        "aria-selected",
        "false"
      );

    });

    tab.classList.add("is-active");

    tab.setAttribute(
      "aria-selected",
      "true"
    );

    Object.values(forms).forEach((form) => {

      form.classList.remove("is-active");

    });

    forms[tab.dataset.tab].classList.add("is-active");

    loginError.textContent = "";

    signupError.textContent = "";

  });

});


// ============================================================
// SIGN UP
// ============================================================

forms.signup.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    signupError.textContent = "";

    const data = new FormData(forms.signup);

    const name =
      data.get("name")?.trim();

    const email =
      data.get("email")?.trim().toLowerCase();

    const target =
      data.get("target");

    const password =
      data.get("password");


    // Validate fields

    if (!name || !email || !target || !password) {

      signupError.textContent =
        "Please fill in every field.";

      return;
    }


    // Validate password

    if (password.length < 6) {

      signupError.textContent =
        "Password needs at least 6 characters.";

      return;
    }


    try {

      // Create Firebase Authentication account

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );


      const user =
        userCredential.user;


      // Create Firestore user profile

      await setDoc(
        doc(db, "users", user.uid),
        {
          name: name,
          email: email,
          target: target,
          role: "student",
          createdAt: serverTimestamp()
        }
      );


      // Reset form

      forms.signup.reset();


      // Enter website

      enterSite(name);

    } catch (error) {

      console.error(
        "SIGNUP ERROR:",
        error
      );

      signupError.textContent =
        getFirebaseErrorMessage(error);

    }

  }
);


// ============================================================
// LOGIN
// ============================================================

forms.login.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    loginError.textContent = "";

    const data =
      new FormData(forms.login);

    const email =
      data.get("email")?.trim().toLowerCase();

    const password =
      data.get("password");


    // Validate fields

    if (!email || !password) {

      loginError.textContent =
        "Please enter your email and password.";

      return;
    }


    try {

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );


      forms.login.reset();

    } catch (error) {

      console.error(
        "LOGIN ERROR:",
        error
      );

      loginError.textContent =
        getFirebaseErrorMessage(error);

    }

  }
);


// ============================================================
// LOGOUT
// ============================================================

logoutBtn.addEventListener(
  "click",
  async () => {

    try {

      await signOut(auth);

    } catch (error) {

      console.error(
        "LOGOUT ERROR:",
        error
      );

    }

  }
);


// ============================================================
// FIREBASE AUTH STATE
// ============================================================

onAuthStateChanged(
  auth,
  async (user) => {

    // User is NOT logged in

    if (!user) {

      showGate();

      return;
    }


    // User IS logged in

    try {

      const userRef =
        doc(db, "users", user.uid);

      const userSnapshot =
        await getDoc(userRef);


      if (userSnapshot.exists()) {

        const userData =
          userSnapshot.data();

        enterSite(
          userData.name || "Student"
        );

      } else {

        enterSite(
          "Student"
        );

      }

    } catch (error) {

      console.error(
        "USER PROFILE ERROR:",
        error
      );

      enterSite(
        "Student"
      );

    }

  }
);


// ============================================================
// FIREBASE ERROR MESSAGES
// ============================================================

function getFirebaseErrorMessage(error) {

  switch (error.code) {

    case "auth/email-already-in-use":

      return "This email is already registered.";

    case "auth/invalid-email":

      return "Please enter a valid email address.";

    case "auth/weak-password":

      return "Password should be at least 6 characters.";

    case "auth/invalid-credential":

      return "Incorrect email or password.";

    case "auth/user-not-found":

      return "No account exists with this email.";

    case "auth/wrong-password":

      return "Incorrect password.";

    case "auth/too-many-requests":

      return "Too many attempts. Please try again later.";

    case "auth/operation-not-allowed":

      return "Email/Password authentication is not enabled in Firebase.";

    case "auth/invalid-api-key":

      return "Firebase API key is invalid.";

    case "auth/network-request-failed":

      return "Network error. Please check your internet connection.";

    case "permission-denied":

      return "Firestore permission denied. Please check your Firestore rules.";

    default:

      console.error(
        "Firebase error code:",
        error.code
      );

      return (
        error.message ||
        "Something went wrong. Please try again."
      );

  }

    }
