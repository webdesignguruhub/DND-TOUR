// 🔍 DEBUG (keep this)
console.log("PENDING BOOKING:", sessionStorage.getItem("pendingBooking"));

// 🔹 Load booking from sessionStorage
const booking = JSON.parse(sessionStorage.getItem("pendingBooking"));

if (!booking) {
  alert("Booking session expired.");
  window.location.href = "index.html";
}

// 🔹 Fill summary (DO NOT CHANGE IDS)
document.getElementById("summary-tour").textContent = booking.tourTitle || "Selected tour";
document.getElementById("summary-date").textContent = booking.date || "-";
document.getElementById("summary-people").textContent = booking.people || "-";
document.getElementById("summary-pickup").textContent = booking.pickup || "-";
document.getElementById("summary-email").textContent = booking.email || "-";

// 🔹 Calculate total SAFELY
const price = Number(booking.price || 0);
const people = Number(booking.people || 1);
const total = price * people;

// 🔹 Save total back (IMPORTANT for success page)
booking.total = total;

document.getElementById("summary-total").textContent = `$${total}`;

// 🔹 SAVE UPDATED BOOKING (DO NOT REMOVE)
sessionStorage.setItem("pendingBooking", JSON.stringify(booking));

/* =========================
   PAY LATER FLOW
========================= */
document.getElementById("pay-later").addEventListener("click", () => {
  booking.paymentMethod = "pay_later";
  booking.paymentStatus = "pending";

  // ✅ Save AGAIN before redirect
  sessionStorage.setItem("pendingBooking", JSON.stringify(booking));

  window.location.href = "success.html";
});

/* =========================
   BANK TRANSFER MODAL
========================= */
const bankModal = document.getElementById("bank-modal");

// Open modal
document.getElementById("bank-transfer").addEventListener("click", () => {
  bankModal.classList.remove("hidden");
  bankModal.classList.add("flex");
});

// Close modal
document.getElementById("close-bank").addEventListener("click", () => {
  bankModal.classList.add("hidden");
  bankModal.classList.remove("flex");
});

// Confirm bank transfer
document.getElementById("confirm-bank").addEventListener("click", () => {
  booking.paymentMethod = "bank_transfer";
  booking.paymentStatus = "awaiting_verification";

  // ✅ Save AGAIN before redirect
  sessionStorage.setItem("pendingBooking", JSON.stringify(booking));

  window.location.href = "success.html";
});
