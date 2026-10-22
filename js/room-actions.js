// Room request and issue-report dialogs for RooMak's room finder prototype.
// These records are stored in this browser only. They are not sent to a server.
(function () {
    "use strict";

    const dialog = document.getElementById("roomActionDialog");
    if (!dialog) return;

    const REQUESTS_KEY = "roomakRoomRequests";
    const REPORTS_KEY = "roomakRoomReports";
    const WEEKDAYS = [
        ["Mon", "Monday"], ["Tue", "Tuesday"], ["Wed", "Wednesday"],
        ["Thu", "Thursday"], ["Fri", "Friday"], ["Sat", "Saturday"],
    ];

    let activeRoom = null;

    const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[char]));

    function localDateInputValue(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function readRecords(key) {
        try {
            const value = JSON.parse(localStorage.getItem(key) || "[]");
            return Array.isArray(value) ? value : [];
        } catch (error) {
            console.warn(`RooMak could not read ${key} from local storage.`, error);
            return [];
        }
    }

    function saveRecord(key, record) {
        const records = readRecords(key);
        records.unshift(record);
        try {
            localStorage.setItem(key, JSON.stringify(records));
            return true;
        } catch (error) {
            console.error(`RooMak could not save ${key} to local storage.`, error);
            return false;
        }
    }

    function roomContextLabel() {
        return `${activeRoom.roomCode} · ${activeRoom.roomName}`;
    }

    function dialogHeader(title, description, eyebrow = "ROOM ACTION") {
        return `
            <header class="action-dialog-header">
                <div class="action-dialog-heading">
                    <p class="eyebrow">${escapeHtml(eyebrow)}</p>
                    <h2 id="roomActionDialogTitle">${escapeHtml(title)}</h2>
                    <p class="action-dialog-description">${escapeHtml(description)}</p>
                </div>
                <button type="button" class="action-dialog-close" data-dialog-close aria-label="Close dialog">&times;</button>
            </header>`;
    }

    function dialogRoomContext() {
        return `<div class="action-room-context"><span class="action-room-dot" aria-hidden="true"></span><span>${escapeHtml(roomContextLabel())}</span></div>`;
    }

    function renderRoomActionButtons({ roomId, roomCode, roomName, special, unavailable = false }) {
        const id = escapeHtml(roomId);
        const code = escapeHtml(roomCode);
        const name = escapeHtml(roomName);
        if (special || unavailable) return "";

  const requestDisabled = special || unavailable;
  const requestDisabledTitle = special
    ? "This space is not reservable"
    : "This room is unavailable for booking";
  const requestDisabledAttribute = requestDisabled
    ? `disabled title="${requestDisabledTitle}"`
    : "";
  const actionNote = special
    ? "This space is marked as non-reservable. Room issue reports are still available."
    : unavailable
      ? "This room is marked unavailable for booking. Room issue reports are still available."
      : "";
        return `
            <section class="room-actions" aria-label="Room actions">
                <p class="room-actions-heading">Room actions</p>
                <div class="room-actions-list">
                    <button type="button" class="room-action-button room-action-request"
                        data-room-action="request" data-room-id="${id}" data-room-code="${code}" data-room-name="${name}" data-room-unavailable="${unavailable ? "true" : "false"}"
                        ${requestDisabledAttribute}>
                        <span class="room-action-icon" aria-hidden="true">＋</span>
                        <span class="room-action-copy"><strong>Submit a request</strong><small>Request a time or recurring room assignment</small></span>
                        <span class="room-action-chevron" aria-hidden="true">›</span>
                    </button>
                    <button type="button" class="room-action-button room-action-report"
                        data-room-action="report" data-room-id="${id}" data-room-code="${code}" data-room-name="${name}" data-room-unavailable="${unavailable ? "true" : "false"}">
                        <span class="room-action-icon" aria-hidden="true">!</span>
                        <span class="room-action-copy"><strong>Report an issue</strong><small>View existing issues or report a new one</small></span>
                        <span class="room-action-chevron" aria-hidden="true">›</span>
                    </button>
                </div>
                ${actionNote ? `<p class="room-action-note">${actionNote}</p>` : ""}
            </section>`;
    }

    // dashboard.js calls this while rendering the selected room's drawer.
    window.renderRoomActionButtons = renderRoomActionButtons;

    function showDialog(markup, focusSelector) {
        dialog.innerHTML = markup;
        if (!dialog.open) dialog.showModal();
        const focusTarget = focusSelector ? dialog.querySelector(focusSelector) : null;
        if (focusTarget) focusTarget.focus();
    }

    function requestDialogMarkup() {
        const today = localDateInputValue();
        const weekdayOptions = WEEKDAYS.map(([value, label]) => `
            <label class="weekday-option"><input type="checkbox" name="days" value="${value}" data-day-checkbox><span>${label}</span></label>
        `).join("");

        return `
            <div class="action-dialog-shell">
                ${dialogHeader("Submit a room request", "Choose the requested time and duration, then add any details for the scheduler.", "SCHEDULE REQUEST")}
                <form id="roomRequestForm" class="action-form">
                    <div class="action-dialog-body">
                        ${dialogRoomContext()}
                        <div class="action-field-grid">
                            <label class="form-group action-field-full" for="requestPattern">
                                <span>Request type</span>
                                <select class="form-input" id="requestPattern" name="requestPattern" required>
                                    <option value="once">One-time use</option>
                                    <option value="recurring">Recurring schedule</option>
                                    <option value="ongoing">Long-term room assignment</option>
                                </select>
                            </label>
                            <section class="action-date-fields action-field-full" data-request-fields="once">
                                <label class="form-group" for="requestUseDate"><span>Date of use</span><input class="form-input" id="requestUseDate" name="useDate" type="date" min="${today}" data-required="true"></label>
                            </section>
                            <section class="action-date-fields action-field-full" data-request-fields="recurring" hidden>
                                <label class="form-group" for="requestRecurringStart"><span>First date</span><input class="form-input" id="requestRecurringStart" name="recurringStart" type="date" min="${today}" data-required="true"></label>
                                <label class="form-group" for="requestRecurringEnd"><span>Last date</span><input class="form-input" id="requestRecurringEnd" name="recurringEnd" type="date" min="${today}" data-required="true"></label>
                            </section>
                            <section class="action-date-fields action-field-full" data-request-fields="ongoing" hidden>
                                <label class="form-group" for="requestEffectiveDate"><span>Effective from</span><input class="form-input" id="requestEffectiveDate" name="effectiveDate" type="date" min="${today}" data-required="true"></label>
                                <label class="form-group" for="requestUntilDate"><span>End date <em>optional</em></span><input class="form-input" id="requestUntilDate" name="untilDate" type="date" min="${today}"></label>
                                <p class="action-field-help action-field-full">Leave the end date blank for an ongoing assignment until further notice.</p>
                            </section>
                            <label class="form-group" for="requestStartTime"><span>Start time</span><input class="form-input" id="requestStartTime" name="startTime" type="time" value="09:00" required></label>
                            <label class="form-group" for="requestEndTime"><span>End time</span><input class="form-input" id="requestEndTime" name="endTime" type="time" value="10:00" required></label>
                            <fieldset class="weekday-fieldset action-field-full" data-weekdays hidden>
                                <legend>Repeat on</legend>
                                <div class="weekday-options">${weekdayOptions}</div>
                            </fieldset>
                            <label class="form-group action-field-full" for="requestMessage">
                                <span>Message <em>optional</em></span>
                                <textarea class="form-input action-textarea" id="requestMessage" name="message" rows="3" maxlength="1200" placeholder="Add the class, subject, purpose, equipment needs, or other details."></textarea>
                            </label>
                        </div>
                        <p class="action-inline-feedback" data-form-feedback role="status" aria-live="polite"></p>
                    </div>
                    <footer class="action-dialog-footer">
                        <p class="action-footnote">Demo only. The request is saved in this browser and does not change the official schedule.</p>
                        <div class="action-footer-buttons"><button type="button" class="action-button-secondary" data-dialog-close>Cancel</button><button type="submit" class="action-button-primary">Submit request</button></div>
                    </footer>
                </form>
            </div>`;
    }

    /* ---------- Availability checks for requests ---------- */
    const OPEN_FROM = 7 * 60;    // same hours as the room timeline on the dashboard
    const OPEN_TO = 20 * 60;
    const DAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    const DAY_NAMES = { Sun: "Sunday", Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday" };
    let requestDraft = null;     // lets "Edit request" bring the form back exactly as it was

    const minutesOf = (time) => { const [h, m] = time.split(":").map(Number); return h * 60 + m; };
    const timeText = (min) => {
        const h = Math.floor(min / 60), m = min % 60;
        return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
    };
    const timeValue = (min) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
    const rangeText = (s, e) => `${timeText(s)} – ${timeText(e)}`;

    // The range the person picked on the dashboard (day tab in the drawer + start/end chips).
    function viewedRange() {
        try {
            if (typeof state !== "undefined" && state.start && state.end) {
                return { day: state.viewDay || state.day || "Mon", start: state.start, end: state.end };
            }
        } catch (error) { /* fall through to defaults */ }
        return { day: "Mon", start: "09:00", end: "10:00" };
    }

    function nextDateForDay(day) {
        const target = DAY_INDEX[day];
        const date = new Date();
        if (target === undefined) return localDateInputValue(date);
        date.setDate(date.getDate() + ((target - date.getDay() + 7) % 7));
        return localDateInputValue(date);
    }

    function weekdayOfDate(value) {
        if (!value) return null;
        return new Date(`${value}T12:00:00`).toLocaleDateString("en-US", { weekday: "short" });
    }

    // Returns a list of reasons the room cannot be used. An empty list means it is free.
    function findConflicts(roomId, days, startTime, endTime) {
        const problems = [];
        if (!startTime || !endTime) return problems;
        const s = minutesOf(startTime), e = minutesOf(endTime);
        if (e <= s) {
            problems.push({ kind: "range", text: "The end time must be later than the start time." });
            return problems;
        }
        if (s < OPEN_FROM || e > OPEN_TO) {
            problems.push({ kind: "hours", text: `Rooms can be requested between ${timeText(OPEN_FROM)} and ${timeText(OPEN_TO)}.` });
            return problems;
        }
        days.forEach((day) => {
            if (DAY_INDEX[day] === 0) {
                problems.push({ kind: "day", day, text: "Rooms are scheduled Monday to Saturday only." });
                return;
            }
            SCHEDULES.forEach((item) => {
                if (item.roomId !== roomId || item.day !== day) return;
                if (minutesOf(item.start) < e && s < minutesOf(item.end)) {
                    problems.push({
                        kind: "busy", day,
                        text: `${DAY_NAMES[day]} ${rangeText(minutesOf(item.start), minutesOf(item.end))} · ${item.activity}`,
                    });
                }
            });
        });
        return problems;
    }

    // Free windows of the same length on one day, so the person can pick one in a tap.
    function freeWindows(roomId, day, startTime, endTime) {
        const length = minutesOf(endTime) - minutesOf(startTime);
        if (length <= 0 || length > OPEN_TO - OPEN_FROM) return [];
        const busy = SCHEDULES
            .filter((item) => item.roomId === roomId && item.day === day)
            .map((item) => [minutesOf(item.start), minutesOf(item.end)])
            .sort((a, b) => a[0] - b[0]);
        const windows = [];
        let cursor = OPEN_FROM;
        const consider = (from, to) => {
            if (to - from >= length && windows.length < 4) windows.push([from, from + length]);
        };
        busy.forEach(([s, e]) => { consider(cursor, s); cursor = Math.max(cursor, e); });
        consider(cursor, OPEN_TO);
        return windows;
    }

    function draftDays(form) {
        const pattern = form.elements.requestPattern.value;
        if (pattern === "once") {
            const day = weekdayOfDate(form.elements.useDate.value);
            return day ? [day] : [];
        }
        return [...form.querySelectorAll("[data-day-checkbox]:checked")].map((input) => input.value);
    }

    function collectDraft(form) {
        const f = form.elements;
        return {
            pattern: f.requestPattern.value,
            useDate: f.useDate.value,
            recurringStart: f.recurringStart.value, recurringEnd: f.recurringEnd.value,
            effectiveDate: f.effectiveDate.value, untilDate: f.untilDate.value,
            days: [...form.querySelectorAll("[data-day-checkbox]:checked")].map((input) => input.value),
            startTime: f.startTime.value, endTime: f.endTime.value,
            message: f.message.value,
        };
    }

    function defaultDraft(range) {
        const date = nextDateForDay(range.day);
        return {
            pattern: "once", useDate: date, recurringStart: date, recurringEnd: "",
            effectiveDate: date, untilDate: "", days: [range.day],
            startTime: range.start, endTime: range.end, message: "",
        };
    }

    function applyDraft(form, draft) {
        const f = form.elements;
        f.requestPattern.value = draft.pattern;
        f.useDate.value = draft.useDate; f.recurringStart.value = draft.recurringStart;
        f.recurringEnd.value = draft.recurringEnd; f.effectiveDate.value = draft.effectiveDate;
        f.untilDate.value = draft.untilDate;
        f.startTime.value = draft.startTime; f.endTime.value = draft.endTime;
        f.message.value = draft.message;
        form.querySelectorAll("[data-day-checkbox]").forEach((input) => { input.checked = draft.days.includes(input.value); });
        updateRequestFields(form);
        checkAvailability(form);
    }

    // Live warning while the form is being edited. Submitting is still blocked by handleRequestSubmit.
    function checkAvailability(form) {
        const problems = findConflicts(activeRoom.roomId, draftDays(form), form.elements.startTime.value, form.elements.endTime.value);
        const target = form.querySelector("[data-form-feedback]");
        if (problems.length === 0) {
            if (target && target.dataset.live === "true") setFormFeedback(form, "");
            return problems;
        }
        setFormFeedback(form, problems[0].kind === "busy"
            ? "This room is not free at the selected time. Please choose another time."
            : problems[0].text);
        if (target) target.dataset.live = "true";
        return problems;
    }

    function showUnavailable(problems, draft, source) {
        const busy = problems.filter((item) => item.kind === "busy");
        const days = [...new Set(busy.map((item) => item.day))];
        const range = draft.startTime && draft.endTime && minutesOf(draft.endTime) > minutesOf(draft.startTime)
            ? rangeText(minutesOf(draft.startTime), minutesOf(draft.endTime)) : "";
        let title = "Room unavailable at this time";
        let lead;
        if (busy.length) {
            lead = `${activeRoom.roomCode} is already in use during ${range || "the time you chose"}. Please choose a different time to continue.`;
        } else {
            title = "Please change the time";
            lead = `${problems[0].text} Please choose a different time to continue.`;
        }
        const list = busy.length
            ? `<ul class="conflict-list">${busy.map((item) => `<li>${escapeHtml(item.text)}</li>`).join("")}</ul>` : "";
        const windows = days.length === 1
            ? freeWindows(activeRoom.roomId, days[0], draft.startTime, draft.endTime) : [];
        const suggestions = windows.length ? `
            <p class="action-section-label conflict-suggest-label">Free on ${escapeHtml(DAY_NAMES[days[0]])}</p>
            <div class="conflict-suggestions">${windows.map(([s, e]) => `
                <button type="button" class="conflict-chip" data-dialog-action="use-slot" data-start="${timeValue(s)}" data-end="${timeValue(e)}">${escapeHtml(rangeText(s, e))}</button>`).join("")}
            </div>` : "";
        const primary = source === "form"
            ? `<button type="button" class="action-button-primary" data-dialog-action="edit-request">Change the time</button>`
            : `<button type="button" class="action-button-primary" data-dialog-action="change-range">Change time range</button>`;
        requestDraft = draft;
        showDialog(`
            <div class="action-dialog-shell action-warning-shell">
                ${dialogHeader(title, "Requests can only be submitted for times when the room is free.", "ROOM NOT AVAILABLE")}
                <div class="action-dialog-body action-success-body">
                    <span class="action-success-mark action-warning-mark" aria-hidden="true">!</span>
                    <p>${escapeHtml(lead)}</p>
                    ${list}${suggestions}
                </div>
                <footer class="action-dialog-footer action-dialog-footer-right">
                    <div class="action-footer-buttons"><button type="button" class="action-button-secondary" data-dialog-close>Cancel</button>${primary}</div>
                </footer>
            </div>`, "[data-dialog-action]");
    }

    function updateRequestFields(form) {
        const pattern = form.elements.requestPattern.value;
        form.querySelectorAll("[data-request-fields]").forEach((section) => {
            const visible = section.dataset.requestFields === pattern;
            section.hidden = !visible;
            section.querySelectorAll("[data-required]").forEach((input) => {
                input.required = visible && input.dataset.required === "true";
            });
        });
        const weekdays = form.querySelector("[data-weekdays]");
        weekdays.hidden = pattern === "once";
    }

    function openRequestDialog(draft) {
        if (!activeRoom || activeRoom.special || activeRoom.unavailable) return;
        showDialog(requestDialogMarkup(), "#requestPattern");
        const form = dialog.querySelector("#roomRequestForm");
        applyDraft(form, draft || defaultDraft(viewedRange()));
    }

    // Pressing "Submit a request" on a room: check the time range chosen on the dashboard first.
    function startRequest() {
        const range = viewedRange();
        const draft = defaultDraft(range);
        const problems = findConflicts(activeRoom.roomId, [range.day], range.start, range.end);
        if (problems.length) showUnavailable(problems, draft, "drawer");
        else openRequestDialog(draft);
    }

    function demoReports() {
        const now = Date.now();
        return [
            {
                id: "sample-report-b2-212", roomId: "B2-212", roomCode: "B2 212",
                category: "Air conditioning", priority: "Normal",
                description: "The air conditioning takes longer than expected to cool the room.",
                locationNote: "General room", status: "Under review",
                createdAt: new Date(now - 3 * 86400000).toISOString(), isDemo: true,
            },
            {
                id: "sample-report-b3-208", roomId: "B3-208", roomCode: "B3 208",
                category: "Projector / AV", priority: "High",
                description: "The projector signal drops intermittently during use.",
                locationNote: "Lecturer's desk", status: "Open",
                createdAt: new Date(now - 86400000).toISOString(), isDemo: true,
            },
        ];
    }

    function dateLabel(value) {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "Date unavailable";
        return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    }

    function getReportsForActiveRoom() {
        return [...readRecords(REPORTS_KEY), ...demoReports()]
            .filter((report) => report.roomId === activeRoom.roomId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    function reportCard(report) {
        const statusClass = String(report.status || "Open").toLowerCase().replace(/[^a-z0-9]+/g, "-");
        return `
            <article class="issue-card">
                <div class="issue-card-topline"><span class="issue-category">${escapeHtml(report.category || "Other")}</span><span class="issue-status status-${escapeHtml(statusClass)}">${escapeHtml(report.status || "Open")}</span></div>
                <p class="issue-description">${escapeHtml(report.description)}</p>
                ${report.locationNote ? `<p class="issue-location">Location: ${escapeHtml(report.locationNote)}</p>` : ""}
                <div class="issue-meta"><span>${escapeHtml(report.priority || "Normal")} priority</span><span>Reported ${escapeHtml(dateLabel(report.createdAt))}</span></div>
                ${report.isDemo ? '<span class="issue-sample-label">Sample report</span>' : ""}
            </article>`;
    }

    function reportsDialogMarkup() {
        const reports = getReportsForActiveRoom();
        const content = reports.length
            ? `<div class="issue-list">${reports.map(reportCard).join("")}</div>`
            : `<div class="issue-empty"><span class="issue-empty-icon" aria-hidden="true">✓</span><h3>No reports for this room yet</h3><p>Submit a report if you notice a facility, equipment, or room-access issue.</p></div>`;
        return `
            <div class="action-dialog-shell">
                ${dialogHeader("Room issues", "Review reports associated with this room or submit a new issue.", "ROOM REPORTS")}
                <div class="action-dialog-toolbar">${dialogRoomContext()}<button type="button" class="action-button-primary" data-dialog-action="new-report">＋ Report an issue</button></div>
                <div class="action-dialog-body action-reports-body">
                    <p class="action-section-label">Reported issues <span>${reports.length}</span></p>
                    ${content}
                    <p class="action-footnote action-reports-note">Sample entries are illustrative. New reports are saved in this browser only. A connected version would route them to the Room Scheduling Coordinator.</p>
                </div>
                <footer class="action-dialog-footer action-dialog-footer-right"><button type="button" class="action-button-secondary" data-dialog-close>Close</button></footer>
            </div>`;
    }

    function openReportsDialog() {
        showDialog(reportsDialogMarkup(), ".action-dialog-close");
    }

    function newReportDialogMarkup() {
        return `
            <div class="action-dialog-shell">
                ${dialogHeader("Report a room issue", "Describe the problem so the Room Scheduling Coordinator can assess it in a connected version.", "NEW REPORT")}
                <form id="roomReportForm" class="action-form">
                    <div class="action-dialog-body">
                        ${dialogRoomContext()}
                        <div class="action-field-grid">
                            <label class="form-group" for="reportCategory"><span>Issue category</span>
                                <select class="form-input" id="reportCategory" name="category" required>
                                    <option value="Air conditioning">Air conditioning</option><option value="Projector / AV">Projector / AV equipment</option>
                                    <option value="Furniture">Furniture or seating</option><option value="Electrical">Electrical or outlet</option>
                                    <option value="Internet / Wi-Fi">Internet / Wi-Fi</option><option value="Cleanliness">Cleanliness</option>
                                    <option value="Access / security">Access / security</option><option value="Other">Other</option>
                                </select>
                            </label>
                            <label class="form-group" for="reportPriority"><span>Priority</span>
                                <select class="form-input" id="reportPriority" name="priority" required><option value="Low">Low</option><option value="Normal" selected>Normal</option><option value="High">High</option></select>
                            </label>
                            <label class="form-group action-field-full" for="reportLocation"><span>Specific location <em>optional</em></span><input class="form-input" id="reportLocation" name="locationNote" maxlength="180" placeholder="e.g. near the windows, lecturer's desk"></label>
                            <label class="form-group action-field-full" for="reportDescription"><span>Describe the issue</span><textarea class="form-input action-textarea" id="reportDescription" name="description" rows="4" maxlength="1500" placeholder="What is wrong, when does it happen, and how does it affect room use?" required></textarea></label>
                        </div>
                        <p class="action-inline-feedback" data-form-feedback role="status" aria-live="polite"></p>
                    </div>
                    <footer class="action-dialog-footer">
                        <p class="action-footnote">Demo only. This report is saved in this browser and does not notify staff.</p>
                        <div class="action-footer-buttons"><button type="button" class="action-button-secondary" data-dialog-action="back-to-reports">Back to reports</button><button type="submit" class="action-button-primary">Submit report</button></div>
                    </footer>
                </form>
            </div>`;
    }

    function openNewReportDialog() {
        showDialog(newReportDialogMarkup(), "#reportCategory");
    }

    function showSuccess(title, description, buttonLabel, action) {
        showDialog(`
            <div class="action-dialog-shell action-success-shell">
                ${dialogHeader(title, description, "SAVED IN THIS BROWSER")}
                <div class="action-dialog-body action-success-body"><span class="action-success-mark" aria-hidden="true">✓</span><p>The submission has been recorded in this browser's local storage.</p><p class="action-footnote">A real request/report queue and notifications require shared backend storage and staff access.</p></div>
                <footer class="action-dialog-footer action-dialog-footer-right"><button type="button" class="action-button-primary" data-dialog-action="${action}">${escapeHtml(buttonLabel)}</button></footer>
            </div>`, '[data-dialog-action]');
    }

    function setFormFeedback(form, message, isError = true) {
        const target = form.querySelector("[data-form-feedback]");
        if (!target) return;
        target.textContent = message;
        target.dataset.live = "false";
        target.classList.toggle("is-error", isError);
        target.classList.toggle("is-success", !isError);
    }

    function handleRequestSubmit(form) {
        const pattern = form.elements.requestPattern.value;
        const startTime = form.elements.startTime.value;
        const endTime = form.elements.endTime.value;
        if (!startTime || !endTime || endTime <= startTime) {
            setFormFeedback(form, "Choose an end time later than the start time.");
            return;
        }

        let startDate = "";
        let endDate = "";
        if (pattern === "once") {
            startDate = form.elements.useDate.value;
            endDate = startDate;
        } else if (pattern === "recurring") {
            startDate = form.elements.recurringStart.value;
            endDate = form.elements.recurringEnd.value;
        } else {
            startDate = form.elements.effectiveDate.value;
            endDate = form.elements.untilDate.value;
        }
        if (!startDate || (endDate && endDate < startDate)) {
            setFormFeedback(form, "Check the requested start and end dates.");
            return;
        }

        const days = pattern === "once"
            ? [new Date(`${startDate}T12:00:00`).toLocaleDateString("en-US", { weekday: "short" })]
            : [...form.querySelectorAll("[data-day-checkbox]:checked")].map((input) => input.value);
        if (pattern !== "once" && days.length === 0) {
            setFormFeedback(form, "Select at least one day for a recurring or ongoing request.");
            return;
        }

        const problems = findConflicts(activeRoom.roomId, days, startTime, endTime);
        if (problems.length) {
            showUnavailable(problems, collectDraft(form), "form");
            return;
        }

        const labels = { once: "One-time use", recurring: "Recurring schedule", ongoing: "Long-term room assignment" };
        const request = {
            id: `request-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            roomId: activeRoom.roomId,
            roomCode: activeRoom.roomCode,
            roomName: activeRoom.roomName,
            requestType: pattern,
            requestTypeLabel: labels[pattern],
            startDate,
            endDate: endDate || null,
            ongoingUntilFurtherNotice: pattern === "ongoing" && !endDate,
            days,
            startTime,
            endTime,
            message: form.elements.message.value.trim(),
            status: "Pending review",
            submittedAt: new Date().toISOString(),
        };
        if (!saveRecord(REQUESTS_KEY, request)) {
            setFormFeedback(form, "The browser could not save this request. Check local storage permissions and try again.");
            return;
        }
        showSuccess("Request submitted", `${request.requestTypeLabel} for ${activeRoom.roomCode} has been recorded with status Pending review.`, "Back to room", "close-dialog");
    }

    function handleReportSubmit(form) {
        const description = form.elements.description.value.trim();
        if (!description) {
            setFormFeedback(form, "Describe the issue before submitting.");
            return;
        }
        const report = {
            id: `report-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            roomId: activeRoom.roomId,
            roomCode: activeRoom.roomCode,
            roomName: activeRoom.roomName,
            category: form.elements.category.value,
            priority: form.elements.priority.value,
            locationNote: form.elements.locationNote.value.trim(),
            description,
            status: "Open",
            createdAt: new Date().toISOString(),
            isDemo: false,
        };
        if (!saveRecord(REPORTS_KEY, report)) {
            setFormFeedback(form, "The browser could not save this report. Check local storage permissions and try again.");
            return;
        }
        showSuccess("Report submitted", `Your ${report.category.toLowerCase()} report for ${activeRoom.roomCode} has been recorded as Open.`, "View room reports", "view-reports");
    }

    document.addEventListener("click", (event) => {
        const button = event.target.closest("[data-room-action]");
        if (!button || button.disabled) return;
        activeRoom = {
            roomId: button.dataset.roomId,
            roomCode: button.dataset.roomCode,
            roomName: button.dataset.roomName,
            special: false,

  unavailable: button.dataset.roomUnavailable === "true",
        };
        if (button.dataset.roomAction === "request") startRequest();
        if (button.dataset.roomAction === "report") openReportsDialog();
    });

    // Open the native time picker from anywhere inside either time field, not only its clock icon.
    dialog.addEventListener("click", (event) => {
        const timeInput = event.target.closest('input[type="time"]');
        if (!timeInput) return;
        timeInput.focus({ preventScroll: true });
        if (typeof timeInput.showPicker === "function") {
            try { timeInput.showPicker(); } catch (error) { /* The browser may already have opened it. */ }
        }
    });

    dialog.addEventListener("click", (event) => {
        if (event.target === dialog) {
            dialog.close();
            return;
        }
        if (event.target.closest("[data-dialog-close]")) {
            dialog.close();
            return;
        }
        const action = event.target.closest("[data-dialog-action]")?.dataset.dialogAction;
        if (!action) return;
        if (action === "new-report") openNewReportDialog();
        else if (action === "back-to-reports" || action === "view-reports") openReportsDialog();
        else if (action === "close-dialog") dialog.close();
        else if (action === "edit-request") openRequestDialog(requestDraft);
        else if (action === "use-slot") {
            const chip = event.target.closest("[data-dialog-action]");
            openRequestDialog({ ...requestDraft, startTime: chip.dataset.start, endTime: chip.dataset.end });
        } else if (action === "change-range") {
            dialog.close();
            // Open the dashboard's time picker so the range can be changed right away.
            // (Delayed one tick so the dashboard's "click outside closes menus" handler does not close it again.)
            setTimeout(() => {
                const timeBtn = document.getElementById("timeBtn");
                if (!timeBtn) return;
                if (typeof closePopovers === "function") closePopovers();
                timeBtn.click();
            }, 0);
        }
    });

    dialog.addEventListener("change", (event) => {
        if (event.target.id === "requestPattern") {
            updateRequestFields(event.target.form);
        }
        if (event.target.form && event.target.form.id === "roomRequestForm") checkAvailability(event.target.form);
        const startEndPairs = [
            ["requestRecurringStart", "requestRecurringEnd"],
            ["requestEffectiveDate", "requestUntilDate"],
        ];
        for (const [startId, endId] of startEndPairs) {
            if (event.target.id === startId) {
                const end = dialog.querySelector(`#${endId}`);
                if (end) end.min = event.target.value || localDateInputValue();
            }
        }
    });

    dialog.addEventListener("submit", (event) => {
        if (event.target.id === "roomRequestForm") {
            event.preventDefault();
            handleRequestSubmit(event.target);
        } else if (event.target.id === "roomReportForm") {
            event.preventDefault();
            handleReportSubmit(event.target);
        }
    });

    dialog.addEventListener("cancel", (event) => {
        // Keep the browser's native Escape-to-close behavior.
        event.stopPropagation();
    });
})();