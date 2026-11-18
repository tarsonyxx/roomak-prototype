/* =========================================================
   RooMak login: decorative motion only.
- Error feedback: shakes the form card when auth.js shows an error.
- Pointer parallax: the background slabs drift with the mouse.
   This file never reads, validates or submits the form. Sign-in
   is handled entirely by js/auth.js.
   ========================================================= */
(function () {
    "use strict";

    var shell = document.getElementById("loginShell");
    if (!shell) return;

    var card = shell.querySelector(".login-card");
    var form = document.getElementById("loginForm");
    var message = document.getElementById("loginMessage");

    /* ---------- Error shake ---------- */
    if (card && form && message) {
        form.addEventListener("submit", function () {
            window.requestAnimationFrame(function () {
                if (!message.classList.contains("is-error")) return;
                card.classList.remove("is-shaking");
                void card.offsetWidth; // restart the animation on repeated failures
                card.classList.add("is-shaking");
            });
        });

        card.addEventListener("animationend", function (event) {
            if (event.animationName === "login-shake") card.classList.remove("is-shaking");
        });
    }

    /* ---------- Pointer parallax (mouse only, never with reduced motion) ---------- */
    if (!window.matchMedia) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    var rectLeft = 0, rectTop = 0;
    function updateRect() {
        var r = shell.getBoundingClientRect();
        rectLeft = r.left;
        rectTop = r.top;
    }
    updateRect();
    window.addEventListener("resize", updateRect, { passive: true });

    var targetX = 0, targetY = 0, currentX = 0, currentY = 0, frame = 0;

    function tick() {
        currentX += (targetX - currentX) * 0.075;
        currentY += (targetY - currentY) * 0.075;
        shell.style.setProperty("--px", currentX.toFixed(3));
        shell.style.setProperty("--py", currentY.toFixed(3));

        var moving = Math.abs(targetX - currentX) > 0.002 || Math.abs(targetY - currentY) > 0.002;
        frame = moving ? window.requestAnimationFrame(tick) : 0;
    }

    window.addEventListener("pointermove", function (event) {
        if (event.pointerType && event.pointerType !== "mouse") return;

        var width = window.innerWidth || 1;
        var height = window.innerHeight || 1;
        targetX = (event.clientX / width - 0.5) * 2;
        targetY = (event.clientY / height - 0.5) * 2;

        shell.style.setProperty("--mx", (event.clientX - rectLeft).toFixed(0) + "px");
        shell.style.setProperty("--my", (event.clientY - rectTop).toFixed(0) + "px");

        if (!frame) frame = window.requestAnimationFrame(tick);
    }, { passive: true });
})();