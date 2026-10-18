# RooMak Project Structure and File Responsibilities

## Overview

RooMak is a room scheduling and management system intended to help University of Makati (UMak) faculty access room information, view schedules, and identify suitable rooms.

This document defines the intended responsibilities of each file and folder in the project. The purpose is to keep the code organized as RooMak develops from a prototype into a more complete application.

The structure separates page layouts, visual styling, application logic, data, static assets, and project documentation.

## 1. Project Directory Structure

```text
RooMak/
├── index.html
├── pages/
│   ├── dashboard.html
│   ├── floorplan.html
│   └── schedule.html
│
├── css/
│   ├── base.css
│   ├── components.css
│   └── pages/
│       ├── login.css
│       ├── dashboard.css
│       ├── floorplan.css
│       └── schedule.css
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
├── assets/
│   ├── screenshots/
│   └── images/
│
├── README.md
└── .gitignore
```

## 2. HTML Files

HTML files define the structure and content of each page. They contain elements such as headings, forms, buttons, navigation menus, tables, and other interface components.

### `index.html`

**Purpose:** Login page and main entry point.

This is the page users encounter when they first open RooMak. It contains the login form, email and password fields, sign-in button, and branding.

Responsibilities:
- Present the login interface.
- Collect the user's login credentials.
- Load the necessary CSS and JavaScript files.
- Redirect users after successful authentication.
- Provide the initial entry point to the application.

Authentication must eventually be connected to a backend or trusted authentication provider. The frontend alone cannot verify credentials securely.

### `pages/dashboard.html`

**Purpose:** Main dashboard.

This is the primary page users see after signing in.

Potential features:
- Overview of room availability.
- Summary of room and schedule information.
- Quick links to the floor plan and schedule viewer.
- Relevant announcements or system information.
- Shortcuts to commonly used functions.

The dashboard should provide a convenient overview rather than duplicate every function of the other pages.

### `pages/floorplan.html`

**Purpose:** Room and floor plan viewer.

This page presents rooms according to their physical locations within UMak buildings.

Potential features:
- Building and floor selection.
- Visual representation of rooms.
- Room selection and detail panels.
- Room identifiers and locations.
- Facility information, such as air-conditioning availability and seating capacity.
- Relevant schedule and availability information.

The final implementation will depend on the room information and floor plans available from UMak.

### `pages/schedule.html`

**Purpose:** Schedule viewer.

This page displays room usage and scheduling information in an organized timetable or calendar-like interface.

Potential features:
- Daily and weekly timetable views.
- Room-based schedule filtering.
- Day and time filters.
- Class or activity details.
- Assigned faculty information, where appropriate.
- Identification of occupied and available time slots.

The interface should reflect RooMak's intended scheduling workflow. If the system primarily supports faculty room assignments at the beginning of an academic year, that workflow should take priority over features designed exclusively for one-time room reservations.

## 3. CSS Files

CSS files control the appearance of the website, including colors, typography, spacing, layouts, borders, and responsive behavior.

### Shared Stylesheets

#### `css/base.css`

**Purpose:** Global design foundation.

Contains styles and design variables shared throughout RooMak.

Responsibilities:
- CSS variables for colors and spacing.
- Typography defaults.
- Basic element resets.
- Global box-sizing rules.
- Default page and body styling.
- Shared responsive foundations.

For example, RooMak's primary color can be defined as a CSS variable here and reused throughout the application.

#### `css/components.css`

**Purpose:** Reusable interface component styles.

Contains the visual styling of elements that appear on multiple pages.

Examples:
- Buttons.
- Form inputs.
- Navigation bars.
- Cards.
- Status badges.
- Dialogs and modal windows.
- Reusable interface controls.

Shared components should be defined here so that common elements maintain a consistent appearance throughout RooMak.

### Page-Specific Stylesheets

#### `css/pages/login.css`

**Purpose:** Login page styling.

Contains styles specific to the login interface.

Examples:
- Login card layout.
- Branding panel.
- Login form positioning.
- Room availability preview.
- Login-specific spacing and responsive behavior.

#### `css/pages/dashboard.css`

**Purpose:** Dashboard styling.

Contains the layout and appearance of dashboard-specific elements.

Examples:
- Overview cards.
- Summary sections.
- Dashboard widgets.
- Dashboard-specific grids and layouts.

#### `css/pages/floorplan.css`

**Purpose:** Floor plan styling.

Contains styles for the room and floor plan interface.

Examples:
- Room layouts.
- Room labels.
- Floor selectors.
- Selected-room indicators.
- Room status colors.
- Room detail panels.

#### `css/pages/schedule.css`

**Purpose:** Schedule viewer styling.

Contains styles specific to the timetable and scheduling interface.

Examples:
- Timetable grids.
- Day and time headers.
- Schedule entries.
- Available and occupied time slots.
- Filter controls and schedule layouts.

### CSS Organization Principle

