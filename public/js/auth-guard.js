import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (!user) {
    // Not logged in → kick out
    window.location.href = "login.html";
  }
});
