/* =========================================================
   RooMak index page: notice acknowledgement & portal entry
   ========================================================= */
(function () {
    "use strict";

    var acknowledgement = document.getElementById("acknowledge");
    var continueButton = document.getElementById("continueButton");
    var gateArea = document.getElementById("gateArea");
    var gateHint = document.getElementById("gateHint");

    if (!acknowledgement || !continueButton) return;

    function syncGateState() {
        var accepted = Boolean(acknowledgement.checked);
        continueButton.disabled = !accepted;

        if (gateArea) {
            gateArea.classList.toggle("is-acknowledged", accepted);
        }

        if (gateHint) {
            gateHint.textContent = accepted
                ? "Ready — proceed to RooMak sign in"
                : "Acknowledge the notice above to unlock entry";
        }
    }

    acknowledgement.addEventListener("change", syncGateState);

    continueButton.addEventListener("click", function () {
        if (!acknowledgement.checked) return;
        window.location.href = "pages/login.html";
    });

    // Keep state accurate on initial load and browser back-navigation (bfcache).
    window.addEventListener("pageshow", syncGateState);
    syncGateState();
})();
