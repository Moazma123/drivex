/* ==========================================================
   DrivEx — Invoice page logic
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const id = Util.qs("id") || (Bookings.getAll()[0] && Bookings.getAll()[0].id);
  const booking = Bookings.getById(id);

  if(!booking){
    document.querySelector(".card-soft").innerHTML =
      `<div class="text-center py-5"><i class="bi bi-file-earmark-x display-4 text-muted-soft"></i>
       <p class="text-muted-soft mt-2">No invoice found for this booking.</p>
       <a href="my-bookings.html" class="btn btn-brand">Back to My Bookings</a></div>`;
    return;
  }

  const car = getCarById(booking.carId);
  const pricePerDay = car ? car.price : Math.round(booking.amount / 5);
  const days = Util.daysBetween(booking.pickup, booking.ret);
  const rentalCharge = pricePerDay * days;
  const remainder = Math.max(booking.amount - rentalCharge, 0);

  document.getElementById("invNumber").textContent = "#INV-" + booking.id;
  document.getElementById("billToName").textContent = booking.customer?.name || "Guest";
  document.getElementById("billToAddress").textContent = booking.customer?.address || booking.pickupLoc;
  document.getElementById("billToCity").textContent = booking.customer?.city || "";
  document.getElementById("billToEmail").textContent = booking.customer?.email || "—";
  document.getElementById("billToPhone").textContent = booking.customer?.phone || "—";

  document.getElementById("invDate").textContent = Util.formatDate(new Date().toISOString().slice(0,10));
  document.getElementById("invBookingId").textContent = booking.id;
  document.getElementById("invPayMethod").textContent = booking.paymentMethod || "Credit Card";

  const statusEl = document.getElementById("invPayStatus");
  if(booking.status === "Cancelled"){
    statusEl.textContent = "Refunded";
    statusEl.className = "status-badge status-cancelled";
  } else {
    statusEl.textContent = "Paid";
    statusEl.className = "status-badge status-paid";
  }

  document.getElementById("invLineItems").innerHTML = `
    <tr><td>1</td><td>${booking.carName} (${days} Day${days>1?"s":""})</td><td class="text-end">${Util.money(rentalCharge)}</td></tr>
    <tr><td>2</td><td>Insurance, Services &amp; Taxes</td><td class="text-end">${Util.money(remainder)}</td></tr>
  `;
  document.getElementById("invTotal").textContent = Util.money(booking.amount);

  document.getElementById("downloadBtn").addEventListener("click", () => window.print());
});
