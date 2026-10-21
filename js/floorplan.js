// js/floorplan.js  -- status logic, floor drawing (with icons), and drag / pinch / zoom.

/* ---------- 1. Availability logic ---------- */
const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const overlaps = (aS, aE, bS, bE) => aS < bE && bS < aE;
const STATUS_LABEL = {
  available: "Available", unavailable: "Unavailable", occupied: "In use", special: "Not reservable",
};

// Look-up of every room by id (built from FLOORS in rooms.js).
const ROOM_INDEX = {};
Object.keys(FLOORS).forEach((f) => ["top", "bottom"].forEach((row) =>
  FLOORS[f][row].forEach((c) => { if (c.id) ROOM_INDEX[c.id] = { ...c, floor: f }; })));

function getStatus(roomId, day, start, end) {
  const room = ROOM_INDEX[roomId];
  if (room && room.special) return { status: "special", reason: room.name };
  if (UNAVAILABLE[roomId]) return { status: "unavailable", reason: UNAVAILABLE[roomId] };
  const clash = SCHEDULES.find((s) =>
    s.roomId === roomId && s.day === day &&
    overlaps(toMin(s.start), toMin(s.end), toMin(start), toMin(end)));
  return clash ? { status: "occupied", reason: clash.activity } : { status: "available" };
}

/* ---------- 2. Drawing a floor ---------- */
const NS = "http://www.w3.org/2000/svg";
const UNIT = 99;       // width of a standard room (used for the starting zoom)
const INSET = 1.5;     // tiny gap between tiles so they don't touch

function el(name, attrs, parent) {
  const n = document.createElementNS(NS, name);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}

const rowWidth = (items) => items.reduce((sum, it) => sum + it.w, 0);

// Stairs symbol: step lines + a U-shaped path with an arrow.
function drawStairs(g, x, y, w, h, dir) {
  const cx = x + w / 2, cy = y + h / 2;
  for (let yy = y + 10; yy <= y + h - 8; yy += 8.5)
    el("line", { class: "icon icon-soft", x1: x + 4, x2: x + w - 4, y1: yy, y2: yy }, g);
  const x1 = x + w * 0.3, x2 = x + w * 0.68, top = y + h * 0.2, bot = y + h * 0.86, r = 5;
  const wrap = el("g", dir === "up" ? { transform: `rotate(180 ${cx} ${cy})` } : {}, g);
  el("path", { class: "icon icon-bold",
    d: `M${x1} ${bot} V${top + r} Q${x1} ${top} ${x1 + r} ${top} H${x2 - r} Q${x2} ${top} ${x2} ${top + r} V${bot - 5}` }, wrap);
  el("path", { class: "arrowhead", d: `M${x2 - 3.2} ${bot - 6} L${x2 + 3.2} ${bot - 6} L${x2} ${bot} Z` }, wrap);
}

// Restroom symbol: man | woman.
function drawRestroom(g, cx, cy) {
  el("line", { class: "icon icon-soft", x1: cx, x2: cx, y1: cy - 15, y2: cy + 15 }, g);
  const man = cx - 10, woman = cx + 10;
  el("circle", { class: "icon", cx: man, cy: cy - 11, r: 3 }, g);
  el("path", { class: "icon", d: `M${man - 4} ${cy - 6} H${man + 4} V${cy + 3} H${man - 4} Z M${man - 1.8} ${cy + 3} V${cy + 12} M${man + 1.8} ${cy + 3} V${cy + 12}` }, g);
  el("circle", { class: "icon", cx: woman, cy: cy - 11, r: 3 }, g);
  el("path", { class: "icon", d: `M${woman} ${cy - 7} L${woman - 5} ${cy + 3} H${woman + 5} Z M${woman - 1.8} ${cy + 3} V${cy + 12} M${woman + 1.8} ${cy + 3} V${cy + 12}` }, g);
}

// Room text: number, then either the extra label (special rooms) or the status line.
function drawLabel(g, it, cx, cy, w) {
  const big = w < 45 ? 8.5 : w < 55 ? 9.5 : w < 80 ? 12 : 14.5;
  const small = w < 55 ? 7 : w < 80 ? 9.5 : 11.5;
  const lines = [];
  if (it.special) {
    if (!it.hide) lines.push({ t: it.id.replace("-", " "), s: big, c: "name" });
    it.tag.split("\n").forEach((t) => lines.push({ t, s: it.hide ? big * 0.85 : (w >= 80 ? big * 0.9 : small), c: "tag" }));
  } else {
    lines.push({ t: it.id.replace("-", " "), s: big, c: "name" });
    if (w >= 70) lines.push({ t: "", s: small, c: "sub" });
  }
  const total = lines.reduce((sum, l) => sum + l.s * 1.35, 0);
  let yy = cy - total / 2;
  for (const l of lines) {
    const t = el("text", { class: l.c, x: cx, y: yy + (l.s * 1.35) / 2,
                           "text-anchor": "middle", "dominant-baseline": "middle" }, g);
    t.style.fontSize = l.s + "px";
    t.textContent = l.t;
    yy += l.s * 1.35;
  }
}

