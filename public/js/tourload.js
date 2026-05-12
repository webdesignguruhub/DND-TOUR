// 🔹 Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔹 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCslM5O5LdYHsG0AQoAqWNnjenzrxQpv70",
  authDomain: "d-and-d-tours-7d88b.firebaseapp.com",
  projectId: "d-and-d-tours-7d88b",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔹 Load tours
async function loadTours() {
  try {
    const toursContainer = document.getElementById("tours-list");
    const toursCount = document.getElementById("tours-count");

    toursContainer.innerHTML = "";

    const q = query(
      collection(db, "tours"),
      where("active", "==", true)
    );

    const snapshot = await getDocs(q);
    let count = 0;

    snapshot.forEach(doc => {
      const tour = doc.data();
      const tourId = doc.id;
      count++;

      const card = `
        <div
          class="tour-card bg-white rounded-2xl shadow-md overflow-hidden border border-zinc-100 hover:shadow-lg transition cursor-pointer"
          data-id="${tourId}"
        >
          <div
            class="h-44 bg-cover bg-center"
            style="background-image:url('${tour.imageUrl || ""}')">
          </div>

          <div class="p-4 space-y-1">
            <h3 class="font-semibold text-zinc-900">
              ${tour.title || "Untitled Tour"}
            </h3>

            <p class="text-[12px] text-zinc-500">
              ${tour.description || ""}
            </p>

            <div class="flex justify-between items-center pt-2">
              <span class="font-semibold text-emerald-700">
                LKR ${tour.price ?? "--"}
              </span>

              <span class="text-[10px] text-zinc-400">
                ⭐ ${tour.rating ?? "N/A"}
              </span>
            </div>
          </div>
        </div>
      `;

      toursContainer.insertAdjacentHTML("beforeend", card);
    });

    toursCount.textContent = `${count} Tours`;

    // ✅ Handle tour click
    document.querySelectorAll(".tour-card").forEach(card => {
      card.addEventListener("click", () => {
        const tourId = card.dataset.id;

        // 🔹 Save clicked tour info
        localStorage.setItem("selectedTourId", tourId);
        localStorage.setItem("tourSource", "index");

        // 🔹 Go to login page
        window.location.href = "login.html";
      });
    });

  } catch (error) {
    console.error("Error loading tours:", error);
  }
}

loadTours();
