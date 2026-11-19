// js/dashboard.js -- controls, legend and the room information drawer.
// Uses helpers from floorplan.js (toMin, getStatus, drawFloor, ...).

const $ = (id) => document.getElementById(id);
const world = $("world");

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_FROM = 7 * 60;    // timeline starts at 7:00 AM
const DAY_TO = 20 * 60;     // ...and ends at 8:00 PM
const BUILDINGS = { B2: "Building 2", B3: "Building 3", BW: "Bridgeway" };

const state = {
    floor: Object.keys(FLOORS)[1],
    day: "Mon", start: "09:00", end: "10:00",
    room: null,        // room currently open in the drawer
    viewDay: "Mon",    // day shown in the drawer's schedule
};

const timeValid = () => toMin(state.end) > toMin(state.start);

/* ---------- Pre-index & pre-sort schedules once at startup ---------- */
const SCHEDULE_MAP = Object.create(null);
for (const item of SCHEDULES) {
    const key = `${item.roomId}|${item.day}`;
    (SCHEDULE_MAP[key] || (SCHEDULE_MAP[key] = [])).push(item);
}
for (const key in SCHEDULE_MAP) {
    SCHEDULE_MAP[key].sort((a, b) => toMin(a.start) - toMin(b.start));
}
const getBookings = (roomId, day) => SCHEDULE_MAP[`${roomId}|${day}`] || [];

/* ---------- Cache frequently accessed DOM nodes ---------- */
const dom = {
    drawer: $("drawer"),
    drawerBody: $("drawerBody"),
    hint: $("hint"),
    floorLabel: $("floorLabel"),
    dayLabel: $("dayLabel"),
    timeLabel: $("timeLabel"),
    timeBtn: $("timeBtn"),
    timeError: $("timeError"),
    floorPop: $("floorPop"),
    dayPop: $("dayPop"),
    timePop: $("timePop"),
    actionDialog: $("roomActionDialog"),
    pops: document.querySelectorAll(".pop"),
    chips: document.querySelectorAll(".chip"),
};

/* ---------- small helpers ---------- */
const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function fmtMin(m) {
    const h = Math.floor(m / 60), mm = m % 60;
    return (h % 12 || 12) + ":" + String(mm).padStart(2, "0") + " " + (h >= 12 ? "PM" : "AM");
}
function fmtRange(s, e) {            // minutes -> "9:00–10:00 AM"
    const a = fmtMin(s).split(" "), b = fmtMin(e).split(" ");
    return a[1] === b[1] ? `${a[0]}–${b[0]} ${b[1]}` : `${a[0]} ${a[1]} – ${b[0]} ${b[1]}`;
}

/* ---------- floating dropdowns ---------- */
function closePopovers() {
    dom.pops.forEach((p) => (p.hidden = true));
    dom.chips.forEach((b) => b.setAttribute("aria-expanded", "false"));
}
function wirePopover(btnId, popId) {
    $(btnId).addEventListener("click", () => {
        const wasHidden = $(popId).hidden;
        closePopovers();
        $(popId).hidden = !wasHidden;
        $(btnId).setAttribute("aria-expanded", String(wasHidden));
    });
}
wirePopover("floorBtn", "floorPop");
wirePopover("dayBtn", "dayPop");
wirePopover("timeBtn", "timePop");

document.addEventListener("click", (e) => {
    if (!e.target.closest(".dd")) closePopovers();
});

function renderOptions(popEl, values, current, labelFn) {
    popEl.innerHTML = values.map((v) =>
        `<button type="button" class="opt ${v === current ? "selected" : ""}" data-v="${v}">${labelFn(v)}</button>`
    ).join("");
}

dom.floorPop.addEventListener("click", (e) => {
    const b = e.target.closest(".opt"); if (!b) return;
    state.floor = b.dataset.v;
    closePopovers();
    showFloor();
});
dom.dayPop.addEventListener("click", (e) => {
    const b = e.target.closest(".opt"); if (!b) return;
    state.day = state.viewDay = b.dataset.v;
    closePopovers();
    refresh();
});
// Click anywhere on the time field (not just the clock icon) to open the picker.
["start", "end"].forEach((id) => {
    const el = $(id);
    el.addEventListener("click", () => {
        try { el.showPicker(); } catch (err) { /* older browsers: typing still works */ }
    });
    el.addEventListener("change", () => {
        state[id] = el.value;
        state.viewDay = state.day;
        refresh();
    });
});

