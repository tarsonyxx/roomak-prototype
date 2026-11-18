/* =========================================================
   RooMak index page: decorative motion only.
   Mirrors js/login-fx.js pointer parallax for the background
   slabs and ambient spotlight. Never alters gate logic.

   Performance notes:
   - Variables are written to the backdrop, not the page shell, so a
     mouse move never restyles the notice card.
   - pointermove only records the target. All style writes happen once
     per frame inside requestAnimationFrame, with no layout reads.
   ========================================================= */
(function () {
    "use strict";

    var backdrop = document.querySelector(".notice-backdrop");
    if (!backdrop) return;

    if (!window.matchMedia) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

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

        var moving =
            Math.abs(targetX - currentX) > 0.002 ||
            Math.abs(targetY - currentY) > 0.002;
        if (moving) frame = window.requestAnimationFrame(tick);
    }

    window.addEventListener(
        "pointermove",
        function (event) {
            if (event.pointerType && event.pointerType !== "mouse") return;

            var width = window.innerWidth || 1;
            var height = window.innerHeight || 1;
            targetX = (event.clientX / width - 0.5) * 2;
            targetY = (event.clientY / height - 0.5) * 2;

            // pageX/pageY are relative to the document, which is where the
            // backdrop starts, so no getBoundingClientRect() (forced layout) is needed.
            mouseX = Math.round(event.pageX);
            mouseY = Math.round(event.pageY);
            glowReady = true;

            if (armed && !frame) frame = window.requestAnimationFrame(tick);
        },
        { passive: true }
    );
})();
