// w = relative width (default 1). Add floors 3 and 4 in the same shape.
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

// Details shown when a room is clicked. Unlisted rooms fall back to their id.
const ROOM_INFO = {
  "B2-212": { name: "Business Simulation Lab", type: "Laboratory", capacity: 40 },
  "B3-208": { name: "Lecture Room", type: "Lecture", capacity: 45 },
};

// Out-of-service rooms -> yellow, regardless of schedule.
const UNAVAILABLE = { "B2-205": "Under maintenance", "B3-206": "Aircon repair" };