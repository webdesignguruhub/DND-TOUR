// js/customer-dashboard.js
import { setupNavAuthButtons, $, watchAuthAndRole, db } from "./common.js";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

setupNavAuthButtons();

let currentUser = null;

watchAuthAndRole(async (user, role) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  if (role !== "customer") {
    window.location.href = "login.html";
    return;
  }
  currentUser = user;
  await loadBookings();
});

async function loadBookings() {
  const listEl = $("customer-bookings");
  listEl.innerHTML = `<p class="text-gray-500 text-sm">Loading...</p>`;

  const q = query(
    collection(db, "bookings"),
    where("userId", "==", currentUser.uid),
    orderBy("startDateTime", "desc")
  );
  const snap = await getDocs(q);

  if (snap.empty) {
    listEl.innerHTML = `<p class="text-gray-500 text-sm">No bookings yet.</p>`;
    return;
  }

  let html = "";
  snap.forEach(doc => {
    const b = doc.data();
    const d = new Date(b.startDateTime);
    const dateStr = d.toLocaleDateString();
    const timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    html += `
      <div class="bg-white rounded-2xl shadow-sm p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <p class="font-semibold text-sm">Booking ID: ${doc.id.slice(0, 8)}</p>
          <p class="text-xs text-gray-500">${dateStr} at ${timeStr}</p>
          <p class="text-xs text-gray-500">Pickup: ${b.pickupLocation || "-"}</p>
        </div>
        <div class="text-right text-xs">
          <p>People: ${b.numPeople}</p>
          <p class="font-semibold mt-1">Status: ${b.status}</p>
        </div>
      </div>
    `;
  });

  listEl.innerHTML = html;
}
