// public/js/owner-dashboard.js
import { app } from "./firebase-config.js";
import { $, watchAuthAndRole, db, setupNavAuthButtons } from "./common.js";
import {
  collection,
  getDocs,
  orderBy,
  query
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

setupNavAuthButtons();

let allBookings = [];

watchAuthAndRole(async (user, role) => {
  if (!user || role !== "owner") {
    window.location.href = "login.html";
    return;
  }
  await loadBookings();
  renderBookings();
  updateStats();
});

async function loadBookings() {
  const q = query(collection(db, "bookings"), orderBy("startDateTime", "desc"));
  const snap = await getDocs(q);
  allBookings = [];
  snap.forEach(docSnap => {
    allBookings.push({ id: docSnap.id, ...docSnap.data() });
  });
}

function updateStats() {
  const now = new Date();
  let active = 0;
  let paid = 0;
  let guestsFuture = 0;

  allBookings.forEach(b => {
    const d = b.startDateTime ? new Date(b.startDateTime) : null;
    const isFuture = d && d >= now;
    if (isFuture) {
      active++;
      guestsFuture += b.numPeople || 1;
    }
    if (b.status === "paid") paid++;
  });

  $("stat-active").textContent = active;
  $("stat-paid").textContent = paid;
  $("stat-guests").textContent = guestsFuture;
}

function renderBookings() {
  const loading = $("owner-loading");
  const empty = $("owner-empty");
  const list = $("owner-list");
  loading.classList.add("hidden");

  const statusFilter = $("filter-status").value;
  let filtered = allBookings.filter(b =>
    statusFilter === "all" ? true : (b.status || "pending") === statusFilter
  );

  if (!filtered.length) {
    list.classList.add("hidden");
    empty.classList.remove("hidden");
    return;
  }

  empty.classList.add("hidden");
  list.classList.remove("hidden");
  list.innerHTML = "";

  filtered.forEach(b => {
    const d = b.startDateTime ? new Date(b.startDateTime) : null;
    const dateStr = d
      ? d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
      : "-";
    const timeStr = d ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-";
    const status = b.status || "pending";

    list.innerHTML += `
      <div class="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div class="space-y-0.5">
          <p class="font-semibold text-slate-900 text-xs md:text-sm">${b.tourTitle || "Tour booking"}</p>
          <p class="text-[11px] text-slate-500">
            ${dateStr} · ${timeStr} · Guests: ${b.numPeople || 1}
          </p>
          <p class="text-[11px] text-slate-500">
            Pickup: ${b.pickupLocation || "-"} · Traveller: ${b.travellerName || "-"}
          </p>
        </div>
        <div class="text-right text-[11px] space-y-1">
          <span class="inline-flex px-2 py-1 rounded-full
            ${status === "paid" ? "bg-emerald-50 text-emerald-700" :
              status === "cancelled" ? "bg-rose-50 text-rose-700" :
              "bg-amber-50 text-amber-700"}">
            ${status}
          </span>
          <p class="text-slate-400">Ref: ${b.id.slice(0,8)}</p>
        </div>
      </div>
    `;
  });
}

$("filter-status").addEventListener("change", () => renderBookings());
