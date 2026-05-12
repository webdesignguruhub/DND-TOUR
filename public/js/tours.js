// public/js/my-trips.js
import { app } from "./firebase-config.js";
import { $, watchAuthAndRole, setupNavAuthButtons, db } from "./common.js";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

setupNavAuthButtons();

let currentUser = null;
let allTrips = [];
let currentTab = "upcoming";

// auth guard
watchAuthAndRole(async (user, role) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  currentUser = user;
  await loadTrips();
  renderTrips();
});

async function loadTrips() {
  const loading = $("trips-loading");
  const list = $("trips-list");
  const empty = $("trips-empty");

  loading.classList.remove("hidden");
  list.classList.add("hidden");
  empty.classList.add("hidden");

  const q = query(
    collection(db, "bookings"),
    where("userId", "==", currentUser.uid),
    orderBy("startDateTime", "desc")
  );
  const snap = await getDocs(q);

  allTrips = [];
  snap.forEach(docSnap => {
    allTrips.push({ id: docSnap.id, ...docSnap.data() });
  });

  loading.classList.add("hidden");
}

function renderTrips() {
  const list = $("trips-list");
  const empty = $("trips-empty");
  list.innerHTML = "";

  const now = new Date();
  let filtered = allTrips.filter(t => {
    if (!t.startDateTime) return false;
    const date = new Date(t.startDateTime);
    return currentTab === "upcoming" ? date >= now : date < now;
  });

  if (!filtered.length) {
    list.classList.add("hidden");
    empty.classList.remove("hidden");
    return;
  }

  list.classList.remove("hidden");
  empty.classList.add("hidden");

  filtered.forEach(t => {
    const date = t.startDateTime ? new Date(t.startDateTime) : null;
    const dateStr = date
      ? date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
      : "-";
    const timeStr = date
      ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "-";

    const statusColor =
      t.status === "paid"
        ? "text-emerald-700 bg-emerald-50"
        : t.status === "cancelled"
        ? "text-rose-700 bg-rose-50"
        : "text-amber-700 bg-amber-50";

    list.innerHTML += `
      <article class="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div class="space-y-1 text-xs md:text-sm">
          <p class="font-semibold text-slate-900">${t.tourTitle || "Tour booking"}</p>
          <p class="text-slate-600">${dateStr} · ${timeStr}</p>
          <p class="text-slate-500">Pickup: ${t.pickupLocation || "-"}</p>
          <p class="text-slate-500">Guests: ${t.numPeople || 1}</p>
        </div>
        <div class="text-right space-y-1 text-[11px] md:text-xs">
          <span class="inline-flex items-center px-2 py-1 rounded-full ${statusColor}">
            ${t.status || "pending"}
          </span>
          <p class="text-slate-400">Booking ref: ${t.id.slice(0, 8)}</p>
        </div>
      </article>
    `;
  });
}

// tab switching
$("tab-upcoming").addEventListener("click", () => {
  currentTab = "upcoming";
  $("tab-upcoming").classList.add("border-emerald-600", "text-emerald-700");
  $("tab-past").classList.remove("border-emerald-600", "text-emerald-700");
  $("tab-past").classList.add("border-transparent");
  renderTrips();
});
$("tab-past").addEventListener("click", () => {
  currentTab = "past";
  $("tab-past").classList.add("border-emerald-600", "text-emerald-700");
  $("tab-upcoming").classList.remove("border-emerald-600", "text-emerald-700");
  $("tab-upcoming").classList.add("border-transparent");
  renderTrips();
});
