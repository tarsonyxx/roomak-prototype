// data/rooms.js
//
// FLOOR LAYOUT -- measured from the floor plan SVG (all widths are in the same units,
// so the map keeps the exact proportions of the drawing).
// Each floor has a "top" row and a "bottom" row, listed left -> right.
//
//   R(id, width)                      normal room        -> reservable (green / yellow / red)
//   X(id, width, tag, name, type)     special room       -> NOT reservable (grey)
//   ST(width, "down" | "up")          stairs
//   CR(width)                         restrooms
//
// To make a special room reservable, change its X(...) into R("ID", width).
// To make a normal room non-reservable, change its R(...) into X(...).

const R  = (id, w) => ({ id, w });
const X  = (id, w, tag, name, type, hide) => ({ id, w, special: true, tag, name, type, hide: Boolean(hide) });
const ST = (w, dir) => ({ kind: "stairs", w, dir: dir || "down" });
const CR = (w) => ({ kind: "cr", w });

const FLOORS = {
  2: {
    rowH: 79.6, gap: 48.7,
    top: [
      ST(59.1), R("B2-212", 99.0), R("B2-210", 99.4),
      R("B2-208", 99.0), R("B2-206", 99.0), R("B2-204", 98.6),
      R("B2-202", 98.4), ST(60.6), R("BW-202", 97.7),
      ST(59.7), R("B3-212", 99.0), R("B3-210", 99.0),
      R("B3-208", 99.0), R("B3-206", 99.0), R("B3-204", 99.0),
      R("B3-202", 99.0), ST(58.6),
    ],
    bottom: [
      CR(58.6), R("B2-211", 98.4), R("B2-209", 99.3),
      X("B2-207", 42.3, "HSU\nREG.", "Higher School ng UMak Registrar", "Registrar's Office"), ST(58.4), R("B2-205", 98.0),
      R("B2-203", 99.3), R("B2-201", 98.0), CR(60.7),
      R("BW-201", 98.0), CR(59.6), X("B3-211", 98.4, "DEAN CTHM", "Dean CTHM", "Dean's Office"),
      X("B3-209", 99.6, "DEAN CTHM", "Dean CTHM", "Dean's Office"), X("B3-207", 40.0, "CTHM\nFaculty", "CTHM Faculty", "Faculty Office"), ST(58.7),
      R("B3-205", 98.0), R("B3-203", 99.0), R("B3-201", 99.0),
      CR(59.8),
    ],
  },
  3: {
    rowH: 79.6, gap: 48.5,
    top: [
      ST(59.3), R("B2-312", 99.0), R("B2-310", 99.0),
      R("B2-308", 99.2), R("B2-306", 99.1), R("B2-304", 98.7),
      R("B2-302", 98.3), ST(60.4), R("BW-302", 97.6),
      ST(59.7), R("B3-312", 99.0), R("B3-310", 99.0),
      R("B3-308", 99.3), R("B3-306", 99.0), R("B3-304", 99.0),
      R("B3-302", 98.9), ST(58.6),
    ],
    bottom: [
      CR(58.8), R("B2-311", 98.3), R("B2-309", 99.0),
      X("B2-307", 42.5, "HSU\nREG.", "Higher School ng UMak Registrar", "Registrar's Office"), ST(58.5), X("B2-305", 97.7, "HSU\nREGISTRAR", "Higher School ng UMak Registrar", "Registrar's Office"),
      X("B2-303", 49.8, "CITE\nOFF.", "CITE Office", "Office"), X("B2-AREA3", 49.9, "Area coor\noffice", "Area Coordinator Office", "Office", true), R("B2-301", 97.6),
      CR(60.7), R("BW-301", 98.0), CR(59.7),
      R("B3-311", 98.3), R("B3-309", 99.8), X("B3-307", 39.9, "FACULTY\nLOUNGE", "Faculty Lounge", "Lounge"),
      ST(59.0), R("B3-305", 97.8), R("B3-303", 99.2),
      R("B3-301", 99.0), CR(59.6),
    ],
  },
  4: {
    rowH: 79.5, gap: 48.6,
    top: [
      ST(59.3), X("B2-410", 198.0, "AVR", "Audio Visual Room (AVR)", "Audio Visual Room"), R("B2-408", 99.0),
      R("B2-406", 99.0), R("B2-404", 98.8), X("B2-402", 98.5, "NROTC", "NROTC", "Office"),
      ST(60.4), R("BW-402", 97.6), ST(59.7),
      R("B3-416", 99.0), R("B3-414", 99.0), R("B3-412", 103.3),
      R("B3-410", 94.9), R("B3-408", 49.8), R("B3-406", 49.3),
      R("B3-404", 49.4), R("B3-402", 49.3), ST(58.8),
    ],
    bottom: [
      CR(59.0), R("B2-411", 98.3), R("B2-409", 99.0),
      X("B2-407", 42.5, "HSU\nREG.", "Higher School ng UMak Registrar", "Registrar's Office"), ST(58.5, "up"), X("B2-405", 97.7, "HSU\nREGISTRAR", "Higher School ng UMak Registrar", "Registrar's Office"),
      X("B2-403", 99.5, "CITE\nOFF.", "CITE Office", "Office"), R("B2-401", 97.8), CR(60.7),
      R("BW-401", 98.0), CR(59.7), R("B3-415", 98.3),
      R("B3-413", 99.7), X("B3-411", 138.3, "FACULTY LOUNGE\nISDNB", "Faculty Lounge (ISDNB)", "Lounge"), ST(58.5, "up"),
      R("B3-407", 49.8), R("B3-405", 49.2), R("B3-403", 49.5),
      R("B3-401", 49.3), CR(59.9),
    ],
  },
};

// Used for any NORMAL room that has no entry in ROOM_INFO. PLACEHOLDER values - replace with real data.
const DEFAULT_INFO = {
  type: "Lecture Room",
  capacity: 40,
  facilities: ["Air conditioning", "Whiteboard", "UMAK Wi-Fi"],
};

// Per-room details. Any field you leave out falls back to DEFAULT_INFO.
// photo: path to an image file (if missing, a "No photo yet" placeholder shows).
const ROOM_INFO = {
  "B2-306": {
    capacity: 40,
    facilities: ["Whiteboard", "Wi-Fi"],
    photo: "../assets/images/classroom_base.jpg",   // stand-in photo - replace with a real one
  }
};

// Out-of-service rooms -> yellow, regardless of schedule.
// Out-of-service rooms -> yellow, regardless of schedule.
const UNAVAILABLE = {
  "B2-310": "Under maintenance",
  "B3-206": "Aircon repair",
  "B2-204": "Electrical maintenance",
  "B3-412": "Ceiling repairs",
};