/* ================= IMPORTS ================= */

import { signInAnonymously } from
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

import { auth, db } from "./firebase-config.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

/* ================= EMAILJS CONFIG ================= */

const EMAILJS_PUBLIC_KEY = "QYZgDa8tEb1pdqfcH";
const EMAILJS_SERVICE_ID = "service_oqa124g";
const TEMPLATE_GUEST = "template_2o3o8ff";
const TEMPLATE_OWNER = "template_b113lj4";
const OWNER_EMAIL = "jonathanimalsh2000@gmail.com";

/* ================= EMAIL HELPER ================= */

async function sendEmail(templateId, params) {
  if (!window.emailjs) {
    await new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
      s.onload = () => {
        window.emailjs.init(EMAILJS_PUBLIC_KEY);
        resolve();
      };
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  return window.emailjs.send(EMAILJS_SERVICE_ID, templateId, params);
}

/* ================= MAIN ================= */

document.addEventListener("DOMContentLoaded", async () => {

  console.log("PAGE LOADED");

  const booking = JSON.parse(sessionStorage.getItem("pendingBooking"));

  console.log("BOOKING DATA:", booking);

  if (!booking) {
    alert("Booking session expired.");
    window.location.href = "index.html";
    return;
  }

  if (!booking.email || !booking.email.includes("@")) {
    console.error("Invalid email detected:", booking.email);
    alert("Invalid booking email. Please try again.");
    return;
  }

  const fmt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val ?? "—";
  };

  fmt("s-status", "Booking Confirmed!");
  fmt("s-message", "Your adventure is locked in.");
  fmt("s-tour", booking.tourTitle);
  fmt("s-date", booking.date);
  fmt("s-people", booking.people + (booking.people === 1 ? " person" : " people"));
  fmt("s-pickup", booking.pickup);
  fmt("s-email", booking.email);
  fmt("s-payment", `${booking.paymentMethod} — ${booking.paymentStatus}`);
  fmt("s-total", `$${Number(booking.total).toFixed(2)}`);

  try {

    /* ================= FIREBASE AUTH (SAFE) ================= */

    let user;

    try {
      const res = await signInAnonymously(auth);
      user = res.user;
    } catch (err) {
      console.warn("Auth failed, continuing as guest:", err);
      user = { uid: "guest-user" };
    }

    /* ================= SAVE TO FIRESTORE ================= */

    await addDoc(collection(db, "bookings"), {
      userId: user.uid,
      bookingStatus: "new",
      tourId: booking.tourId ?? "",
      tourTitle: booking.tourTitle,
      date: booking.date,
      people: booking.people,
      pickup: booking.pickup,
      guestEmail: booking.email,
      paymentMethod: booking.paymentMethod,
      paymentStatus: booking.paymentStatus,
      total: booking.total,
      createdAt: serverTimestamp()
    });

    console.log("Booking saved");

    /* ================= EMAIL DATA ================= */

    const shared = {
      guest_name: booking.email.split("@")[0],
      tour_title: booking.tourTitle,
      tour_date: booking.date,
      people: booking.people,
      pickup: booking.pickup,
      payment_method: booking.paymentMethod,
      payment_status: booking.paymentStatus,
      total: `$${Number(booking.total).toFixed(2)}`
    };

    /* ================= SEND GUEST EMAIL ================= */

    console.log("Sending guest email...");

    await sendEmail(TEMPLATE_GUEST, {
      ...shared,
      to_email: booking.email
    });

    console.log("Guest email sent");

    /* ================= SEND OWNER EMAIL ================= */

    console.log("Sending owner email...");

    await sendEmail(TEMPLATE_OWNER, {
      ...shared,
      to_email: OWNER_EMAIL,
      guest_email: booking.email
    });

    console.log("Owner email sent");

    /* ================= CLEANUP ================= */

    sessionStorage.removeItem("pendingBooking");

  } catch (err) {
    console.error("Something failed:", err);
  }

});
