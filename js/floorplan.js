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

// Pre-index schedules per room for O(1) lookup instead of scanning all SCHEDULES.
const ROOM_SCHEDULES = Object.create(null);
if (typeof SCHEDULES !== "undefined") {
  for (const s of SCHEDULES) {
    (ROOM_SCHEDULES[s.roomId] || (ROOM_SCHEDULES[s.roomId] = [])).push(s);
  }
}

function getStatus(roomId, day, start, end) {
  const room = ROOM_INDEX[roomId];
  if (room && room.special) return { status: "special", reason: room.name };
  if (UNAVAILABLE[roomId]) return { status: "unavailable", reason: UNAVAILABLE[roomId] };
  const list = ROOM_SCHEDULES[roomId];
  if (!list) return { status: "available" };
  const sMin = toMin(start), eMin = toMin(end);
  const clash = list.find((s) =>
    s.day === day && overlaps(toMin(s.start), toMin(s.end), sMin, eMin));
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

// Staircase symbol: steps + a U-turn arrow showing the walking direction.
function drawStairs(g, x, y, w, h, dir) {
  const cx = x + w / 2, cy = y + h / 2;
  const ig = dir === "up" ? el("g", { transform: `rotate(180 ${cx} ${cy})` }, g) : g;
  const x1 = x + 4, x2 = x + w - 4;
  for (let yy = y + 10; yy <= y + h - 8; yy += 8.5) {
    el("line", { class: "icon icon-soft", x1, x2, y1: yy, y2: yy }, ig);
  }
  const dx = Math.min(11, w * 0.24), top = y + 16, bot = y + h - 16, r = 5;
  el("path", {
    class: "icon icon-bold",
    d: `M${cx - dx} ${bot + 4.8} V${top + r} Q${cx - dx} ${top} ${cx - dx + r} ${top} ` +
       `H${cx + dx - r} Q${cx + dx} ${top} ${cx + dx} ${top + r} V${bot - 0.2}`,
  }, ig);
  el("path", {
    class: "arrowhead",
    d: `M${cx + dx - 3.2} ${bot - 1.2} L${cx + dx + 3.2} ${bot - 1.2} L${cx + dx} ${bot + 4.8} Z`,
  }, ig);
}

// Restroom symbol: a divider with a small man and woman icon.
function drawRestroom(g, cx, cy) {
  el("line", { class: "icon icon-soft", x1: cx, x2: cx, y1: cy - 15, y2: cy + 15 }, g);
  el("circle", { class: "icon", cx: cx - 10, cy: cy - 11, r: 3 }, g);
  el("path", { class: "icon", d: `M${cx - 14} ${cy - 6} H${cx - 6} V${cy + 3} H${cx - 14} Z M${cx - 11.8} ${cy + 3} V${cy + 12} M${cx - 8.2} ${cy + 3} V${cy + 12}` }, g);
  el("circle", { class: "icon", cx: cx + 10, cy: cy - 11, r: 3 }, g);
  el("path", { class: "icon", d: `M${cx + 10} ${cy - 7} L${cx + 5} ${cy + 3} H${cx + 15} Z M${cx + 8.2} ${cy + 3} V${cy + 12} M${cx + 11.8} ${cy + 3} V${cy + 12}` }, g);
}

// Room text: number, then either the extra label (special rooms) or the status line.
function drawLabel(g, it, cx, cy, w) {
  const big = w < 45 ? 8.5 : w < 55 ? 9.5 : w < 80 ? 12 : 14.5;
  const small = w < 55 ? 7 : w < 80 ? 9.5 : 11.5;
  const lines = [];
  let subEl = null;

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
    if (l.c === "sub") subEl = t;
    yy += l.s * 1.35;
  }
  return subEl;
}

let cachedRooms = [];
let selectedRoomEl = null;

function drawRow(parent, items, y, h) {
  let x = 0;
  for (const it of items) {
    const isRoom = Boolean(it.id);
    const g = el("g", { class: isRoom ? "room" : "fixed" }, parent);
    el("rect", { x: x + INSET, y: y + INSET, width: it.w - INSET * 2, height: h - INSET * 2, rx: 6 }, g);
    if (it.kind === "stairs") drawStairs(g, x, y, it.w, h, it.dir);
    else if (it.kind === "cr") drawRestroom(g, x + it.w / 2, y + h / 2);
    else {
      const subEl = drawLabel(g, it, x + it.w / 2, y + h / 2, it.w);
      if (isRoom) {
        g.dataset.room = it.id;
        cachedRooms.push({ id: it.id, g, sub: subEl });
      }
    }
    x += it.w;
  }
}

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
  cachedRooms = [];
  selectedRoomEl = null;

  const frag = document.createDocumentFragment();
  const f = FLOORS[floor];
  const w = Math.max(rowWidth(f.top), rowWidth(f.bottom));
  drawBrackets(frag, f.top, w);
  el("rect", { class: "corridor", x: 0, y: TOP + f.rowH + 2, width: w, height: f.gap - 4, rx: 8 }, frag);
  drawRow(frag, f.top, TOP, f.rowH);
  drawRow(frag, f.bottom, TOP + f.rowH + f.gap, f.rowH);

  world.replaceChildren(frag);
  return { w, h: TOP + f.rowH * 2 + f.gap };
}

