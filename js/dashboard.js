/* ==========================================================
   DrivEx — Dashboard page logic
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  if(!Auth.requireAuth("dashboard.html")) return;

  const user = Auth.getUser();
  document.getElementById("userNameLabel").textContent = user.name;
  document.getElementById("userAvatar").textContent = Util.initials(user.name);
  document.getElementById("welcomeText").textContent = `Welcome back, ${user.name.split(" ")[0]}!`;

  document.getElementById("navLogoutLink").addEventListener("click", handleLogout);
  document.getElementById("sidebarLogout").addEventListener("click", handleLogout);

  renderStats();
  renderUpcoming();

  // --- Manage Vehicles ---
  renderManageCars();
  document.getElementById("addCarForm").addEventListener("submit", handleAddCar);
  document.getElementById("resetCarsBtn").addEventListener("click", handleResetCars);

  // Live preview of the chosen car photo
  document.getElementById("newCarImage").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    const preview = document.getElementById("newCarPreview");
    if(!file){ preview.classList.add("d-none"); return; }
    try{
      const dataUrl = await Util.resizeImageFile(file, 200, 0.7);
      preview.src = dataUrl;
      preview.classList.remove("d-none");
    }catch(err){
      Util.toast(err.message, "danger");
      e.target.value = "";
      preview.classList.add("d-none");
    }
  });

  removeCarModalInstance = new bootstrap.Modal(document.getElementById("removeCarModal"));
  document.getElementById("confirmRemoveCarBtn").addEventListener("click", confirmRemoveCar);
});

let removeCarModalInstance = null;
let carPendingRemoval = null;

function handleLogout(e){
  e.preventDefault();
  Auth.logout();
  Util.toast("You have been logged out", "info");
  setTimeout(()=> window.location.href = "index.html", 500);
}

function renderStats(){
  const all = Bookings.getAll();
  document.getElementById("statTotal").textContent = all.length;
  document.getElementById("statUpcoming").textContent = all.filter(b=>b.status==="Upcoming").length;
  document.getElementById("statCompleted").textContent = all.filter(b=>b.status==="Completed").length;
  document.getElementById("statCancelled").textContent = all.filter(b=>b.status==="Cancelled").length;
}

function renderUpcoming(){
  const upcoming = Bookings.getAll().filter(b => b.status === "Upcoming");
  const tbody = document.getElementById("upcomingTableBody");
  const noUpcoming = document.getElementById("noUpcoming");

  if(upcoming.length === 0){
    tbody.innerHTML = "";
    noUpcoming.classList.remove("d-none");
    return;
  }
  noUpcoming.classList.add("d-none");

  tbody.innerHTML = upcoming.map(b => `
    <tr>
      <td class="d-flex align-items-center gap-2"><img src="${getCarImage(getCarById(b.carId))}" style="width:50px;height:36px;object-fit:cover;border-radius:6px;"> ${b.carName}</td>
      <td>${Util.formatDate(b.pickup)}</td>
      <td>${Util.formatDate(b.ret)}</td>
      <td><span class="status-badge status-upcoming">Upcoming</span></td>
      <td class="fw-bold">${Util.money(b.amount)}</td>
    </tr>`).join("");
}

/* ---------------- Manage Vehicles ---------------- */
function renderManageCars(){
  const tbody = document.getElementById("manageCarsTableBody");
  tbody.innerHTML = CARS.map(car => `
    <tr>
      <td class="d-flex align-items-center gap-2"><img src="${getCarImage(car)}" style="width:40px;height:40px;object-fit:cover;border-radius:6px;"> ${car.name}</td>
      <td>${car.brand}</td>
      <td>${Util.money(car.price)}</td>
      <td>${car.seats}</td>
      <td>${car.transmission}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-danger remove-car-btn" data-id="${car.id}" data-name="${car.name}">
          <i class="bi bi-trash"></i> Remove
        </button>
      </td>
    </tr>`).join("");

  tbody.querySelectorAll(".remove-car-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      carPendingRemoval = btn.dataset.id;
      document.getElementById("removeCarName").textContent = `"${btn.dataset.name}" will be removed from the catalog.`;
      removeCarModalInstance.show();
    });
  });
}

async function handleAddCar(e){
  e.preventDefault();
  const form = e.target;
  if(!form.checkValidity()){
    form.classList.add("was-validated");
    Util.toast("Please fill in the required fields.", "danger");
    return;
  }

  const submitBtn = form.querySelector("button[type=submit]");
  submitBtn.disabled = true;

  try {
    const file = document.getElementById("newCarImage").files[0];
    // Compress the uploaded photo (if any) before saving to localStorage
    const image = file ? await Util.resizeImageFile(file, 500, 0.7) : null;

    const newCar = {
      name: document.getElementById("newCarName").value.trim(),
      brand: document.getElementById("newCarBrand").value.trim(),
      price: Number(document.getElementById("newCarPrice").value),
      seats: Number(document.getElementById("newCarSeats").value),
      transmission: document.getElementById("newCarTrans").value,
      fuel: "Petrol",
      rating: 4.5,
      reviews: 0,
      doors: 4,
      luggage: 2,
      minAge: 21,
      features: ["Bluetooth", "Air Conditioning"],
      image: image // null if no photo was chosen -> falls back to placeholder
    };

    addCarToCatalog(newCar);
    Util.toast(`${newCar.name} added to the catalog`, "success");

    form.reset();
    document.getElementById("newCarSeats").value = "5";
    document.getElementById("newCarPreview").classList.add("d-none");
    form.classList.remove("was-validated");

    renderManageCars();
  } catch(err){
    console.error("DrivEx add car error:", err);
    Util.toast(err.message || "Could not add the car.", "danger");
  } finally {
    submitBtn.disabled = false;
  }
}

function confirmRemoveCar(){
  if(carPendingRemoval){
    removeCarFromCatalog(carPendingRemoval);
    Util.toast("Vehicle removed from catalog", "info");
    carPendingRemoval = null;
  }
  removeCarModalInstance.hide();
  renderManageCars();
}

function handleResetCars(){
  resetCarsToDefault();
  Util.toast("Catalog reset to default vehicles", "info");
  renderManageCars();
}
