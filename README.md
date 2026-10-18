
![thumbnail](/screenshots/thumbnail.png)

>[!Important]
>
>This repository is for a student research project: A proposed web-based room scheduling and information system for the University of Makati (UMak).
>
> ## About
>
>RooMak aims to make room-related information and processes easier to access in one place. The prototype is being developed to demonstrate how users could find rooms, view room details, check schedules, submit reservation requests, and report room-related concerns.
>
>This is an early prototype that is expected to be built atleast within a two-week development period. It is intended to demonstrate the main interface and workflows for the sake of research, not to serve as a production system for UMak.
>
>Prototype built by the following student(s) from 12-01 ICT:
> - Wilson B. Ube \- Main Developer
>
>Other Contributors:
> - Work in Progress

# Screenshots

![roomak initial image prototype](/screenshots/login-ss.png)

> very very very early images btw. nothing functional nor anything further than what you see here. it is a BASE. give me some time will ya
> \-Wilson

## Planned Features

- **Room Finder** — Browse rooms by building and floor, and view their displayed availability.
- **Room Information** — View details such as room capacity, facilities, air-conditioning, connectivity notes, and reported issues.
- **Scheduling and Reservations** — View sample schedules and submit room reservation requests.
- **Room Reports** — Record issues associated with a particular room.
- **Role-Based Views** — Demonstrate the different functions intended for students, faculty, and authorized administrators.

Features may be simplified or simulated to fit the prototype's development timeline.

## Technology

The initial prototype is planned to use:

- HTML for page structure
- CSS for styling and layout
- JavaScript for interface behavior and prototype logic
- Browser `localStorage` for saving demonstration data locally, if needed

The initial version does not provide shared, multi-user data storage or real-time room occupancy information. Any sample room details and schedules are for demonstration unless verified separately.

## How to Run Locally

1. Clone or download this repository.
2. Open `index.html` in a web browser.
3. No internet connection is required for the basic prototype, provided its files and assets are stored locally.

## Expected Project Structure

```text
RooMak/
├── index.html
├── README.md
├── .gitignore
│
├── css/
│   └── style.css
│
├── js/
│   ├── app.js
│   ├── auth.js
│   ├── floorplan.js
│   ├── schedule.js
│   └── storage.js
│
├── data/
│   ├── rooms.js
│   └── schedules.js
│
└── assets/
    ├── images/
    └── floorplans/
        ├── campus.svg
        ├── b2-ground.svg
        ├── b2-second.svg
        ├── b2-third.svg
        ├── b2-fourth.svg
        └── ...
```

Additional files and folders may be added as the prototype develops.

## Project Status

**Status:** Initial setup / very early prototype

The interface and features are still under development. The current repository may not yet contain all planned functionality.

