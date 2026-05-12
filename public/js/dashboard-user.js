import { auth } from "./firebase-config.js";
import { signOut } from
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";



/* ---------------- USER INFO & LOGOUT ---------------- */

const emailEl = document.getElementById("user-email");
if (auth.currentUser && emailEl) {
  emailEl.textContent = auth.currentUser.email;
}

const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.onclick = async () => {
    await signOut(auth);
    window.location.href = "login.html";
  };
}

const openBookings = sessionStorage.getItem("goToMyBookings");

if (openBookings === "true") {
  sessionStorage.removeItem("goToMyBookings");

  // wait for DOM
  window.addEventListener("DOMContentLoaded", () => {
    const bookingsTab = document.querySelector('[data-tab="bookings"]');
    if (bookingsTab) bookingsTab.click();
  });
}


/* ---------------- TAB SWITCHING ---------------- */

const tabButtons = document.querySelectorAll(".tab-btn");
const tabBook = document.getElementById("tab-book");
const tabBookings = document.getElementById("tab-bookings");

tabButtons.forEach(btn => {
  btn.onclick = () => {
    tabButtons.forEach(b => {
      b.classList.remove("bg-emerald-600", "text-white");
      b.classList.add("bg-emerald-100", "text-emerald-800");
    });

    btn.classList.add("bg-emerald-600", "text-white");
    btn.classList.remove("bg-emerald-100", "text-emerald-800");

    if (btn.dataset.tab === "book") {
      tabBook.classList.remove("hidden");
      tabBookings.classList.add("hidden");
    } else {
      tabBookings.classList.remove("hidden");
      tabBook.classList.add("hidden");
    }
  };
});

/* ---------------- TOUR CARD (SAME AS GUEST) ---------------- */

function renderTourCard(tour, tourId) {
  return `
    <div class="bg-white rounded-2xl shadow-md border hover:shadow-lg transition overflow-hidden">
      <div
        class="h-44 bg-cover bg-center"
        style="background-image:url('${tour.imageUrl || ""}')">
      </div>

      <div class="p-4 space-y-2">
        <h3 class="font-semibold text-zinc-900">${tour.title}</h3>

        <p class="text-xs text-zinc-600">
          ${tour.description || ""}
        </p>

        <div class="flex justify-between items-center pt-2">
          <span class="font-semibold text-emerald-700">
            $${tour.price ?? "--"}
          </span>
          <span class="text-[11px] text-zinc-500">
            ⭐ ${tour.rating ?? "N/A"}
          </span>
        </div>

        <button
          class="mt-3 w-full bg-emerald-600 text-white py-2 rounded-lg text-sm hover:bg-emerald-700"
          onclick="startBooking('${tourId}')">
          Book this tour
        </button>
      </div>
    </div>
  `;
}

/* ---------------- LOAD TOURS ---------------- */

async function loadTours() {
  const list = document.getElementById("tour-list");
  list.innerHTML = "";

  const selectedTourId = localStorage.getItem("selectedTourId");

  // If coming from index → show only selected tour
  if (selectedTourId) {
    const ref = doc(db, "tours", selectedTourId);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      list.insertAdjacentHTML(
        "beforeend",
        renderTourCard(snap.data(), snap.id)
      );
      showViewAllButton();
      return;
    }
  }

  // Normal dashboard → show all tours
  const snap = await getDocs(collection(db, "tours"));
  snap.forEach(docSnap => {
    list.insertAdjacentHTML(
      "beforeend",
      renderTourCard(docSnap.data(), docSnap.id)
    );
  });
}

loadTours();

/* ---------------- BOOK TOUR (THIS WAS BROKEN BEFORE) ---------------- */

function startBooking(tourId) {
  // store selected tour (same as guest)
  localStorage.setItem("selectedTourId", tourId);

  // go to booking form (logged-in user)
  window.location.href = "guest-booking.html";
}

// expose for inline onclick
window.startBooking = startBooking;


/* ---------------- VIEW ALL BUTTON ---------------- */

function showViewAllButton() {
  const btn = document.getElementById("view-all-tours");
  if (!btn) return;

  btn.classList.remove("hidden");

  btn.onclick = () => {
    localStorage.removeItem("selectedTourId");
    btn.classList.add("hidden");
    loadTours();
  };
}
