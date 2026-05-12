// 🔹 Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔹 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCslM5O5LdYHsG0AQoAqWNnjenzrxQpv70",
  authDomain: "d-and-d-tours-7d88b.firebaseapp.com",
  projectId: "d-and-d-tours-7d88b",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const toursList = document.getElementById("guest-tours-list");
const backBtn = document.getElementById("back-to-all");

// ✅ Only ONE variable (fixed)
const selectedTourId = localStorage.getItem("selectedTourId");


// 🔹 Render tour card
function renderTour(tour, tourId) {
  return `
    <div class="bg-white rounded-2xl shadow-md border hover:shadow-lg transition overflow-hidden">
      <div class="h-44 bg-cover bg-center"
        style="background-image:url('${tour.imageUrl || ""}')"></div>

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

        <div class="mt-3 flex gap-2">

  <!-- Read More (NEW) -->
  <button
    class="w-1/2 border border-zinc-300 text-zinc-700 py-2 rounded-lg text-sm hover:bg-zinc-100"
    onclick="viewTour('${tourId}')">
    Read More
  </button>

  <!-- Book Now (UNCHANGED LOGIC) -->
  <button
    class="w-1/2 bg-emerald-600 text-white py-2 rounded-lg text-sm hover:bg-emerald-700"
    onclick="selectTour('${tourId}')">
    Book this tour
  </button>

</div>
      </div>
    </div>
  `;
}

// 🔹 Select tour
window.selectTour = function (tourId) {
  localStorage.setItem("selectedTourId", tourId);
  window.location.href = "guest-booking.html";
};


// 🔹 Load single tour
async function loadSingleTour(id) {
  backBtn.classList.remove("hidden");

  const ref = doc(db, "tours", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    loadAllTours();
    return;
  }

  toursList.innerHTML = renderTour(snap.data(), id);
}

window.viewTour = function (tourId) {
  localStorage.setItem("selectedTourId", tourId);
  window.location.href = "guest-tours.html";
};
// 🔹 Load all tours
async function loadAllTours() {
  backBtn.classList.add("hidden");

  const q = query(collection(db, "tours"), where("active", "==", true));
  const snapshot = await getDocs(q);

  toursList.innerHTML = "";

  snapshot.forEach(docSnap => {
    toursList.insertAdjacentHTML(
      "beforeend",
      renderTour(docSnap.data(), docSnap.id)
    );
  });
}

// 🔹 Back button
backBtn.addEventListener("click", () => {
  localStorage.removeItem("selectedTourId");
  loadAllTours();
});

// 🔹 Init (FINAL FIX — no error blocking)
if (selectedTourId) {
  loadSingleTour(selectedTourId);
} else {
  loadAllTours();
}