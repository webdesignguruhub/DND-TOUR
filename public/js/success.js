/* ================= IMPORTS ================= */

import { signInAnonymously } from
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

import { auth } from "./firebase-config.js";
import { db }   from "./firebase-config.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

/* ================= EMAILJS CONFIG ================= */

const EMAILJS_PUBLIC_KEY = "QYZgDa8tEb1pdqfcH";
const EMAILJS_SERVICE_ID = "service_oqa124g";
const TEMPLATE_GUEST     = "template_2o3o8ff";
const TEMPLATE_OWNER     = "template_b113lj4";
const OWNER_EMAIL        = "jonathanimalsh2000@gmail.com";

/* ================= SEND EMAIL HELPER ================= */

async function sendEmail(templateId, templateParams) {
  if (!window.emailjs) {
    await new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
    window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }
  return window.emailjs.send(EMAILJS_SERVICE_ID, templateId, templateParams);
}

/* ================= MAIN ================= */

document.addEventListener("DOMContentLoaded", () => {

  const booking = JSON.parse(sessionStorage.getItem("pendingBooking"));

  if (!booking) {
    alert("Booking session expired.");
    window.location.href = "index.html";
    return;
  }

  /* -------- POPULATE PAGE -------- */
  const fmt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val ?? "—";
  };

  fmt("s-status",  "Booking Confirmed!");
  fmt("s-message", "Your adventure is locked in. We can't wait to show you around.");
  fmt("s-tour",    booking.tourTitle);
  fmt("s-date",    booking.date);
  fmt("s-people",  booking.people + (booking.people === 1 ? " person" : " people"));
  fmt("s-pickup",  booking.pickup);
  fmt("s-email",   booking.email);
  fmt("s-payment", `${booking.paymentMethod} — ${booking.paymentStatus}`);
  fmt("s-total",   `$${Number(booking.total).toFixed(2)}`);

  /* -------- SAVE + EMAIL (no redirect — let user read the page) -------- */

  (async () => {
    try {
      // Sign in anonymously — works for guests, no login needed
      const { user } = await signInAnonymously(auth);
      console.log("✅ Signed in anonymously, uid:", user.uid);

      // 1. Save to Firestore
      await addDoc(collection(db, "bookings"), {
        userId:        user.uid,
        bookingStatus: "new",
        tourId:        booking.tourId   ?? "",
        tourTitle:     booking.tourTitle,
        date:          booking.date,
        people:        booking.people,
        pickup:        booking.pickup,
        guestEmail:    booking.email,
        paymentMethod: booking.paymentMethod,
        paymentStatus: booking.paymentStatus,
        total:         booking.total,
        createdAt:     serverTimestamp()
      });
      console.log("✅ Booking saved");

      // 2. Shared email params
      const sharedParams = {
        guest_name:     booking.email.split("@")[0],
        tour_title:     booking.tourTitle,
        tour_date:      booking.date,
        people:         booking.people,
        pickup:         booking.pickup,
        payment_method: booking.paymentMethod,
        payment_status: booking.paymentStatus,
        total:          `$${Number(booking.total).toFixed(2)}`
      };

      // 3. Email guest
      await sendEmail(TEMPLATE_GUEST, { ...sharedParams, to_email: booking.email });
      console.log("✅ Guest email sent");

      // 4. Email owner
      await sendEmail(TEMPLATE_OWNER, {
        ...sharedParams,
        to_email:    OWNER_EMAIL,
        guest_email: booking.email
      });
      console.log("✅ Owner email sent");

      // 5. Clean up session
      sessionStorage.removeItem("pendingBooking");

    } catch (err) {
      console.error("Something failed:", err);
    }
  })();

});