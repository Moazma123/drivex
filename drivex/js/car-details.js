/* ==========================================================
   DrivEx — Car Details page logic
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  renderNavbarAuth("navAuthSlot");

  const carId = Util.qs("car") || CARS[2].id; // default to BMW 3 Series like the original mock
  const car = getCarById(carId) || CARS[2];

  document.getElementById("pageTitle").textContent = `${car.name} — Car Details — DrivEx`;
  document.getElementById("crumbCarName").textContent = car.name;
  document.getElementById("carName").textContent = car.name;
  document.getElementById("carRatingText").textContent = `${car.rating} (${car.reviews} Reviews)`;
  document.getElementById("carPriceText").innerHTML = `${Util.money(car.price)} <small>/day</small>`;
  document.getElementById("aboutCarText").textContent =
    `The ${car.name} combines comfort, performance, and reliability. Perfect for both city drives and long road trips, it offers a smooth, responsive ride with a well-equipped, comfortable cabin.`;

  document.getElementById("mainCarImg").src = getCarImage(car);
  document.getElementById("mainCarImg").alt = car.name;
  document.querySelectorAll(".thumb-img").forEach(img => img.src = getCarImage(car));

  document.getElementById("specSeats").textContent = car.seats;
  document.getElementById("specTrans").textContent = car.transmission;
  document.getElementById("specFuel").textContent = car.fuel;
  document.getElementById("specDoors").textContent = car.doors;
  document.getElementById("specLuggage").textContent = car.luggage;
  document.getElementById("specMinAge").textContent = car.minAge + " Years";

  document.getElementById("featuresGrid").innerHTML = car.features.map(f =>
    `<div class="col-6"><i class="bi bi-check-circle-fill text-primary-brand"></i> ${f}</div>`
  ).join("");

  // Other cars: 3 random-ish picks excluding current
  const others = CARS.filter(c => c.id !== car.id).slice(0, 3);
  document.getElementById("otherCarsGrid").innerHTML = others.map(c => `
    <div class="col-4">
      <a href="car-details.html?car=${c.id}" class="text-decoration-none text-dark">
        <div class="car-card p-2">
          <img src="${getCarImage(c)}" class="w-100 mb-2" style="height:80px;object-fit:cover;border-radius:8px;">
          <div class="small fw-bold">${c.name}</div>
          <div class="d-flex justify-content-between">
            <span class="car-price" style="font-size:.9rem;">${Util.money(c.price)}<small>/day</small></span>
            <span class="small text-muted-soft"><i class="bi bi-star-fill text-warning"></i> ${c.rating}</span>
          </div>
        </div>
      </a>
    </div>`).join("");

  document.getElementById("bookNowBtn").addEventListener("click", () => {
    LS.set(LS_KEYS.SELECTED_CAR, car.id);
    window.location.href = "booking.html";
  });
});
