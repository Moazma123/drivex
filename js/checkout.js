/* ==========================================================
   DrivEx — Checkout page logic
   ========================================================== */
const INSURANCE = 30;
const EXTRA_SERVICES = 30;
const COUPONS = { "SAVE20": 20, "DRIVEX10": 10 };

let booking = null;
let discount = 0;

document.addEventListener("DOMContentLoaded", () => {
  booking = LS.get(LS_KEYS.CURRENT_BOOKING, null);

  if(!booking){
    // Nothing in progress — send back to vehicle selection
    window.location.href = "vehicles.html";
    return;
  }

  // Prefill billing with customer info collected on booking page
  document.getElementById("billName").value = booking.customer.name || "";
  document.getElementById("billEmail").value = booking.customer.email || "";
  document.getElementById("billPhone").value = booking.customer.phone || "";
  document.getElementById("billAddress").value = booking.customer.address || "";
  document.getElementById("billCity").value = booking.customer.city || "";
  document.getElementById("billPostal").value = booking.customer.postal || "";

  renderSummary();
  bindPaymentToggle();
  bindCoupon();
  bindCardFormatting();

  document.getElementById("completeBookingBtn").addEventListener("click", completeBooking);
});

function renderSummary(){
  document.getElementById("ckCarName").textContent = booking.carName;
  document.getElementById("ckCarImg").src = getCarImage(getCarById(booking.carId));
  document.getElementById("ckDates").textContent = `${Util.formatDate(booking.pickup)} - ${Util.formatDate(booking.ret)}`;
  document.getElementById("ckRoute").textContent = `${booking.pickupLoc} → ${booking.dropoffLoc}`;
  document.getElementById("ckDays").textContent = booking.days + " Days";

  const taxes = booking.taxes;
  const grand = booking.subtotal + INSURANCE + EXTRA_SERVICES + taxes - discount;

  document.getElementById("ckSubtotal").textContent = Util.money(booking.subtotal);
  document.getElementById("ckInsurance").textContent = Util.money(INSURANCE);
  document.getElementById("ckExtra").textContent = Util.money(EXTRA_SERVICES);
  document.getElementById("ckTaxes").textContent = Util.money(taxes);
  document.getElementById("ckTotal").textContent = Util.money(grand);

  const discountRow = document.getElementById("ckDiscountRow");
  if(discount > 0){
    discountRow.classList.remove("d-none");
    document.getElementById("ckDiscount").textContent = "-" + Util.money(discount);
  } else {
    discountRow.classList.add("d-none");
  }
}

function bindPaymentToggle(){
  const cardFields = document.getElementById("cardFields");
  document.querySelectorAll('input[name="pay"]').forEach(radio => {
    radio.addEventListener("change", () => {
      cardFields.style.display = radio.value === "card" && radio.checked ? "" : "none";
    });
  });
}

function bindCoupon(){
  document.getElementById("couponBtn").addEventListener("click", () => {
    const code = document.getElementById("couponInput").value.trim().toUpperCase();
    const successEl = document.getElementById("couponSuccess");
    const errorEl = document.getElementById("couponError");
    successEl.classList.add("d-none");
    errorEl.classList.add("d-none");

    if(COUPONS[code]){
      discount = COUPONS[code];
      successEl.classList.remove("d-none");
      Util.toast(`Coupon applied: -$${discount}`, "success");
    } else {
      discount = 0;
      errorEl.classList.remove("d-none");
    }
    renderSummary();
  });
}

function bindCardFormatting(){
  const num = document.getElementById("cardNumber");
  num.addEventListener("input", () => {
    num.value = num.value.replace(/\D/g,"").replace(/(.{4})/g,"$1 ").trim();
  });
  const exp = document.getElementById("cardExpiry");
  exp.addEventListener("input", () => {
    let v = exp.value.replace(/\D/g,"");
    if(v.length >= 3) v = v.slice(0,2) + "/" + v.slice(2,4);
    exp.value = v;
  });
  const cvv = document.getElementById("cardCvv");
  cvv.addEventListener("input", () => { cvv.value = cvv.value.replace(/\D/g,""); });
}

function completeBooking(){
  const billingForm = document.getElementById("billingForm");
  const agree = document.getElementById("agree2");
  const payMethod = document.querySelector('input[name="pay"]:checked').value;

  if(!billingForm.checkValidity()){
    billingForm.classList.add("was-validated");
    Util.toast("Please complete your billing information.", "danger");
    return;
  }

  if(payMethod === "card"){
    const num = document.getElementById("cardNumber").value.replace(/\s/g,"");
    const exp = document.getElementById("cardExpiry").value;
    const cvv = document.getElementById("cardCvv").value;
    const cardError = document.getElementById("cardError");
    const validCard = num.length >= 15 && /^\d{2}\/\d{2}$/.test(exp) && cvv.length >= 3;
    if(!validCard){
      cardError.classList.remove("d-none");
      Util.toast("Please enter valid card details.", "danger");
      return;
    }
    cardError.classList.add("d-none");
  }

  if(!agree.checked){
    Util.toast("Please agree to the Terms & Conditions.", "danger");
    return;
  }

  const grand = booking.subtotal + INSURANCE + EXTRA_SERVICES + booking.taxes - discount;
  const bookingId = Util.genId("DRVX");

  const finalBooking = {
    id: bookingId,
    carId: booking.carId,
    carName: booking.carName,
    pickup: booking.pickup,
    ret: booking.ret,
    pickupLoc: booking.pickupLoc,
    dropoffLoc: booking.dropoffLoc,
    status: "Upcoming",
    amount: grand,
    paymentMethod: payMethod === "card" ? "Credit Card" : payMethod === "paypal" ? "PayPal" : payMethod === "stripe" ? "Stripe" : "Cash on Delivery",
    customer: booking.customer
  };

  Bookings.add(finalBooking);
  LS.remove(LS_KEYS.CURRENT_BOOKING);

  window.location.href = "booking-success.html?id=" + bookingId;
}
