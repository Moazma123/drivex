/* ==========================================================
   DrivEx — Booking (Customer Details) page logic
   ========================================================== */
let currentCar = null;
let currentSearch = null;

document.addEventListener("DOMContentLoaded", () => {
  const carId = LS.get(LS_KEYS.SELECTED_CAR, "c3"); // default BMW 3 Series
  currentCar = getCarById(carId) || CARS[2];
  currentSearch = LS.get(LS_KEYS.SEARCH, {
    location: "New York, USA",
    pickup: Util.todayPlus(3),
    ret: Util.todayPlus(8)
  });

  renderSummary();

  // Prefill with logged-in user's info for convenience
  const user = Auth.getUser();
  if(user){
    document.getElementById("custName").value = user.name || "";
    document.getElementById("custEmail").value = user.email || "";
  }

  document.getElementById("licenseUploadBtn").addEventListener("click", () => {
    document.getElementById("licenseFileInput").click();
  });
  document.getElementById("licenseFileInput").addEventListener("change", (e) => {
    const file = e.target.files[0];
    document.getElementById("licenseFileLabel").value = file ? file.name : "No file selected";
  });

  document.getElementById("bookingForm").addEventListener("submit", handleSubmit);
});

function renderSummary(){
  const days = Util.daysBetween(currentSearch.pickup, currentSearch.ret);
  const subtotal = days * currentCar.price;
  const taxes = Math.round(subtotal * 0.15);
  const total = subtotal + taxes;

  document.getElementById("summaryCarName").textContent = currentCar.name;
  document.getElementById("summaryCarImg").src = getCarImage(currentCar);
  document.getElementById("sumPickupLoc").textContent = currentSearch.location;
  document.getElementById("sumDropoffLoc").textContent = currentSearch.location;
  document.getElementById("sumPickupDate").textContent = Util.formatDate(currentSearch.pickup);
  document.getElementById("sumReturnDate").textContent = Util.formatDate(currentSearch.ret);
  document.getElementById("sumDays").textContent = days + " Days";
  document.getElementById("sumPricePerDay").textContent = Util.money(currentCar.price);
  document.getElementById("sumSubtotal").textContent = Util.money(subtotal);
  document.getElementById("sumTaxes").textContent = Util.money(taxes);
  document.getElementById("sumTotal").textContent = Util.money(total);
}

function handleSubmit(e){
  e.preventDefault();
  const form = e.target;

  // Email + phone pattern checks on top of native required validation
  const email = document.getElementById("custEmail");
  const phone = document.getElementById("custPhone");
  const emergency = document.getElementById("custEmergency");
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);
  const phoneOk = /^[\d+\-\s()]{7,20}$/.test(phone.value);
  const emergencyOk = /^[\d+\-\s()]{7,20}$/.test(emergency.value);

  email.setCustomValidity(emailOk ? "" : "invalid");
  phone.setCustomValidity(phoneOk ? "" : "invalid");
  emergency.setCustomValidity(emergencyOk ? "" : "invalid");

  if(!form.checkValidity()){
    form.classList.add("was-validated");
    Util.toast("Please fill in all required fields correctly.", "danger");
    return;
  }
  form.classList.add("was-validated");

  const days = Util.daysBetween(currentSearch.pickup, currentSearch.ret);
  const subtotal = days * currentCar.price;
  const taxes = Math.round(subtotal * 0.15);
  const total = subtotal + taxes;

  const bookingDraft = {
    carId: currentCar.id,
    carName: currentCar.name,
    pricePerDay: currentCar.price,
    pickupLoc: currentSearch.location,
    dropoffLoc: currentSearch.location,
    pickup: currentSearch.pickup,
    ret: currentSearch.ret,
    days, subtotal, taxes, total,
    customer: {
      name: document.getElementById("custName").value,
      email: document.getElementById("custEmail").value,
      phone: document.getElementById("custPhone").value,
      cnic: document.getElementById("custCnic").value,
      dob: document.getElementById("custDob").value,
      license: document.getElementById("custLicense").value,
      country: document.getElementById("custCountry").value,
      city: document.getElementById("custCity").value,
      address: document.getElementById("custAddress").value,
      postal: document.getElementById("custPostal").value,
      emergency: document.getElementById("custEmergency").value,
      notes: document.getElementById("custNotes").value
    }
  };

  LS.set(LS_KEYS.CURRENT_BOOKING, bookingDraft);
  window.location.href = "checkout.html";
}
