// js/common.js
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCslM5O5LdYHsG0AQoAqWNnjenzrxQpv70",
  authDomain: "d-and-d-tours-7d88b.firebaseapp.com",
  projectId: "d-and-d-tours-7d88b",
  storageBucket: "d-and-d-tours-7d88b.firebasestorage.app",
  messagingSenderId: "375049373586",
  appId: "1:375049373586:web:4a0bbbab06212899c8234b",
  measurementId: "G-GEN68YN8N0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


import { app } from "./firebase-config.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

export function $(id) {
  return document.getElementById(id);
}

// for navbar buttons
export function setupNavAuthButtons() {
  const loginBtn = document.getElementById("nav-login");
  const logoutBtn = document.getElementById("nav-logout");

  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      window.location.href = "login.html";
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await signOut(auth);
      window.location.href = "index.html";
    });
  }
}

// watch current user + role (customer or admin)
export function watchAuthAndRole(callback) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback(null, null);
      return;
    }
    try {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      const role = snap.exists() ? snap.data().role : "customer";
      callback(user, role);
    } catch (e) {
      console.error("Error reading user role", e);
      callback(user, null);
    }
  });
}

export { auth, db };
