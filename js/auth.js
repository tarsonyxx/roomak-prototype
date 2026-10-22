const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

if (loginForm && loginMessage) {
    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData(loginForm);
        const username = String(formData.get("username") || "").trim();
        const password = String(formData.get("password") || "");

        // Demo-only credentials.
        if (username === "demo" && password === "1234") {
            sessionStorage.setItem("roomakLoggedIn", "yes");
            window.location.href = "dashboard.html";
            return;
        }

        loginMessage.textContent =
            "Incorrect account name or password. Check the demo credentials and try again.";
        loginMessage.className = "status-message is-error";
    });

    loginForm.addEventListener("input", () => {
        loginMessage.textContent = "";
        loginMessage.className = "status-message";
    });
}