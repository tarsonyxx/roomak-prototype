// data/rooms.js
// Each floor has a top row and a bottom row, listed left -> right.
// w = relative width (default 1). kind "fixed" = stairs, CR, etc. (not clickable).
// Add floors 3 and 4 in the same shape.
const FLOORS = {
  2: {
    top: [
      { kind: "fixed", label: "Stairs" },
      { id: "B2-212" }, { id: "B2-210" }, { id: "B2-208" },
      { id: "B2-206" }, { id: "B2-204" }, { id: "B2-202" },
      { kind: "fixed", label: "Stairs" },
      { id: "BW-202" },
      { kind: "fixed", label: "Stairs" },
      { id: "B3-212" }, { id: "B3-210" }, { id: "B3-208" },
      { id: "B3-206" }, { id: "B3-204" }, { id: "B3-202" },
      { kind: "fixed", label: "Stairs" },
    ],
    bottom: [
      { kind: "fixed", label: "CR" },
      { id: "B2-211" }, { id: "B2-209" },
      { id: "B2-207", w: 0.7 }, { kind: "fixed", label: "Stairs" },
      { id: "B2-205" }, { id: "B2-203" }, { id: "B2-201" },
      { kind: "fixed", label: "CR" },
      { id: "BW-201" },
      { kind: "fixed", label: "CR" },
      { id: "B3-211" }, { id: "B3-209" },
      { id: "B3-207", w: 0.7 }, { kind: "fixed", label: "Stairs" },
      { id: "B3-205" }, { id: "B3-203" }, { id: "B3-201" },
      { kind: "fixed", label: "CR" },
    ],
  },
};

// Used for any room that has no entry in ROOM_INFO. PLACEHOLDER values - replace with real data.
const DEFAULT_INFO = {
  type: "Lecture Room",
  capacity: 40,
  facilities: ["Air conditioning", "Whiteboard", "Wi-Fi"],
};

// Per-room details. Any field you leave out falls back to DEFAULT_INFO.
// photo: path to an image file (if missing, a "No photo yet" placeholder shows).
const ROOM_INFO = {
  "B2-212": {
    name: "Business Simulation Laboratory", type: "Laboratory", capacity: 40,
    facilities: ["Air conditioning", "Computers", "Projector", "Wi-Fi"],
    photo: "/assets/images/umak-sunset.jpg",   // stand-in photo - replace with a real one
  },
  "B3-209": { name: "CTHM Faculty Office", type: "Office", capacity: 10,
              facilities: ["Air conditioning", "Wi-Fi"] },
  "B3-208": { name: "Lecture Room 208", capacity: 45,
              facilities: ["Air conditioning", "Projector", "Whiteboard", "Wi-Fi"] },
};

// Out-of-service rooms -> yellow, regardless of schedule.
const UNAVAILABLE = { "B2-205": "Under maintenance", "B3-206": "Aircon repair" };