/* Load's Chats — data and logic of the section (Figma: CRM 3.0 / Load's Chats, 1699:1188).
   Chat is the global emp-chat (js/empire.js); icons and the chat widget come from js/chat-widget.js. */
(function () {
    var L = window.empLc, icon = L.icon, esc = L.esc;
    var ME = { name: "Andrew Jameson", avatar: "AJ", role: "Dispatcher" };
    var $ = function (id) { return document.getElementById(id); };
    function toast(kind, data) { if (window.empToast) window.empToast(kind, data); }
    function btn(label, type, ic, attrs, icRight) { return '<button class="emp-btn emp-btn--' + type + ' emp-btn--md" type="button" ' + (attrs || "") + ">" + (ic && !icRight ? '<span class="emp-btn__glyph">' + icon(ic, "emp-icon") + "</span>" : "") + '<span class="emp-btn__label">' + label + "</span>" + (ic && icRight ? '<span class="emp-btn__glyph">' + icon(ic, "emp-icon") + "</span>" : "") + "</button>"; }
    function chip(text, color, opts) {
        opts = opts || {};
        return '<span class="emp-chip emp-chip--sm' + (opts.fill ? "" : " emp-chip--outline") + (color && color !== "blue" ? " emp-chip--" + color : "") + '"' + (opts.attrs || "") + ">" + esc(text) + (opts.x ? '<button class="emp-chip__x lc-chip-x" type="button" aria-label="Remove ' + esc(text) + '" ' + opts.x + ">" + icon("ci-x", "lc-chip-x__ico") + "</button>" : "") + "</span>";
    }
    function nowTime() { return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }); }

    var LABELS = [
        { id: "l1", text: "Urgent Issues", color: "red" }, { id: "l2", text: "Issue", color: "orange" }, { id: "l3", text: "Team Driver", color: "purple" },
        { id: "l4", text: "Canada load", color: "blue" }, { id: "l5", text: "Future load", color: "green" }
    ];
    var TEAM = [
        { name: "Arnold Pick", role: "Dispatcher", avatar: "AP", loads: ["612300", "612455"] },
        { name: "Benjamin Williams", role: "Dispatcher", avatar: "BW", loads: ["345678", "523498", "523411", "876678"] },
        { name: "Nick Donovan", role: "Dispatcher", avatar: "ND", loads: ["876444", "876655", "523502"] },
        { name: "Ethan Johnson", role: "Tracker", avatar: "EJ", loads: [] }
    ];
    var QUICK = ["You are welcome", "Thank you", "Please, share your current location", "Please send the BOL right after loading"];
    var DISPATCH = "PU 11/05/26 08:00–15:00\nPLAE VERTICAL, 190 ETOWAH INDUSTRIAL, CANTON GA 30114\nPhone# (404) 645-7900 HUNTER\nPU#: 1 pallet, 230 lbs\n\nDEL 11/06/26 09:00\nD1 SOUTHLAKE, 500 WEST SOUTHLAKE BLVD SUITE 100, SOUTHLAKE TX 76092\nPhone: (323) 599-2272 - IRWIN\n\nRATE: $725\nREMINDER: you are working under Empire National Authority with MC# 966111 and USDOT# 2878524. Please keep the Empire App ON while you are on a load with us.\nYour dispatcher is Andrew Jameson. Ph# (864) 920-2552";
    var DRIVERS = [["Oliver Smith", "2323"], ["Nolan Kenter", "4440"], ["Bob Marley", "3463"], ["Gavin Chesterton", "4441"]];
    var REJECT_SHORT = { "Wrong paperwork or missing pages": "wrong paperwork", "Missing signature, printed name or date": "missing signature", "Poor quality of the paperwork (blurred, cropped)": "poor quality", "No BOL at the shipper": "no BOL at the shipper", "Other reason": "other reason" };

    function load(pro, from, to, author, role, last, time, o) {
        o = o || {};
        return { pro: pro, from: from, to: to, author: author, role: role, last: last, time: time, type: o.type || "text", unread: o.unread || 0, labels: o.labels || [], archived: !!o.archived, archivedFor: o.archivedFor || null, draft: o.draft,
            driver: o.driver || (role === "Driver" ? author : "John Driver"), stops: o.stops, msgs: null };
    }
    var LOADS = [
        load("136275", "Atlanta, GA 30336", "Chicago, IL 60638", "John Driver", "Driver", "Arrived at the shipper, waiting for the dock.", "12:34", { labels: ["l4", "l1"] }),
        load("345263", "Harrisburg, PA 17101", "Bismarck, ND 58501", "Anna Horda", "Tracker", "Driver is En Route, ETA to DEL 4:30 PM. Shared the current location.", "12:31", { unread: 3 }),
        load("345678", "Dallas, TX 75001", "Denver, CO 80202", "Peter Ashton", "Driver", "Voice message · 0:42", "12:20", { type: "voice", labels: ["l4", "l1"] }),
        load("876678", "Miami, FL 33101", "Atlanta, GA 30303", "Alex Green", "Tracker", "BOL_876678.pdf", "11:58", { type: "file", unread: 1 }),
        load("876444", "Phoenix, AZ 85001", "El Paso, TX 79901", "You", "Dispatcher", "2 files · BOL_876444.pdf", "11:40", { type: "file", labels: ["l4", "l1"] }),
        load("876655", "Memphis, TN 38103", "St. Louis, MO 63101", "You", "Dispatcher", "Please, share your current location", "10:12"),
        load("523411", "Chicago, IL 60601", "Detroit, MI 48201", "Mike Ross", "Driver", "At the receiver, waiting for unloading.", "09:58"),
        load("523498", "Houston, TX 77001", "Dallas, TX 75201", "", "", "John Driver checked in at DEL1", "09:31", { type: "system", labels: ["l3"] }),
        load("523502", "Denver, CO 80202", "Omaha, NE 68102", "You", "Dispatcher", "Will call the receiver at 7 AM", "09:05", { type: "draft" }),
        load("612300", "Seattle, WA 98101", "Portland, OR 97201", "Bob Marley", "Driver", "Photo · 2 images", "08:47", { type: "photo", labels: ["l5"] }),
        load("612455", "Boise, ID 83702", "Reno, NV 89501", "Lisa Kim", "Tracker", "Driver is resting until 6 AM.", "08:15"),
        load("401120", "Newark, NJ 07102", "Boston, MA 02108", "Natali Wilson", "Dispatcher", "Moved to archive for everyone", "11/05/26", { archived: true, archivedFor: "everyone", type: "file" }),
        load("401177", "Tampa, FL 33602", "Orlando, FL 32801", "You", "Dispatcher", "Moved to archive for me", "11/04/26", { archived: true, archivedFor: "me" })
    ];
    var state = { tab: "active", open: "136275", filter: [], q: "", teamOpen: null, stopsOpen: false, labelsOpen: true, settings: { widget: true, sound: true, desktop: false, mentions: false } };
    try { state.settings.widget = localStorage.getItem("empChatWidget.off") !== "1"; } catch (e) {}
    function byPro(p) { for (var i = 0; i < LOADS.length; i++) if (LOADS[i].pro === p) return LOADS[i]; return null; }
    function label(id) { for (var i = 0; i < LABELS.length; i++) if (LABELS[i].id === id) return LABELS[i]; return null; }
    function route(l) { return l.from + " → " + l.to; }

    /* ---------- conversation data ---------- */
    function members(l) {
        if (!l.members) l.members = [{ name: ME.name + " (You)", role: "Dispatcher", av: "AJ", me: true }, { name: "Natali Wilson", role: "Tracker", av: "NW" }, { name: l.driver, role: "Driver", av: window.empChat.initials(l.driver) }];
        return l.members;
    }
    function memberNames(l) { return members(l).map(function (m) { return m.name.replace(" (You)", ""); }); }
    function stops(l) {
        if (!l.stops) l.stops = [
            { t: "PU1", city: l.from.replace(/ \d+$/, ""), addr: "MAPLE AVENUE, 4", dt: "11/05/2026 12:45 – 11/05/2026 14:45", svc: ["Driver assist", "Clean background"] },
            { t: "PU2", city: "Dallas, TX", addr: "OAK STREET, 14", dt: "11/05/2026 16:24 – 11/05/2026 17:24", svc: [] },
            { t: "DEL1", city: "Jacksonville, FL", addr: "PINE BOULEVARD, 11/2", dt: "11/06/2026 02:22 – 11/06/2026 04:22", svc: ["Full PPE", "White glove service"] },
            { t: "DEL2", city: l.to.replace(/ \d+$/, ""), addr: "ELM DRIVE, 21", dt: "11/06/2026 12:05 – 11/06/2026 13:05", svc: [] }
        ];
        return l.stops;
    }
    /* The whole feed is today (11/05/2026), as in Figma 1.1–1.7 */
    function messages(l) {
        if (l.msgs) return l.msgs;
        var d = l.driver, di = window.empChat.initials(d), T = "Today";
        var m = [
            { kind: "event", tone: "success", text: "Load has been successfully created", time: "11/05/2026 9:20 AM", day: T },
            { kind: "event", tone: "neutral", text: d + " has been assigned to the load", time: "11/05/2026 9:20 AM", day: T },
            { side: "out", author: ME.name, avatar: "AJ", role: "Dispatcher", time: "9:22 AM", day: T, status: "read", text: DISPATCH, pinned: true, readBy: [[d, "Driver"], ["Natali Wilson", "Tracker"]] },
            { side: "in", author: "Natali Wilson", avatar: "NW", role: "Tracker", time: "9:40 AM", day: T, text: "Receiver closes at 4 PM, no appointments after 3:30 PM.", pinned: true },
            { kind: "event", tone: "success", text: "Check In at PU1 · Driver: " + d, time: "11/05/2026 11:40 AM", day: T },
            { side: "in", author: d, avatar: di, role: "Driver", time: "11:58 AM", day: T, text: "Arrived at the shipper, waiting for the dock." },
            { side: "out", author: ME.name, avatar: "AJ", time: "12:02 PM", day: T, status: "read", text: "Thanks! Please send the BOL right after loading.", readBy: [[d, "Driver"], ["Natali Wilson", "Tracker"]] }
        ];
        if (l.pro === "136275") {
            m.splice(0, 0, { kind: "event", tone: "success", text: d + " accepted offer", time: "11/05/2026 9:02 AM", day: T }, { kind: "card", card: "offer", state: "booked", time: "9:02 AM", day: T }, { kind: "event", tone: "neutral", text: "Hold by Andrew Jameson", time: "11/05/2026 9:05 AM", day: T });
            m.push({ side: "in", author: "Natali Wilson", avatar: "NW", role: "Tracker", time: "12:34 PM", day: T, text: "Driver checked in at PU1. I will keep an eye on the dock time and update the broker." });
            m.push({ kind: "card", card: "bol", time: "12:40 PM", day: T, file: "BOL_136275.pdf", status: "review" });
        } else if (l.unread) {
            m.push({ side: "in", id: "u-" + l.pro, author: l.author, avatar: window.empChat.initials(l.author), role: l.role, time: "12:28 PM", day: T, text: "Driver is En Route, ETA to DEL 4:30 PM." });
            m.push({ side: "in", author: l.author, avatar: window.empChat.initials(l.author), role: l.role, time: "12:30 PM", day: T, type: "location", place: "Harrisburg, PA 17101", placeNote: "Shared the current location" });
            m.push({ side: "in", author: l.author, avatar: window.empChat.initials(l.author), role: l.role, time: "12:31 PM", day: T, text: "Traffic is ok, no delays expected." });
        } else if (l.type === "voice") m.push({ side: "in", author: l.author, avatar: window.empChat.initials(l.author), time: "12:20 PM", day: T, type: "voice", duration: "0:42" });
        else if (l.type === "file") m.push({ side: l.author === "You" ? "out" : "in", author: l.author === "You" ? ME.name : l.author, avatar: l.author === "You" ? "AJ" : window.empChat.initials(l.author), time: "11:40 AM", day: T, status: "read", type: "file", file: { name: (l.last.indexOf(".pdf") > 0 ? l.last.replace(/^2 files · /, "") : "POD_" + l.pro + ".pdf"), size: "1.1 MB" } });
        else if (l.type === "photo") m.push({ side: "in", author: l.author, avatar: window.empChat.initials(l.author), time: "08:47 AM", day: T, type: "gallery", more: 0 });
        else if (l.type === "system") m.push({ kind: "event", tone: "success", text: l.last, time: "11/05/2026 9:31 AM", day: T });
        else if (l.type !== "draft" && !l.archived) m.push({ side: l.author === "You" ? "out" : "in", author: l.author === "You" ? ME.name : l.author, avatar: l.author === "You" ? "AJ" : window.empChat.initials(l.author), time: l.time, day: T, status: "delivered", text: l.last });
        if (l.archived) m.push({ kind: "event", tone: "neutral", text: (l.author === "You" ? ME.name : l.author) + " moved the chat to archive" + (l.archivedFor === "me" ? " (for me)" : ""), time: "11/05/2026 9:02 AM", day: T });
        l.msgs = m;
        return m;
    }

    /* ---------- left: labels + list ---------- */
    function labelHtml(lb) {
        var on = state.filter.indexOf(lb.id) >= 0;
        return '<span class="lc-label' + (on ? " is-on" : "") + '" draggable="true" data-lc-label="' + lb.id + '" title="Drag onto a chat to add the label">' + icon("grip", "lc-label__grip") +
            '<button class="lc-label__chip" type="button" data-lc-filter="' + lb.id + '" aria-pressed="' + on + '">' + chip(lb.text, lb.color, { fill: on }) + "</button>" +
            '<button class="lc-label__menu" type="button" data-lc-label-menu="' + lb.id + '" aria-label="Label actions: ' + esc(lb.text) + '" aria-expanded="false">' + icon("dots-v") + "</button></span>";
    }
    function lastHtml(l) {
        var ic = { file: ["file-text", "is-accent"], voice: ["ci-mic-fill", "is-accent"], photo: ["image", "is-accent"], system: ["info", ""] }[l.type];
        var text = l.type === "draft" && !l.archived ? '<span class="lc-item__draft">Draft:</span> ' + esc(l.last) : esc(l.last);
        return '<span class="lc-item__msg' + (l.type === "system" ? " lc-item__msg--system" : "") + '">' + (ic && !l.archived ? icon(ic[0], "lc-item__type " + ic[1]) : "") + '<span class="lc-item__text">' + text + "</span></span>";
    }
    function itemHtml(l) {
        var cls = "lc-item" + (state.open === l.pro ? " is-active" : "") + (l.unread ? " is-unread" : "");
        return '<div class="' + cls + '" role="button" tabindex="0" data-lc-open="' + l.pro + '">' +
            '<div class="lc-item__top"><span class="lc-item__pro">#' + l.pro + '</span><span class="lc-item__route">' + esc(route(l)) + '</span><span class="lc-item__time">' + esc(l.time) + "</span>" +
            (l.archived ? "" : '<span class="lc-menu-wrap"><button class="lc-item__archive" type="button" data-lc-archive="' + l.pro + '" aria-label="Move to archive" aria-expanded="false" title="Move to archive">' + icon("archive-fill") + "</button></span>") + "</div>" +
            '<div class="lc-item__body">' + (l.type === "system" ? "" : '<span class="lc-item__who"><span class="lc-item__author">' + esc(l.author) + ':</span><span class="lc-item__role">' + esc(l.role) + "</span></span>") + lastHtml(l) +
            (l.unread ? '<span class="lc-item__count">' + l.unread + "</span>" : "") + "</div>" +
            (l.labels.length ? '<div class="lc-item__labels">' + l.labels.map(function (id) { var lb = label(id); return lb ? chip(lb.text, lb.color, { x: 'data-lc-unlabel="' + l.pro + ":" + id + '"' }) : ""; }).join("") + "</div>" : "") + "</div>";
    }
    function matches(l) {
        var q = state.q.toLowerCase().replace(/^#/, "");
        if (state.filter.length && !state.filter.every(function (f) { return l.labels.indexOf(f) >= 0; })) return false;
        if (q && (l.pro + " " + route(l) + " " + l.author + " " + l.last).toLowerCase().indexOf(q) < 0) return false;
        return true;
    }
    function visibleLoads() {
        return LOADS.filter(function (l) {
            if (state.tab === "archive" ? !l.archived : l.archived) return false;
            if (state.tab === "team") return false;
            return matches(l);
        });
    }
    function memberLoads(t) { return t.loads.map(byPro).filter(function (l) { return l && !l.archived && matches(l); }); }
    function renderSide() {
        $("lc-active-count").textContent = LOADS.filter(function (l) { return !l.archived; }).length;
        document.querySelectorAll("[data-lc-tab]").forEach(function (t) { var on = t.getAttribute("data-lc-tab") === state.tab; t.classList.toggle("is-active", on); t.setAttribute("aria-selected", on); });
        var h = '<div class="lc-labels' + (state.labelsOpen ? "" : " is-closed") + '"><div class="lc-labels__head"><span class="lc-labels__title">My Labels</span><button class="lc-icon-btn" type="button" data-lc-labels-toggle aria-expanded="' + state.labelsOpen + '" aria-label="' + (state.labelsOpen ? "Hide" : "Show") + ' labels">' + icon(state.labelsOpen ? "chev-up" : "ci-down") + "</button></div>" +
            (state.labelsOpen ? '<div class="lc-labels__list" id="lc-labels">' + LABELS.map(labelHtml).join("") + '<button class="emp-plus" type="button" data-lc-label-add aria-label="Add label"><svg class="emp-icon" viewBox="0 0 16 16" aria-hidden="true"><use href="#i-plus"></use></svg></button></div>' : "") + "</div>";
        if (state.tab === "team") {
            /* My team (Figma 3.1): dispatchers of the team as an accordion — the open one shows his load chats right in the list */
            h += '<div class="lc-list" data-emp-fade>' + TEAM.map(function (t, i) {
                var open = state.teamOpen === i, list = open ? memberLoads(t) : [];
                return '<button class="lc-acc' + (open ? " is-open" : "") + '" type="button" data-lc-member="' + i + '" aria-expanded="' + open + '"><span class="lc-acc__name">' + esc(t.name) + '</span><span class="lc-acc__count">' + t.loads.length + (t.loads.length === 1 ? " load" : " loads") + "</span>" + icon(open ? "chev-up" : "ci-down", "lc-acc__chev") + "</button>" +
                    (open ? '<div class="lc-acc__body">' + (list.length ? list.map(itemHtml).join("") : '<p class="lc-empty lc-empty--sm">' + (t.loads.length ? "No chats found" : "No active loads") + "</p>") + "</div>" : "");
            }).join("") + "</div>";
        } else {
            var list = visibleLoads();
            h += '<div class="lc-list" id="lc-list" data-emp-fade>' + (list.length ? list.map(itemHtml).join("") : '<p class="lc-empty">' + (state.q ? "No chats found" : state.filter.length ? "No chats with these labels" : state.tab === "archive" ? "Archive is empty" : "No chats found") + "</p>") + "</div>";
        }
        $("lc-side-body").innerHTML = h;
    }

    /* ---------- right: header + chat ---------- */
    function headerHtml(l) {
        var arch = l.archived;
        return '<header class="lc-head"><div class="lc-head__row"><h2 class="lc-head__title">#' + l.pro + " (" + esc(l.from) + " - " + esc(l.to) + ")</h2>" +
            '<button class="lc-icon-btn" type="button" data-lc-copy aria-label="Copy load number" title="Copy">' + icon("ci-copy") + "</button>" +
            '<span class="lc-menu-wrap"><button class="lc-icon-btn" type="button" data-lc-members aria-label="Chat members and actions" aria-expanded="false">' + icon("dots-v") + "</button></span>" +
            '<button class="lc-icon-btn" type="button" data-lc-stops aria-expanded="' + state.stopsOpen + '" aria-label="' + (state.stopsOpen ? "Hide" : "Show") + ' stops">' + icon(state.stopsOpen ? "chev-up" : "ci-down") + "</button>" +
            /* Archive is read-only (Figma 3.2): no actions in the header, "Reopen" lives in the closed composer */
            '<span class="lc-grow"></span>' + (arch ? "" : btn("Get BOL", "outline", "file-text", "data-lc-get-bol") + btn("Check call", "secondary", "", "data-lc-check-call") + btn("Request location", "primary", "ci-geo", "data-lc-location")) + "</div>" +
            (l.labels.length ? '<div class="lc-head__labels">' + l.labels.map(function (id) { var lb = label(id); return lb ? chip(lb.text, lb.color, { x: arch ? "" : 'data-lc-unlabel="' + l.pro + ":" + id + '"' }) : ""; }).join("") + "</div>" : "") +
            (state.stopsOpen ? '<div class="lc-stops">' + stops(l).map(function (s) {
                return '<div class="lc-stop"><span class="lc-stop__type">' + s.t + ':</span><span class="lc-stop__city">' + esc(s.city) + '</span><span class="lc-stop__addr">' + esc(s.addr) + '</span><span class="lc-stop__dt">' + esc(s.dt) + "</span>" + s.svc.map(function (x) { return chip(x, "grey"); }).join("") + "</div>";
            }).join("") + "</div>" : "") + "</header>";
    }
    function offerCard(m) {
        var foot = m.state === "booked" ? '<span class="emp-offer__done">' + icon("ci-check") + "Booked by " + ME.name + "</span>" : m.state === "hold" ? chip("On hold by You · 14:54", "orange") : "";
        return '<div class="emp-offer"><div class="emp-offer__row"><b>ETA to PU:</b><span class="emp-offer__value">1h : 30m</span><span class="emp-offer__muted">05:47 PM (CDT, GMT-5)</span></div>' +
            '<div class="emp-offer__row"><b>Rate:</b><span class="emp-offer__value">$1,050</span></div><div class="emp-offer__row"><b>Note:</b><span>can pick up the load earlier</span></div>' +
            '<div class="emp-offer__loc"><span class="emp-offer__muted">Driver’s current location:</span><a href="#" data-lc-noop>Coeur d’Alene, NM, 04205</a></div>' + foot + "</div>";
    }
    /* BOL review — system card in the middle of the feed: title, the file (global file row) and the check status / buttons. */
    function bolCard(m) {
        var status = m.status === "review" ? chip("Waiting for check", "orange") + btn("Reject", "outline", "", 'data-lc-bol-reject="' + m.id + '"') + btn("Approve", "primary", "", 'data-lc-bol-approve="' + m.id + '"')
            : m.status === "approved" ? chip("Approved by " + ME.name, "green") : chip("Rejected: " + (REJECT_SHORT[m.reason] || (m.reason || "").toLowerCase()), "red");
        return '<div class="lc-bol"><span class="lc-bol__title">BOL sent — check it</span>' + window.empChat.fileHtml({ name: m.file, author: "John Driver", size: "3 pages · 860 KB" }) + '<div class="lc-bol__status">' + status + "</div></div>";
    }
    function chatNode() { var n = document.querySelector("#lc-main .emp-chat"); return n && n._empChat; }
    function pushEvent(text, tone) { var c = chatNode(); if (!c) return; c.push({ kind: "event", tone: tone || "neutral", text: text }); c.scrollBottom(); }
    function syncMentions(l) { var c = chatNode(); if (c) c.o.mentions = memberNames(l).map(function (n) { return { name: n }; }); }
    function renderMain() {
        var l = byPro(state.open), box = $("lc-main");
        if (!l || (state.tab === "archive") !== l.archived) {
            box.innerHTML = '<div class="lc-placeholder">' + icon("chat-dots", "lc-placeholder__ico") + "<strong>Select a chat</strong><span>Choose a load on the left to open its chat.</span></div>";
            return;
        }
        var unread = !l.msgs && l.unread && l.pro !== "136275" ? "u-" + l.pro : null;
        var msgs = messages(l);
        l.unread = 0;
        box.innerHTML = headerHtml(l) + '<div class="lc-chat"></div>';
        var c = window.empChat.mount(box.querySelector(".lc-chat"), {
            me: ME, messages: msgs, quick: QUICK, mentions: memberNames(l).map(function (n) { return { name: n }; }), channel: "via App", unreadFrom: unread,
            placeholder: "Write a message", renderCard: function (m) { return m.card === "bol" ? bolCard(m) : offerCard(m); },
            demo: { name: l.driver, avatar: window.empChat.initials(l.driver), channel: "via App", replies: ["Got it 👍", "Copy that.", "Will do.", "On my way, ETA 1h 20m."] },
            disabled: l.archived, onReopen: function () { restore(l); },
            onSend: function (m) { l.last = m.text || (m.file ? m.file.name : "Message"); l.author = "You"; l.role = "Dispatcher"; l.type = m.type === "file" ? "file" : "text"; l.draft = ""; l.time = nowTime(); renderSide(); }
        });
        if (l.draft && !l.archived) c.input.value = l.draft;
    }
    /* Main first: opening a chat clears its unread counter, then the list is painted with it */
    function render() { renderMain(); renderSide(); }
    function restore(l) { l.archived = false; l.archivedFor = null; l.msgs && l.msgs.push({ kind: "event", tone: "neutral", text: "Chat reopened by " + ME.name, day: "Today", time: nowTime() }); toast("chatRestored", { name: "#" + l.pro }); state.tab = "active"; state.open = l.pro; render(); }
    function archive(l, forWhom) {
        l.archived = true; l.archivedFor = forWhom; l.unread = 0;
        l.last = forWhom === "me" ? "Moved to archive for me" : "Moved to archive for everyone"; l.author = "You"; l.role = "Dispatcher"; l.type = "text"; l.time = "11/05/26";
        if (l.msgs) l.msgs.push({ kind: "event", tone: "neutral", text: ME.name + " moved the chat to archive" + (forWhom === "me" ? " (for me)" : ""), day: "Today", time: nowTime() });
        toast("archived", { name: "#" + l.pro });
        if (state.open === l.pro) { var n = visibleLoads()[0]; state.open = n ? n.pro : null; }
        render();
    }

    /* ---------- menus ---------- */
    function closeMenu() { var m = document.querySelector(".lc-menu"); if (m) m.remove(); document.querySelectorAll("[data-lc-members],[data-lc-label-menu],[data-lc-archive]").forEach(function (b) { b.setAttribute("aria-expanded", "false"); }); }
    function menuItem(ic, text, attr, danger) { var p = attr.split("="); return '<button class="lc-menu__item' + (danger ? " lc-menu__item--danger" : "") + '" type="button" role="menuitem" ' + p[0] + (p[1] ? '="' + p[1] + '"' : "") + ">" + icon(ic) + "<span>" + text + "</span></button>"; }
    function openMembers(anchor) {
        var l = byPro(state.open); closeMenu();
        var ms = members(l), arch = l.archived;
        var menu = document.createElement("div"); menu.className = "lc-menu lc-menu--members"; menu.setAttribute("role", "menu");
        menu.innerHTML = '<span class="lc-menu__title">Members (' + ms.length + ")</span>" + ms.map(function (m, i) {
            return '<div class="lc-menu__member"><span class="emp-avatar">' + esc(m.av) + '</span><span class="lc-menu__who"><span>' + esc(m.name) + '</span><span class="lc-menu__role">' + esc(m.role) + "</span></span>" + (m.me || arch ? "" : '<button class="lc-icon-btn" type="button" data-lc-remove-member="' + i + '" aria-label="Remove ' + esc(m.name) + '">' + icon("ci-x") + "</button>") + "</div>";
        }).join("") + '<span class="lc-menu__sep"></span>' +
            (arch ? "" : menuItem("ci-plus", "Add members", "data-lc-add") + menuItem("ci-plus", "Add driver", "data-lc-add-driver") + menuItem("megaphone", "Dispatch message", "data-lc-dispatch") + '<span class="lc-menu__sep"></span>') +
            menuItem("ci-file", "Files (" + FILES.length + ")", "data-lc-files") + menuItem("ci-download", "Export chat (PDF)", "data-lc-export") + menuItem("archive", "Offer’s archive (2)", "data-lc-offer-archive");
        anchor.parentNode.appendChild(menu); anchor.setAttribute("aria-expanded", "true");
    }
    function openLabelMenu(anchor, id) {
        closeMenu();
        var l = byPro(state.open), canAdd = l && !l.archived && l.labels.indexOf(id) < 0;
        var menu = document.createElement("div"); menu.className = "lc-menu lc-menu--label"; menu.setAttribute("role", "menu");
        /* "Add to chat" — the same as dragging the label onto the open chat, for keyboard and touch */
        menu.innerHTML = (canAdd ? menuItem("ci-plus", "Add to #" + l.pro, "data-lc-label-attach=" + id) : "") + menuItem("ci-edit", "Edit", "data-lc-label-edit=" + id) + menuItem("ci-trash", "Delete", "data-lc-label-del=" + id, true);
        anchor.closest(".lc-label").appendChild(menu); anchor.setAttribute("aria-expanded", "true");
    }
    function openArchiveMenu(anchor, pro) {
        closeMenu();
        var l = byPro(pro);
        var menu = document.createElement("div"); menu.className = "lc-menu lc-menu--label lc-menu--archive"; menu.setAttribute("role", "menu");
        menu.innerHTML = menuItem("archive", "Move to archive for me", "data-lc-archive-for=me") + menuItem("archive", "Move to archive for everyone", "data-lc-archive-for=everyone");
        menu.setAttribute("data-pro", l.pro);
        anchor.parentNode.appendChild(menu); anchor.setAttribute("aria-expanded", "true");
    }

    /* ---------- modals ---------- */
    var labelEdit = null, labelColor = "blue";
    function openLabelModal(id) {
        labelEdit = id || null; var lb = id ? label(id) : null; labelColor = lb ? lb.color : "blue";
        $("lc-label-title").textContent = lb ? "Edit label" : "New label";
        $("lc-label-name").value = lb ? lb.text : "";
        paintColors();
        window.empOverlay.open($("lc-label-modal")); setTimeout(function () { $("lc-label-name").focus(); }, 50);
    }
    function paintColors() {
        $("lc-label-colors").innerHTML = ["blue", "red", "orange", "yellow", "green", "purple", "grey"].map(function (c) {
            return '<button class="lc-color' + (c === labelColor ? " is-on" : "") + '" type="button" data-lc-color="' + c + '" aria-pressed="' + (c === labelColor) + '">' + chip($("lc-label-name").value.trim() || "Label", c, { fill: c === labelColor }) + "</button>";
        }).join("");
    }
    function saveLabel() {
        var name = $("lc-label-name").value.trim(); if (!name) { $("lc-label-name").focus(); return; }
        if (labelEdit) { var lb = label(labelEdit); lb.text = name; lb.color = labelColor; toast("updated"); }
        else { LABELS.push({ id: "l" + Date.now(), text: name, color: labelColor }); toast("created"); }
        window.empOverlay.close($("lc-label-modal")); render();
    }
    var delLabel = null;
    var FILES = [["photo", "IMG_0412.jpg", "John Driver · 11/05, 11:12", "2.4 MB"], ["photo", "IMG_0413.jpg", "John Driver · 11/05, 11:14", "2.1 MB"], ["doc", "BOL_136275.pdf", "John Driver · 11/05, 12:44", "860 KB"], ["doc", "RateCon_136275.pdf", "You · 11/05, 09:20", "320 KB"], ["doc", "POD_draft.pdf", "Natali Wilson · 11/05, 10:02", "410 KB"], ["voice", "Voice message", "John Driver · 11/05, 11:40", "0:42"], ["voice", "Voice message", "John Driver · 11/05, 12:10", "0:18"]];
    var filesTab = "all";
    function openFiles(kind) {
        filesTab = kind || filesTab;
        var q = ($("lc-files-q").value || "").trim().toLowerCase();
        var hit = function (f) { return !q || f[1].toLowerCase().indexOf(q) >= 0; };
        ["all", "photo", "doc", "voice"].forEach(function (k) { var n = FILES.filter(function (f) { return (k === "all" || f[0] === k) && hit(f); }).length; var c = document.querySelector('[data-lc-files-count="' + k + '"]'); if (c) c.textContent = n; });
        $("lc-files-tabs").querySelectorAll(".emp-tab").forEach(function (t) { var on = t.getAttribute("data-lc-files-tab") === filesTab; t.classList.toggle("is-active", on); t.setAttribute("aria-selected", on); });
        var list = FILES.filter(function (f) { return (filesTab === "all" || f[0] === filesTab) && hit(f); });
        $("lc-files-list").innerHTML = list.length ? list.map(function (f) {
            return window.empChat.fileHtml({ name: f[1], author: f[2], size: f[3], kind: f[0] === "photo" ? "photo" : f[0] === "voice" ? "voice" : "doc" });
        }).join("") : '<p class="lc-empty">No files found</p>';
    }
    /* Chat settings: quick replies are edited on a draft — Save applies, Cancel / × drops the changes */
    var tplDraft = [];
    function openSettings() {
        tplDraft = QUICK.slice();
        $("lc-set-widget").checked = state.settings.widget; $("lc-set-sound").checked = state.settings.sound; $("lc-set-desktop").checked = state.settings.desktop; $("lc-set-mentions").checked = state.settings.mentions;
        renderTemplates();
    }
    function renderTemplates() {
        $("lc-tpl-list").innerHTML = tplDraft.map(function (q, i) {
            return '<div class="lc-tpl" draggable="true" data-lc-tpl="' + i + '">' + icon("grip", "lc-tpl__grip") + '<span class="lc-tpl__text" data-lc-tpl-text="' + i + '">' + esc(q) + '</span><button class="lc-icon-btn" type="button" data-lc-tpl-edit="' + i + '" aria-label="Edit template">' + icon("ci-edit") + '</button><button class="lc-icon-btn lc-icon-btn--danger" type="button" data-lc-tpl-del="' + i + '" aria-label="Delete template">' + icon("ci-trash") + "</button></div>";
        }).join("") || '<p class="lc-empty lc-empty--sm">No quick replies yet</p>';
    }
    function commitTplEdits() {
        document.querySelectorAll(".lc-tpl__text[contenteditable=true]").forEach(function (x) { var i = +x.getAttribute("data-lc-tpl-text"); var v = x.textContent.trim(); if (v) tplDraft[i] = v; else tplDraft.splice(i, 1); x.contentEditable = "false"; });
    }
    function editTpl(i) {
        var txt = document.querySelector('[data-lc-tpl-text="' + i + '"]'); if (!txt) return;
        txt.contentEditable = "true"; txt.focus();
        var r = document.createRange(); r.selectNodeContents(txt); r.collapse(false); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
    }
    var rejectFor = null;
    function openAdd() {
        var l = byPro(state.open), have = memberNames(l);
        var people = [["Anna Lu", "Dispatcher"], ["Peter Ashton", "Dispatcher"], ["Lisa Kim", "Tracker"], ["Natali Wilson", "Tracker"], ["Winston Wolf", "Manager"]].filter(function (p) { return have.indexOf(p[0]) < 0; });
        $("lc-add-body").innerHTML = people.length ? '<div class="lc-add__list">' + people.map(function (p) {
            return '<label class="emp-check lc-add__row"><input class="emp-check__input" type="checkbox" value="' + esc(p[0]) + '" data-role="' + esc(p[1]) + '"><span class="emp-check__box"><svg class="emp-check__mark" viewBox="0 0 20 20" aria-hidden="true"><use href="#i-check"></use></svg><span class="emp-check__minus"></span></span><span class="emp-avatar">' + window.empChat.initials(p[0]) + '</span><span class="lc-menu__who"><span>' + esc(p[0]) + '</span><span class="lc-menu__role">' + esc(p[1]) + "</span></span></label>";
        }).join("") + "</div>" : '<p class="lc-empty lc-empty--sm">Everyone from your team is already in this chat.</p>';
        $("lc-add").querySelector("[data-lc-add-save]").disabled = !people.length;
        window.empOverlay.open($("lc-add"));
    }
    function saveAdd() {
        var l = byPro(state.open);
        var picked = Array.prototype.map.call($("lc-add-body").querySelectorAll(".emp-check__input:checked"), function (i) { return [i.value, i.getAttribute("data-role")]; });
        if (!picked.length) { toast("denied"); return; }
        picked.forEach(function (p) { members(l).push({ name: p[0], role: p[1], av: window.empChat.initials(p[0]) }); pushEvent(p[0] + " has been added to the chat by " + ME.name); });
        syncMentions(l);
        window.empOverlay.close($("lc-add"));
        toast("added", { name: picked.map(function (p) { return p[0]; }).join(", ") });
    }
    function openAddDriver() {
        $("lc-drv-truck").value = ""; $("lc-drv-name").value = ""; $("lc-drv-team").value = "";
        $("lc-drv-field").classList.remove("is-error"); $("lc-drv-error").hidden = true;
        var all = document.querySelector('input[name="lc-history"][value="All messages and files"]'); if (all) all.checked = true;
        window.empOverlay.open($("lc-add-driver")); setTimeout(function () { $("lc-drv-truck").focus(); }, 50);
    }
    function saveDriver() {
        var l = byPro(state.open), v = $("lc-drv-name").value.trim();
        var name = v.replace(/ · \d+$/, "");
        if (!name) { $("lc-drv-field").classList.add("is-error"); $("lc-drv-error").hidden = false; $("lc-drv-name").focus(); return; }
        if (memberNames(l).indexOf(name) >= 0) { $("lc-drv-field").classList.add("is-error"); $("lc-drv-error").textContent = name + " is already in this chat"; $("lc-drv-error").hidden = false; return; }
        var hist = (document.querySelector('input[name="lc-history"]:checked') || {}).value || "All messages and files";
        var team = $("lc-drv-team").value.trim().replace(/ · \d+$/, "");
        [name].concat(team && team !== name && memberNames(l).indexOf(team) < 0 ? [team] : []).forEach(function (n) {
            members(l).push({ name: n, role: "Driver", av: window.empChat.initials(n) });
            pushEvent(n + " has been added to the chat by " + ME.name + " · sees: " + hist.toLowerCase());
        });
        syncMentions(l);
        window.empOverlay.close($("lc-add-driver")); toast("added", { name: name });
    }

    /* ---------- events ---------- */
    document.addEventListener("click", function (e) {
        var t = e.target;
        if (!t.closest(".lc-menu") && !t.closest("[data-lc-members],[data-lc-label-menu],[data-lc-archive]")) closeMenu();
        var a = t.closest("[data-lc-tab],[data-lc-open],[data-lc-archive],[data-lc-archive-for],[data-lc-filter],[data-lc-label-menu],[data-lc-label-add],[data-lc-label-edit],[data-lc-label-del],[data-lc-label-attach],[data-lc-labels-toggle],[data-lc-unlabel],[data-lc-member],[data-lc-copy],[data-lc-members],[data-lc-stops],[data-lc-get-bol],[data-lc-check-call],[data-lc-location],[data-lc-remove-member],[data-lc-add],[data-lc-add-driver],[data-lc-driver-save],[data-lc-dispatch],[data-lc-files],[data-lc-files-tab],[data-lc-files-all],[data-lc-export],[data-lc-offer-archive],[data-lc-bol-approve],[data-lc-bol-reject],[data-lc-color],[data-lc-label-save],[data-lc-del-confirm],[data-lc-tpl-del],[data-lc-tpl-edit],[data-lc-tpl-add],[data-lc-settings-save],[data-lc-add-save],[data-lc-reject-save],[data-lc-noop],[data-overlay-open=lc-settings]");
        if (!a) return;
        var d = a.dataset, l = byPro(state.open);
        if ("lcNoop" in d) { e.preventDefault(); return; }
        if (a.getAttribute("data-overlay-open") === "lc-settings") { openSettings(); return; }
        if (d.lcTab) { state.tab = d.lcTab; state.filter = []; if (state.tab !== "team") { var first = visibleLoads()[0]; state.open = first ? first.pro : null; } render(); return; }
        if (d.lcArchive) { e.stopPropagation(); if (a.getAttribute("aria-expanded") === "true") closeMenu(); else openArchiveMenu(a, d.lcArchive); return; }
        if (d.lcArchiveFor) { e.stopPropagation(); var pro = a.closest(".lc-menu").getAttribute("data-pro"); closeMenu(); archive(byPro(pro), d.lcArchiveFor); return; }
        if (d.lcUnlabel) { e.stopPropagation(); var p = d.lcUnlabel.split(":"), lu = byPro(p[0]); lu.labels = lu.labels.filter(function (x) { return x !== p[1]; }); render(); return; }
        if (d.lcOpen) { if (t.closest(".lc-chip-x,.lc-menu")) return; state.open = d.lcOpen; render(); return; }
        if (d.lcFilter) { var i = state.filter.indexOf(d.lcFilter); if (i >= 0) state.filter.splice(i, 1); else state.filter.push(d.lcFilter); renderSide(); return; }
        if (d.lcLabelMenu) { e.stopPropagation(); if (a.getAttribute("aria-expanded") === "true") closeMenu(); else openLabelMenu(a, d.lcLabelMenu); return; }
        if ("lcLabelAdd" in d) { openLabelModal(); return; }
        if (d.lcLabelAttach) { closeMenu(); if (l.labels.indexOf(d.lcLabelAttach) < 0) { l.labels.push(d.lcLabelAttach); toast("labelAdded", { name: label(d.lcLabelAttach).text }); } render(); return; }
        if (d.lcLabelEdit) { closeMenu(); openLabelModal(d.lcLabelEdit); return; }
        if (d.lcLabelDel) { closeMenu(); delLabel = d.lcLabelDel; $("lc-del-text").textContent = "Are you sure you want to delete the label “" + label(delLabel).text + "”? It will be removed from all chats."; window.empOverlay.open($("lc-del-modal")); return; }
        if ("lcDelConfirm" in d) { LABELS = LABELS.filter(function (x) { return x.id !== delLabel; }); LOADS.forEach(function (x) { x.labels = x.labels.filter(function (y) { return y !== delLabel; }); }); state.filter = state.filter.filter(function (y) { return y !== delLabel; }); window.empOverlay.close($("lc-del-modal")); toast("deleted"); render(); return; }
        if (d.lcColor) { labelColor = d.lcColor; paintColors(); return; }
        if ("lcLabelSave" in d) { saveLabel(); return; }
        if ("lcLabelsToggle" in d) { state.labelsOpen = !state.labelsOpen; renderSide(); return; }
        if (d.lcMember) { var mi = +d.lcMember; state.teamOpen = state.teamOpen === mi ? null : mi; if (state.teamOpen !== null) { var f2 = memberLoads(TEAM[mi])[0]; if (f2) state.open = f2.pro; } render(); return; }
        if ("lcCopy" in d) { if (navigator.clipboard) navigator.clipboard.writeText("#" + l.pro).catch(function () {}); toast("loadCopied", { name: "#" + l.pro }); return; }
        if ("lcMembers" in d) { e.stopPropagation(); if (a.getAttribute("aria-expanded") === "true") closeMenu(); else openMembers(a); return; }
        if ("lcStops" in d) { state.stopsOpen = !state.stopsOpen; renderMain(); return; }
        if ("lcGetBol" in d) { pushEvent("BOL requested from " + l.driver + " by " + ME.name); toast("requested", { name: "BOL" }); return; }
        if ("lcCheckCall" in d) { pushEvent("Check call requested by " + ME.name); toast("requested", { name: "Check call" }); return; }
        if ("lcLocation" in d) { pushEvent("Location requested by " + ME.name); toast("requested", { name: "Current location" }); var lp = l.pro; setTimeout(function () { var c = chatNode(); if (c && state.open === lp) { c.push({ side: "in", author: l.driver, avatar: window.empChat.initials(l.driver), type: "location", place: "Marietta, GA 30060", placeNote: "Live location · 24 mi to DEL" }); c.scrollBottom(); } }, 2200); return; }
        if (d.lcRemoveMember) { var ms = members(l), rm = ms.splice(+d.lcRemoveMember, 1)[0]; closeMenu(); syncMentions(l); pushEvent(rm.name + " has been removed from the chat by " + ME.name); return; }
        if ("lcAdd" in d) { closeMenu(); openAdd(); return; }
        if ("lcAddDriver" in d) { closeMenu(); openAddDriver(); return; }
        if ("lcDriverSave" in d) { saveDriver(); return; }
        if ("lcAddSave" in d) { saveAdd(); return; }
        if ("lcDispatch" in d) { closeMenu(); var c2 = chatNode(); var dm = c2.push({ side: "out", author: ME.name, avatar: "AJ", status: "sent", text: DISPATCH, readBy: [] }); c2.pinned.unshift(dm.id); c2._pinIndex = 0; c2.paintPinned(); c2.scrollBottom(); toast("sent", { name: "Dispatch message" }); return; }
        if ("lcFiles" in d) { closeMenu(); $("lc-files-title").textContent = "Files · #" + l.pro; $("lc-files-q").value = ""; openFiles("all"); window.empOverlay.open($("lc-files")); return; }
        if (d.lcFilesTab) { openFiles(d.lcFilesTab); return; }
        if ("lcFilesAll" in d) { toast("downloading", { name: document.querySelectorAll("#lc-files-list .emp-chat__file").length + " files" }); return; }
        if ("lcExport" in d) { closeMenu(); toast("exported", { name: "Chat #" + l.pro }); return; }
        if ("lcOfferArchive" in d) { closeMenu(); window.location.href = "offers.html#archive"; return; }
        if (d.lcBolApprove) { var c3 = chatNode(), bm = c3.byId(d.lcBolApprove); bm.status = "approved"; c3.repaint(bm); c3.push({ kind: "event", tone: "success", text: "BOL approved by " + ME.name }); c3.scrollBottom(); return; }
        if (d.lcBolReject) { rejectFor = d.lcBolReject; $("lc-reject-note").value = ""; var def = document.querySelector('input[name="lc-reason"][value^="Missing signature"]'); if (def) def.checked = true; $("lc-reject-field").classList.remove("is-error"); $("lc-reject-error").hidden = true; window.empOverlay.open($("lc-reject")); return; }
        if ("lcRejectSave" in d) {
            var r = document.querySelector('input[name="lc-reason"]:checked'), reason = r ? r.value : "Other reason", note = $("lc-reject-note").value.trim();
            if (reason === "Other reason" && !note) { $("lc-reject-field").classList.add("is-error"); $("lc-reject-error").hidden = false; $("lc-reject-note").focus(); return; }
            var c4 = chatNode(), rb = c4.byId(rejectFor); rb.status = "rejected"; rb.reason = reason; c4.repaint(rb);
            c4.push({ kind: "event", tone: "danger", text: "BOL rejected by " + ME.name + ": " + (reason === "Other reason" ? note : reason.toLowerCase()) + ". Please, attach new BOL." });
            if (note && reason !== "Other reason") c4.push({ side: "out", author: ME.name, avatar: "AJ", status: "sent", text: note });
            c4.scrollBottom(); window.empOverlay.close($("lc-reject")); return;
        }
        if (d.lcTplDel) { commitTplEdits(); tplDraft.splice(+d.lcTplDel, 1); renderTemplates(); return; }
        if (d.lcTplEdit) { var tx = document.querySelector('[data-lc-tpl-text="' + d.lcTplEdit + '"]'); if (tx && tx.isContentEditable) { commitTplEdits(); renderTemplates(); } else { commitTplEdits(); renderTemplates(); editTpl(+d.lcTplEdit); } return; }
        if ("lcTplAdd" in d) { commitTplEdits(); tplDraft.push("New quick reply"); renderTemplates(); editTpl(tplDraft.length - 1); var nt = document.querySelector('[data-lc-tpl-text="' + (tplDraft.length - 1) + '"]'); if (nt) { var rg = document.createRange(); rg.selectNodeContents(nt); var sl = window.getSelection(); sl.removeAllRanges(); sl.addRange(rg); } return; }
        if ("lcSettingsSave" in d) {
            commitTplEdits();
            QUICK.length = 0; Array.prototype.push.apply(QUICK, tplDraft.filter(function (x) { return x && x.trim(); }));
            state.settings.widget = $("lc-set-widget").checked; state.settings.sound = $("lc-set-sound").checked; state.settings.desktop = $("lc-set-desktop").checked; state.settings.mentions = $("lc-set-mentions").checked;
            try { localStorage.setItem("empChatWidget.off", state.settings.widget ? "0" : "1"); } catch (er) {}
            window.empOverlay.close($("lc-settings")); toast("saved"); renderMain(); return;
        }
    });
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeMenu();
        /* Rows are role="button": Enter and Space open them, like a real button */
        if ((e.key === "Enter" || e.key === " ") && e.target.matches && e.target.matches("[data-lc-open]")) { e.preventDefault(); e.target.click(); }
        if (e.key === "Enter" && e.target.id === "lc-label-name") saveLabel();
        if (e.key === "Enter" && e.target.matches && e.target.matches(".lc-tpl__text[contenteditable=true]")) { e.preventDefault(); commitTplEdits(); renderTemplates(); }
    });
    document.addEventListener("input", function (e) {
        if (e.target.id === "lc-q") { state.q = e.target.value; renderSide(); }
        if (e.target.id === "lc-label-name") paintColors();
        if (e.target.id === "lc-files-q") openFiles();
        if (e.target.id === "lc-reject-note") { $("lc-reject-field").classList.remove("is-error"); $("lc-reject-error").hidden = true; }
        if (e.target.id === "lc-drv-name") { $("lc-drv-field").classList.remove("is-error"); $("lc-drv-error").hidden = true; }
        /* Truck number picks the driver of that truck */
        if (e.target.id === "lc-drv-truck") { var tn = e.target.value.trim(); var hit = DRIVERS.filter(function (x) { return x[1] === tn; })[0]; if (hit) { $("lc-drv-name").value = hit[0] + " · " + hit[1]; $("lc-drv-field").classList.remove("is-error"); $("lc-drv-error").hidden = true; } }
    });
    document.addEventListener("change", function (e) { if (e.target.id === "lc-drv-name") { $("lc-drv-field").classList.remove("is-error"); $("lc-drv-error").hidden = true; } });
    window.addEventListener("hashchange", function () { var h = (location.hash || "").replace("#", ""), hl = byPro(h); if (hl) { state.tab = hl.archived ? "archive" : "active"; state.open = h; render(); } });
    /* Drag a label onto a chat in the list; drag templates to reorder them */
    var dragLabel = null, dragTpl = null;
    document.addEventListener("dragstart", function (e) {
        var tp = e.target.closest && e.target.closest("[data-lc-tpl]");
        if (tp) { commitTplEdits(); dragTpl = +tp.getAttribute("data-lc-tpl"); tp.classList.add("is-dragging"); e.dataTransfer.effectAllowed = "move"; try { e.dataTransfer.setData("text/plain", "tpl"); } catch (er) {} return; }
        var lb = e.target.closest && e.target.closest("[data-lc-label]"); if (!lb) return; dragLabel = lb.getAttribute("data-lc-label"); lb.classList.add("is-dragging"); e.dataTransfer.effectAllowed = "copy"; try { e.dataTransfer.setData("text/plain", dragLabel); } catch (er) {} document.body.classList.add("lc-is-dragging");
    });
    document.addEventListener("dragend", function () { dragLabel = null; dragTpl = null; document.body.classList.remove("lc-is-dragging"); document.querySelectorAll(".is-dragging,.is-drop").forEach(function (n) { n.classList.remove("is-dragging", "is-drop"); }); });
    document.addEventListener("dragover", function (e) {
        if (dragTpl !== null) { var row = e.target.closest && e.target.closest("[data-lc-tpl]"); document.querySelectorAll(".lc-tpl.is-drop").forEach(function (n) { if (n !== row) n.classList.remove("is-drop"); }); if (row) { e.preventDefault(); row.classList.add("is-drop"); } return; }
        if (!dragLabel) return; var it = e.target.closest && e.target.closest("[data-lc-open]"); document.querySelectorAll(".lc-item.is-drop").forEach(function (n) { if (n !== it) n.classList.remove("is-drop"); }); if (it && !byPro(it.getAttribute("data-lc-open")).archived) { e.preventDefault(); it.classList.add("is-drop"); }
    });
    document.addEventListener("drop", function (e) {
        if (dragTpl !== null) { var row = e.target.closest && e.target.closest("[data-lc-tpl]"); if (!row) return; e.preventDefault(); var to = +row.getAttribute("data-lc-tpl"), item = tplDraft.splice(dragTpl, 1)[0]; tplDraft.splice(to, 0, item); dragTpl = null; renderTemplates(); return; }
        if (!dragLabel) return; var it = e.target.closest && e.target.closest("[data-lc-open]"); if (!it) return; e.preventDefault();
        var l = byPro(it.getAttribute("data-lc-open")), lb = label(dragLabel);
        if (!l.archived && l.labels.indexOf(dragLabel) < 0) { l.labels.push(dragLabel); toast("labelAdded", { name: lb.text }); }
        dragLabel = null; render();
    });

    function init() {
        if (window.empChat.injectSprite) window.empChat.injectSprite();
        var hash = (location.hash || "").replace("#", ""), hl = byPro(hash); if (hl) { state.open = hash; if (hl.archived) state.tab = "archive"; }
        render();
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
