/* ==========================================================
   DrivEx — Vehicles listing logic
   ========================================================== */
const PAGE_SIZE = 6;
let currentPage = 1;

document.addEventListener("DOMContentLoaded", () => {
  renderNavbarAuth("navAuthSlot");
  populateBrandFilter();
  bindFilterEvents();
  applyFiltersAndRender();
});

function populateBrandFilter(){
  const brandSelect = document.getElementById("fBrand");
  const brands = [...new Set(CARS.map(c => c.brand))].sort();
  brands.forEach(b => {
    const opt = document.createElement("option");
    opt.value = b; opt.textContent = b;
    brandSelect.appendChild(opt);
  });
}

function bindFilterEvents(){
  document.getElementById("fPrice").addEventListener("input", (e)=>{
    document.getElementById("fPriceLabel").textContent = "$" + e.target.value + (e.target.value >= 150 ? "+" : "");
  });
  document.getElementById("fApply").addEventListener("click", () => { currentPage = 1; applyFiltersAndRender(); });
  document.getElementById("fClear").addEventListener("click", clearFilters);
  document.getElementById("fSort").addEventListener("change", applyFiltersAndRender);
  document.getElementById("fSearch").addEventListener("keyup", (e)=>{ if(e.key === "Enter"){ currentPage = 1; applyFiltersAndRender(); } });
}

function clearFilters(){
  document.getElementById("fSearch").value = "";
  document.getElementById("fPrice").value = 150;
  document.getElementById("fPriceLabel").textContent = "$150+";
  document.getElementById("fBrand").value = "";
  document.getElementById("fFuel").value = "";
  document.getElementById("fTransmission").value = "";
  document.getElementById("fSeats").value = "";
  document.getElementById("fRating").checked = false;
  currentPage = 1;
  applyFiltersAndRender();
}

function getFilteredCars(){
  const search = document.getElementById("fSearch").value.trim().toLowerCase();
  const maxPrice = Number(document.getElementById("fPrice").value);
  const brand = document.getElementById("fBrand").value;
  const fuel = document.getElementById("fFuel").value;
  const trans = document.getElementById("fTransmission").value;
  const seats = document.getElementById("fSeats").value;
  const ratingOnly = document.getElementById("fRating").checked;
  const sort = document.getElementById("fSort").value;

  let list = CARS.filter(c => {
    if(search && !(c.name.toLowerCase().includes(search) || c.brand.toLowerCase().includes(search))) return false;
    if(c.price > maxPrice) return false;
    if(brand && c.brand !== brand) return false;
    if(fuel && c.fuel !== fuel) return false;
    if(trans && c.transmission !== trans) return false;
    if(seats && c.seats !== Number(seats)) return false;
    if(ratingOnly && c.rating < 4.0) return false;
    return true;
  });

  if(sort === "price-asc") list.sort((a,b)=>a.price-b.price);
  else if(sort === "price-desc") list.sort((a,b)=>b.price-a.price);
  else if(sort === "rating") list.sort((a,b)=>b.rating-a.rating);

  return list;
}

function applyFiltersAndRender(){
  const filtered = getFilteredCars();
  const grid = document.getElementById("vehiclesGrid");
  const noResults = document.getElementById("noResults");
  const resultsCount = document.getElementById("resultsCount");

  resultsCount.textContent = `${filtered.length} car${filtered.length !== 1 ? "s" : ""} found`;

  if(filtered.length === 0){
    grid.innerHTML = "";
    noResults.classList.remove("d-none");
    renderPagination(0);
    return;
  }
  noResults.classList.add("d-none");

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  if(currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  grid.innerHTML = pageItems.map(car => `
    <div class="col-6 col-md-4">
      <div class="car-card p-3 h-100 d-flex flex-column">
        <img src="${getCarImage(car)}" class="w-100 mb-3" alt="${car.name}" style="height:140px;object-fit:cover;border-radius:10px;">
        <h6 class="fw-bold mb-1">${car.name}</h6>
        <div class="car-price mb-2">${Util.money(car.price)}<small>/day</small></div>
        <div class="d-flex gap-2 mb-3 flex-wrap">
          <span class="badge-spec"><i class="bi bi-star-fill text-warning"></i> ${car.rating}</span>
          <span class="badge-spec"><i class="bi bi-gear"></i> ${car.transmission}</span>
          <span class="badge-spec"><i class="bi bi-people"></i> ${car.seats} Seats</span>
        </div>
        <a href="car-details.html?car=${car.id}" class="btn btn-brand w-100 btn-sm mt-auto">Book Now</a>
      </div>
    </div>`).join("");

  renderPagination(totalPages);
}

function renderPagination(totalPages){
  const list = document.getElementById("paginationList");
  if(totalPages <= 1){ list.innerHTML = ""; return; }

  let html = `<li class="page-item ${currentPage===1?'disabled':''}"><a class="page-link" href="#" data-page="prev">Prev</a></li>`;
  for(let i=1;i<=totalPages;i++){
    html += `<li class="page-item ${i===currentPage?'active':''}"><a class="page-link" href="#" data-page="${i}" ${i===currentPage?'style="background:var(--primary);border-color:var(--primary);"':''}>${i}</a></li>`;
  }
  html += `<li class="page-item ${currentPage===totalPages?'disabled':''}"><a class="page-link" href="#" data-page="next">Next</a></li>`;
  list.innerHTML = html;

  list.querySelectorAll("a.page-link").forEach(a => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const p = a.dataset.page;
      if(p === "prev") currentPage = Math.max(1, currentPage - 1);
      else if(p === "next") currentPage = Math.min(totalPages, currentPage + 1);
      else currentPage = Number(p);
      applyFiltersAndRender();
      window.scrollTo({ top: document.getElementById("vehiclesGrid").offsetTop - 100, behavior: "smooth" });
    });
  });
}