Shared styles belong in `base.css` or `components.css`, while page-specific layouts belong in the appropriate stylesheet under `css/pages/`.

For example, the general appearance of a button belongs in `components.css`. A full-width login button or a button positioned inside a schedule filter may require additional page-specific styling.

HTML pages should load shared stylesheets first and their page-specific stylesheet afterward.

Example for `index.html`:

```html
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/components.css">
<link rel="stylesheet" href="css/pages/login.css">
```

Example for `pages/dashboard.html`:

```html
<link rel="stylesheet" href="../css/base.css">
<link rel="stylesheet" href="../css/components.css">
<link rel="stylesheet" href="../css/pages/dashboard.css">
```

The `../` prefix moves up one directory before accessing the requested file.

## 4. JavaScript Files

JavaScript files implement the application's behavior and interactions. They connect user actions to application logic and data.

### `js/app.js`

**Purpose:** Shared application behavior.

Contains functionality used across multiple pages.

Potential responsibilities:
- Shared interface initialization.
- Common status messages and notifications.
- General navigation behavior.
- Shared UI utilities.
- Common application-wide behavior.

This file should not become a container for every feature in RooMak. Functionality specific to authentication, scheduling, or the floor plan should remain in the appropriate module.

### `js/auth.js`

**Purpose:** Authentication-related behavior.

Handles the frontend interactions associated with user authentication.

Responsibilities:
- Login form submission.
- Basic client-side form validation.
- Password visibility controls.
- Login and logout interactions.
- Authentication status checks.
- Redirects after successful authentication.
- Integration with a backend or authentication provider.

Client-side validation improves usability, but actual authentication and access permissions must be enforced by the backend.

The dashboard and other restricted pages must also verify that the user's session is valid. Redirecting from the login page alone does not protect those pages.

### `js/floorplan.js`

**Purpose:** Floor plan functionality.

Handles interactions and logic related to the room and floor plan interface.

Potential responsibilities:
- Selecting buildings and floors.
- Displaying room information.
- Responding to room selections.
- Updating room-status indicators.
- Retrieving the relevant room records.
- Displaying room details and facilities.

The module should obtain room information from the project's data source rather than maintaining a separate, inconsistent copy of the room records.

### `js/schedule.js`

**Purpose:** Scheduling interface functionality.

Handles the behavior of the schedule viewer.

Potential responsibilities:
- Rendering timetable entries.
- Filtering schedules by room, day, or time.
- Displaying class and room assignments.
- Updating the interface when filters change.
- Connecting schedule records to room information.
- Supporting room availability calculations where appropriate.

If availability calculations become complex, they may eventually be moved into a dedicated module so that the floor plan and schedule viewer can reuse the same logic.

### `js/storage.js`

**Purpose:** Data storage utilities.

Provides a consistent interface for reading and writing locally stored prototype data or user preferences.

Potential responsibilities:
- Saving interface preferences.
- Remembering the selected floor or schedule view.
- Reading and writing appropriate browser storage.
- Providing reusable storage functions.
- Handling missing or invalid stored values.

This file should not be responsible for authenticating users or deciding whether a room is officially available.

Browser storage is appropriate for certain preferences and local prototype data. Shared schedules and authoritative room assignments should eventually be managed through a backend or shared database.

## 5. Data Files

The `data/` directory contains the room and schedule records used by the prototype.

Keeping data separate from interface code makes the application easier to maintain. The same room records can be used by the dashboard, floor plan, and schedule viewer without duplicating the information in each page.

### `data/rooms.js`

**Purpose:** Room records.

Contains information describing the rooms managed by RooMak.

Potential fields:
- Room identifier.
- Room name or number.
- Building.
- Floor.
- Room type.
- Seating capacity.
- Available facilities.
- Air-conditioning information, if relevant.
- Other room characteristics gathered from UMak.

Illustrative record:

```javascript
{
    id: "ROOM-204",
    name: "Room 204",
    building: "Academic Building",
    floor: 2,
    capacity: 40,
    facilities: ["Air conditioning", "Projector"]
}
```

This example is illustrative and does not represent verified UMak room information.

### `data/schedules.js`

**Purpose:** Schedule records.

Contains sample class assignments, room assignments, or other room-usage records required by the prototype.

Potential fields:
- Schedule identifier.
- Room identifier.
- Day or date.
- Start time.
- End time.
- Subject or activity.
- Assigned faculty member, where appropriate.
- Academic term or school year, if required.

Illustrative record:

```javascript
{
    id: "SCHED-001",
    roomId: "ROOM-204",
    day: "Monday",
    startTime: "08:00",
    endTime: "09:30",
    activity: "Sample class"
}
```

The `roomId` field references the corresponding room record in `rooms.js`. This relationship allows RooMak to associate a schedule with a room without repeating the room's details in every schedule entry.

### Data Management Considerations

These JavaScript files are intended for prototype data. They are suitable for testing layouts, filters, and scheduling logic before the actual data source is available.

