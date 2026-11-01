/* Quotes — data and logic of the section. Chat is the global emp-chat from js/empire.js. */
(function () {
    var ME = { name: "Andrew Jameson", avatar: "AJ" };
    var TEAM = [
        { name: "Anna Lu", role: "Dispatcher", avatar: "AL" },
        { name: "Andrew Jameson", role: "Dispatcher", avatar: "AJ" },
        { name: "Winston Wolf", role: "Manager", avatar: "WW" }
    ];
    var QUICK = ["You are welcome", "Thank you", "Please, share your current location"];
    var BROKER_QUICK = ["Thanks, checking the rate", "Can you share the DIMS?", "Is it still available?"];

    function drivers(seed) {
        var base = [
            { id: "d1", unit: "2323", name: "John Driver", state: "TX", rating: "9.75", miles: 6.9, rate: 1200, badge: ["RR", "emp-chip--red"], status: "Hold by Anna Lu", company: "Rojer Holloway LLC", code: "11", tags: [{ text: "Only ENG", cls: "emp-chip--orange" }, { text: "Other company sticker", cls: "emp-chip--outline emp-chip--red" }] },
            { id: "d2", unit: "1422", name: "Tom Bob", state: "OK", rating: "9.71", miles: 7.2, rate: 1200, badge: ["QB", ""], status: "Driver accepted offer", company: "Bob Trucking", code: "4" },
            { id: "d3", unit: "4122", name: "Sam Bobson", state: "TX", rating: "7.44", miles: 11.4, rate: 1200, badge: ["QB", ""], status: "Driver accepted offer", company: "SB Logistics", code: "7" },
            { id: "d4", unit: "5521", name: "Walter White", state: "NM", rating: "7.12", miles: 12.4, rate: 1200, badge: ["QB", ""], last: "You: Some text", company: "Heisen Freight", code: "2" },
            { id: "d5", unit: "1244", name: "Robert Bobson", state: "AR", rating: "9.44", miles: 65.1, rate: 1250, last: "You: Some text", company: "RB Express", code: "9" }
        ];
        return base.slice(0, seed);
    }
    function brokerThread(q) {
        var contact = q.contact, at = new Date(q.date.replace(" ", "T"));
        return [
            { side: "in", author: contact, text: "Subject: " + q.subject + "\n\n" + q.body, time: at.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }), day: at.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), channel: "via Email" },
            { side: "in", author: contact, text: "Lorem ipsum dolor sit amet consectetur. Bibendum donec enim dui pretium purus.", time: "12:30 AM", day: "Today", channel: "via Email" },
            { side: "out", author: "Dispatcher", avatar: "AJ", text: "Okay", time: "12:34 AM", status: "read" },
            { side: "in", author: contact, text: "Thank you!", time: "12:36 AM", channel: "via Email" }
        ];
    }
    var QUOTES = [
        { id: 1245352, company: "Johnson & Johnson", contact: "Brooklyn Simmons", email: "debra.holt@example.com", date: "2020-05-05 10:21:13", days: 0, subject: "quote", isNew: true, irrelevant: "Dry Van, 4 pallets, DIMS 190×75×56, air ride", offer: true, bid: true, lane: "Los Angeles, CA – Austin, TX", pu: "Los Angeles, CA", del: "Austin, TX", miles: 1380,
          body: "AIRLINE ACCOUNT NUMBER:\n01119230011 (Turkish Airlines)\nVEHICLE TYPE: VAN\nDANGEROUS GOODS: NO\nTOTAL PIECES: 4\nTOTAL WEIGHT: 157.00 KG\n2 of 120.0 x 80.0 x 101.0 CM @ 60.0 KG each\nCommodity: Other - Automotive Parts\nIDs: ATE9NCD2Z3, AT7Y2E6PTZ\n1 of 60.0 x 41.0 x 30.0 CM @ 7.0 KG\nCommodity: Other - Automotive Parts\nID: ATFD664JA3", drivers: 5 },
        { id: 1245353, company: "General Electric", contact: "Ethan Carter", email: "jane.doe456@example.com", date: "2020-05-04 09:18:16", days: 1, subject: "quote", irrelevant: "Dry Van, 4 pallets, DIMS length 190, height 75, width 56, air ride", offer: true, bid: true, lane: "Madera, CA – Lithia Springs, GA", pu: "Madera, CA", del: "Lithia Springs, GA", miles: 2280,
          body: "Madera CA to Lithia spring GA\nCan I get a spring van, material is ready now in Madera CA pickup ASAP\n1 PALLET 31X47X23= 443 LBS\nLithia Springs GA 30122", drivers: 3 },
        { id: 1245354, company: "IBM", contact: "Cody Fisher", email: "nevaeh.simmons@example.com", date: "2020-05-03 08:14:01", days: 2, subject: "quote", isNew: true, irrelevant: "Air waybill shipment, needs TSA-approved carrier", lane: "Los Angeles, CA – Atlanta, GA", pu: "Los Angeles, CA 90045", del: "Atlanta, GA 30320", miles: 2170,
          body: "PICKUP TIME:\nDec 01, 2025, 20:30 PST\nDELIVER BY:\nDec 02, 2025, 12:00 CST\nDELIVERY INSTRUCTIONS:\nNone\nAIR WAYBILLS:\n235-95087705\nOrder details\nORDER REFERENCES:\nPICKUP ADDRESS:\nTurkish Airlines\nSWISSPORT\n5871 West Imperial Highway\nLos Angeles, CA 90045\nUnited States of America\nDELIVERY ADDRESS:\nAtlanta, GA 30320\nUnited States of America\nTOTAL PIECES: 4\nTOTAL WEIGHT: 157 KG" },
        { id: 1245355, company: "eBay", contact: "Esther Howard", email: "deanna.curtis@example.com", date: "2020-05-03 08:14:01", days: 2, subject: "quote", isNew: true, lane: "La Vergne, TN – Jefferson, GA", pu: "La Vergne, TN", del: "Jefferson, GA", miles: 270,
          body: "Hey! I have a tote in La Vergne, TN that needs to be shipped to Jefferson, GA. It's ready now but they can load the truck till 17:00 and delivers tomorrow morning at 8am.\nit's one tote (like the last few loads y'all have done for us), 2400 lbs" },
        { id: 1245356, company: "MasterCard", contact: "Darlene Robertson", email: "willie.jennings@example.com", date: "2020-05-06 11:24:08", days: 5, subject: "quote", lane: "Baxter, MN – Chino, CA", pu: "Baxter, MN", del: "Chino, CA", miles: 1890,
          body: "Baxter MN to Chino CA - Team Sprinter Needed\nPick 11/6 4AM\nDelv 11/8 8AM\n350 pounds\nLet me know a rate" },
        { id: 1245357, company: "Louis Vuitton", contact: "Darrell Steward", email: "jessica.hanson@example.com", date: "2020-05-02 07:10:15", days: 12, subject: "quote", lane: "Greenville, OH – Albion, IL", pu: "Greenville, OH", del: "Albion, IL", miles: 300,
          body: "Hey Joel...good morning.\nCan you please check on this?\nPickup Location: Greenville OH\nDelivery Location: Albion IL\nEquipment: box truck or sprinter van\nPallets: 2 (48x40x50), 900 lbs" },
        { id: 1245310, company: "Apple", contact: "Jenny Wilson", email: "willie.jennings@example.com", date: "2020-04-28 15:02:44", days: 30, subject: "rate request", archived: true, offer: true, bid: true, lane: "Cupertino, CA – Reno, NV", pu: "Cupertino, CA", del: "Reno, NV", miles: 250, body: "Need a sprinter tomorrow 8AM\n2 pallets, 1,100 lbs\nCupertino CA → Reno NV", drivers: 2 },
        { id: 1245311, company: "Mitsubishi", contact: "Guy Hawkins", email: "georgia.young@example.com", date: "2020-04-25 10:12:01", days: 33, subject: "quote", archived: true, lane: "Detroit, MI – Toledo, OH", pu: "Detroit, MI", del: "Toledo, OH", miles: 60, body: "Hot shot Detroit to Toledo\n1 crate 400 lbs\nASAP" }
    ];
    QUOTES.forEach(function (q) { q.driverList = drivers(q.drivers || 0); q.thread = brokerThread(q); });
    var RULES = {
        include: [["Mitsubishi", "georgia.young@example.com"], ["Apple", "willie.jennings@example.com"], ["Louis Vuitton", "curtis.weaver@example.com"], ["MasterCard", "deanna.curtis@example.com"], ["eBay", "tim.jennings@example.com"], ["General Electric", "michelle.rivera@example.com"]],
        exclude: [["Spam Freight", "noreply@spamfreight.com"], ["Load Bot", "bot@loadboard.io"]]
    };

    var state = { tab: "active", status: "New/active", q: "", date: "Any date", open: null, driver: null, rulesTab: "include", archiveId: null, checkId: null };
    var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
    var $ = function (id) { return document.getElementById(id); };
    function byId(id) { for (var i = 0; i < QUOTES.length; i++) if (QUOTES[i].id === +id) return QUOTES[i]; return null; }
    function toast(kind, data) { if (window.empToast) window.empToast(kind, data); }
    function svg(id, cls) { return '<svg class="' + (cls || "emp-icon") + '" viewBox="0 0 16 16" aria-hidden="true"><use href="#' + id + '"></use></svg>'; }
    function btn(label, type, icon, attrs) { return '<button class="emp-btn emp-btn--' + type + ' emp-btn--md" type="button" ' + (attrs || "") + '><span class="emp-btn__label">' + label + "</span>" + (icon ? '<span class="emp-btn__glyph">' + svg(icon) + "</span>" : "") + "</button>"; }

    function marks(q) {
        var h = "";
        if (q.offer) h += '<span class="emp-chip emp-chip--outline emp-chip--grey">Offer created</span>';
        if (q.irrelevant) h += '<span class="emp-tip" data-place="auto"><span class="emp-chip emp-chip--orange" tabindex="0">Irrelevant</span><span class="emp-tip__bubble" role="tooltip"><span class="emp-tip__line">' + esc(q.irrelevant) + "</span></span></span>";
        if (q.bid) h += '<span class="emp-chip emp-chip--green">BID created</span>';
        if (q.isNew) h += '<span class="emp-chip emp-chip--red">NEW</span>';
        return h + '<svg class="qt-gmail" viewBox="0 0 48 48" role="img" aria-label="Gmail"><use href="#q-gmail"></use></svg>';
    }
    function filtered() {
        var needle = state.q.trim().toLowerCase();
        return QUOTES.filter(function (q) {
            if (state.tab === "active" ? q.archived : !q.archived) return false;
            if (state.status === "New only" && !q.isNew) return false;
            if (state.status === "Offer created" && !q.offer) return false;
            if (state.status === "BID created" && !q.bid) return false;
            if (state.status === "Irrelevant" && !q.irrelevant) return false;
            if (state.date === "Today" && q.days > 0) return false;
            if (state.date === "Last 7 days" && q.days > 7) return false;
            if (state.date === "Last 30 days" && q.days > 30) return false;
            if (!needle) return true;
            return [q.company, q.contact, q.email, q.body, q.lane, q.id].join(" ").toLowerCase().indexOf(needle) >= 0;
        });
    }
    function card(q) {
        var archived = state.tab === "archive", ready = q.offer && q.bid;
        var a1 = archived ? btn("Restore", "secondary", "q-restore", 'data-qt-restore="' + q.id + '"')
            : ready ? btn("Open", "secondary", "q-open", 'data-qt-open="' + q.id + '"')
            : btn("Create BID &amp; Offer", "primary", "q-stars", 'data-qt-check="' + q.id + '"');
        var a2 = archived ? btn("Open", "outline", "q-open", 'data-qt-open="' + q.id + '"') : btn("Archive", "outline", "q-archive", 'data-qt-archive="' + q.id + '"');
        return '<article class="qt-card" data-id="' + q.id + '"><div class="qt-marks">' + marks(q) + '</div><h2 class="qt-card__company">' + esc(q.company) + "</h2>" +
            '<p class="qt-card__contact">' + esc(q.contact) + '</p><p class="qt-card__email">' + esc(q.email) + '</p><p class="qt-card__date">' + esc(q.date) + "</p>" +
            '<p class="qt-card__subject">Email subject: <strong>' + esc(q.subject) + '</strong></p><p class="qt-card__body">' + esc(q.body) + "</p>" +
            '<div class="qt-card__actions">' + a1 + a2 + "</div></article>";
    }
    function renderBoard() {
        var list = filtered();
        $("qt-grid").innerHTML = list.length ? list.map(card).join("") : '<div class="qt-empty"><strong>No quotes match these filters</strong><span>Try another status, date or search.</span>' + btn("Clear filters", "link", "", "data-qt-clear") + "</div>";
        $("qt-count").textContent = list.length + (state.tab === "archive" ? " archived quotes" : " quotes");
        var n = QUOTES.filter(function (q) { return q.isNew && !q.archived; }).length;
        $("qt-new-count").textContent = n; $("qt-new-count").hidden = !n;
    }

    /* ---------- workspace ---------- */
    function mini(q, active) {
        var h = '<div class="qt-mini' + (active ? " is-active" : "") + '" data-qt-pick="' + q.id + '"' + (active ? "" : ' role="button" tabindex="0"') + '><div class="qt-marks">' + marks(q) + "</div>" +
            '<div><h3 class="qt-card__company">' + esc(q.company) + '</h3><p class="qt-card__contact">' + esc(q.contact) + '</p><p class="qt-card__email">' + esc(q.email) + '</p><p class="qt-card__date">' + esc(q.date) + "</p></div>";
        h += active ? '<div class="qt-mini__thread" id="qt-mini-thread"></div>' : '<p class="qt-mini__lane">' + esc(q.lane) + "</p>";
        return h + "</div>";
    }
    function renderRail() {
        var q = state.open, rail = $("qt-rail"), top = rail.scrollTop;
        rail.innerHTML = QUOTES.filter(function (x) { return !x.archived || x === q; }).map(function (x) { return mini(x, x === q); }).join("");
        rail.scrollTop = top;
        var act = rail.querySelector(".qt-mini.is-active"), rr = rail.getBoundingClientRect(), ar = act.getBoundingClientRect();
        if (ar.top < rr.top || ar.bottom > rr.bottom) act.scrollIntoView({ block: "nearest" });
        window.empChat.mount($("qt-mini-thread"), { size: "compact", me: { name: "Dispatcher", avatar: "AJ" }, messages: q.thread, quick: null, placeholder: "Reply to " + q.contact.split(" ")[0], channel: "via Email", onSend: function (m) { q.thread.push(m); } });
    }
    function driverRow(d) {
        var sel = state.driver === d.id;
        return '<div class="qt-driver' + (sel ? " is-selected" : "") + '" data-qt-driver="' + d.id + '">' +
            '<label class="emp-check" data-stop><input class="emp-check__input" type="checkbox" aria-label="Select ' + esc(d.name) + '"' + (d.checked ? " checked" : "") + ' data-qt-check-driver="' + d.id + '"><span class="emp-check__box"><svg class="emp-check__mark" viewBox="0 0 20 20" aria-hidden="true"><use href="#i-check"></use></svg><span class="emp-check__minus"></span></span></label>' +
            '<span class="emp-avatar emp-avatar--lg">' + esc(window.empChat.initials(d.name)) + "</span>" +
            '<div class="qt-driver__info"><span class="qt-driver__name"><span class="qt-strong">' + d.unit + "</span>" + esc(d.name) + svg("q-star", "qt-star") + '<span class="qt-muted">' + d.rating + "</span></span>" +
            '<span class="qt-driver__dist">' + svg("q-geo", "qt-icon") + d.miles + " mi away</span>" +
            (d.booked ? '<span class="emp-chip emp-chip--green">Booked</span>' : d.status ? '<span><span class="emp-chip emp-chip--outline emp-chip--grey">' + esc(d.status) + "</span></span>" : '<span class="qt-muted">' + esc(d.last || "") + "</span>") + "</div>" +
            '<div class="qt-driver__side">' + (d.badge ? '<span class="emp-chip emp-chip--sm ' + d.badge[1] + '">' + d.badge[0] + "</span>" : "") + '<span class="qt-driver__rate">$' + d.rate.toLocaleString("en-US") + "</span>" +
            (d.booked ? "" : btn("Book driver", "outline", "", 'data-qt-book="' + d.id + '"')) + "</div></div>";
    }
    function renderDrivers() {
        var q = state.open, box = $("qt-drivers");
        if (!q.bid || !q.driverList.length) {
            box.innerHTML = '<div class="qt-placeholder">' + svg("q-truck") + "<strong>No driver offers yet</strong><span>Check the lane and post a rate.<br>Drivers will answer on this board.</span>" + btn("Create BID &amp; Offer", "primary", "q-stars", 'data-qt-check="' + q.id + '"') + "</div>";
            return;
        }
        var booked = q.driverList.filter(function (d) { return d.booked; }).length;
        box.innerHTML =
            '<div class="qt-dsec"><div class="qt-drow"><div class="emp-field emp-field--sm"><div class="emp-input"><span class="emp-input__icon" aria-hidden="true"><svg class="emp-input__search" viewBox="0 0 12 12"><use href="#i-input-search-sm"></use></svg></span><input class="emp-input__control" type="text" placeholder="City / Name" id="qt-driver-q" aria-label="Search drivers"></div></div>' + btn("Search", "secondary", "", "data-qt-dsearch") + btn("Reset", "link", "", "data-qt-dreset") + "</div></div>" +
            '<div class="qt-dsec"><div class="qt-drow qt-drow--between"><div class="emp-tabs__list emp-tabs__list--boxed" role="tablist"><button class="emp-tab is-active" type="button">' + (q.driverList.length - booked) + ' Active</button><button class="emp-tab" type="button">' + booked + ' Booked</button><button class="emp-tab" type="button">Archive</button></div>' + btn("Clear all", "link", "", "data-qt-dreset") + "</div></div>" +
            '<div class="qt-dsec"><div class="qt-drow"><span class="qt-strong">' + q.driverList.length + ' DRIVERS</span><span class="emp-chip emp-chip--sm emp-chip--yellow">26</span><span class="qt-grow"></span>' + svg("q-person", "qt-icon") + '<span class="qt-muted">05/05/2026 13:13</span></div>' +
            '<div class="qt-drow qt-drow--between"><span class="qt-muted"><b>PU:</b> ' + esc(q.pu) + " / ASAP</span>" + btn("Google Maps", "link", "q-geo", "data-qt-maps") + "</div>" +
            '<div class="qt-drow qt-drow--between"><span class="qt-muted"><b>DEL:</b> ' + esc(q.del) + " / Tomorrow by 9 AM</span>" + btn("Renew offer", "link", "q-restore", "data-qt-renew") + "</div>" +
            '<div class="qt-drow">' + svg("q-timer", "qt-icon") + '<span class="qt-strong" id="qt-timer">4:54</span><span class="qt-muted qt-grow">No new drivers available</span>' + btn("Update offer", "secondary", "", "data-qt-update") + "</div></div>" +
            '<div class="qt-dsec qt-head-row"><div class="qt-drow"><label class="emp-check"><input class="emp-check__input" type="checkbox" id="qt-all"><span class="emp-check__box"><svg class="emp-check__mark" viewBox="0 0 20 20" aria-hidden="true"><use href="#i-check"></use></svg><span class="emp-check__minus"></span></span><span>Choose all</span></label><span class="qt-grow"></span>' + btn("Mi away", "link", "q-sort", "data-qt-sort") + "</div></div>" +
            '<div class="qt-list" id="qt-dlist" data-emp-fade>' + q.driverList.map(driverRow).join("") + "</div>";
    }
    function offerCard(m) {
        var d = m.driver, q = state.open;
        var foot = d.booked ? '<span class="qt-offer__done">' + svg("q-star", "qt-icon") + "Booked by " + ME.name + "</span>"
            : d.hold ? '<span class="emp-chip emp-chip--outline emp-chip--orange">On hold by ' + ME.name + "</span>" + btn("Release hold", "outline", "", 'data-qt-hold="' + d.id + '"')
            : btn("Put on Hold", "primary", "", 'data-qt-hold="' + d.id + '"');
        return '<div class="qt-offer"><div class="qt-offer__row"><b>ETA to PU:</b><span class="qt-offer__value">1h : 30m</span><span class="qt-muted">05:47 PM (CDT, GMT-5)</span></div>' +
            '<div class="qt-offer__row"><b>Rate:</b><span class="qt-offer__value">$' + d.rate.toLocaleString("en-US") + "</span></div>" +
            '<div class="qt-offer__row"><b>Note:</b><span>can pick up the load earlier</span></div>' +
            '<div class="qt-offer__row"><span class="qt-muted">Driver’s current location:</span></div><a class="qt-offer__loc" href="#">Coeur d’Alene, NM, 04205</a>' + foot + "</div>";
    }
    var chats = {};
    function renderChat() {
        var q = state.open, box = $("qt-chat"), d = q.driverList.filter(function (x) { return x.id === state.driver; })[0];
        box.innerHTML = "";
        if (!d) { box.innerHTML = '<div class="qt-placeholder">' + svg("q-chat") + "<strong>No chat selected</strong><span>Select a driver to open the offer chat.</span></div>"; return; }
        var key = q.id + ":" + d.id;
        if (!chats[key]) chats[key] = [
            { kind: "event", tone: "neutral", text: "Offer sent to 5 drivers by " + ME.name, time: "8:30 AM", day: "Today" },
            { side: "out", author: ME.name, avatar: ME.avatar, time: "8:41 AM", status: "read", channel: "via App", text: "Hi " + d.name.split(" ")[0] + "! Load from " + q.pu + " to " + q.del + ", " + q.miles + " mi. Rate $" + d.rate.toLocaleString("en-US") + ". Can you take it?" },
            { side: "in", author: d.name, time: "8:55 AM", channel: "via App", text: "Yes, I can be there in about 1.5 hours. Can pick up earlier if needed.", reactions: [{ e: "👍", n: 1, mine: true, who: ME.name }] },
            { side: "in", author: d.name, time: "8:56 AM", type: "voice", duration: "0:24" },
            { kind: "event", tone: "success", text: d.name + " accepted offer", time: "05/05/2024 9:02 AM" },
            { kind: "card", card: "offer", driver: d, time: "9:02 AM" }
        ];
        var host = document.createElement("div"); box.appendChild(host);
        window.empChat.mount(host, {
            me: ME, messages: chats[key], quick: QUICK, mentions: TEAM, notes: true, channel: "via App",
            header: { name: d.unit + " " + d.name + " (" + d.state + ")", sub: d.company + " [" + d.code + "] · online", avatar: window.empChat.initials(d.name), tags: d.tags || [], phone: "+1 (555) 010-2323", presence: "online" },
            demo: { name: d.name, avatar: window.empChat.initials(d.name), channel: "via App", replies: ["Got it 👍", "On my way, ETA 1h 20m.", "Sent the BOL photo.", "Copy that."] },
            renderCard: offerCard,
            earlier: [{ side: "in", author: d.name, time: "Yesterday", day: "Yesterday", text: "Available tomorrow from 6 AM in " + q.pu + "." }, { side: "out", author: ME.name, avatar: ME.avatar, time: "Yesterday", day: "Yesterday", status: "read", text: "Thanks, I’ll keep you posted." }],
            onSend: function () {}
        });
    }
    function openWork(id) {
        var q = byId(id); if (!q) return;
        state.open = q; q.isNew = false;
        state.driver = q.driverList.length ? q.driverList[0].id : null;
        $("qt-board").hidden = true; $("qt-work").hidden = false;
        $("qt-work-id").textContent = "#" + q.id;
        renderRail(); renderDrivers(); renderChat();
        window.scrollTo(0, 0);
    }
    function closeWork() { state.open = null; $("qt-work").hidden = true; $("qt-board").hidden = false; renderBoard(); }

    /* ---------- check quote ---------- */
    function openCheck(id) {
        var q = byId(id); if (!q) return;
        state.checkId = q.id;
        $("qt-check-company").textContent = q.company; $("qt-check-contact").textContent = q.contact; $("qt-check-email").textContent = q.email; $("qt-check-date").textContent = q.date; $("qt-check-subject").textContent = q.subject;
        $("qt-pu").value = q.pu; $("qt-del").value = q.del; $("qt-miles").value = ""; $("qt-rate").value = "";
        var thread = $("qt-check-thread"); thread.innerHTML = ""; var host = document.createElement("div"); thread.appendChild(host); host.style.height = "100%";
        window.empChat.mount(host, { size: "compact", me: { name: "Dispatcher", avatar: "AJ" }, messages: q.thread, placeholder: "Reply to " + q.contact.split(" ")[0], channel: "via Email", onSend: function (m) { q.thread.push(m); } });
        window.empOverlay.open($("qt-check"));
    }

    /* ---------- rules ---------- */
    var KNOWN = (function () {
        var seen = {}, out = [];
        QUOTES.map(function (q) { return [q.company, q.email]; }).concat(RULES.include, RULES.exclude, [["IBM", "nevaeh.simmons@example.com"], ["General Electric", "michelle.rivera@example.com"], ["Reid Transport", "felicia.reid@example.com"], ["Graham Freight", "jackson.graham@example.com"], ["Holt Cargo", "debra.holt@example.com"]]).forEach(function (r) { if (!seen[r[1]]) { seen[r[1]] = 1; out.push(r); } });
        return out;
    })();
    function listOf(email) {
        email = email.toLowerCase();
        var has = function (l) { return RULES[l].some(function (r) { return r[1].toLowerCase() === email; }); };
        return has("include") ? "include" : has("exclude") ? "exclude" : null;
    }
    function renderRules() {
        var list = RULES[state.rulesTab];
        var head = '<div class="emp-table__row qt-head-row" role="row"><div class="emp-table__cell"><p class="qt-muted">#</p></div><div class="emp-table__cell"><p class="qt-muted">Company name</p></div><div class="emp-table__cell"><p class="qt-muted">Email</p></div><div class="emp-table__cell emp-table__cell--center"><p class="qt-muted">Actions</p></div></div>';
        $("qt-rules-rows").innerHTML = head + list.map(function (r, i) { return '<div class="emp-table__row" role="row"><div class="emp-table__cell"><p>' + (i + 1) + '</p></div><div class="emp-table__cell"><p>' + esc(r[0]) + '</p></div><div class="emp-table__cell"><p>' + esc(r[1]) + '</p></div><div class="emp-table__cell emp-table__cell--center"><button class="qt-rules__del" type="button" data-qt-rule-del="' + i + '" aria-label="Remove ' + esc(r[1]) + '">' + svg("q-minus") + "</button></div></div>"; }).join("");
        $("qt-rules-empty").hidden = !!list.length;
        renderSuggest();
    }
    function renderSuggest() {
        var input = $("qt-rules-q"), q = input.value.trim().toLowerCase(), combo = $("qt-rules-combo"), drop = $("qt-rules-drop");
        var names = { include: "Always include", exclude: "Exclude" };
        var hits = q ? KNOWN.filter(function (r) { return (r[0] + " " + r[1]).toLowerCase().indexOf(q) >= 0; }).slice(0, 6) : [];
        drop.innerHTML = hits.map(function (r) {
            var where = listOf(r[1]), here = where === state.rulesTab;
            return '<button class="emp-drop__item qt-suggest" type="button" role="option" data-qt-suggest="' + esc(r[1]) + '" data-qt-company="' + esc(r[0]) + '"' + (here ? " disabled" : "") + '><span class="qt-suggest__main"><span class="qt-suggest__email">' + esc(r[1]) + '</span><span class="qt-muted">' + esc(r[0]) + "</span></span>" + (where ? '<span class="emp-chip ' + (here ? "emp-chip--outline emp-chip--grey" : "emp-chip--orange") + '">' + (here ? "Added" : names[where]) + "</span>" : "") + "</button>";
        }).join("");
        combo.classList.toggle("is-open", !!hits.length && document.activeElement === input);
        var isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(q);
        $("qt-rules-add").hidden = !(isEmail && !listOf(q) && !KNOWN.some(function (r) { return r[1].toLowerCase() === q; }));
    }
    function addRule(email, company) {
        var where = listOf(email);
        if (where && where !== state.rulesTab) { toast("ruleConflict"); return; }
        if (!where) {
            company = company || email.split("@")[1].split(".")[0].replace(/^\w/, function (c) { return c.toUpperCase(); });
            RULES[state.rulesTab].unshift([company, email]);
            if (!KNOWN.some(function (r) { return r[1] === email; })) KNOWN.push([company, email]);
            toast("created");
        }
        $("qt-rules-q").value = ""; $("qt-rules-combo").classList.remove("is-open"); renderRules();
    }

    document.addEventListener("click", function (e) {
        var t = e.target.closest("[data-qt-open],[data-qt-check],[data-qt-archive],[data-qt-restore],[data-qt-tab],[data-qt-back],[data-qt-review],[data-qt-pick],[data-qt-driver],[data-qt-book],[data-qt-hold],[data-qt-rules],[data-qt-rule-del],[data-qt-suggest],[data-qt-clear],[data-qt-renew],[data-qt-update],[data-qt-maps],[data-qt-miles],[data-qt-rate],[data-qt-dreset],[data-qt-dsearch],[data-qt-sort],[data-qt-stop]");
        if (!t) return;
        var d = t.dataset;
        if (d.qtOpen) openWork(d.qtOpen);
        else if (d.qtCheck) openCheck(d.qtCheck);
        else if (d.qtArchive) { state.archiveId = +d.qtArchive; var q = byId(d.qtArchive); $("qt-archive-text").textContent = "Are you sure you want to move " + q.email + " to the archive?"; window.empOverlay.open($("qt-archive")); }
        else if (d.qtRestore) { var r = byId(d.qtRestore); r.archived = false; renderBoard(); toast("restored", { name: r.company }); }
        else if (d.qtTab) { state.tab = d.qtTab; document.querySelectorAll("[data-qt-tab]").forEach(function (b) { var on = b === t; b.classList.toggle("is-active", on); b.setAttribute("aria-selected", on); }); renderBoard(); }
        else if (t.hasAttribute("data-qt-back")) closeWork();
        else if (t.hasAttribute("data-qt-review")) openCheck(state.open.id);
        else if (d.qtPick && !t.classList.contains("is-active")) openWork(d.qtPick);
        else if (d.qtBook) { e.stopPropagation(); var dv = state.open.driverList.filter(function (x) { return x.id === d.qtBook; })[0]; dv.booked = true; dv.hold = false; state.driver = dv.id; renderDrivers(); renderChat(); toast("booked", { name: dv.name }); }
        else if (d.qtHold) { var dh = state.open.driverList.filter(function (x) { return x.id === d.qtHold; })[0]; dh.hold = !dh.hold; dh.status = dh.hold ? "Hold by " + ME.name : "Driver accepted offer"; renderDrivers(); var c = document.querySelector("#qt-chat .emp-chat"); if (c && c._empChat) { c._empChat.push({ kind: "event", tone: dh.hold ? "neutral" : "neutral", text: (dh.hold ? "Put on hold by " : "Hold released by ") + ME.name }); c._empChat.renderAll(); c._empChat.scrollBottom(); } }
        else if (d.qtDriver && !e.target.closest("[data-stop],[data-qt-book]")) { state.driver = d.qtDriver; renderDrivers(); renderChat(); }
        else if (d.qtRules) { state.rulesTab = d.qtRules; document.querySelectorAll("[data-qt-rules]").forEach(function (b) { b.classList.toggle("is-active", b === t); b.setAttribute("aria-selected", b === t); }); renderRules(); }
        else if (d.qtRuleDel) { RULES[state.rulesTab].splice(+d.qtRuleDel, 1); renderRules(); }
        else if (d.qtSuggest) addRule(d.qtSuggest, d.qtCompany);
        else if (t.hasAttribute("data-qt-clear")) { state.q = ""; $("qt-search").value = ""; ["qt-status", "qt-date"].forEach(function (id) { var i = $(id); i.value = i.getAttribute("data-emp-default"); i.dispatchEvent(new Event("change", { bubbles: true })); }); state.status = "New/active"; state.date = "Any date"; renderBoard(); }
        else if (t.hasAttribute("data-qt-renew")) { var tm = $("qt-timer"); if (tm) tm.textContent = "5:00"; toast("sent", { name: "Offer" }); }
        else if (t.hasAttribute("data-qt-update")) toast("updated");
        else if (t.hasAttribute("data-qt-maps")) window.open("https://www.google.com/maps/dir/?api=1&origin=" + encodeURIComponent(state.open.pu) + "&destination=" + encodeURIComponent(state.open.del), "_blank", "noopener");
        else if (t.hasAttribute("data-qt-miles")) { var cq = byId(state.checkId); $("qt-miles").value = cq ? cq.miles : 700; }
        else if (t.hasAttribute("data-qt-rate")) { var mi = parseFloat($("qt-miles").value) || 700; $("qt-rate").value = "$ " + Math.round(mi * 2.1).toLocaleString("en-US"); }
        else if (t.hasAttribute("data-qt-dreset")) { var dq = $("qt-driver-q"); if (dq) dq.value = ""; document.querySelectorAll("#qt-dlist .qt-driver").forEach(function (n) { n.hidden = false; }); }
        else if (t.hasAttribute("data-qt-dsearch")) { var v = ($("qt-driver-q").value || "").toLowerCase(); document.querySelectorAll("#qt-dlist .qt-driver").forEach(function (n) { n.hidden = !!v && n.textContent.toLowerCase().indexOf(v) < 0; }); }
        else if (t.hasAttribute("data-qt-sort")) { state.open.driverList.reverse(); renderDrivers(); }
        else if (d.qtStop) toast("updated");
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Enter" && e.target.matches && e.target.matches("[data-qt-pick]")) e.target.click(); });
    document.addEventListener("change", function (e) {
        if (e.target.id === "qt-all") { state.open.driverList.forEach(function (x) { x.checked = e.target.checked; }); document.querySelectorAll("[data-qt-check-driver]").forEach(function (c) { c.checked = e.target.checked; }); }
        if (e.target.id === "qt-status") { state.status = e.target.value; renderBoard(); }
        if (e.target.id === "qt-date") { state.date = e.target.value; renderBoard(); }
    });
    document.addEventListener("input", function (e) {
        if (e.target.id === "qt-search") { state.q = e.target.value; renderBoard(); }
        if (e.target.id === "qt-rules-q") renderSuggest();
        if (e.target.id === "qt-status") { state.status = e.target.value; renderBoard(); }
        if (e.target.id === "qt-date") { state.date = e.target.value; renderBoard(); }
    });
    $("qt-archive-ok").addEventListener("click", function () { var q = byId(state.archiveId); q.archived = true; q.isNew = false; window.empOverlay.close($("qt-archive")); renderBoard(); toast("archived", { name: q.company }); });
    $("qt-check-form").addEventListener("submit", function (e) {
        e.preventDefault();
        var q = byId(state.checkId); q.offer = true; q.bid = !$("qt-no-bid").checked; q.isNew = false;
        if (!q.driverList.length) q.driverList = drivers(4);
        window.empOverlay.close($("qt-check")); toast("offerCreated");
        if (state.open) { renderRail(); renderDrivers(); renderChat(); } else renderBoard();
    });
    $("qt-rules-add").addEventListener("click", function () { addRule($("qt-rules-q").value.trim()); });
    $("qt-rules-q").addEventListener("focus", renderSuggest);
    $("qt-rules-q").addEventListener("blur", function () { setTimeout(function () { $("qt-rules-combo").classList.remove("is-open"); }, 150); });
    $("qt-rules-q").addEventListener("keydown", function (e) {
        if (e.key === "Escape") { $("qt-rules-combo").classList.remove("is-open"); return; }
        if (e.key !== "Enter") return;
        e.preventDefault();
        var first = $("qt-rules-drop").querySelector("[data-qt-suggest]:not([disabled])");
        if (!$("qt-rules-add").hidden) $("qt-rules-add").click(); else if (first) first.click();
    });
    $("qt-rules-save").addEventListener("click", function () { window.empOverlay.close($("qt-rules")); toast("saved"); });

    renderBoard();
    renderRules();
    if (/[?&]open=(\d+)/.test(location.search)) document.addEventListener("DOMContentLoaded", function () { openWork(RegExp.$1); });
})();
