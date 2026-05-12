// 🔹 Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔹 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCslM5O5LdYHsG0AQoAqWNnjenzrxQpv70",
  authDomain: "d-and-d-tours-7d88b.firebaseapp.com",
  projectId: "d-and-d-tours-7d88b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔹 Get selected tour ID (works for index + guest flow)
const tourId =
  localStorage.getItem("bookingTourId") ||
  localStorage.getItem("selectedTourId");

// 🔹 Elements
const titleEl = document.getElementById("tour-title");
const descEl = document.getElementById("tour-description");
const priceEl = document.getElementById("tour-price");
const imgEl = document.getElementById("tour-image");

// 🔹 Store loaded tour globally
let loadedTour = null;

// 🔹 Load tour details
async function loadTour() {
  if (!tourId) {
    alert("No tour selected. Please choose a tour first.");
    window.location.href = "index.html";
    return;
  }

  try {
    const ref = doc(db, "tours", tourId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      alert("Tour not found.");
      window.location.href = "index.html";
      return;
    }

    loadedTour = snap.data();

    // Fill UI
    titleEl.textContent = loadedTour.title;
    descEl.textContent = loadedTour.description;
    priceEl.textContent = `$${loadedTour.price}`;
    imgEl.style.backgroundImage = `url('${loadedTour.imageUrl}')`;
    imgEl.classList.add("bg-cover", "bg-center");

  } catch (err) {
    console.error("Error loading tour:", err);
    alert("Failed to load tour. Please try again.");
  }
}

loadTour();

// 🔹 Handle booking submit (ONLY ONE HANDLER)
document.getElementById("booking-form").addEventListener("submit", (e) => {
  e.preventDefault();

  if (!loadedTour) {
    alert("Tour data not ready. Please wait.");
    return;
  }

  const bookingData = {
    // 🔑 Tour info (THIS FIXES PAYMENT PAGE)
    tourId: tourId,
    tourTitle: loadedTour.title,
    price: Number(loadedTour.price),

    // 👤 Guest info
    email: document.getElementById("email").value.trim(),
    date: document.getElementById("date").value,
    people: Number(document.getElementById("people").value),
    pickup: document.getElementById("pickup").value.trim()
  };

  // Basic validation
  if (
    !bookingData.email ||
    !bookingData.date ||
    !bookingData.people ||
    !bookingData.pickup
  ) {
    alert("Please fill all required fields.");
    return;
  }

  // ✅ Save ONLY to sessionStorage
  sessionStorage.setItem("pendingBooking", JSON.stringify(bookingData));

  // Cleanup
  localStorage.removeItem("bookingTourId");
  localStorage.removeItem("selectedTourId");

  // Go to payment page
  window.location.href = "payment.html";
});
