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