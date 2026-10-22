// js/hints.js -- first-time tips. Shows once per browser, and the "?" button (bottom right) replays it.
// Needs only the page itself (no other script). Load it LAST in dashboard.html.

(function () {
    const SEEN_KEY = "roomak.tipsSeen";

    // To edit the tips, change the text below. place: where the tip card sits ("top" or "bottom").
    const STEPS = [
        { target: ".controls", place: "bottom", title: "Pick a floor, day and time",
          text: "Use these three buttons. The rooms on the map change color to show what is free at that time." },
        { target: ".legend", place: "top", title: "What the colors mean",
          text: "Green is available, yellow is unavailable, red is in use, and grey rooms cannot be reserved." },
        { target: ".zoom", place: "top", title: "Move around the map",
          text: "Drag the map to move it. Pinch with two fingers, or use + and −, to zoom." },
        { target: null, place: "bottom", title: "Tap a room",
          text: "See its details and schedule, request it, or report a problem with it." },
    ];

    const seen = () => { try { return localStorage.getItem(SEEN_KEY) === "1"; } catch (e) { return false; } };
    const markSeen = () => { try { localStorage.setItem(SEEN_KEY, "1"); } catch (e) { /* ignore */ } };

    let card = null, current = null, index = 0;

    function clearTarget() {
        if (current) current.classList.remove("tip-target");
        current = null;
    }

    function stop() {
        clearTarget();
        if (card) card.remove();
        card = null;
        markSeen();
    }

    function show(i) {
        index = i;
        const step = STEPS[i];
        clearTarget();
        current = step.target ? document.querySelector(step.target) : null;
        if (current) current.classList.add("tip-target");

        const last = i === STEPS.length - 1;
        if (!card) {
            card = document.createElement("div");
            card.className = "tip-card";
            card.setAttribute("role", "dialog");
            card.setAttribute("aria-label", "Quick tips");
            card.addEventListener("click", (e) => {
                const b = e.target.closest("[data-tip]");
                if (!b) return;
                if (b.dataset.tip === "skip") stop();
                else if (index === STEPS.length - 1) stop();
                else show(index + 1);
            });
            document.body.appendChild(card);
        }
        card.className = "tip-card " + step.place;
        card.innerHTML = `
            <p class="tip-count">Tip ${i + 1} of ${STEPS.length}</p>
            <h3>${step.title}</h3>
            <p>${step.text}</p>
            <div class="tip-actions">
                <button type="button" class="tip-skip" data-tip="skip">${last ? "Close" : "Skip"}</button>
                <button type="button" class="tip-next" data-tip="next">${last ? "Got it" : "Next"}</button>
            </div>`;
    }

    function start() {
        if (card) return;
        const drawer = document.getElementById("drawer");
        if (drawer && drawer.classList.contains("open")) drawer.classList.remove("open");
        show(0);
    }

    // "?" replay button
    const zoom = document.querySelector(".zoom");
    if (zoom) {
        const help = document.createElement("button");
        help.type = "button";
        help.id = "tipsBtn";
        help.setAttribute("aria-label", "Show tips");
        help.textContent = "?";
        help.addEventListener("click", start);
        zoom.appendChild(help);
    }

    if (!seen()) setTimeout(start, 700);
})();