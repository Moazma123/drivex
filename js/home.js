/* ==========================================================
   DrivEx — Home page logic
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  renderNavbarAuth("navAuthSlot");

  // Default dates
  const pickupInput = document.getElementById("searchPickup");
  const returnInput = document.getElementById("searchReturn");
  if(pickupInput && returnInput){
    pickupInput.value = Util.todayPlus(3);
    returnInput.value = Util.todayPlus(8);
  }

  // Popular cars — first 4 from catalog
  const grid = document.getElementById("popularCarsGrid");
  if(grid){
    grid.innerHTML = CARS.slice(0,4).map(car => `
      <div class="col-6 col-md-3">
        <div class="car-card p-3 h-100 d-flex flex-column">
          <img src="${getCarImage(car)}" class="w-100 mb-3" alt="${car.name}" style="height:140px;object-fit:cover;border-radius:10px;">
          <h6 class="fw-bold mb-1">${car.name}</h6>
          <div class="car-price mb-2">${Util.money(car.price)}<small>/day</small></div>
          <div class="d-flex gap-2 mb-3 flex-wrap">
            <span class="badge-spec"><i class="bi bi-star-fill text-warning"></i> ${car.rating}</span>
            <span class="badge-spec"><i class="bi bi-gear"></i> ${car.transmission}</span>
            <span class="badge-spec"><i class="bi bi-people"></i> ${car.seats}</span>
          </div>
          <a href="car-details.html?car=${car.id}" class="btn btn-brand w-100 btn-sm mt-auto">Book Now</a>
        </div>
      </div>`).join("");
  }

  // Hero search form
  const form = document.getElementById("heroSearchForm");
  if(form){
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const location = document.getElementById("searchLocation").value;
      const pickup = pickupInput.value;
      const ret = returnInput.value;
      const errorBox = document.getElementById("searchError");

      if(!pickup || !ret || new Date(ret) <= new Date(pickup)){
        errorBox.classList.remove("d-none");
        return;
      }
      errorBox.classList.add("d-none");

      LS.set(LS_KEYS.SEARCH, { location, pickup, ret });
      window.location.href = "vehicles.html";
    });
  }
});
