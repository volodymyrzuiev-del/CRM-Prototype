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

    var LABELS = [
        { id: "l1", text: "Urgent Issues", color: "red" }, { id: "l2", text: "Issue", color: "orange" }, { id: "l3", text: "Team Driver", color: "purple" },
        { id: "l4", text: "Canada load", color: "blue" }, { id: "l5", text: "Future load", color: "green" }
    ];
    var TEAM = [
        { name: "Anna Lu", role: "Dispatcher", avatar: "AL", loads: ["612300", "612455", "523411"] },
        { name: "Peter Ashton", role: "Dispatcher", avatar: "PA", loads: ["345678", "523498"] },
        { name: "Nataly Wilson", role: "Tracker", avatar: "NW", loads: ["876678"] },
        { name: "Mike Ross", role: "Dispatcher", avatar: "MR", loads: [] }
    ];
    var QUICK = ["You are welcome", "Thank you", "Please, share your current location", "Please send the BOL right after loading"];
    var DISPATCH = "PU 11/05/26 08:00–15:00\nPLAE VERTICAL, 190 ETOWAH INDUSTRIAL, CANTON GA 30114\nPhone# (404) 645-7900 HUNTER\nPU#: 1 pallet, 230 lbs\n\nDEL 11/06/26 09:00\nD1 SOUTHLAKE, 500 WEST SOUTHLAKE BLVD SUITE 100, SOUTHLAKE TX 76092\nPhone: (323) 599-2272 - IRWIN\n\nRATE: $725\nREMINDER: you are working under Empire National Authority with MC# 966111 and USDOT# 2878524. Please keep the Empire App ON while you are on a load with us.\nYour dispatcher is Andrew Jameson. Ph# (864) 920-2552";

    function load(pro, from, to, author, role, last, time, o) {
        o = o || {};
        return { pro: pro, from: from, to: to, author: author, role: role, last: last, time: time, type: o.type || "text", unread: o.unread || 0, labels: o.labels || [], archived: !!o.archived, draft: o.draft,
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
        load("401120", "Newark, NJ 07102", "Boston, MA 02108", "John Smith", "Driver", "Delivered, POD attached.", "Yesterday", { archived: true, type: "file" }),
        load("401177", "Tampa, FL 33602", "Orlando, FL 32801", "You", "Dispatcher", "Thanks, closing the load.", "11/03", { archived: true })
    ];
    var state = { tab: "active", open: "136275", filter: [], q: "", member: null, stopsOpen: false, labelsOpen: true, settings: { widget: true, sound: true, popup: true } };
    try { state.settings.widget = localStorage.getItem("empChatWidget.off") !== "1"; } catch (e) {}
    function byPro(p) { for (var i = 0; i < LOADS.length; i++) if (LOADS[i].pro === p) return LOADS[i]; return null; }
    function label(id) { for (var i = 0; i < LABELS.length; i++) if (LABELS[i].id === id) return LABELS[i]; return null; }
    function route(l) { return l.from + " → " + l.to; }

    /* ---------- conversation data ---------- */
    function members(l) {
        if (!l.members) l.members = [{ name: ME.name + " (You)", role: "Dispatcher", av: "AJ", me: true }, { name: "Natali Wilson", role: "Tracker", av: "NW" }, { name: l.driver, role: "Driver", av: window.empChat.initials(l.driver) }];
        return l.members;
    }
    function stops(l) {
        if (!l.stops) l.stops = [
            { t: "PU1", city: l.from.replace(/ \d+$/, ""), addr: "MAPLE AVENUE, 4", dt: "11/05/2026 12:45 – 11/05/2026 14:45", svc: ["Driver assist", "Clean background"] },
            { t: "PU2", city: "Texas, TX", addr: "OAK STREET, 14", dt: "11/05/2026 16:24 – 11/05/2026 17:24", svc: [] },
            { t: "DEL1", city: "Florida, GA", addr: "PINE BOULEVARD, 11/2", dt: "11/06/2026 02:22 – 11/06/2026 04:22", svc: ["Full PPE", "White glove service"] },
            { t: "DEL2", city: l.to.replace(/ \d+$/, ""), addr: "ELM DRIVE, 21", dt: "11/06/2026 12:05 – 11/06/2026 13:05", svc: [] }
        ];
        return l.stops;
    }
    function messages(l) {
        if (l.msgs) return l.msgs;
        var d = l.driver, di = window.empChat.initials(d);
        var m = [
            { kind: "event", tone: "success", text: "Load has been successfully created", time: "11/04/2026 9:20 AM", day: "Yesterday" },
            { kind: "event", tone: "neutral", text: d + " has been assigned to the load", time: "11/04/2026 9:20 AM", day: "Yesterday" },
            { side: "out", author: ME.name, avatar: "AJ", role: "Dispatcher", time: "9:22 AM", day: "Yesterday", status: "read", text: DISPATCH, pinned: true, readBy: [[d, "Driver"], ["Natali Wilson", "Tracker"]] },
            { side: "in", author: "Natali Wilson", avatar: "NW", role: "Tracker", time: "9:40 AM", day: "Yesterday", text: "Receiver closes at 4 PM, no appointments after 3:30 PM.", pinned: true },
            { kind: "event", tone: "success", text: "Check In at PU1", time: "11:40 AM", day: "Today" },
            { side: "in", author: d, avatar: di, role: "Driver", time: "11:58 AM", day: "Today", text: "Arrived at the shipper, waiting for the dock." },
            { side: "out", author: ME.name, avatar: "AJ", time: "12:02 PM", day: "Today", status: "read", text: "Thanks! Please send the BOL right after loading.", readBy: [[d, "Driver"], ["Natali Wilson", "Tracker"]] }
        ];
        if (l.pro === "136275") {
            m.splice(1, 0, { kind: "event", tone: "success", text: d + " accepted offer", time: "11/04/2026 9:02 AM", day: "Yesterday" }, { kind: "card", card: "offer", state: "booked", time: "9:02 AM", day: "Yesterday" }, { kind: "event", tone: "neutral", text: "Hold by Andrew Jameson", time: "11/04/2026 9:05 AM", day: "Yesterday" });
            m.push({ side: "in", author: "Natali Wilson", avatar: "NW", role: "Tracker", time: "12:34 PM", day: "Today", text: "Driver checked in at PU1. I will keep an eye on the dock time and update the broker." });
            m.push({ kind: "card", card: "bol", time: "12:40 PM", day: "Today", file: "BOL_136275.pdf", status: "review" });
        } else if (l.unread) {
            m.push({ side: "in", id: "u-" + l.pro, author: l.author, avatar: window.empChat.initials(l.author), role: l.role, time: "12:28 PM", day: "Today", text: "Driver is En Route, ETA to DEL 4:30 PM." });
            m.push({ side: "in", author: l.author, avatar: window.empChat.initials(l.author), role: l.role, time: "12:30 PM", day: "Today", type: "location", place: "Harrisburg, PA 17101", placeNote: "Shared the current location" });
            m.push({ side: "in", author: l.author, avatar: window.empChat.initials(l.author), role: l.role, time: "12:31 PM", day: "Today", text: "Traffic is ok, no delays expected." });
        } else if (l.type === "voice") m.push({ side: "in", author: l.author, avatar: window.empChat.initials(l.author), time: "12:20 PM", day: "Today", type: "voice", duration: "0:42" });
        else if (l.type === "file") m.push({ side: l.author === "You" ? "out" : "in", author: l.author === "You" ? ME.name : l.author, avatar: l.author === "You" ? "AJ" : window.empChat.initials(l.author), time: "11:40 AM", day: "Today", status: "read", type: "file", file: { name: l.last.replace(/^2 files · /, ""), size: "1.1 MB" } });
        else if (l.type === "photo") m.push({ side: "in", author: l.author, avatar: window.empChat.initials(l.author), time: "08:47 AM", day: "Today", type: "gallery", more: 0 });
        else if (l.type === "system") m.push({ kind: "event", tone: "success", text: l.last, time: "09:31 AM", day: "Today" });
        else if (l.type !== "draft") m.push({ side: l.author === "You" ? "out" : "in", author: l.author === "You" ? ME.name : l.author, avatar: l.author === "You" ? "AJ" : window.empChat.initials(l.author), time: l.time, day: "Today", status: "delivered", text: l.last });
        l.msgs = m;
        return m;
    }

    /* ---------- left: labels + list ---------- */
    function labelHtml(lb) {
        var on = state.filter.indexOf(lb.id) >= 0;
        return '<span class="lc-label' + (on ? " is-on" : "") + '" draggable="true" data-lc-label="' + lb.id + '" title="Drag onto a chat to add the label">' + icon("grip", "lc-label__grip") +
            '<button class="lc-label__chip" type="button" data-lc-filter="' + lb.id + '" aria-pressed="' + on + '">' + chip(lb.text, lb.color, { fill: on }) + "</button>" +
            '<button class="lc-label__menu" type="button" data-lc-label-menu="' + lb.id + '" aria-label="Label actions">' + icon("dots-v") + "</button></span>";
    }
    function lastHtml(l) {
        var ic = { file: ["file-text", "is-accent"], voice: ["ci-mic-fill", "is-accent"], photo: ["image", "is-accent"], system: ["info", ""] }[l.type];
        var text = l.type === "draft" ? '<span class="lc-item__draft">Draft:</span> ' + esc(l.last) : esc(l.last);
        return '<span class="lc-item__msg' + (l.type === "system" ? " lc-item__msg--system" : "") + '">' + (ic ? icon(ic[0], "lc-item__type " + ic[1]) : "") + '<span class="lc-item__text">' + text + "</span></span>";
    }
    function itemHtml(l) {
        var cls = "lc-item" + (state.open === l.pro ? " is-active" : "") + (l.unread ? " is-unread" : "");
        return '<div class="' + cls + '" role="button" tabindex="0" data-lc-open="' + l.pro + '">' +
            '<div class="lc-item__top"><span class="lc-item__pro">#' + l.pro + '</span><span class="lc-item__route">' + esc(route(l)) + '</span><span class="lc-item__time">' + esc(l.time) + "</span>" +
            (l.archived ? "" : '<button class="lc-item__archive" type="button" data-lc-archive="' + l.pro + '" aria-label="Move to archive" title="Move to archive">' + icon("archive-fill") + "</button>") + "</div>" +
            '<div class="lc-item__body">' + (l.type === "system" ? "" : '<span class="lc-item__who"><span class="lc-item__author">' + esc(l.author) + ':</span><span class="lc-item__role">' + esc(l.role) + "</span></span>") + lastHtml(l) +
            (l.unread ? '<span class="lc-item__count">' + l.unread + "</span>" : "") + "</div>" +
            (l.labels.length ? '<div class="lc-item__labels">' + l.labels.map(function (id) { var lb = label(id); return lb ? chip(lb.text, lb.color, { x: 'data-lc-unlabel="' + l.pro + ":" + id + '"' }) : ""; }).join("") + "</div>" : "") + "</div>";
    }
    function visibleLoads() {
        var q = state.q.toLowerCase().replace(/^#/, "");
        return LOADS.filter(function (l) {
            if (state.tab === "archive" ? !l.archived : l.archived) return false;
            if (state.tab === "team" && (!state.member || state.member.loads.indexOf(l.pro) < 0)) return false;
            if (state.filter.length && !state.filter.every(function (f) { return l.labels.indexOf(f) >= 0; })) return false;
            if (q && (l.pro + " " + route(l) + " " + l.author + " " + l.last).toLowerCase().indexOf(q) < 0) return false;
            return true;
        });
    }
    function renderSide() {
        var active = LOADS.filter(function (l) { return !l.archived; }).length;
        $("lc-active-count").textContent = active;
        document.querySelectorAll("[data-lc-tab]").forEach(function (t) { var on = t.getAttribute("data-lc-tab") === state.tab; t.classList.toggle("is-active", on); t.setAttribute("aria-selected", on); });
        var h = "";
        if (state.tab !== "team" || state.member) {
            h += '<div class="lc-labels' + (state.labelsOpen ? "" : " is-closed") + '"><div class="lc-labels__head"><span class="lc-labels__title">My Labels</span><button class="lc-icon-btn" type="button" data-lc-labels-toggle aria-expanded="' + state.labelsOpen + '" aria-label="' + (state.labelsOpen ? "Hide" : "Show") + ' labels">' + icon(state.labelsOpen ? "chev-up" : "ci-down") + "</button></div>" +
                (state.labelsOpen ? '<div class="lc-labels__list" id="lc-labels">' + LABELS.map(labelHtml).join("") + '<button class="emp-plus" type="button" data-lc-label-add aria-label="Add label"><svg class="emp-icon" viewBox="0 0 16 16" aria-hidden="true"><use href="#i-plus"></use></svg></button></div>' : "") + "</div>";
        }
        if (state.tab === "team" && !state.member) {
            h += '<div class="lc-list" data-emp-fade>' + TEAM.map(function (t, i) {
                return '<button class="lc-member" type="button" data-lc-member="' + i + '"><span class="emp-avatar emp-avatar--lg">' + t.avatar + '</span><span class="lc-member__body"><span class="lc-item__pro">' + esc(t.name) + '</span><span class="lc-item__role">' + esc(t.role) + '</span></span><span class="lc-member__loads">' + t.loads.length + " active loads</span></button>";
            }).join("") + "</div>";
        } else {
            var list = visibleLoads();
            h += (state.tab === "team" ? '<button class="lc-crumb" type="button" data-lc-member-back>' + icon("left") + "<span>My team · " + esc(state.member.name) + "</span></button>" : "") +
                '<div class="lc-list" id="lc-list" data-emp-fade>' + (list.length ? list.map(itemHtml).join("") : '<p class="lc-empty">' + (state.filter.length ? "No chats with these labels" : state.tab === "archive" ? "Archive is empty" : "No chats found") + "</p>") + "</div>";
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
            '<span class="lc-grow"></span>' + (arch ? btn("Restore", "primary", "", "data-lc-restore") :
                btn("Get BOL", "outline", "file-text", "data-lc-get-bol") + btn("Check call", "secondary", "", "data-lc-check-call") + btn("Request location", "primary", "ci-geo", "data-lc-location")) + "</div>" +
            (l.labels.length ? '<div class="lc-head__labels">' + l.labels.map(function (id) { var lb = label(id); return lb ? chip(lb.text, lb.color, { x: 'data-lc-unlabel="' + l.pro + ":" + id + '"' }) : ""; }).join("") + "</div>" : "") +
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
            : m.status === "approved" ? chip("BOL approved by " + ME.name, "green") : chip("BOL rejected · " + (m.reason || ""), "red");
        return '<div class="lc-bol"><span class="lc-bol__title">BOL sent — check it</span>' + window.empChat.fileHtml({ name: m.file, author: "John Driver", size: "3 pages · 860 KB" }) + '<div class="lc-bol__status">' + status + "</div></div>";
    }
    function chatNode() { var n = document.querySelector("#lc-main .emp-chat"); return n && n._empChat; }
    function pushEvent(text, tone) { var c = chatNode(); if (!c) return; c.push({ kind: "event", tone: tone || "neutral", text: text }); c.scrollBottom(); }
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
            me: ME, messages: msgs, quick: QUICK, mentions: members(l).map(function (m) { return { name: m.name.replace(" (You)", "") }; }), channel: "via App", unreadFrom: unread,
            placeholder: "Write a message", renderCard: function (m) { return m.card === "bol" ? bolCard(m) : offerCard(m); },
            demo: { name: l.driver, avatar: window.empChat.initials(l.driver), channel: "via App", replies: ["Got it 👍", "Copy that.", "Will do.", "On my way, ETA 1h 20m."] },
            disabled: l.archived,
            onSend: function (m) { l.last = m.text || (m.file ? m.file.name : "Message"); l.author = "You"; l.role = "Dispatcher"; l.type = m.type === "file" ? "file" : "text"; l.time = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }); renderSide(); }
        });
        if (l.draft) c.input.value = l.draft;
    }
    function render() { renderSide(); renderMain(); }

    /* ---------- members menu ---------- */
    function closeMenu() { var m = document.querySelector(".lc-menu"); if (m) m.remove(); document.querySelectorAll("[data-lc-members],[data-lc-label-menu]").forEach(function (b) { b.setAttribute("aria-expanded", "false"); }); }
    function openMembers(anchor) {
        var l = byPro(state.open); closeMenu();
        var ms = members(l);
        var menu = document.createElement("div"); menu.className = "lc-menu lc-menu--members"; menu.setAttribute("role", "menu");
        menu.innerHTML = '<span class="lc-menu__title">Members (' + ms.length + ")</span>" + ms.map(function (m, i) {
            return '<div class="lc-menu__member"><span class="emp-avatar">' + esc(m.av) + '</span><span class="lc-menu__who"><span>' + esc(m.name) + '</span><span class="lc-menu__role">' + esc(m.role) + "</span></span>" + (m.me ? "" : '<button class="lc-icon-btn" type="button" data-lc-remove-member="' + i + '" aria-label="Remove ' + esc(m.name) + '">' + icon("ci-x") + "</button>") + "</div>";
        }).join("") + '<span class="lc-menu__sep"></span>' +
            item("ci-plus", "Add members", "data-lc-add=members") + item("ci-plus", "Add driver", "data-lc-add=driver") + item("megaphone", "Dispatch message", "data-lc-dispatch") + '<span class="lc-menu__sep"></span>' +
            item("ci-file", "Files (6)", "data-lc-files") + item("ci-download", "Export chat (PDF)", "data-lc-export") + item("archive", "Offer’s archive (2)", "data-lc-offer-archive");
        anchor.parentNode.appendChild(menu); anchor.setAttribute("aria-expanded", "true");
        function item(ic, text, attr) { var p = attr.split("="); return '<button class="lc-menu__item" type="button" role="menuitem" ' + p[0] + (p[1] ? '="' + p[1] + '"' : "") + ">" + icon(ic) + "<span>" + text + "</span></button>"; }
    }
    function openLabelMenu(anchor, id) {
        closeMenu();
        var menu = document.createElement("div"); menu.className = "lc-menu lc-menu--label"; menu.setAttribute("role", "menu");
        menu.innerHTML = '<button class="lc-menu__item" type="button" role="menuitem" data-lc-label-edit="' + id + '">' + icon("ci-edit") + '<span>Edit</span></button><button class="lc-menu__item lc-menu__item--danger" type="button" role="menuitem" data-lc-label-del="' + id + '">' + icon("ci-trash") + "<span>Delete</span></button>";
        anchor.closest(".lc-label").appendChild(menu); anchor.setAttribute("aria-expanded", "true");
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
    function openFiles(kind) {
        var files = [["photo", "IMG_0412.jpg", "John Driver", "2.4 MB"], ["photo", "IMG_0413.jpg", "John Driver", "2.1 MB"], ["doc", "BOL_136275.pdf", "John Driver", "860 KB"], ["doc", "RateCon_136275.pdf", "Andrew Jameson", "320 KB"], ["doc", "POD_draft.pdf", "Natali Wilson", "410 KB"], ["voice", "Voice message", "John Driver", "0:42"]];
        var tab = kind || "all";
        $("lc-files-tabs").querySelectorAll(".emp-tab").forEach(function (t) { var on = t.getAttribute("data-lc-files-tab") === tab; t.classList.toggle("is-active", on); t.setAttribute("aria-selected", on); });
        $("lc-files-list").innerHTML = files.filter(function (f) { return tab === "all" || f[0] === tab; }).map(function (f) {
            return window.empChat.fileHtml({ name: f[1], author: f[2], size: f[3], kind: f[0] === "photo" ? "photo" : f[0] === "voice" ? "voice" : "doc" });
        }).join("");
    }
    function renderTemplates() {
        $("lc-tpl-list").innerHTML = QUICK.map(function (q, i) {
            return '<div class="lc-tpl">' + icon("grip", "lc-tpl__grip") + '<span class="lc-tpl__text">' + esc(q) + '</span><button class="lc-icon-btn" type="button" data-lc-tpl-edit="' + i + '" aria-label="Edit template">' + icon("ci-edit") + '</button><button class="lc-icon-btn lc-icon-btn--danger" type="button" data-lc-tpl-del="' + i + '" aria-label="Delete template">' + icon("ci-trash") + "</button></div>";
        }).join("");
    }
    var rejectFor = null;

    /* ---------- events ---------- */
    document.addEventListener("click", function (e) {
        var t = e.target;
        if (!t.closest(".lc-menu") && !t.closest("[data-lc-members],[data-lc-label-menu]")) closeMenu();
        var a = t.closest("[data-lc-tab],[data-lc-open],[data-lc-archive],[data-lc-filter],[data-lc-label-menu],[data-lc-label-add],[data-lc-label-edit],[data-lc-label-del],[data-lc-labels-toggle],[data-lc-unlabel],[data-lc-member],[data-lc-member-back],[data-lc-copy],[data-lc-members],[data-lc-stops],[data-lc-get-bol],[data-lc-check-call],[data-lc-location],[data-lc-restore],[data-lc-remove-member],[data-lc-add],[data-lc-dispatch],[data-lc-files],[data-lc-files-tab],[data-lc-export],[data-lc-offer-archive],[data-lc-bol-approve],[data-lc-bol-reject],[data-lc-color],[data-lc-label-save],[data-lc-del-confirm],[data-lc-tpl-del],[data-lc-tpl-edit],[data-lc-tpl-add],[data-lc-settings-save],[data-lc-add-save],[data-lc-reject-save],[data-lc-noop]");
        if (!a) return;
        var d = a.dataset, l = byPro(state.open);
        if ("lcNoop" in d) { e.preventDefault(); return; }
        if (d.lcTab) { state.tab = d.lcTab; state.member = null; state.filter = []; var first = visibleLoads()[0]; if (state.tab !== "team") state.open = first ? first.pro : null; render(); return; }
        if (d.lcArchive) { e.stopPropagation(); var la = byPro(d.lcArchive); la.archived = true; toast("archived", { name: "#" + la.pro }); if (state.open === la.pro) { var n = visibleLoads()[0]; state.open = n ? n.pro : null; } render(); return; }
        if (d.lcUnlabel) { e.stopPropagation(); var p = d.lcUnlabel.split(":"), lu = byPro(p[0]); lu.labels = lu.labels.filter(function (x) { return x !== p[1]; }); render(); return; }
        if (d.lcOpen) { if (t.closest(".lc-chip-x")) return; state.open = d.lcOpen; render(); return; }
        if (d.lcFilter) { var i = state.filter.indexOf(d.lcFilter); if (i >= 0) state.filter.splice(i, 1); else state.filter.push(d.lcFilter); renderSide(); return; }
        if (d.lcLabelMenu) { e.stopPropagation(); if (a.getAttribute("aria-expanded") === "true") closeMenu(); else openLabelMenu(a, d.lcLabelMenu); return; }
        if ("lcLabelAdd" in d) { openLabelModal(); return; }
        if (d.lcLabelEdit) { closeMenu(); openLabelModal(d.lcLabelEdit); return; }
        if (d.lcLabelDel) { closeMenu(); delLabel = d.lcLabelDel; $("lc-del-text").textContent = "Are you sure you want to delete the label “" + label(delLabel).text + "”? It will be removed from all chats."; window.empOverlay.open($("lc-del-modal")); return; }
        if ("lcDelConfirm" in d) { LABELS = LABELS.filter(function (x) { return x.id !== delLabel; }); LOADS.forEach(function (x) { x.labels = x.labels.filter(function (y) { return y !== delLabel; }); }); state.filter = state.filter.filter(function (y) { return y !== delLabel; }); window.empOverlay.close($("lc-del-modal")); toast("deleted"); render(); return; }
        if (d.lcColor) { labelColor = d.lcColor; paintColors(); return; }
        if ("lcLabelSave" in d) { saveLabel(); return; }
        if ("lcLabelsToggle" in d) { state.labelsOpen = !state.labelsOpen; renderSide(); return; }
        if (d.lcMember) { state.member = TEAM[+d.lcMember]; var f2 = visibleLoads()[0]; state.open = f2 ? f2.pro : null; render(); return; }
        if ("lcMemberBack" in d) { state.member = null; render(); return; }
        if ("lcCopy" in d) { if (navigator.clipboard) navigator.clipboard.writeText("#" + l.pro).catch(function () {}); toast("copied"); return; }
        if ("lcMembers" in d) { e.stopPropagation(); if (a.getAttribute("aria-expanded") === "true") closeMenu(); else openMembers(a); return; }
        if ("lcStops" in d) { state.stopsOpen = !state.stopsOpen; renderMain(); return; }
        if ("lcGetBol" in d) { pushEvent("BOL requested from " + l.driver + " by " + ME.name); toast("requested", { name: "BOL" }); return; }
        if ("lcCheckCall" in d) { pushEvent("Check call requested by " + ME.name); toast("requested", { name: "Check call" }); return; }
        if ("lcLocation" in d) { pushEvent("Location requested by " + ME.name); toast("requested", { name: "Current location" }); setTimeout(function () { var c = chatNode(); if (c) { c.push({ side: "in", author: l.driver, avatar: window.empChat.initials(l.driver), type: "location", place: "Marietta, GA 30060", placeNote: "Live location · 24 mi to DEL" }); c.scrollBottom(); } }, 2200); return; }
        if ("lcRestore" in d) { l.archived = false; toast("restored", { name: "#" + l.pro }); state.tab = "active"; render(); return; }
        if (d.lcRemoveMember) { var ms = members(l), rm = ms.splice(+d.lcRemoveMember, 1)[0]; closeMenu(); pushEvent(rm.name + " has been removed from the chat by " + ME.name); return; }
        if (d.lcAdd) { closeMenu(); openAdd(d.lcAdd); return; }
        if ("lcAddSave" in d) { saveAdd(); return; }
        if ("lcDispatch" in d) { closeMenu(); var c2 = chatNode(); var dm = c2.push({ side: "out", author: ME.name, avatar: "AJ", status: "sent", text: DISPATCH, readBy: [] }); c2.pinned.unshift(dm.id); c2._pinIndex = 0; c2.paintPinned(); c2.scrollBottom(); toast("sent", { name: "Dispatch message" }); return; }
        if ("lcFiles" in d) { closeMenu(); $("lc-files-title").textContent = "Files · #" + l.pro; openFiles("all"); window.empOverlay.open($("lc-files")); return; }
        if (d.lcFilesTab) { openFiles(d.lcFilesTab); return; }
        if ("lcExport" in d) { closeMenu(); toast("exported", { name: "Chat #" + l.pro }); return; }
        if ("lcOfferArchive" in d) { closeMenu(); window.location.href = "offers.html#archive"; return; }
        if (d.lcBolApprove) { var c3 = chatNode(), bm = c3.byId(d.lcBolApprove); bm.status = "approved"; c3.repaint(bm); c3.push({ kind: "event", tone: "success", text: "BOL approved by " + ME.name }); c3.scrollBottom(); return; }
        if (d.lcBolReject) { rejectFor = d.lcBolReject; $("lc-reject-note").value = ""; window.empOverlay.open($("lc-reject")); return; }
        if ("lcRejectSave" in d) { var r = document.querySelector('input[name="lc-reason"]:checked'); var c4 = chatNode(), rb = c4.byId(rejectFor); rb.status = "rejected"; rb.reason = r ? r.value : "Other"; c4.repaint(rb); c4.push({ kind: "event", tone: "danger", text: "BOL rejected by " + ME.name + ": " + rb.reason }); c4.push({ side: "out", author: ME.name, avatar: "AJ", status: "sent", text: "Please resend the BOL: " + rb.reason.toLowerCase() + ($("lc-reject-note").value.trim() ? ". " + $("lc-reject-note").value.trim() : "") }); c4.scrollBottom(); window.empOverlay.close($("lc-reject")); return; }
        if (d.lcTplDel) { QUICK.splice(+d.lcTplDel, 1); renderTemplates(); return; }
        if (d.lcTplEdit) { var row = a.closest(".lc-tpl"), txt = row.querySelector(".lc-tpl__text"); if (txt.isContentEditable) { txt.contentEditable = "false"; QUICK[+d.lcTplEdit] = txt.textContent.trim() || QUICK[+d.lcTplEdit]; } else { txt.contentEditable = "true"; txt.focus(); } return; }
        if ("lcTplAdd" in d) { var v = $("lc-tpl-new").value.trim(); if (v) { QUICK.push(v); $("lc-tpl-new").value = ""; renderTemplates(); } return; }
        if ("lcSettingsSave" in d) {
            state.settings.widget = $("lc-set-widget").checked; state.settings.sound = $("lc-set-sound").checked; state.settings.popup = $("lc-set-popup").checked;
            try { localStorage.setItem("empChatWidget.off", state.settings.widget ? "0" : "1"); } catch (er) {}
            document.querySelectorAll(".lc-tpl__text[contenteditable=true]").forEach(function (x) { x.contentEditable = "false"; });
            window.empOverlay.close($("lc-settings")); toast("saved"); renderMain(); return;
        }
    });
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeMenu();
        if (e.key === "Enter" && e.target.matches && e.target.matches("[data-lc-open]")) e.target.click();
        if (e.key === "Enter" && e.target.id === "lc-label-name") saveLabel();
        if (e.key === "Enter" && e.target.id === "lc-tpl-new") document.querySelector("[data-lc-tpl-add]").click();
    });
    document.addEventListener("input", function (e) {
        if (e.target.id === "lc-q") { state.q = e.target.value; renderSide(); }
        if (e.target.id === "lc-label-name") paintColors();
    });
    /* Drag a label onto a chat in the list */
    var dragLabel = null;
    document.addEventListener("dragstart", function (e) { var lb = e.target.closest && e.target.closest("[data-lc-label]"); if (!lb) return; dragLabel = lb.getAttribute("data-lc-label"); lb.classList.add("is-dragging"); e.dataTransfer.effectAllowed = "copy"; try { e.dataTransfer.setData("text/plain", dragLabel); } catch (er) {} document.body.classList.add("lc-is-dragging"); });
    document.addEventListener("dragend", function () { dragLabel = null; document.body.classList.remove("lc-is-dragging"); document.querySelectorAll(".is-dragging,.is-drop").forEach(function (n) { n.classList.remove("is-dragging", "is-drop"); }); });
    document.addEventListener("dragover", function (e) { if (!dragLabel) return; var it = e.target.closest && e.target.closest("[data-lc-open]"); document.querySelectorAll(".lc-item.is-drop").forEach(function (n) { if (n !== it) n.classList.remove("is-drop"); }); if (it) { e.preventDefault(); it.classList.add("is-drop"); } });
    document.addEventListener("drop", function (e) {
        if (!dragLabel) return; var it = e.target.closest && e.target.closest("[data-lc-open]"); if (!it) return; e.preventDefault();
        var l = byPro(it.getAttribute("data-lc-open")), lb = label(dragLabel);
        if (l.labels.indexOf(dragLabel) < 0) { l.labels.push(dragLabel); toast("labelAdded", { name: lb.text }); }
        dragLabel = null; render();
    });

    function openAdd(kind) {
        $("lc-add-title").textContent = kind === "driver" ? "Add driver" : "Add members";
        var people = kind === "driver" ? [["Oliver Smith", "Driver · 2323"], ["Nolan Kenter", "Driver · 4440"], ["Bob Marley", "Driver · 3463"]] : [["Anna Lu", "Dispatcher"], ["Peter Ashton", "Dispatcher"], ["Lisa Kim", "Tracker"], ["Winston Wolf", "Manager"]];
        $("lc-add-body").innerHTML = '<div class="lc-add__list">' + people.map(function (p, i) {
            return '<label class="emp-check lc-add__row"><input class="emp-check__input" type="checkbox" value="' + esc(p[0]) + '"' + (i === 0 ? " checked" : "") + '><span class="emp-check__box"><svg class="emp-check__mark" viewBox="0 0 20 20" aria-hidden="true"><use href="#i-check"></use></svg><span class="emp-check__minus"></span></span><span class="emp-avatar">' + window.empChat.initials(p[0]) + '</span><span class="lc-menu__who"><span>' + esc(p[0]) + '</span><span class="lc-menu__role">' + esc(p[1]) + "</span></span></label>";
        }).join("") + "</div>" + (kind === "driver" ? '<fieldset class="lc-add__history"><legend class="lc-add__legend">What chat history the new driver sees</legend>' +
            ["Whole history", "From today", "Only new messages"].map(function (h, i) { return '<label class="emp-radio"><input class="emp-radio__input" type="radio" name="lc-history" value="' + h + '"' + (i === 0 ? " checked" : "") + '><span class="emp-radio__box"></span><span>' + h + "</span></label>"; }).join("") + "</fieldset>" : "");
        $("lc-add").setAttribute("data-kind", kind);
        window.empOverlay.open($("lc-add"));
    }
    function saveAdd() {
        var l = byPro(state.open), kind = $("lc-add").getAttribute("data-kind");
        var picked = Array.prototype.map.call($("lc-add-body").querySelectorAll(".emp-check__input:checked"), function (i) { return i.value; });
        picked.forEach(function (n) { members(l).push({ name: n, role: kind === "driver" ? "Driver" : "Dispatcher", av: window.empChat.initials(n) }); pushEvent(n + " has been added to the chat by " + ME.name); });
        window.empOverlay.close($("lc-add"));
        if (picked.length) toast("updated");
    }

    function init() {
        if (window.empChat.injectSprite) window.empChat.injectSprite();
        var hash = (location.hash || "").replace("#", ""); if (hash && byPro(hash)) state.open = hash;
        $("lc-set-widget").checked = state.settings.widget; $("lc-set-sound").checked = state.settings.sound; $("lc-set-popup").checked = state.settings.popup;
        renderTemplates();
        render();
        document.querySelector('[data-overlay-open="lc-settings"]').addEventListener("click", function () { renderTemplates(); });
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