If multiple faculty members need to access or modify the same schedules, the authoritative records should eventually be stored in a shared backend database or scheduling system. Local JavaScript data files cannot provide reliable, synchronized updates across different users' browsers.

## 6. Assets

The `assets/` directory stores static resources used by the project.

### `assets/images/`

**Purpose:** Images displayed in the application.

Potential contents:
- RooMak logo.
- Building photographs.
- Floor plan images.
- Illustrations.
- Other visual resources used in the interface.

If the floor plan is implemented directly using HTML, CSS, or SVG, a static floor plan image may not be necessary. The implementation should depend on the available building information and the requirements of the project.

### `assets/screenshots/`

**Purpose:** Screenshots for documentation and development.

Potential contents:
- Login page screenshots.
- Dashboard screenshots.
- Floor plan previews.
- Schedule viewer screenshots.
- Prototype progress screenshots.

These screenshots can be referenced in the README, research documentation, presentations, and progress reports. They are generally documentation assets rather than resources required by the live interface.

## 7. Project Documentation and Git Configuration

### `README.md`

**Purpose:** Project documentation and onboarding guide.

The README explains what RooMak is, what problem it addresses, how its code is organized, and how developers can run and contribute to the prototype.

Recommended sections:

1. Project overview.
2. Problem statement.
3. Objectives.
4. Intended users.
5. Features and project scope.
6. Project directory structure.
7. Setup and usage instructions.
8. Technologies used.
9. Current implementation status.
10. Known limitations.
11. Team contributions, if applicable.

The README should help groupmates understand the project before they begin modifying the code.

It should also distinguish between implemented features, planned features, and features that require a backend.

### `.gitignore`

**Purpose:** Specifies which files Git should ignore.

This file prevents temporary, generated, machine-specific, or sensitive files from being committed to the repository.

Potential entries include:
- Operating-system-generated files.
- Editor-specific folders.
- Temporary files.
- Generated build output, if a build system is introduced.
- Dependency directories, if package management is added.
- Local environment configuration containing secrets.

The exact entries should depend on the tools RooMak actually uses. Files required to run the project should not be ignored.

Passwords, API secrets, and private production configuration should never be committed to the repository.

## 8. How the Application Components Work Together

The following example illustrates how the different files can cooperate when a faculty member selects a room.

1. `pages/floorplan.html` provides the room-selection interface.
2. `js/floorplan.js` handles the selection and requests the corresponding room information.
3. `data/rooms.js` supplies the prototype room record.
4. The interface displays the room's details, facilities, and location.
5. If schedule information is required, the application retrieves the relevant records from the schedule data source.
6. `js/schedule.js` or a shared scheduling module provides the appropriate schedule information.
7. CSS controls how the room details and schedule are displayed.

As the application grows, common data-access operations and availability calculations can be extracted into dedicated modules when necessary. The existing structure does not require every module to communicate directly with every other module.

## 9. Architectural Principles

### Separation of Responsibilities

Each file should have a clear purpose.

- HTML defines the page structure.
- CSS defines the visual presentation.
- JavaScript implements interactions and application logic.
- Data files provide prototype records.
- Assets contain static resources.
- Documentation explains the project.
- Git configuration controls which files are tracked.

### Reuse Shared Components

Common interface elements should be implemented consistently across the application. Shared CSS and reusable JavaScript utilities help reduce duplication.

### Keep Data Separate from Presentation

Room names, facilities, and schedule records should come from the data source. Their appearance belongs in CSS, while the logic connecting records to the interface belongs in JavaScript.

### Protect Shared Scheduling Data

Prototype data can be stored locally while the group develops the interface. A real multi-user scheduling system will need a shared backend, suitable permissions, and reliable data validation.

The backend should be responsible for enforcing access permissions and validating scheduling changes. It should also prevent conflicting room assignments when the project's requirements call for exclusive room allocation.

### Add Complexity Only When Needed

New modules should be introduced when they have a clear responsibility. The project does not need empty files or unnecessary abstractions simply to appear more sophisticated.

Potential future additions include:
- API communication modules.
- Availability calculation utilities.
- Room filtering modules.
- User profile functionality.
- Administrative interfaces.
- Backend and database components.

These additions should follow the actual requirements gathered during development.

## 10. Summary

RooMak's structure is designed to keep the project manageable as its functionality expands.

The root `index.html` serves as the entry point. The `pages/` directory contains the main application screens. Shared and page-specific stylesheets organize the visual design. JavaScript modules separate authentication, floor plan interactions, scheduling, and storage. The `data/` directory supplies prototype room and schedule records, while `assets/` stores images and documentation screenshots.

The README and Git configuration support collaboration and project maintenance.

The guiding principle is to identify whether a new feature belongs to the page structure, visual styling, interaction logic, or data layer before deciding where to implement it. This will make RooMak easier to maintain, test, and divide among group members as the prototype develops.