function drawRow(parent, items, y, h) {
  let x = 0;
  for (const it of items) {
    const isRoom = Boolean(it.id);
    const g = el("g", { class: isRoom ? "room" : "fixed" }, parent);
    if (isRoom) g.dataset.room = it.id;
    el("rect", { x: x + INSET, y: y + INSET, width: it.w - INSET * 2, height: h - INSET * 2, rx: 6 }, g);
    if (it.kind === "stairs") drawStairs(g, x, y, it.w, h, it.dir);
    else if (it.kind === "cr") drawRestroom(g, x + it.w / 2, y + h / 2);
    else drawLabel(g, it, x + it.w / 2, y + h / 2, it.w);
    x += it.w;
  }
}

// Draws one floor inside the <g> "world". Returns the plan's size.
const TOP = 36;   // space above the rows for the building brackets

// Brackets above the plan: Building 2 | Bridgeway | Building 3.
function drawBrackets(world, items, total) {
  const i = items.findIndex((c) => c.id && c.id.startsWith("BW-"));
  if (i < 1) return;
  const starts = [];
  let x = 0;
  items.forEach((c) => { starts.push(x); x += c.w; });
  const bwEnd = starts[i + 1] + items[i + 1].w;     // stairs + BW room + stairs
  const regions = [
    { label: "BUILDING 2 (B2)", x1: 0, x2: starts[i - 1] },
    { label: "BRIDGEWAY (BW)", x1: starts[i - 1], x2: bwEnd },
    { label: "BUILDING 3 (B3)", x1: bwEnd, x2: total },
  ];
  regions.forEach((r) => {
    const y = TOP - 10;
    el("path", { class: "region-line", d: `M${r.x1 + 3} ${y + 6} V${y} H${r.x2 - 3} V${y + 6}` }, world);
    const t = el("text", { class: "region-label", x: (r.x1 + r.x2) / 2, y: y - 10,
                           "text-anchor": "middle", "dominant-baseline": "middle" }, world);
    t.textContent = r.label;
  });
}

// Draws one floor inside the <g> "world". Returns the plan's size.
function drawFloor(world, floor) {
  while (world.firstChild) world.removeChild(world.firstChild);
  const f = FLOORS[floor];
  const w = Math.max(rowWidth(f.top), rowWidth(f.bottom));
  drawBrackets(world, f.top, w);
  el("rect", { class: "corridor", x: 0, y: TOP + f.rowH + 2, width: w, height: f.gap - 4, rx: 8 }, world);
  drawRow(world, f.top, TOP, f.rowH);
  drawRow(world, f.bottom, TOP + f.rowH + f.gap, f.rowH);
  return { w, h: TOP + f.rowH * 2 + f.gap };
}

// Colors every room for the chosen time. Returns counts for the legend (reservable rooms only).
function applyTimeRange(world, day, start, end) {
  const counts = { available: 0, unavailable: 0, occupied: 0 };
  world.querySelectorAll(".room").forEach((g) => {
    const { status, reason } = getStatus(g.dataset.room, day, start, end);
    g.setAttribute("data-status", status);
    g.dataset.reason = reason || "";
    const sub = g.querySelector(".sub");
    if (sub) sub.textContent = STATUS_LABEL[status];
    if (status in counts) counts[status]++;
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
  const PAD = 48, MAX_K = 4;
  let plan = { w: 1, h: 1 };
  let k = 1, x = 0, y = 0;
  let travelled = 0;

  const size = () => viewport.getBoundingClientRect();
  const fitK = () => (size().width - 24) / plan.w;
  const limitK = (v) => Math.min(MAX_K, Math.max(fitK(), v));

  function apply() {
    const r = size(), pw = plan.w * k, ph = plan.h * k;
    // Keep the plan on screen: centered if small, otherwise stop at the edges.
    x = pw + 24 <= r.width ? (r.width - pw) / 2 : Math.min(PAD, Math.max(r.width - pw - PAD, x));
    y = ph + 24 <= r.height ? (r.height - ph) / 2 : Math.min(PAD, Math.max(r.height - ph - PAD, y));
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