/* ---------- map ---------- */
/* ---------- map ---------- */
const edgeLeft = $("edgeLeft");
const edgeRight = $("edgeRight");
const panLeftBtn = $("panLeft");
const panRightBtn = $("panRight");

const panZoom = createPanZoom(
    $("viewport"),
    world,
    (roomEl) => {
        dom.hint.classList.add("hidden");
        closePopovers();
        if (roomEl) openDrawer(roomEl.dataset.room);
        else closeDrawer();
    },
    ({ canLeft, canRight }) => {
        if (edgeLeft) edgeLeft.hidden = !canLeft;
        if (edgeRight) edgeRight.hidden = !canRight;
        if (panLeftBtn) panLeftBtn.disabled = !canLeft;
        if (panRightBtn) panRightBtn.disabled = !canRight;
    }
);

$("zoomIn").addEventListener("click", panZoom.zoomIn);
$("zoomOut").addEventListener("click", panZoom.zoomOut);
$("zoomFit").addEventListener("click", panZoom.fit);
if (panLeftBtn) panLeftBtn.addEventListener("click", panZoom.panLeft);
if (panRightBtn) panRightBtn.addEventListener("click", panZoom.panRight);
if (edgeLeft) edgeLeft.addEventListener("click", panZoom.panLeft);
if (edgeRight) edgeRight.addEventListener("click", panZoom.panRight);

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        closePopovers();
        if (!dom.actionDialog.open) closeDrawer();
        return;
    }

    // Let browser shortcuts (like Ctrl + / Ctrl -) work normally
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    // Do not intercept keys if a modal dialog is open or user is typing in an input
    if (dom.actionDialog.open || document.querySelector("dialog[open]")) return;
    const tag = document.activeElement?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

    if (e.key === "ArrowLeft") {
        e.preventDefault();
        dom.hint.classList.add("hidden");
        panZoom.panLeft();
    } else if (e.key === "ArrowRight") {
        e.preventDefault();
        dom.hint.classList.add("hidden");
        panZoom.panRight();
    } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        dom.hint.classList.add("hidden");
        panZoom.zoomIn();
    } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        dom.hint.classList.add("hidden");
        panZoom.zoomOut();
    } else if (e.key === "0") {
        e.preventDefault();
        dom.hint.classList.add("hidden");
        panZoom.fit();
    }
});

function showFloor() {
    closeDrawer();
    panZoom.setPlan(drawFloor(world, state.floor));
    refresh();
}

function refresh() {
    const ok = timeValid();
    dom.floorLabel.textContent = state.floor + "F";
    dom.dayLabel.textContent = state.day;
    dom.timeLabel.textContent = ok ? fmtRange(toMin(state.start), toMin(state.end)) : "Check time";
    dom.timeBtn.classList.toggle("error", !ok);
    dom.timeError.textContent = ok ? "" : "End time must be after start time.";
    renderOptions(dom.floorPop, Object.keys(FLOORS), state.floor, (n) => "Floor " + n);
    renderOptions(dom.dayPop, DAYS, state.day, (d) => d);

    if (ok) {
            const counts = applyTimeRange(world, state.day, state.start, state.end);
            for (const key in counts) $("n-" + key).textContent = counts[key];
        } else {
            clearTimeRange(world);
            ["available", "unavailable", "occupied"].forEach((key) => {
                $("n-" + key).textContent = "—";
            });
        }
}

/* ---------- room information drawer ---------- */
function openDrawer(roomId) {
    state.room = roomId;
    state.viewDay = state.day;
    dom.drawer.classList.add("open");
    dom.drawer.setAttribute("aria-hidden", "false");
    markSelected(world, roomId);
    renderDrawer();
    dom.drawerBody.scrollTop = 0;
}
function closeDrawer() {
    state.room = null;
    dom.drawer.classList.remove("open");
    dom.drawer.setAttribute("aria-hidden", "true");
    markSelected(world, null);
}

