// js/hints.js -- first-time tips. Shows once per browser, and the "?" button (bottom right) replays it.
// Needs only the page itself (no other script). Load it LAST in dashboard.html.

(function () {
    const SEEN_KEY = "roomak.tipsSeen";
    const isTouch = () => window.matchMedia && window.matchMedia("(hover: none)").matches;

    function getSteps() {
        return [
            {
                targets: ".controls",
                place: "bottom",
                title: "Pick a floor, day and time",
                text: "Use these three buttons. The rooms on the map change color to show what is free at that time.",
            },
            {
                targets: ".legend",
                place: "top",
                title: "What the colors mean",
                text: "Green is available, yellow is unavailable, red is in use, and grey rooms cannot be reserved.",
            },
            {
                targets: ".zoom, .pan-bar, .edge-arrow:not([hidden])",
                place: "top",
                title: "Move and zoom around the map",
                text: isTouch()
                    ? "Drag with one finger to move, or pinch with two fingers (or tap + and −) to zoom. Yellow arrows show more rooms off-screen."
                    : "Drag, scroll with two fingers, or use the ← → buttons and arrow keys to move across buildings. Use + and − to zoom.",
            },
            {
                targets: null,
                place: "bottom",
                title: "Tap a room",
                text: "See its details and schedule, request it, or report a problem with it.",
            },
        ];
    }

    const seen = () => { try { return localStorage.getItem(SEEN_KEY) === "1"; } catch (e) { return false; } };
    const markSeen = () => { try { localStorage.setItem(SEEN_KEY, "1"); } catch (e) { /* ignore */ } };

    let card = null, backdrop = null, activeTargets = [], index = 0;

    function clearTargets() {
        activeTargets.forEach((el) => el.classList.remove("tip-target"));
        activeTargets = [];
    }

    function stop() {
        clearTargets();
        if (backdrop) { backdrop.remove(); backdrop = null; }
        if (card) { card.remove(); card = null; }
        markSeen();
    }

    function show(i) {
        const steps = getSteps();
        index = i;
        const step = steps[i];
        clearTargets();

        // Dim the map behind the highlighted controls (except on the final "Tap a room" step)
        const mapCard = document.querySelector(".map-card");
        if (mapCard && step.targets) {
            if (!backdrop) {
                backdrop = document.createElement("div");
                backdrop.className = "tip-backdrop";
                mapCard.appendChild(backdrop);
            }
        } else if (backdrop) {
            backdrop.remove();
            backdrop = null;
        }

        if (step.targets) {
            document.querySelectorAll(step.targets).forEach((el) => {
                if (el.offsetParent === null) return;
                el.classList.add("tip-target");
                activeTargets.push(el);
            });
        }

        const last = i === steps.length - 1;
        if (!card) {
            card = document.createElement("div");
            card.className = "tip-card";
            card.setAttribute("role", "dialog");
            card.setAttribute("aria-label", "Quick tips");
            card.addEventListener("click", (e) => {
                const b = e.target.closest("[data-tip]");
                if (!b) return;
                if (b.dataset.tip === "skip") stop();
                else if (index === steps.length - 1) stop();
                else show(index + 1);
            });
            document.body.appendChild(card);
        }
        card.className = "tip-card " + step.place;
        card.innerHTML = `
            <p class="tip-count">Tip ${i + 1} of ${steps.length}</p>
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