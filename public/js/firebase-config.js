// public/js/firebase-config.js
// Exports initialized app, auth and firestore for other modules to import.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// <-- paste your firebase config here (from project settings) -->
const firebaseConfig = {
  apiKey: "AIzaSyCslM5O5LdYHsG0AQoAqWNnjenzrxQpv70",
  authDomain: "d-and-d-tours-7d88b.firebaseapp.com",
  projectId: "d-and-d-tours-7d88b",
  storageBucket: "d-and-d-tours-7d88b.firebasestorage.app",
  messagingSenderId: "375049373586",
  appId: "1:375049373586:web:4a0bbbab06212899c8234b",
  measurementId: "G-GEN68YN8N0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