// Free and busy blocks for one day, in order.
function daySegments(bookings) {
    const out = [];
    let cur = DAY_FROM;
    for (const b of bookings) {
        const s = toMin(b.start), e = toMin(b.end);
        if (s > cur) out.push({ free: true, s: cur, e: s });
        out.push({ free: false, s, e, b });
        cur = Math.max(cur, e);
    }
    if (cur < DAY_TO) out.push({ free: true, s: cur, e: DAY_TO });
    return out;
}

function availabilitySubtitle(day, bookings, res, selS, selE, valid) {
    if (!valid) return "Select a valid time range.";
    if (!res) return "—";

    if (res.status === "occupied") {
        const conflicts = bookings.filter((booking) =>
            toMin(booking.start) < selE && selS < toMin(booking.end));
        const details = conflicts.map((booking) =>
            `${fmtRange(toMin(booking.start), toMin(booking.end))} · ${esc(booking.activity)}`);
        return `${day} · ${details.length ? details.join(" | ") : esc(res.reason || "In use")}`;
    }

    if (res.status === "available") {
        const nextBooking = bookings.find((booking) => toMin(booking.start) >= selE);
        const availableUntil = nextBooking ? toMin(nextBooking.start) : DAY_TO;
        return `${day} · Available until ${fmtMin(availableUntil)}`;
    }

    if (res.status === "unavailable") {
        return `${day} · ${esc(res.reason || "Unavailable for booking")}`;
    }

    return `${day}${res.reason ? " · " + esc(res.reason) : ""}`;
}

const pct = (m) => ((Math.min(DAY_TO, Math.max(DAY_FROM, m)) - DAY_FROM) / (DAY_TO - DAY_FROM)) * 100;
const TICKS_HTML = [7, 10, 13, 16, 19].map((h) =>
    `<span style="left:${pct(h * 60)}%">${h % 12 || 12} ${h >= 12 ? "PM" : "AM"}</span>`).join("");

function buildScheduleInner(id, day, closedAllDay, ok, selS, selE) {
    const bookings = getBookings(id, day);
    const segs = daySegments(bookings);

    const blocks = closedAllDay ? "" : bookings.map((b) =>
        `<i class="blk busy" style="left:${pct(toMin(b.start))}%;width:${pct(toMin(b.end)) - pct(toMin(b.start))}%"></i>`).join("");
    const sel = ok ? `<i class="blk sel" style="left:${pct(selS)}%;width:${pct(selE) - pct(selS)}%"></i>` : "";

    const list = segs.map((g) => {
        const hit = ok && g.s < selE && selS < g.e;
        const when = fmtRange(g.s, g.e);
        if (g.free) {
            return closedAllDay ? "" :
                `<li class="free ${hit ? "hit" : ""}"><span class="when">${when}</span><strong>Free</strong></li>`;
        }
        return `<li class="busy ${hit ? "hit" : ""}"><span class="when">${when}</span>` +
            `<strong>${esc(g.b.activity)}</strong>` +
            (g.b.faculty ? `<em>${esc(g.b.faculty)}</em>` : "") + `</li>`;
    }).join("");

    return `
        <div class="daytabs" role="tablist">
            ${DAYS.map((d) => `<button type="button" class="${d === day ? "active" : ""}" data-day="${d}">${d}</button>`).join("")}
        </div>
        ${closedAllDay
            ? `<p class="notice">Not available for booking: ${esc(UNAVAILABLE[id])}.</p>`
            : `<div class="timeline">${blocks}${sel}</div><div class="ticks">${TICKS_HTML}</div>`}
        <ul class="slots">${list || '<li class="none">No classes scheduled.</li>'}</ul>`;
}

function renderScheduleOnly() {
    const id = state.room;
    if (!id) return;
    const container = dom.drawerBody.querySelector("#drawerSchedule");
    if (!container) { renderDrawer(); return; }
    const ok = timeValid();
    container.innerHTML = buildScheduleInner(
        id, state.viewDay, Boolean(UNAVAILABLE[id]), ok, toMin(state.start), toMin(state.end)
    );
}