// Colors every room for the chosen time. Returns counts for the legend (reservable rooms only).
function applyTimeRange(world, day, start, end) {
  const counts = { available: 0, unavailable: 0, occupied: 0 };
  for (let i = 0; i < cachedRooms.length; i++) {
    const item = cachedRooms[i];
    const { status, reason } = getStatus(item.id, day, start, end);
    if (item.g.getAttribute("data-status") !== status) {
      item.g.setAttribute("data-status", status);
    }
    item.g.dataset.reason = reason || "";
    if (item.sub && item.sub.textContent !== STATUS_LABEL[status]) {
      item.sub.textContent = STATUS_LABEL[status];
    }
    if (status in counts) counts[status]++;
  }
  return counts;
}

function clearTimeRange(world) {
  for (let i = 0; i < cachedRooms.length; i++) {
    const item = cachedRooms[i];
    const room = ROOM_INDEX[item.id];
    const status = room && room.special ? "special" : "invalid";
    if (item.g.getAttribute("data-status") !== status) {
      item.g.setAttribute("data-status", status);
    }
    item.g.dataset.reason = "";
    if (item.sub && item.sub.textContent !== "") {
      item.sub.textContent = "";
    }
  }
}

function markSelected(world, roomId) {
  if (selectedRoomEl) {
    selectedRoomEl.classList.remove("selected");
    selectedRoomEl = null;
  }
  if (!roomId) return;
  for (let i = 0; i < cachedRooms.length; i++) {
    if (cachedRooms[i].id === roomId) {
      selectedRoomEl = cachedRooms[i].g;
      selectedRoomEl.classList.add("selected");
      break;
    }
  }
}

/* ---------- 3. Drag, pinch and wheel zoom ---------- */
function createPanZoom(viewport, world, onTap) {
  const pointers = new Map();
  const PAD = 48, MAX_K = 4;
  let plan = { w: 1, h: 1 };
  let k = 1, x = 0, y = 0;
  let travelled = 0;

  // Cache viewport bounding rect to prevent layout thrashing on pointermove / wheel.
  let vpRect = viewport.getBoundingClientRect();
  const syncRect = () => { vpRect = viewport.getBoundingClientRect(); return vpRect; };

  const fitK = () => (vpRect.width - 24) / plan.w;
  const limitK = (v) => Math.min(MAX_K, Math.max(fitK(), v));

  // Draw at most once per screen frame (phones send many touch events per frame).
  let queued = false;
  function apply() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      const pw = plan.w * k, ph = plan.h * k;
      // Keep the plan on screen: centered if small, otherwise stop at the edges.
      x = pw + 24 <= vpRect.width ? (vpRect.width - pw) / 2 : Math.min(PAD, Math.max(vpRect.width - pw - PAD, x));
      y = ph + 24 <= vpRect.height ? (vpRect.height - ph) / 2 : Math.min(PAD, Math.max(vpRect.height - ph - PAD, y));
      world.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${k.toFixed(4)})`);
    });
  }

  function zoomAt(newK, cx, cy) {
    newK = limitK(newK);
    x = cx - (cx - x) * (newK / k);
    y = cy - (cy - y) * (newK / k);
    k = newK;
    apply();
  }

  viewport.addEventListener("pointerdown", (e) => {
    viewport.setPointerCapture(e.pointerId);
    if (pointers.size === 0) {
      travelled = 0;
      syncRect();
    }
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    viewport.classList.add("grabbing");
  });

  viewport.addEventListener("pointermove", (e) => {
    const prev = pointers.get(e.pointerId);
    if (!prev) return;
    const cur = { x: e.clientX, y: e.clientY };

    if (pointers.size === 1) {
      const dx = cur.x - prev.x, dy = cur.y - prev.y;
      x += dx;
      y += dy;
      travelled += Math.hypot(dx, dy);
      apply();
    } else if (pointers.size === 2) {
      let other = null;
      for (const [id, pt] of pointers) {
        if (id !== e.pointerId) { other = pt; break; }
      }
      if (!other) return;
      const oldDist = Math.hypot(prev.x - other.x, prev.y - other.y) || 1;
      const newDist = Math.hypot(cur.x - other.x, cur.y - other.y) || 1;
      const oldMidX = (prev.x + other.x) * 0.5, oldMidY = (prev.y + other.y) * 0.5;
      const newMidX = (cur.x + other.x) * 0.5, newMidY = (cur.y + other.y) * 0.5;
      x += newMidX - oldMidX;
      y += newMidY - oldMidY;
      travelled += 100; // a two-finger gesture is never a tap
      zoomAt(k * (newDist / oldDist), newMidX - vpRect.left, newMidY - vpRect.top);
    }
    prev.x = cur.x;
    prev.y = cur.y;
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
    zoomAt(k * Math.exp(-e.deltaY * 0.0015), e.clientX - vpRect.left, e.clientY - vpRect.top);
  }, { passive: false });

  new ResizeObserver(() => {
    syncRect();
    apply();
  }).observe(viewport);

  return {
    // Start zoomed in a little, showing roughly 5-9 rooms.
    setPlan(dims) {
      plan = dims;
      syncRect();
      const rooms = vpRect.width >= 700 ? 9 : 4.5;
      k = limitK(vpRect.width / (UNIT * rooms));
      x = PAD; y = 0;
      apply();
    },
    zoomIn()  { syncRect(); zoomAt(k * 1.35, vpRect.width / 2, vpRect.height / 2); },
    zoomOut() { syncRect(); zoomAt(k / 1.35, vpRect.width / 2, vpRect.height / 2); },
    fit()     { syncRect(); k = fitK(); apply(); },
  };
}