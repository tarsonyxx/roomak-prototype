// data/schedules.js
// RooMak demo schedules
//
// Demo subjects:
// GENMATH  - General Mathematics
// GENSCI   - General Science
// PLKP     - Pag-aaral sa Likasan at Kasaysayan ng Pilipinas
// FIRST AID
// BFL      - Basic Financial Literacy
//
// Times use 24-hour format.
// Your class schedule is preserved at the exact rooms and times provided.

const SCHEDULES = [
  // =========================================================
  // YOUR CLASS SCHEDULE
  // These entries are kept exactly as specified.
  // =========================================================

  // MONDAY
  {
    id: 1,
    roomId: "B2-306",
    day: "Mon",
    start: "09:00",
    end: "12:00",
    activity: "CSS",
    faculty: "Prof. Domingo"
  },
  {
    id: 2,
    roomId: "B2-306",
    day: "Mon",
    start: "12:00",
    end: "13:30",
    activity: "RHGP",
    faculty: "Ms. Rapio"
  },

  // TUESDAY
  {
    id: 3,
    roomId: "B2-306",
    day: "Tue",
    start: "07:30",
    end: "10:30",
    activity: "CSS",
    faculty: "Prof. Domingo"
  },
  {
    id: 4,
    roomId: "B2-306",
    day: "Tue",
    start: "12:00",
    end: "15:00",
    activity: "FSD",
    faculty: "Ms. Suycano"
  },
  {
    id: 5,
    roomId: "B2-301",
    day: "Tue",
    start: "15:00",
    end: "18:00",
    activity: "Research 2",
    faculty: "Ms. Navalez"
  },

  // THURSDAY
  {
    id: 6,
    roomId: "B2-306",
    day: "Thu",
    start: "07:30",
    end: "09:00",
    activity: "RHGP",
    faculty: "Ms. Rapio"
  },
  {
    id: 7,
    roomId: "B2-306",
    day: "Thu",
    start: "09:00",
    end: "12:00",
    activity: "CSS",
    faculty: "Prof. Domingo"
  },

  // FRIDAY
  {
    id: 8,
    roomId: "B2-306",
    day: "Fri",
    start: "07:30",
    end: "10:30",
    activity: "CSS",
    faculty: "Prof. Domingo"
  },
  {
    id: 9,
    roomId: "B2-306",
    day: "Fri",
    start: "12:00",
    end: "15:00",
    activity: "FSD",
    faculty: "Ms. Suycano"
  },
  {
    id: 10,
    roomId: "B2-301",
    day: "Fri",
    start: "16:30",
    end: "19:30",
    activity: "Research 2",
    faculty: "Ms. Navalez"
  },

  // =========================================================
  // ADDITIONAL DEMO SCHEDULES
  // Distributed across the third floor.
  // =========================================================

  // MONDAY

  {
    id: 11,
    roomId: "B2-312",
    day: "Mon",
    start: "08:00",
    end: "10:00",
    activity: "GENMATH",
    faculty: "Prof. Santos"
  },
  {
    id: 12,
    roomId: "B2-310",
    day: "Mon",
    start: "10:00",
    end: "12:00",
    activity: "GENSCI",
    faculty: "Ms. Villanueva"
  },
  {
    id: 13,
    roomId: "B2-308",
    day: "Mon",
    start: "13:00",
    end: "15:00",
    activity: "PLKP",
    faculty: "Mr. Tabbu"
  },
  {
    id: 14,
    roomId: "B2-304",
    day: "Mon",
    start: "15:00",
    end: "17:00",
    activity: "FIRST AID",
    faculty: "Prof. Mendoza"
  },
  {
    id: 15,
    roomId: "B2-302",
    day: "Mon",
    start: "09:30",
    end: "11:00",
    activity: "BFL",
    faculty: "Ms. Garcia"
  },

  // TUESDAY

  {
    id: 16,
    roomId: "B3-312",
    day: "Tue",
    start: "07:30",
    end: "09:30",
    activity: "GENSCI",
    faculty: "Ms. Villanueva"
  },
  {
    id: 17,
    roomId: "B3-310",
    day: "Tue",
    start: "09:30",
    end: "11:30",
    activity: "PLKP",
    faculty: "Mr. Tabbu"
  },
  {
    id: 18,
    roomId: "B3-308",
    day: "Tue",
    start: "13:00",
    end: "15:00",
    activity: "FIRST AID",
    faculty: "Prof. Mendoza"
  },
  {
    id: 19,
    roomId: "B3-304",
    day: "Tue",
    start: "15:00",
    end: "17:00",
    activity: "BFL",
    faculty: "Ms. Garcia"
  },
  {
    id: 20,
    roomId: "BW-302",
    day: "Tue",
    start: "09:30",
    end: "11:00",
    activity: "GENMATH",
    faculty: "Prof. Santos"
  },

  // WEDNESDAY

  {
    id: 21,
    roomId: "B2-311",
    day: "Wed",
    start: "08:00",
    end: "10:00",
    activity: "GENMATH",
    faculty: "Prof. Santos"
  },
  {
    id: 22,
    roomId: "B2-309",
    day: "Wed",
    start: "10:00",
    end: "12:00",
    activity: "GENSCI",
    faculty: "Ms. Villanueva"
  },
  {
    id: 23,
    roomId: "BW-301",
    day: "Wed",
    start: "13:00",
    end: "15:00",
    activity: "PLKP",
    faculty: "Mr. Tabbu"
  },
  {
    id: 24,
    roomId: "B3-311",
    day: "Wed",
    start: "15:00",
    end: "17:00",
    activity: "FIRST AID",
    faculty: "Prof. Mendoza"
  },
  {
    id: 25,
    roomId: "B3-309",
    day: "Wed",
    start: "09:00",
    end: "11:00",
    activity: "BFL",
    faculty: "Ms. Garcia"
  },

  // THURSDAY

  {
    id: 26,
    roomId: "B3-305",
    day: "Thu",
    start: "08:00",
    end: "10:00",
    activity: "GENMATH",
    faculty: "Prof. Santos"
  },
  {
    id: 27,
    roomId: "B3-303",
    day: "Thu",
    start: "10:00",
    end: "12:00",
    activity: "GENSCI",
    faculty: "Ms. Villanueva"
  },
  {
    id: 28,
    roomId: "B3-301",
    day: "Thu",
    start: "13:00",
    end: "15:00",
    activity: "PLKP",
    faculty: "Mr. Tabbu"
  },
  {
    id: 29,
    roomId: "B2-312",
    day: "Thu",
    start: "15:00",
    end: "17:00",
    activity: "FIRST AID",
    faculty: "Prof. Mendoza"
  },
  {
    id: 30,
    roomId: "B2-310",
    day: "Thu",
    start: "13:00",
    end: "15:00",
    activity: "BFL",
    faculty: "Ms. Garcia"
  },

  // FRIDAY

  {
    id: 31,
    roomId: "B3-312",
    day: "Fri",
    start: "10:30",
    end: "12:00",
    activity: "GENMATH",
    faculty: "Prof. Santos"
  },
  {
    id: 32,
    roomId: "B3-310",
    day: "Fri",
    start: "08:30",
    end: "10:30",
    activity: "GENSCI",
    faculty: "Ms. Villanueva"
  },
  {
    id: 33,
    roomId: "B3-308",
    day: "Fri",
    start: "15:00",
    end: "17:00",
    activity: "PLKP",
    faculty: "Mr. Tabbu"
  },
  {
    id: 34,
    roomId: "B3-304",
    day: "Fri",
    start: "15:00",
    end: "16:30",
    activity: "FIRST AID",
    faculty: "Prof. Mendoza"
  },
  {
    id: 35,
    roomId: "BW-302",
    day: "Fri",
    start: "10:30",
    end: "12:00",
    activity: "BFL",
    faculty: "Ms. Garcia"
  }
];

// yeah no i cant do this i need a ui to handle allat