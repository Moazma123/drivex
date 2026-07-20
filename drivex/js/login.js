/* ==========================================================
   DrivEx — Login page logic
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    // Get login form
    const form = document.getElementById("loginForm");

    if (!form) {
        console.error("Login form not found!");
        return;
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        try {
            const email = document.getElementById("loginEmail").value.trim();
            const password = document.getElementById("loginPassword").value;

            if (!form.checkValidity()) {
                form.classList.add("was-validated");
                return;
            }

            // Show entered credentials in console (development only)
            console.log("========== LOGIN ATTEMPT ==========");
            console.log("Email:", email);
            console.log("Password:", password);

            // Check login
            const result = Auth.loginWithCredentials(email, password);

            if (!result.success) {
                console.log("❌ Login Failed");
                console.log(result.message);

                Util.toast("Wrong email or password!", "danger");
                return;
            }

            console.log("✅ Login Successful");
            console.log(Auth.getUser());

            Util.toast(`Welcome ${result.name}!`, "success");

            const redirect = Util.qs("redirect") || "dashboard.html";

            setTimeout(() => {
                window.location.href = redirect;
            }, 1000);

        } catch (err) {
            console.error("Login Error:", err);
            Util.toast("Something went wrong!", "danger");
        }
    });

});