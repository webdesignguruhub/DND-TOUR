// js/booking.js
import { app } from "./firebase-config.js";
import { $, watchAuthAndRole } from "./common.js";
import {
  getFirestore,
  addDoc,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const db = getFirestore(app);

let currentUser = null;
let selectedTour = null;

watchAuthAndRole((user, role) => {
  currentUser = user;
});

const modal = $("booking-modal");
const titleEl = $("booking-tour-title");

window.addEventListener("openBookingModal", (e) => {
  selectedTour = e.detail;
  titleEl.textContent = selectedTour.tourTitle;
  $("booking-date").value = "";
  $("booking-time").value = "";
  $("booking-people").value = 1;
  $("booking-pickup").value = "";
  $("booking-message").textContent = "";
  modal.classList.remove("hidden");
});

$("booking-close").addEventListener("click", () => {
  modal.classList.add("hidden");
});

$("booking-pay").addEventListener("click", async () => {
  if (!currentUser || !selectedTour) {
    $("booking-message").textContent = "Please login again.";
    return;
  }

  const date = $("booking-date").value;
  const time = $("booking-time").value;
  const people = parseInt($("booking-people").value || "1");
  const pickup = $("booking-pickup").value;

  if (!date || !time || !pickup) {
    $("booking-message").textContent = "Please fill all fields.";
    return;
  }

  try {
    // 1) Save booking with status 'pending-payment'
    const startDateTime = new Date(`${date}T${time}:00`);

    const bookingRef = await addDoc(collection(db, "bookings"), {
      tourId: selectedTour.tourId,
      userId: currentUser.uid,
      guideId: null, // can assign later via admin
      startDateTime: startDateTime.toISOString(),
      numPeople: people,
      pickupLocation: pickup,
      status: "pending",
      createdAt: serverTimestamp()
    });

    // 2) Call payment (stub now, you plug PayHere / Stripe here)
    await handlePaymentMock(bookingRef.id);

    $("booking-message").textContent = "Booking created! Payment simulated (test).";
    setTimeout(() => {
      modal.classList.add("hidden");
      window.location.href = "dashboard-customer.html";
    }, 800);
  } catch (err) {
    console.error(err);
    $("booking-message").textContent = "Error creating booking.";
  }
});

// Payment stub – replace with real gateway later
async function handlePaymentMock(bookingId) {
  console.log("Pretend redirect to payment gateway for booking:", bookingId);
  await new Promise(res => setTimeout(res, 500));
}