function renderDrawer() {
    const id = state.room;
    const body = dom.drawerBody;
    const scroll = body.scrollTop;
    const cell = ROOM_INDEX[id];
    const special = Boolean(cell.special);
    const info = special
        ? { type: cell.type, name: cell.name, ...(ROOM_INFO[id] || {}) }
        : { ...DEFAULT_INFO, ...(ROOM_INFO[id] || {}) };
    const code = id.replace("-", " ");
    const showCode = !(cell.hide);
    const prefix = id.split("-")[0];
    const day = state.viewDay;
    const ok = timeValid();
    const selS = toMin(state.start), selE = toMin(state.end);

    const res = ok ? getStatus(id, day, state.start, state.end) : null;
    const closedAllDay = Boolean(UNAVAILABLE[id]);
    const bookings = getBookings(id, day);

    const photo = info.photo
        ? `<img src="${esc(info.photo)}" alt="Photo of ${esc(info.name || code)}" decoding="async" onerror="this.parentNode.classList.add('empty');this.remove()">`
        : "";

    const availBlock = special
        ? `<div class="avail special"><span class="avail-label">Not reservable</span>
             <span class="avail-sub">This room is not open for scheduling.</span></div>`
        : `<div class="avail ${res ? res.status : ""}">
             <span class="avail-label">${res ? STATUS_LABEL[res.status] : "Pick a valid time"}</span>
             <span class="avail-sub">${availabilitySubtitle(day, bookings, res, selS, selE, ok)}</span>
           </div>`;

    const specs = [
        showCode ? `<div><dt>Room</dt><dd>${esc(code)}</dd></div>` : "",
        info.capacity ? `<div><dt>Capacity</dt><dd>${esc(info.capacity)} seats</dd></div>` : "",
        `<div><dt>Building</dt><dd>${BUILDINGS[prefix] || esc(prefix)}</dd></div>`,
        `<div><dt>Floor</dt><dd>${esc(cell.floor)}F</dd></div>`,
        info.type ? `<div class="wide"><dt>Type</dt><dd>${esc(info.type)}</dd></div>` : "",
    ].join("");

    const facilities = (info.facilities || []);
    const facilitiesBlock = facilities.length
        ? `<h3>Facilities</h3><div class="tags">${facilities.map((f) => `<span>${esc(f)}</span>`).join("")}</div>`
        : "";

    const scheduleBlock = special ? "" : `
            <h3>Schedule</h3>
            <div id="drawerSchedule">${buildScheduleInner(id, day, closedAllDay, ok, selS, selE)}</div>`;

    body.innerHTML = `
        <div class="photo ${info.photo ? "" : "empty"}">
            ${photo}
            <div class="ph"><b>${esc(showCode ? code : (info.name || ""))}</b><span>No photo taken yet :(</span></div>
            <button class="back" type="button" data-close>&larr; Back to map</button>
            <button class="close" type="button" data-close aria-label="Close">&times;</button>
        </div>

        <div class="drawer-content">
            <p class="eyebrow">${esc(showCode ? code : (BUILDINGS[prefix] || prefix) + " · " + cell.floor + "F")}</p>
            <h2>${esc(info.name || "Room " + code)}</h2>
            ${renderRoomActionButtons({
                roomId: id,
                roomCode: code,
                roomName: info.name || "Room " + code,
                special,
                unavailable: closedAllDay
            })}
            ${availBlock}
            <dl class="specs">${specs}</dl>
            ${facilitiesBlock}
            ${scheduleBlock}
        </div>`;
    body.scrollTop = scroll;
}

dom.drawerBody.addEventListener("click", (e) => {
    const d = e.target.closest("[data-day]");
    if (d) { state.viewDay = d.dataset.day; renderScheduleOnly(); return; }
    if (e.target.closest("[data-close]")) closeDrawer();
});

$("logoutBtn").addEventListener("click", () => {
    sessionStorage.removeItem("roomakLoggedIn");
    window.location.href = "login.html";
});

showFloor();