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

    function renderRoomActionButtons({ roomId, roomCode, roomName, special }) {
        const id = escapeHtml(roomId);
        const code = escapeHtml(roomCode);
        const name = escapeHtml(roomName);
        return `
            <section class="room-actions" aria-label="Room actions">
                <p class="room-actions-heading">Room actions</p>
                <div class="room-actions-list">
                    <button type="button" class="room-action-button room-action-request"
                        data-room-action="request" data-room-id="${id}" data-room-code="${code}" data-room-name="${name}"
                        ${special ? "disabled title=\"This space is not reservable\"" : ""}>
                        <span class="room-action-icon" aria-hidden="true">＋</span>
                        <span class="room-action-copy"><strong>Submit a request</strong><small>Request a time or recurring room assignment</small></span>
                        <span class="room-action-chevron" aria-hidden="true">›</span>
                    </button>
                    <button type="button" class="room-action-button room-action-report"
                        data-room-action="report" data-room-id="${id}" data-room-code="${code}" data-room-name="${name}">
                        <span class="room-action-icon" aria-hidden="true">!</span>
                        <span class="room-action-copy"><strong>Report an issue</strong><small>View existing issues or report a new one</small></span>
                        <span class="room-action-chevron" aria-hidden="true">›</span>
                    </button>
                </div>
                ${special ? '<p class="room-action-note">This space is marked as non-reservable. Room issue reports are still available.</p>' : ""}
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

    function openRequestDialog() {
        if (!activeRoom || activeRoom.special) return;
        showDialog(requestDialogMarkup(), "#requestPattern");
        const form = dialog.querySelector("#roomRequestForm");
        updateRequestFields(form);
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
        };
        if (button.dataset.roomAction === "request") openRequestDialog();
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
    });

    dialog.addEventListener("change", (event) => {
        if (event.target.id === "requestPattern") {
            updateRequestFields(event.target.form);
        }
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
