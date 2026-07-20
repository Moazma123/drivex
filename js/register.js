/* ==========================================================
   DrivEx — Register Page Logic
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("registerForm");

    if (!form) {
        console.error("DrivEx: #registerForm not found.");
        return;
    }

    if (typeof Auth === "undefined" || typeof Util === "undefined") {
        console.error("DrivEx: app.js not loaded.");
        return;
    }

    const password = document.getElementById("regPassword");
    const confirmPassword = document.getElementById("regConfirm");

    form.addEventListener("submit", function(e) {
        e.preventDefault();

        // Check password match
        if (password.value !== confirmPassword.value) {
            confirmPassword.setCustomValidity("Passwords do not match");
        } else {
            confirmPassword.setCustomValidity("");
        }

        if (!form.checkValidity()) {
            form.classList.add("was-validated");
            Util.toast("Please fill all fields correctly.", "danger");
            return;
        }

        const name = document.getElementById("regName").value.trim();
        const email = document.getElementById("regEmail").value.trim();
        const pass = password.value;

        console.log("========== REGISTER ==========");
        console.log("Name:", name);
        console.log("Email:", email);
        console.log("Password:", pass);

        // Register user
        const result = Auth.register(name, email, pass);

        if (!result.success) {
            console.log("Registration Failed");
            console.log(result.message);

            Util.toast(result.message, "danger");
            return;
        }

        console.log("Registration Successful");
        console.log(Auth.getUser());

        Util.toast(`Welcome ${name}! Your account has been created.`, "success");

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1000);
    });

    confirmPassword.addEventListener("input", () => {
        confirmPassword.setCustomValidity("");
    });

});