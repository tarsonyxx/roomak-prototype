// js/floorplan.js  -- status logic, floor drawing, and drag / pinch / zoom.

/* ---------- 1. Availability logic ---------- */
const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const overlaps = (aS, aE, bS, bE) => aS < bE && bS < aE;
const STATUS_LABEL = { available: "Available", unavailable: "Unavailable", occupied: "In use" };

function getStatus(roomId, day, start, end) {
  if (UNAVAILABLE[roomId]) return { status: "unavailable", reason: UNAVAILABLE[roomId] };
  const clash = SCHEDULES.find((s) =>
    s.roomId === roomId && s.day === day &&
    overlaps(toMin(s.start), toMin(s.end), toMin(start), toMin(end)));
  return clash ? { status: "occupied", reason: clash.activity } : { status: "available" };
}

/* ---------- 2. Drawing a floor ---------- */
const NS = "http://www.w3.org/2000/svg";
const ROW_H = 120, GAP = 56, UNIT = 96, INSET = 3;

function el(name, attrs, parent) {
  const n = document.createElementNS(NS, name);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}

const rowWidth = (items) => items.reduce((sum, it) => sum + (it.w || 1) * UNIT, 0);

function drawRow(parent, items, y) {
  let x = 0;
  for (const it of items) {
    const w = (it.w || 1) * UNIT;
    const isRoom = Boolean(it.id);
    const narrow = w < UNIT * 0.9;
    const g = el("g", { class: isRoom ? "room" : "fixed" }, parent);
    if (isRoom) g.dataset.room = it.id;

    el("rect", { x: x + INSET, y: y + INSET, width: w - INSET * 2,
                 height: ROW_H - INSET * 2, rx: 12 }, g);

    const mid = { "text-anchor": "middle", "dominant-baseline": "middle" };
    const cx = x + w / 2, cy = y + ROW_H / 2;
    if (isRoom) {
      const name = el("text", { class: "name", x: cx, y: narrow ? cy : cy - 9, ...mid }, g);
      name.textContent = it.id.replace("-", " ");
      if (!narrow) el("text", { class: "sub", x: cx, y: cy + 16, ...mid }, g);
    } else {
      const label = el("text", { class: "name", x: cx, y: cy, ...mid }, g);
      label.textContent = it.label;
    }
    x += w;
  }
}

// Draws one floor inside the <g> "world". Returns the plan's size.
function drawFloor(world, floor) {
  while (world.firstChild) world.removeChild(world.firstChild);
  const f = FLOORS[floor];
  const w = Math.max(rowWidth(f.top), rowWidth(f.bottom));
  el("rect", { class: "corridor", x: 0, y: ROW_H + 10, width: w, height: GAP - 20, rx: 10 }, world);
  drawRow(world, f.top, 0);
  drawRow(world, f.bottom, ROW_H + GAP);
  return { w, h: ROW_H * 2 + GAP };
}

// Colors every room for the chosen time. Returns counts for the legend.
function applyTimeRange(world, day, start, end) {
  const counts = { available: 0, unavailable: 0, occupied: 0 };
  world.querySelectorAll(".room").forEach((g) => {
    const { status, reason } = getStatus(g.dataset.room, day, start, end);
    g.setAttribute("data-status", status);
    g.dataset.reason = reason || "";
    const sub = g.querySelector(".sub");
    if (sub) sub.textContent = STATUS_LABEL[status];
    counts[status]++;
  });
  return counts;
}

function markSelected(world, roomId) {
  world.querySelectorAll(".room").forEach((g) =>
    g.classList.toggle("selected", g.dataset.room === roomId));
}

/* ---------- 3. Drag, pinch and wheel zoom ---------- */
function createPanZoom(viewport, world, onTap) {
  const pointers = new Map();
  const PAD = 48, MAX_K = 2.5;
  let plan = { w: 1, h: 1 };
  let k = 1, x = 0, y = 0;
  let travelled = 0;

  const size = () => viewport.getBoundingClientRect();
  const fitK = () => size().width / (plan.w + PAD);
  const limitK = (v) => Math.min(MAX_K, Math.max(fitK(), v));

  function apply() {
    const r = size(), pw = plan.w * k, ph = plan.h * k;
    // Keep the plan on screen: centered if small, otherwise stop at the edges.
    x = pw + PAD * 2 <= r.width ? (r.width - pw) / 2 : Math.min(PAD, Math.max(r.width - pw - PAD, x));
    y = ph + PAD * 2 <= r.height ? (r.height - ph) / 2 : Math.min(PAD, Math.max(r.height - ph - PAD, y));
    world.setAttribute("transform", `translate(${x} ${y}) scale(${k})`);
  }

  function zoomAt(newK, cx, cy) {
    newK = limitK(newK);
    x = cx - (cx - x) * (newK / k);
    y = cy - (cy - y) * (newK / k);
    k = newK;
    apply();
  }

  const local = (e) => { const r = size(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };

  viewport.addEventListener("pointerdown", (e) => {
    viewport.setPointerCapture(e.pointerId);
    if (pointers.size === 0) travelled = 0;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    viewport.classList.add("grabbing");
  });

  viewport.addEventListener("pointermove", (e) => {
    const prev = pointers.get(e.pointerId);
    if (!prev) return;
    const cur = { x: e.clientX, y: e.clientY };

    if (pointers.size === 1) {
      x += cur.x - prev.x;
      y += cur.y - prev.y;
      travelled += Math.hypot(cur.x - prev.x, cur.y - prev.y);
      apply();
    } else if (pointers.size === 2) {
      const other = [...pointers.entries()].find(([id]) => id !== e.pointerId)[1];
      const r = size();
      const oldDist = Math.hypot(prev.x - other.x, prev.y - other.y) || 1;
      const newDist = Math.hypot(cur.x - other.x, cur.y - other.y) || 1;
      const oldMid = { x: (prev.x + other.x) / 2, y: (prev.y + other.y) / 2 };
      const newMid = { x: (cur.x + other.x) / 2, y: (cur.y + other.y) / 2 };
      x += newMid.x - oldMid.x;
      y += newMid.y - oldMid.y;
      travelled += 100; // a two-finger gesture is never a tap
      zoomAt(k * (newDist / oldDist), newMid.x - r.left, newMid.y - r.top);
    }
    pointers.set(e.pointerId, cur);
  });

  function release(e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    if (pointers.size === 0) viewport.classList.remove("grabbing");
    // Finger/mouse barely moved = a tap, not a drag.
    if (e.type === "pointerup" && pointers.size === 0 && travelled < 8) {
      const hit = document.elementFromPoint(e.clientX, e.clientY);
      onTap(hit ? hit.closest(".room") : null);
    }
  }
  viewport.addEventListener("pointerup", release);
  viewport.addEventListener("pointercancel", release);

  viewport.addEventListener("wheel", (e) => {
    e.preventDefault();
    const p = local(e);
    zoomAt(k * Math.exp(-e.deltaY * 0.0015), p.x, p.y);
  }, { passive: false });

  new ResizeObserver(apply).observe(viewport);

  return {
    // Start zoomed in a little, showing roughly 5-9 rooms.
    setPlan(dims) {
      plan = dims;
      const rooms = size().width >= 700 ? 9 : 4.5;
      k = limitK(size().width / (UNIT * rooms));
      x = PAD; y = 0;
      apply();
    },
    zoomIn()  { const r = size(); zoomAt(k * 1.35, r.width / 2, r.height / 2); },
    zoomOut() { const r = size(); zoomAt(k / 1.35, r.width / 2, r.height / 2); },
    fit()     { k = fitK(); apply(); },
  };
}