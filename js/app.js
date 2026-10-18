"use strict";

(() => {
    const messageElement = document.getElementById("formMessage");

    // Expose shared UI helpers for other RooMak scripts.
    window.RooMakApp = {
        showMessage(message, type = "info") {
            if (!messageElement) {
                return;
            }

            messageElement.textContent = message;
            messageElement.className = `form-message visible ${type}`;
        },

        clearMessage() {
            if (!messageElement) {
                return;
            }

            messageElement.textContent = "";
            messageElement.className = "form-message";
        }
    };

    // Keep the copyright year current.
    const yearElement = document.getElementById("currentYear");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Temporary help and privacy placeholders.
    const placeholderLinks = [
        {
            id: "helpLink",
            message: "RooMak help documentation has not been configured yet."
        },
        {
            id: "privacyLink",
            message: "The RooMak privacy policy needs to be added before deployment."
        }
    ];

    placeholderLinks.forEach(({ id, message }) => {
        const link = document.getElementById(id);

        if (!link) {
            return;
        }

        link.addEventListener("click", (event) => {
            event.preventDefault();
            window.RooMakApp.showMessage(message);
        });
    });
})();