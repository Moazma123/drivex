/* ==========================================================
   DrivEx — Contact page logic
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  renderNavbarAuth("navAuthSlot");

  const form = document.getElementById("contactForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if(!form.checkValidity()){
      form.classList.add("was-validated");
      return;
    }
    Util.toast("Your message has been sent! We'll get back to you soon.", "success");
    form.reset();
    form.classList.remove("was-validated");
  });
});
