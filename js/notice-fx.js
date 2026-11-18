/* =========================================================
   RooMak index page: decorative spatial motion only.
   Tracks pointer position for ambient spotlight and subtle
   parallax depth. Never reads or alters form state.
   ========================================================= */
(function () {
    "use strict";

    var stage = document.getElementById("noticeStage");
    if (!stage) return;

    if (!window.matchMedia) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    var targetX = 0;
    var targetY = 0;
    var currentX = 0;
    var currentY = 0;
    var frame = 0;

    function tick() {
        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;

        stage.style.setProperty("--px", currentX.toFixed(3));
        stage.style.setProperty("--py", currentY.toFixed(3));

        var moving =
            Math.abs(targetX - currentX) > 0.002 ||
            Math.abs(targetY - currentY) > 0.002;
        frame = moving ? window.requestAnimationFrame(tick) : 0;
    }

    window.addEventListener(
        "pointermove",
        function (event) {
            if (event.pointerType && event.pointerType !== "mouse") return;

            var width = window.innerWidth || 1;
            var height = window.innerHeight || 1;
            targetX = (event.clientX / width - 0.5) * 2;
            targetY = (event.clientY / height - 0.5) * 2;

            var rect = stage.getBoundingClientRect();
            stage.style.setProperty("--mx", (event.clientX - rect.left).toFixed(0) + "px");
            stage.style.setProperty("--my", (event.clientY - rect.top).toFixed(0) + "px");

            if (!frame) frame = window.requestAnimationFrame(tick);
        },
        { passive: true }
    );
})();
