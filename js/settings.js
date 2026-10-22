// js/settings.js -- Account and Settings buttons (top right), dark mode, and a few small tools.
// Load it LAST in dashboard.html. The saved choice is read early by the tiny script in <head>.

(function () {
    const THEME_KEY = "roomak.theme";                       // "light" | "dark" | "auto"
    const DATA_KEYS = ["roomakRoomRequests", "roomakRoomReports"];   // what "Clear saved data" removes
    const dark = window.matchMedia("(prefers-color-scheme: dark)");

    /* ---------- theme ---------- */
    const getMode = () => { try { return localStorage.getItem(THEME_KEY) || "auto"; } catch (e) { return "auto"; } };
    function applyTheme() {
        const mode = getMode();
        const useDark = mode === "dark" || (mode === "auto" && dark.matches);
        document.documentElement.toggleAttribute("data-theme", false);
        if (useDark) document.documentElement.setAttribute("data-theme", "dark");
    }
    function setMode(mode) {
        try { localStorage.setItem(THEME_KEY, mode); } catch (e) { /* ignore */ }
        applyTheme();
    }
    dark.addEventListener("change", applyTheme);
    applyTheme();

    /* ---------- top bar buttons ---------- */
    const logout = document.getElementById("logoutBtn");
    if (!logout) return;
    const ICON_USER = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>';
    const ICON_GEAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h9M19 7h1M4 17h1M11 17h9"/><circle cx="16" cy="7" r="2.6"/><circle cx="8" cy="17" r="2.6"/></svg>';

    const bar = document.createElement("div");
    bar.className = "topbar-actions";
    logout.parentNode.insertBefore(bar, logout);
    bar.insertAdjacentHTML("beforeend",
        `<button type="button" class="icon-btn" id="accountBtn" aria-label="Account">${ICON_USER}</button>
         <button type="button" class="icon-btn" id="settingsBtn" aria-label="Settings">${ICON_GEAR}</button>`);
    bar.appendChild(logout);

    /* ---------- the pop-up ---------- */
    const dialog = document.createElement("dialog");
    dialog.className = "panel-dialog";
    document.body.appendChild(dialog);

    function open(html) {
        dialog.innerHTML = html;
        if (!dialog.open) dialog.showModal();
    }
    const head = (eyebrow, title) => `
        <header class="panel-head">
            <div><p class="eyebrow">${eyebrow}</p><h2>${title}</h2></div>
            <button type="button" class="panel-x" data-panel="close" aria-label="Close">&times;</button>
        </header>`;

    function showAccount() {
        open(`${head("ACCOUNT", "Your account")}
            <div class="panel-body">
                <div class="profile">
                    <span class="avatar" aria-hidden="true">D</span>
                    <div><strong>Demo User</strong><small>@demo</small></div>
                </div>
                <dl class="panel-list">
                    <div><dt>Role</dt><dd>Demo account</dd></div>
                    <div><dt>University</dt><dd>University of Makati</dd></div>
                </dl>
                <p class="panel-note">This is a prototype account. Real accounts and role-based views are not available yet.</p>
                <button type="button" class="panel-btn danger" data-panel="logout">Log out</button>
            </div>`);
    }

    function showSettings(message) {
        const mode = getMode();
        const opt = (value, label) =>
            `<button type="button" data-theme-mode="${value}" class="${mode === value ? "active" : ""}" aria-pressed="${mode === value}">${label}</button>`;
        open(`${head("SETTINGS", "Settings")}
            <div class="panel-body">
                <h3>Appearance</h3>
                <div class="seg-row" role="group" aria-label="Theme">
                    ${opt("light", "Light")}${opt("dark", "Dark")}${opt("auto", "Auto")}
                </div>
                <p class="panel-note">Auto follows your phone or computer setting.</p>

                <h3>Help</h3>
                <button type="button" class="panel-btn" data-panel="tips">Show the quick tips again</button>

                <h3>Saved data</h3>
                <p class="panel-note">Your requests and reports are saved only in this browser. Clearing them cannot be undone.</p>
                <button type="button" class="panel-btn danger" data-panel="clear">Clear my saved requests and reports</button>
                <p class="panel-done" role="status">${message || ""}</p>
            </div>`);
    }

    let confirming = false;
    dialog.addEventListener("click", (e) => {
        if (e.target === dialog) { dialog.close(); return; }                 // click on the dark area

        const theme = e.target.closest("[data-theme-mode]");
        if (theme) { setMode(theme.dataset.themeMode); showSettings(); return; }

        const act = e.target.closest("[data-panel]");
        if (!act) return;
        const what = act.dataset.panel;
        if (what === "close") dialog.close();
        else if (what === "logout") logout.click();
        else if (what === "tips") {
            dialog.close();
            const help = document.getElementById("tipsBtn");
            if (help) help.click();
        } else if (what === "clear") {
            if (!confirming) {                                               // first tap: ask to confirm
                confirming = true;
                act.textContent = "Tap again to confirm";
                setTimeout(() => { confirming = false; if (act.isConnected) act.textContent = "Clear my saved requests and reports"; }, 4000);
                return;
            }
            confirming = false;
            try { DATA_KEYS.forEach((k) => localStorage.removeItem(k)); } catch (err) { /* ignore */ }
            try { if (state.room) renderDrawer(); } catch (err) { /* drawer closed */ }
            showSettings("Saved requests and reports were cleared.");
        }
    });
    dialog.addEventListener("close", () => { confirming = false; });

    document.getElementById("accountBtn").addEventListener("click", showAccount);
    document.getElementById("settingsBtn").addEventListener("click", () => showSettings());
})();