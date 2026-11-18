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

    // Variables go on the backdrop, not the shell, so a mouse move never restyles the form.
    var backdrop = shell.querySelector(".login-backdrop");
    if (!backdrop) return;

    var targetX = 0, targetY = 0, currentX = 0, currentY = 0;
    var mouseX = 0, mouseY = 0, glowReady = false;
    var frame = 0;

    // Ignore the mouse until the intro animation has finished (about 1.3s). Parallax
    // during startup competes with the entrance animation for the same frames.
    var INTRO_MS = 1400;
    var armed = false;
    window.setTimeout(function () {
        armed = true;
        backdrop.classList.add("is-parallax");
        if (glowReady && !frame) frame = window.requestAnimationFrame(tick);
    }, INTRO_MS);

    // All style writes happen once per frame here; pointermove only records targets.
    function tick() {
        frame = 0;
        currentX += (targetX - currentX) * 0.075;
        currentY += (targetY - currentY) * 0.075;

        var style = backdrop.style;
        style.setProperty("--px", currentX.toFixed(3));
        style.setProperty("--py", currentY.toFixed(3));
        if (glowReady) {
            style.setProperty("--mx", mouseX + "px");
            style.setProperty("--my", mouseY + "px");
        }

        var moving = Math.abs(targetX - currentX) > 0.002 || Math.abs(targetY - currentY) > 0.002;
        if (moving) frame = window.requestAnimationFrame(tick);
    }

    window.addEventListener("pointermove", function (event) {
        if (event.pointerType && event.pointerType !== "mouse") return;

        var width = window.innerWidth || 1;
        var height = window.innerHeight || 1;
        targetX = (event.clientX / width - 0.5) * 2;
        targetY = (event.clientY / height - 0.5) * 2;

        // Document-relative coordinates: the backdrop starts at the document origin,
        // so no cached or live getBoundingClientRect() is needed.
        mouseX = Math.round(event.pageX);
        mouseY = Math.round(event.pageY);
        glowReady = true;

        if (armed && !frame) frame = window.requestAnimationFrame(tick);
    }, { passive: true });
})();
