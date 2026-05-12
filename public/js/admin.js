// 🔹 Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔹 Firebase config (same as your site)
const firebaseConfig = {
  apiKey: "AIzaSyCslM5O5LdYHsG0AQoAqWNnjenzrxQpv70",
  authDomain: "d-and-d-tours-7d88b.firebaseapp.com",
  projectId: "d-and-d-tours-7d88b",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔹 Cloudinary config (YOUR ACCOUNT)
const CLOUD_NAME = "ds7bmhiuj";
const UPLOAD_PRESET = "unsigned_tours"; // we create this next

// 🔹 Form submit
document.getElementById("tourForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const status = document.getElementById("status");
  status.textContent = "Uploading...";

  try {
    // 1️⃣ Upload image to Cloudinary
    const file = document.getElementById("image").files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData
      }
    );

    const imageData = await uploadRes.json();

    // 2️⃣ Save tour to Firebase
  if (editingId) {
  await updateDoc(doc(db, "tours", editingId), {
    title: title.value,
    description: description.value,
    price: Number(price.value),
    rating: Number(rating.value || 0),
    duration: duration.value,
    active: active.checked
  });

  editingId = null;
} else {
  await addDoc(collection(db, "tours"), {
    title: title.value,
    description: description.value,
    price: Number(price.value),
    rating: Number(rating.value || 0),
    duration: duration.value,
    imageUrl: imageData.secure_url,
    active: active.checked,
    createdAt: serverTimestamp()
  });
}

loadAdminTours();

    status.textContent = "✅ Tour added successfully!";
    e.target.reset();

  } catch (err) {
    console.error(err);
    status.textContent = "❌ Error adding tour";
  }
});

    const adminTours = document.getElementById("admin-tours");

async function loadAdminTours() {
  adminTours.innerHTML = "";

  const snapshot = await getDocs(collection(db, "tours"));

  snapshot.forEach((docSnap) => {
    const tour = docSnap.data();
    const id = docSnap.id;

    const card = `
      <div class="bg-white p-4 rounded-xl shadow border space-y-2">
        <img
          src="${tour.imageUrl}"
          class="h-32 w-full object-cover rounded-lg"
        />

        <h3 class="font-semibold">${tour.title}</h3>
        <p class="text-sm text-zinc-500">${tour.description}</p>

        <div class="flex justify-between items-center text-sm">
          <span class="font-semibold text-emerald-600">$${tour.price}</span>
          <span>⭐ ${tour.rating}</span>
        </div>

        <div class="flex gap-2 pt-2">
          <button
            onclick="editTour('${id}')"
            class="flex-1 bg-blue-500 text-white py-1 rounded-lg text-sm">
            Edit
          </button>

          <button
            onclick="deleteTour('${id}')"
            class="flex-1 bg-red-500 text-white py-1 rounded-lg text-sm">
            Delete
          </button>
        </div>
      </div>
    `;

    adminTours.insertAdjacentHTML("beforeend", card);
  });
}

loadAdminTours();

    window.deleteTour = async (id) => {
  if (!confirm("Delete this tour?")) return;

  await deleteDoc(doc(db, "tours", id));
  loadAdminTours();
};


  let editingId = null;

window.editTour = async (id) => {
  editingId = id;

  const snap = await getDocs(collection(db, "tours"));
  snap.forEach(d => {
    if (d.id === id) {
      const tour = d.data();

      title.value = tour.title;
      description.value = tour.description;
      price.value = tour.price;
      rating.value = tour.rating;
      duration.value = tour.duration;
      active.checked = tour.active;
    }
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
};

