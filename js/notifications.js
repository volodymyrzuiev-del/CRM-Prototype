/* Notifications (Figma: Empire design system / Notification, section 6965:18941).
   Inbox under the bell + pop-up toasts. State lives in localStorage, so it follows the user across pages.
   Demo simulation: a new notification arrives on every page load and then every 2–3 minutes. */
(function () {
    "use strict";
    if (!document.querySelector(".emp-head__bell")) return;

    var KEY = "empNtf.v1";
    var SPRITE = "<symbol id='ntf-bell' viewBox='0 0 16 16'><path d='M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2m.995-14.901a1 1 0 1 0-1.99 0A5 5 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901'/></symbol><symbol id='ntf-x' viewBox='0 0 16 16'><path d='M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708'/></symbol><symbol id='ntf-archive' viewBox='0 0 16 16'><path d='M12.643 15C13.979 15 15 13.845 15 12.5V5H1v7.5C1 13.845 2.021 15 3.357 15zM5.5 7h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1M.8 1a.8.8 0 0 0-.8.8V3a.8.8 0 0 0 .8.8h14.4A.8.8 0 0 0 16 3V1.8a.8.8 0 0 0-.8-.8z'/></symbol><symbol id='ntf-gear' viewBox='0 0 16 16'><path d='M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z'/></symbol><symbol id='ntf-clock' viewBox='0 0 16 16'><path d='M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z'/>  <path d='M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0'/></symbol><symbol id='ntf-arrow' viewBox='0 0 16 16'><path fill-rule='evenodd' d='M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8'/></symbol><symbol id='ntf-down' viewBox='0 0 16 16'><path fill-rule='evenodd' d='M1.646 6.646a.5.5 0 0 1 .708 0L8 12.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708'/>  <path fill-rule='evenodd' d='M1.646 2.646a.5.5 0 0 1 .708 0L8 8.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708'/></symbol><symbol id='ntf-up' viewBox='0 0 16 16'><path fill-rule='evenodd' d='M7.646 2.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 3.707 2.354 9.354a.5.5 0 1 1-.708-.708z'/>  <path fill-rule='evenodd' d='M7.646 6.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 7.707l-5.646 5.647a.5.5 0 0 1-.708-.708z'/></symbol><symbol id='ntf-back' viewBox='0 0 16 16'><path fill-rule='evenodd' d='M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5'/></symbol><symbol id='ntf-restore' viewBox='0 0 16 16'><path fill-rule='evenodd' d='M1.146 4.854a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H12.5A2.5 2.5 0 0 1 15 6.5v8a.5.5 0 0 1-1 0v-8A1.5 1.5 0 0 0 12.5 5H2.707l3.147 3.146a.5.5 0 1 1-.708.708z'/></symbol><symbol id='ntf-trash' viewBox='0 0 16 16'><path d='M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z'/>  <path d='M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z'/></symbol>";
    var TOAST_LIFE = 8000;           // a toast stays 8 s (hover pauses it), the notification stays unread in the inbox
    var MAX_TOASTS = 3;              // design: at most 3 pop-up toasts
    var FIRST_DELAY = 1500;          // first simulated notification after page load
    var NEXT_MIN = 120000, NEXT_MAX = 180000; // then every 2–3 minutes

    // type: documents | system | regular. section = where it came from; href = where View / click leads.
    var POOL = [
        { type: "documents", title: "Vehicle registration expires", text: "The vehicle registration for truck 123456 will expire in 5 days. Please update the documentation.", section: "Document checking", href: "documents.html" },
        { type: "documents", title: "COI expires soon", text: "The certificate of insurance of MX New Carrier expires on 11/12/2026. Please upload the new one.", section: "Document checking", href: "documents.html" },
        { type: "documents", title: "Data mismatch found", text: "The TIN on the W-9 of Sunrise Logistics does not match the owner profile. Check the document.", section: "Document checking", href: "documents.html" },
        { type: "documents", title: "New document uploaded", text: "Andrew Jameson uploaded a CDL (front and back). Assign a type and check it.", section: "Document checking", href: "documents.html" },
        { type: "system", title: "Scheduled maintenance", text: "The CRM will be unavailable on Sunday from 02:00 to 03:00 AM EST.", section: "System", href: "" },
        { type: "system", title: "New version available", text: "Quotes got rule-based filtering. Reload the page to get the update.", section: "System", href: "" },
        { type: "system", title: "Password expires", text: "Your password expires in 3 days. Change it in the profile settings.", section: "System", href: "" },
        { type: "regular", title: "Broker agent transferred", text: "Robert Bob (City 85) was transferred from Tom Bob to Jacob Jones.", section: "Brokers", href: "brokers.html" },
        { type: "regular", title: "New quote request", text: "TQL sent a quote: Atlanta, GA → Chicago, IL, 2 pallets, PU tomorrow 08:00.", section: "Quotes", href: "quotes.html" },
        { type: "regular", title: "Late delivery", text: "Load UA1 | JSn 17013 is 45 min behind the DEL appointment in Miami, FL 33133.", section: "Loads", href: "loads.html" },
        { type: "regular", title: "New candidate", text: "Gregg Orn applied via Website for the OTR driver position.", section: "Candidates", href: "candidates.html" },
        { type: "regular", title: "Charge deducted", text: "$30.00 for Possible claim was deducted from Andrew Jameson's payroll.", section: "Charges", href: "charges.html" },
        { type: "regular", title: "Added to the blacklist", text: "Carrier Fast Wheels LLC was added to the blacklist by Kelemen Krisztina.", section: "Blacklist", href: "blacklist.html" },
        { type: "regular", title: "Warehouse hours changed", text: "Walmart DC #6094 now receives from 06:00 AM to 02:00 PM.", section: "Warehouses", href: "warehouses.html" },
        { type: "regular", title: "Daily goal reached", text: "Guy Hawkins team reached today's goal: $12,410 profit from 9 loads.", section: "Statistics", href: "statistics.html" }
    ];

    var mem = null;
    function load() {
        if (mem) return mem;
        try { mem = JSON.parse(localStorage.getItem(KEY)); } catch (e) { mem = null; }
        if (!mem || !mem.items) mem = seed();
        return mem;
    }
    function save() { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { /* private mode: keep in memory */ } }
    function seed() {
        var now = Date.now(), H = 3600000;
        var pick = [[7, 3 * H, false], [4, 5 * H, false], [0, 26 * H, true], [8, 28 * H, true], [10, 30 * H, true], [11, 52 * H, true], [1, 70 * H, true, true], [12, 96 * H, true, true]];
        return {
            seq: pick.length,
            settings: { muteDocs: false, muteSystem: false, toasts: true },
            items: pick.map(function (p, i) {
                var t = POOL[p[0]];
                return { id: "s" + i, type: t.type, title: t.title, text: t.text, section: t.section, href: t.href, ts: now - p[1], read: p[2], archived: !!p[3] };
            })
        };
    }

    var $ = function (sel, root) { return (root || document).querySelector(sel); };
    var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
    var icon = function (id) { return '<svg viewBox="0 0 16 16" aria-hidden="true"><use href="#ntf-' + id + '"></use></svg>'; };
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    function when(ts) {
        var d = Date.now() - ts, m = Math.floor(d / 60000);
        if (m < 1) return "Just now";
        if (m < 60) return m + " min ago";
        if (m < 24 * 60) return Math.floor(m / 60) + " h ago";
        var t = new Date(ts), h = t.getHours(), ap = h < 12 ? "AM" : "PM";
        h = h % 12 || 12;
        return pad(t.getDate()) + "/" + pad(t.getMonth() + 1) + "/" + t.getFullYear() + " " + pad(h) + ":" + pad(t.getMinutes()) + " " + ap;
    }
    function muted(n) { var s = load().settings; return (n.type === "documents" && s.muteDocs) || (n.type === "system" && s.muteSystem); }
    function find(id) { return load().items.filter(function (n) { return n.id === id; })[0]; }
    function inbox(tab) {
        return load().items.filter(function (n) { return !n.archived && (tab === "all" || n.type === tab); }).sort(function (a, b) { return b.ts - a.ts; });
    }
    function unread(tab) { return inbox(tab).filter(function (n) { return !n.read; }).length; }

    // ---------- markup ----------
    function card(n, mode) {
        // mode: toast | inbox | archive
        var acts = "";
        if (mode === "toast") acts = '<button class="emp-ntf-act" type="button" data-ntf-close aria-label="Close">' + icon("x") + "</button>";
        if (mode === "inbox") acts = '<button class="emp-ntf-act" type="button" data-ntf-archive aria-label="Move to archive">' + icon("archive") + "</button>";
        if (mode === "archive") acts = '<button class="emp-ntf-act" type="button" data-ntf-restore aria-label="Back to notifications">' + icon("restore") + '</button><button class="emp-ntf-act emp-ntf-act--red" type="button" data-ntf-delete aria-label="Delete">' + icon("trash") + "</button>";
        var unreadCls = !n.read && mode !== "archive" ? " is-unread" : "";
        var foot = mode === "toast" ? "" :
            '<div class="emp-ntf-card__foot"><span class="emp-ntf-card__meta">' + icon("clock") + "<span>" + when(n.ts) + "</span><span>•</span><span>" + esc(n.section) + "</span></span>" +
            (mode === "inbox" ? '<span class="emp-ntf-card__view">View' + icon("arrow") + "</span>" : "") + "</div>";
        return '<div class="emp-ntf-card' + unreadCls + '" role="button" tabindex="0" data-ntf-id="' + n.id + '" data-ntf-mode="' + mode + '">' +
            '<div class="emp-ntf-card__head"><span class="emp-ntf-card__name">' + (unreadCls ? '<span class="emp-ntf-card__dot"></span>' : "") +
            '<svg class="emp-ntf-card__bell" viewBox="0 0 16 16" aria-hidden="true"><use href="#ntf-bell"></use></svg><span class="emp-ntf-card__title">' + esc(n.title) + "</span></span>" +
            '<span class="emp-ntf-card__acts">' + acts + "</span></div>" +
            '<p class="emp-ntf-card__text">' + esc(n.text) + "</p>" + foot + "</div>";
    }

    var ui = { view: "inbox", tab: "all", expanded: false };
    var panel, toasts, bell, badge;

    function build() {
        var sp = document.createElement("div");
        sp.style.display = "none";
        sp.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg">' + SPRITE + "</svg>";
        document.body.appendChild(sp);
        toasts = document.createElement("div");
        toasts.className = "emp-ntf-toasts";
        toasts.setAttribute("aria-live", "polite");
        document.body.appendChild(toasts);
        panel = document.createElement("section");
        panel.className = "emp-ntf";
        panel.setAttribute("aria-label", "Notifications");
        document.body.appendChild(panel);
        var old = $(".emp-head__bell");
        bell = document.createElement("button");
        bell.type = "button";
        bell.className = old.className;
        bell.setAttribute("aria-label", "Notifications");
        bell.setAttribute("aria-expanded", "false");
        bell.innerHTML = old.innerHTML;
        old.parentNode.replaceChild(bell, old);
        badge = bell.querySelector(".emp-tab__count");
    }

    function renderBadge() {
        var u = unread("all");
        if (!badge) return;
        badge.hidden = u === 0;
        badge.textContent = u > 99 ? "99+" : String(u);
    }
    function tab(id, label) {
        var u = unread(id);
        return '<button class="emp-tab' + (ui.tab === id ? " is-active" : "") + '" type="button" role="tab" aria-selected="' + (ui.tab === id) + '" data-ntf-tab="' + id + '">' + label +
            (u ? '<span class="emp-tab__count">' + (u > 99 ? "99+" : u) + "</span>" : "") + "</button>";
    }
    function renderPanel() {
        panel.setAttribute("data-view", ui.view);
        panel.classList.toggle("is-expanded", ui.view === "inbox" && ui.expanded);
        var html;
        if (ui.view === "settings") {
            var s = load().settings;
            var opt = function (key, label) {
                return '<div class="emp-ntf__opt"><span>' + label + '</span><label class="emp-toggle"><input class="emp-toggle__input" type="checkbox" data-ntf-set="' + key + '"' + (s[key] ? " checked" : "") + ' aria-label="' + label + '"><span class="emp-toggle__track"></span></label></div>';
            };
            html = '<div class="emp-ntf__top"><div class="emp-ntf__bar"><h2 class="emp-ntf__title"><button class="emp-ntf__back" type="button" data-ntf-back aria-label="Back">' + icon("back") + "</button>Settings</h2></div></div>" +
                '<div class="emp-ntf__settings"><div class="emp-ntf__group"><h3 class="emp-ntf__group-title">Mute notifications</h3><div class="emp-ntf__opts">' +
                opt("muteDocs", "Mute documents") + opt("muteSystem", "Mute system messages") + "</div></div>" +
                '<div class="emp-ntf__group"><h3 class="emp-ntf__group-title">Pop-up toasts</h3><div class="emp-ntf__opts">' + opt("toasts", "Show pop-up toasts") + "</div></div></div>";
        } else if (ui.view === "archive") {
            var arch = load().items.filter(function (n) { return n.archived; }).sort(function (a, b) { return b.ts - a.ts; });
            html = '<div class="emp-ntf__top"><div class="emp-ntf__bar"><h2 class="emp-ntf__title"><button class="emp-ntf__back" type="button" data-ntf-back aria-label="Back">' + icon("back") + "</button>Archive</h2></div></div>" +
                '<div class="emp-ntf__list">' + (arch.length ? arch.map(function (n) { return card(n, "archive"); }).join("") : '<p class="emp-ntf__empty">Archive is empty</p>') + "</div>";
        } else {
            var list = inbox(ui.tab), shown = ui.expanded ? list : list.slice(0, 3);
            var more = list.length > 3 ? '<button class="emp-btn emp-btn--outline emp-btn--md emp-ntf__more" type="button" data-ntf-more><span class="emp-btn__label">' + (ui.expanded ? "Collapse inbox" : "Expand inbox") + '</span><span class="emp-btn__glyph">' + icon(ui.expanded ? "up" : "down") + "</span></button>" : "";
            html = '<div class="emp-ntf__top"><div class="emp-ntf__bar"><h2 class="emp-ntf__title">Notifications</h2><button class="emp-ntf__readall" type="button" data-ntf-readall' + (unread("all") ? "" : " disabled") + ">Mark all read</button></div>" +
                '<div class="emp-ntf__row"><div class="emp-tabs__list emp-tabs__list--boxed emp-ntf__tabs" role="tablist">' + tab("all", "All") + tab("documents", "Documents") + tab("system", "System") + "</div>" +
                '<div class="emp-ntf__tools"><button class="emp-ntf__tool" type="button" data-ntf-view="settings" aria-label="Settings">' + icon("gear") + '</button><button class="emp-ntf__tool" type="button" data-ntf-view="archive" aria-label="Archive">' + icon("archive") + "</button></div></div></div>" +
                '<div class="emp-ntf__list">' + (shown.length ? shown.map(function (n) { return card(n, "inbox"); }).join("") : '<p class="emp-ntf__empty">No notifications</p>') + "</div>" + more;
        }
        panel.innerHTML = html;
    }
    function render() { renderBadge(); if (panel.classList.contains("is-open")) renderPanel(); }

    function open(on) {
        panel.classList.toggle("is-open", on);
        document.body.classList.toggle("emp-ntf-open", on);
        bell.setAttribute("aria-expanded", String(on));
        if (on) { ui.view = "inbox"; ui.expanded = false; renderPanel(); }
    }

    // ---------- toasts ----------
    function dropToast(node) {
        if (!node || node.classList.contains("is-leaving")) return;
        clearTimeout(node._t);
        node.classList.add("is-leaving");
        setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, 300);
    }
    function toast(n) {
        var wrap = document.createElement("div");
        wrap.innerHTML = card(n, "toast");
        var node = wrap.firstChild;
        toasts.insertBefore(node, toasts.firstChild);
        var live = toasts.querySelectorAll(".emp-ntf-card:not(.is-leaving)");
        for (var i = MAX_TOASTS; i < live.length; i++) dropToast(live[i]);
        requestAnimationFrame(function () { requestAnimationFrame(function () { node.classList.add("is-show"); }); });
        var arm = function () { node._t = setTimeout(function () { dropToast(node); }, TOAST_LIFE); };
        node.addEventListener("mouseenter", function () { clearTimeout(node._t); });
        node.addEventListener("mouseleave", arm);
        arm();
    }

    // ---------- simulation ----------
    function simulate() {
        var st = load(), last = st.lastPool;
        var i;
        do { i = Math.floor(Math.random() * POOL.length); } while (i === last && POOL.length > 1);
        st.lastPool = i;
        var t = POOL[i];
        var n = { id: "n" + (++st.seq) + "-" + Date.now(), type: t.type, title: t.title, text: t.text, section: t.section, href: t.href, ts: Date.now(), read: false, archived: false };
        st.items.unshift(n);
        if (st.items.length > 120) st.items.length = 120;
        save();
        render();
        if (st.settings.toasts && !muted(n) && !panel.classList.contains("is-open")) toast(n);
        return n;
    }
    function schedule() { setTimeout(function () { simulate(); schedule(); }, NEXT_MIN + Math.random() * (NEXT_MAX - NEXT_MIN)); }

    // ---------- actions ----------
    function go(n) {
        n.read = true;
        save();
        var here = location.pathname.split("/").pop() || "index.html";
        if (n.href && n.href !== here) { location.href = n.href; return; }
        open(false);
        render();
    }
    function onClick(e) {
        var t = e.target;
        if (t.closest(".emp-head__bell")) { open(!panel.classList.contains("is-open")); return; }
        var cardNode = t.closest(".emp-ntf-card");
        if (cardNode) {
            var n = find(cardNode.getAttribute("data-ntf-id"));
            var mode = cardNode.getAttribute("data-ntf-mode");
            if (!n) { if (mode === "toast") dropToast(cardNode); return; }
            if (t.closest("[data-ntf-close]")) { n.read = true; save(); dropToast(cardNode); render(); return; }
            if (t.closest("[data-ntf-archive]")) { n.archived = true; n.read = true; save(); render(); return; }
            if (t.closest("[data-ntf-restore]")) { n.archived = false; save(); render(); return; }
            if (t.closest("[data-ntf-delete]")) { load().items = load().items.filter(function (x) { return x !== n; }); save(); render(); return; }
            if (mode === "archive") return;
            if (mode === "toast") dropToast(cardNode);
            go(n);
            return;
        }
        if (!t.closest(".emp-ntf")) { if (panel.classList.contains("is-open")) open(false); return; }
        var b;
        if ((b = t.closest("[data-ntf-tab]"))) { ui.tab = b.getAttribute("data-ntf-tab"); ui.expanded = false; renderPanel(); return; }
        if (t.closest("[data-ntf-readall]")) { load().items.forEach(function (n) { if (!n.archived) n.read = true; }); save(); render(); return; }
        if (t.closest("[data-ntf-more]")) { ui.expanded = !ui.expanded; renderPanel(); return; }
        if ((b = t.closest("[data-ntf-view]"))) { ui.view = b.getAttribute("data-ntf-view"); renderPanel(); return; }
        if (t.closest("[data-ntf-back]")) { ui.view = "inbox"; renderPanel(); return; }
    }

    build();
    renderBadge();
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && panel.classList.contains("is-open")) { open(false); bell.focus(); return; }
        if ((e.key === "Enter" || e.key === " ") && e.target.classList && e.target.classList.contains("emp-ntf-card")) { e.preventDefault(); e.target.click(); }
    });
    panel.addEventListener("change", function (e) {
        var key = e.target.getAttribute("data-ntf-set");
        if (!key) return;
        load().settings[key] = e.target.checked;
        save();
    });
    // Other tabs of the prototype open at the same time: keep the badge in sync.
    window.addEventListener("storage", function (e) { if (e.key === KEY) { mem = null; render(); } });
    // Relative times ("Just now", "5 min ago") refresh while the inbox is open.
    setInterval(function () { if (panel.classList.contains("is-open") && ui.view !== "settings") renderPanel(); }, 30000);

    setTimeout(function () { simulate(); schedule(); }, FIRST_DELAY);
    window.empNotify = { simulate: simulate, open: function () { open(true); }, reset: function () { mem = seed(); save(); render(); } };
})();
