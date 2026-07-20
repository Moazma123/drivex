/* ==========================================================
   DrivEx — My Bookings page logic
   ========================================================== */
let cancelTargetId = null;
let cancelModalInstance = null;

document.addEventListener("DOMContentLoaded", () => {
    if (!Auth.requireAuth("my-bookings.html")) return;

    const user = Auth.getUser();
    document.getElementById("userNameLabel").textContent = user.name;
    document.getElementById("userAvatar").textContent = Util.initials(user.name);

    document.getElementById("navLogoutLink").addEventListener("click", handleLogout);
    document.getElementById("sidebarLogout").addEventListener("click", handleLogout);

    cancelModalInstance = new bootstrap.Modal(document.getElementById("cancelModal"));
    document.getElementById("confirmCancelBtn").addEventListener("click", confirmCancel);

    renderTable();
});

function handleLogout(e) {
    e.preventDefault();
    Auth.logout();
    Util.toast("You have been logged out", "info");
    setTimeout(() => window.location.href = "index.html", 500);
}

function statusClass(status) {
    return { Upcoming: "status-upcoming", Completed: "status-completed", Cancelled: "status-cancelled" }[status] || "status-upcoming";
}

function renderTable() {
    const all = Bookings.getAll();
    const tbody = document.getElementById("bookingsTableBody");
    const noBookings = document.getElementById("noBookings");

    if (all.length === 0) {
        tbody.innerHTML = "";
        noBookings.classList.remove("d-none");
        return;
    }
    noBookings.classList.add("d-none");

    tbody.innerHTML = all.map(b => `
    <tr>
      <td class="fw-semibold">${b.id}</td>
      <td class="d-flex align-items-center gap-2"><img src="${getCarImage(getCarById(b.carId))}" style="width:44px;height:32px;object-fit:cover;border-radius:6px;"> ${b.carName}</td>
      <td>${Util.formatDate(b.pickup)}</td>
      <td>${Util.formatDate(b.ret)}</td>
      <td><span class="status-badge ${statusClass(b.status)}">${b.status}</span></td>
      <td class="fw-bold">${Util.money(b.amount)}</td>
      <td>
        <a href="booking-success.html?id=${b.id}" class="text-muted-soft me-2" title="View"><i class="bi bi-eye"></i></a>
        <a href="invoice.html?id=${b.id}" class="text-muted-soft me-2" title="Download Invoice"><i class="bi bi-download"></i></a>
        ${b.status === "Upcoming"
          ? `<a href="#" class="text-danger cancel-btn" data-id="${b.id}" title="Cancel Booking"><i class="bi bi-x-circle"></i></a>`
          : `<span class="text-muted-soft opacity-25"><i class="bi bi-x-circle"></i></span>`}
      </td>
    </tr>`).join("");

  tbody.querySelectorAll(".cancel-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      cancelTargetId = btn.dataset.id;
      cancelModalInstance.show();
    });
  });
}

function confirmCancel(){
  if(cancelTargetId){
    Bookings.updateStatus(cancelTargetId, "Cancelled");
    Util.toast(`Booking ${cancelTargetId} cancelled`, "info");
    cancelTargetId = null;
  }
  cancelModalInstance.hide();
  renderTable();
}