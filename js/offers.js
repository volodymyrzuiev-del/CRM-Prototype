/* Offers — data and logic of the section (Figma: CRM 3.0 / Offers, 1699:1913).
   Chat is the global emp-chat (js/empire.js), the offer card is the global emp-offer; icons come from js/chat-widget.js.
   Actions (hold / book / decline) live in the always-visible Actions bar of the driver header, never inside the feed. */
(function () {
    var L = window.empLc, icon = L.icon, esc = L.esc;
    var ME = { name: "Andrew Jameson", avatar: "AJ" };
    var $ = function (id) { return document.getElementById(id); };
    function toast(kind, data) { if (window.empToast) window.empToast(kind, data); }
    function btn(label, type, attrs, disabled) { return '<button class="emp-btn emp-btn--' + type + ' emp-btn--md" type="button" ' + (attrs || "") + (disabled ? " disabled" : "") + '><span class="emp-btn__label">' + label + "</span></button>"; }
    function chip(text, color, outline) { return '<span class="emp-chip emp-chip--sm' + (outline === false ? "" : " emp-chip--outline") + (color && color !== "blue" ? " emp-chip--" + color : "") + '">' + esc(text) + "</span>"; }
    function mmss(s) { s = Math.max(0, s); return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2); }
    var QUICK = ["You are welcome", "Thank you", "Please, share your current location"];

    function drv(id, unit, name, st, rating, miles, rate, state, o) {
        o = o || {};
        return { id: id, unit: unit, name: name, st: st, rating: rating, miles: miles, rate: rate, state: state, holdBy: o.holdBy || null, team: o.team || null, seen: o.seen || null, unread: o.unread || 0,
            unreliable: !!o.unreliable, reason: o.reason || "", tz: !!o.tz, noGps: !!o.noGps, avail: o.avail || "Av", hold: 14 * 60 + 54, msgs: null, checked: false };
    }
    var DRIVERS = [
        drv("d1", "2323", "John Driver", "TX", "9.75", 6.9, 1500, "hold", { holdBy: "You", seen: "read", tz: true, team: { name: "Oliver Smith", rating: "5.00" } }),
        drv("d2", "4637", "Bryden Williams", "GA", "9.75", 4.9, 1200, "accepted", { holdBy: "Anna Lu", seen: "read" }),
        drv("d3", "4440", "Gavin Chesterton", "OK", "9.75", 7, 800, "accepted", { unread: 1, noGps: true }),
        drv("d4", "3463", "Benjamin Blare", "GA", "9.75", 6.1, 0, "notstarted", { seen: "sent" }),
        drv("d5", "4638", "Eddie Lake", "NM", "8.10", 9.2, 0, "notstarted", { unreliable: true, seen: "sent" }),
        drv("d6", "7866", "Dave Mustaine", "CA", "9.40", 12, 1900, "rejected", { reason: "The rate was too high", avail: "Av On" })
    ];
    var ARCHIVE = [
        { route: "Newark, NJ → Boston, MA", date: "11/03/2026 09:12", result: "Load built · #401120", drivers: 4 },
        { route: "Tampa, FL → Orlando, FL", date: "11/01/2026 16:40", result: "All drivers rejected", drivers: 3 },
        { route: "Austin, TX → Houston, TX", date: "10/29/2026 11:05", result: "Load built · #398877", drivers: 6 }
    ];
    var state = { tab: "active", open: "d1", sort: "Mi away", status: "All statuses", q: "", timer: 2 * 60 + 54, newDrivers: 0, added: 0, bid: 14 * 60 + 12, archiveOpen: 0 };
    function byId(id) { for (var i = 0; i < DRIVERS.length; i++) if (DRIVERS[i].id === id) return DRIVERS[i]; return null; }

    /* ---------- left column ---------- */
    function renderSummary() {
        var upd = state.newDrivers ? { cls: "is-available", text: "New drivers are available", n: state.newDrivers, type: "primary", dis: false }
            : state.added ? { cls: "is-added", text: "New drivers were added", n: state.added, type: "secondary", dis: false }
            : { cls: "", text: "No new drivers available", n: 0, type: "secondary", dis: true };
        var renewOff = state.timer > 0;
        $("of-summary").innerHTML =
            '<div class="of-sum__row"><span class="of-sum__drivers">' + DRIVERS.length + ' DRIVERS</span><span class="emp-tab__count">26</span><span class="of-grow"></span><span class="of-muted">Andrew J. · 11/05/2026 13:13</span></div>' +
            '<div class="of-sum__row"><span class="of-sum__stop">PU1: Dallas, TX 75001 / ASAP</span><span class="of-grow"></span><a class="of-link" href="#" data-of-noop>' + icon("ci-geo") + "Google Maps</a></div>" +
            '<div class="of-muted">+2 PU on the way · +2 DEL on the way · <a class="of-link" href="#" data-of-noop>See more</a></div>' +
            '<div class="of-sum__row"><span class="of-sum__stop of-sum__stop--cut">DEL3: Atlanta, GA, 30033 / Tomorrow by 10 AM</span><span class="of-grow"></span><button class="of-link of-link--btn" type="button" data-of-renew' + (renewOff ? ' disabled title="Available when the offer timer ends"' : "") + ">" + icon("ci-retry") + "Renew offer</button></div>" +
            '<div class="of-sum__row of-sum__timer"><span class="of-timer">' + icon("ci-clock") + mmss(state.timer) + '</span><span class="of-status ' + upd.cls + '">' + icon("people") + "<span>" + upd.text + "</span>" + (upd.n ? '<span class="of-plus">+' + upd.n + "</span>" : "") + '</span><span class="of-grow"></span>' +
            btn("Update offer", upd.type, "data-of-update", upd.dis) + "</div>";
    }
    function ticks(d) {
        if (!d.seen || d.unread) return d.unread ? '<span class="of-unread">' + d.unread + "</span>" : "";
        return '<span class="emp-chat__status emp-chat__status--' + (d.seen === "read" ? "read" : "sent") + '" title="' + (d.seen === "read" ? "Read" : "Sent") + '">' + icon(d.seen === "read" ? "ci-check-all" : "ci-check", "emp-chat__ico") + "</span>";
    }
    function stateChip(d) {
        if (d.state === "booked") return chip("Booked by You", "green");
        if (d.state === "hold") return chip("Hold by " + d.holdBy, d.holdBy === "You" ? "orange" : "grey");
        if (d.state === "holdover") return chip("Hold time is over", "red");
        if (d.state === "rejected") return chip(d.reason || "Declined", "red");
        if (d.state === "accepted") return d.holdBy ? chip("Hold by " + d.holdBy, "grey") : chip("Driver accepted offer", "blue");
        return chip("Chat not started", "grey");
    }
    function sideNote(d) {
        if (d.state === "hold") return '<span class="of-note of-note--hold">on hold ' + mmss(d.hold) + "</span>";
        if (d.unreliable) return '<span class="of-note">unreliable</span>';
        if (d.state === "rejected") return '<span class="of-note">rejected by You</span>';
        if (d.holdBy && d.holdBy !== "You") return '<span class="of-note">on hold by ' + esc(d.holdBy) + "</span>";
        return "";
    }
    function rowHtml(d) {
        var cls = "of-driver" + (state.open === d.id ? " is-active" : "") + (d.unreliable ? " is-unreliable" : "") + (d.state === "rejected" ? " is-rejected" : "");
        var av = '<span class="of-avatars' + (d.team ? " is-team" : "") + '">' + (d.team ? '<span class="emp-avatar emp-avatar--lg emp-avatar--alt">' + window.empChat.initials(d.team.name) + "</span>" : "") + '<span class="emp-avatar emp-avatar--lg">' + window.empChat.initials(d.name) + "</span></span>";
        return '<div class="' + cls + '" role="button" tabindex="0" data-of-open="' + d.id + '">' +
            '<label class="emp-check" data-of-stop><input class="emp-check__input" type="checkbox" aria-label="Select ' + esc(d.name) + '"' + (d.checked ? " checked" : "") + (d.state === "booked" ? " disabled" : "") + ' data-of-check="' + d.id + '"><span class="emp-check__box"><svg class="emp-check__mark" viewBox="0 0 20 20" aria-hidden="true"><use href="#i-check"></use></svg><span class="emp-check__minus"></span></span></label>' + av +
            '<div class="of-driver__info"><span class="of-driver__name"><b>' + d.unit + '</b><span class="of-driver__nm">' + esc(d.name) + "</span>" + icon("star", "of-star") + '<span class="of-rating">' + d.rating + "</span></span>" +
            (d.team ? '<span class="of-driver__name of-driver__name--team">' + esc(d.team.name) + icon("star", "of-star") + '<span class="of-rating">' + d.team.rating + "</span></span>" : "") +
            '<span class="of-muted">' + icon("ci-geo", "of-geo") + d.miles + " mi away</span><span>" + stateChip(d) + "</span></div>" +
            '<div class="of-driver__side"><span class="of-driver__top">' + sideNote(d) + '<span class="emp-chip emp-chip--sm emp-chip--outline emp-chip--green">' + d.avail + "</span></span>" +
            (d.rate ? '<span class="of-driver__rate">$' + d.rate.toLocaleString("en-US") + "</span>" : "") + ticks(d) + "</div></div>";
    }
    function visible() {
        var order = { hold: 0, accepted: 1, booked: 1, holdover: 2, notstarted: 3, rejected: 5 };
        var list = DRIVERS.filter(function (d) {
            if (state.tab === "booked" && d.state !== "booked") return false;
            if (state.status !== "All statuses") { var m = { "On hold": ["hold", "holdover"], "Accepted": ["accepted"], "Chat not started": ["notstarted"], "Rejected": ["rejected"] }[state.status]; if (m && m.indexOf(d.state) < 0) return false; }
            if (state.q && (d.name + " " + d.unit + " " + (d.team ? d.team.name : "")).toLowerCase().indexOf(state.q.toLowerCase()) < 0) return false;
            return true;
        });
        list.sort(function (a, b) {
            var oa = (a.unreliable ? 4 : order[a.state]), ob = (b.unreliable ? 4 : order[b.state]);
            if (oa !== ob) return oa - ob;
            if (state.sort === "Rate") return (a.rate || 1e9) - (b.rate || 1e9);
            if (state.sort === "Rating") return parseFloat(b.rating) - parseFloat(a.rating);
            return a.miles - b.miles;
        });
        return list;
    }
    function renderList() {
        var sel = DRIVERS.filter(function (d) { return d.checked; });
        $("of-bulk").hidden = !sel.length; $("of-sorts").hidden = !!sel.length;
        $("of-sel-count").textContent = sel.length + " selected";
        var all = $("of-all"); all.checked = sel.length && sel.length === DRIVERS.filter(function (d) { return d.state !== "booked"; }).length; all.indeterminate = !!sel.length && !all.checked;
        $("of-all").closest(".emp-check").classList.toggle("is-indeterminate", all.indeterminate);
        if (state.tab === "archive") {
            $("of-list").innerHTML = ARCHIVE.map(function (a, i) {
                return '<div class="of-arch' + (state.archiveOpen === i ? " is-active" : "") + '" role="button" tabindex="0" data-of-arch="' + i + '"><span class="of-sum__stop">' + esc(a.route) + '</span><span class="of-muted">' + a.drivers + " drivers · " + esc(a.date) + '</span><span class="of-arch__result">' + esc(a.result) + "</span></div>";
            }).join("");
            return;
        }
        var list = visible();
        $("of-list").innerHTML = list.length ? list.map(rowHtml).join("") : '<p class="of-empty">No drivers</p>';
    }
    function renderSide() {
        document.querySelectorAll("[data-of-tab]").forEach(function (t) { var on = t.getAttribute("data-of-tab") === state.tab; t.classList.toggle("is-active", on); t.setAttribute("aria-selected", on); });
        $("of-booked-count").textContent = DRIVERS.filter(function (d) { return d.state === "booked"; }).length;
        $("of-summary").hidden = state.tab === "archive"; $("of-listbar").hidden = state.tab === "archive";
        renderSummary(); renderList();
    }

    /* ---------- header + actions bar ---------- */
    function actionsHtml(d) {
        var left, b = [];
        if (d.state === "notstarted") { left = '<span class="of-muted">Waiting for the driver’s offer — the driver writes first (rate + ETA to PU)</span>'; b = [btn("Decline the driver", "secondary", "data-of-decline"), btn("Put on hold", "primary", "", true)]; }
        else if (d.state === "accepted") { left = d.holdBy && d.holdBy !== "You" ? chip("On hold by " + d.holdBy, "grey") : chip("Driver accepted offer", "blue"); b = [btn("Decline the driver", "secondary", "data-of-decline"), btn("Put on hold", "primary", "data-of-hold", !!(d.holdBy && d.holdBy !== "You"))]; }
        else if (d.state === "hold") { left = chip("On hold by You", "orange"); b = [btn("Decline the driver", "secondary", "data-of-decline"), btn("Release hold", "secondary", "data-of-release"), btn("Renew hold", "secondary", "data-of-renew-hold"), btn("Book driver on this load", "primary", "data-of-book")]; }
        else if (d.state === "holdover") { left = chip("Hold time is over", "red"); b = [btn("Decline the driver", "secondary", "data-of-decline"), btn("Put on hold", "primary", "data-of-hold")]; }
        else if (d.state === "booked") { left = '<span class="emp-offer__done">' + icon("ci-check") + "Booked by " + ME.name + " · " + esc(d.bookedAt || "11/05/2026 9:20 AM") + "</span>"; b = [btn("Cancel booking", "secondary", "data-of-cancel"), btn("Add to existed Load", "secondary", "data-of-add-load"), btn("Build the load", "primary", "data-of-build")]; }
        else { left = '<span class="of-muted">Declined by You · ' + esc(d.reason) + "</span>"; b = [btn("Restore the driver", "secondary", "data-of-restore")]; }
        return '<div class="of-actions">' + left + '<span class="of-grow"></span>' + b.join("") + "</div>";
    }
    function headerHtml(d) {
        var timers = d.state === "hold" ? chip("Bid is valid for: " + mmss(state.bid), "grey") + chip("Hold time: " + mmss(d.hold), "orange")
            : d.state === "booked" ? chip("Bid time is over", "grey") + chip("Booked by You", "green") : chip("Bid is valid for: " + mmss(state.bid), "grey") + (d.state === "notstarted" ? chip("Chat not started", "red") : "");
        return '<header class="of-head">' +
            '<div class="of-head__driver"><div class="of-head__who"><div class="of-head__name">' + icon("octagon", "of-flag of-flag--red") + icon("box", "of-flag of-flag--orange") + "<b>" + d.unit + '</b><span class="of-head__driver-name">' + esc(d.name) + " (" + d.st + ")</span>" + icon("star", "of-star") + '<span class="of-rating">7/2.61</span>' + chip("Only ENG", "orange") + chip("Other company sticker", "red") + '<button class="lc-icon-btn" type="button" data-of-noop aria-label="Edit driver">' + icon("ci-edit") + "</button></div>" +
            (d.team ? '<div class="of-head__name"><span class="of-head__driver-name of-head__driver-name--team">' + esc(d.team.name) + " (GA)</span>" + icon("star", "of-star") + '<span class="of-rating">' + d.team.rating + "</span></div>" : "") +
            '<div class="of-head__company"><span class="of-muted">Rojer Holloway LLC [11]</span>' + chip("TWIC", "grey") + chip("Hazmat", "grey") + chip("US citizen", "grey") + "</div></div>" +
            '<span class="of-vr"></span><div class="of-head__col"><b>Dallas TX, 75001</b><span class="of-muted">' + d.miles + " mi away · 11/05/2026 00:18</span>" + chip("Available", "green") + "</div>" +
            '<span class="of-vr"></span><div class="of-head__col of-kv"><span><span class="of-muted">DIMS</span>155 x 53 x 74</span><span><span class="of-muted">Payload</span>3200</span></div>' +
            '<span class="of-vr"></span><div class="of-head__col of-kv"><span><span class="of-muted">Ow</span><a href="tel:+11111111111">' + icon("ci-phone", "of-phone") + "(111) 111 - 1111</a></span><span><span class=\"of-muted\">Dr</span><a href=\"tel:+12222222222\">" + icon("ci-phone", "of-phone") + "(222) 222 - 2222</a></span></div></div>" +
            '<div class="of-head__details"><b>Details:</b><div class="of-kv of-kv--grid"><span><span class="of-muted">Loaded miles</span>891</span><span><span class="of-muted">Weight, lbs</span>1,500</span><span><span class="of-muted">Pallets</span>2</span><span><span class="of-muted">DIMS, in</span>48x48x48</span></div>' +
            '<span class="of-vr"></span><div class="of-head__note"><b>Note:</b><span>The driver must be a US citizen, and have TWIC card</span></div><span class="of-grow"></span><span class="of-vr"></span><div class="of-head__timers">' + timers + "</div></div>" +
            actionsHtml(d) + "</header>";
    }
    function offerCard(m) {
        var d = byId(m.driver); if (!d) return "";
        var foot = d.state === "booked" ? '<span class="emp-offer__done">' + icon("ci-check") + "Booked by " + ME.name + "</span>" : d.state === "hold" ? chip("On hold by You · " + mmss(d.hold), "orange") : d.state === "holdover" ? chip("Hold time is over", "red") : "";
        var tz = d.tz ? '<span class="emp-tip" data-place="top"><span class="emp-offer__tz" tabindex="0" aria-label="Time zone warning">' + icon("excl") + '</span><span class="emp-tip__bubble" role="tooltip"><span class="emp-tip__line">Driver crossing a time zone.</span><span class="emp-tip__line">Arrival time is shown in CDT (GMT-5)</span></span></span>' : "";
        return '<div class="emp-offer"><div class="emp-offer__row"><b>ETA to PU:</b><span class="emp-offer__value">1h : 30m</span><span class="emp-offer__muted">05:47 PM (CDT, GMT-5)</span>' + tz + "</div>" +
            '<div class="emp-offer__row"><b>Rate:</b><span class="emp-offer__value">$' + (d.rate || 0).toLocaleString("en-US") + '</span></div><div class="emp-offer__row"><b>Note:</b><span>can pick up the load earlier</span></div>' +
            '<div class="emp-offer__loc' + (d.noGps ? " is-missing" : "") + '"><span class="emp-offer__muted">Driver’s current location:</span>' + (d.noGps ? '<span class="emp-offer__nogps">Can’t get current location</span>' : '<a href="#" data-of-noop>Coeur d’Alene, NM, 04205</a>') + "</div>" + foot + "</div>";
    }
    function messages(d) {
        if (d.msgs) return d.msgs;
        var di = window.empChat.initials(d.name);
        var m = [{ kind: "event", tone: "neutral", text: "Offer sent to " + DRIVERS.length + " drivers by " + ME.name, time: "8:30 AM", day: "Today" },
            { side: "out", author: ME.name, avatar: "AJ", time: "8:41 AM", status: d.seen === "read" ? "read" : "delivered", channel: "via App", text: "Hi " + d.name.split(" ")[0] + "! Load from Dallas, TX to Atlanta, GA, 891 mi, 2 pallets. Can you take it?", readBy: d.seen === "read" ? [[d.name, "Driver"]] : [] }];
        if (d.state !== "notstarted") {
            m.push({ side: "in", author: d.name, avatar: di, time: "8:55 AM", channel: "via App", text: "Yes, I can be there in about 1.5 hours. Can pick up earlier if needed." });
            m.push({ kind: "event", tone: "success", text: d.name + " accepted offer", time: "11/05/2026 9:02 AM" });
            m.push({ kind: "card", card: "offer", driver: d.id, time: "9:02 AM" });
        }
        if (d.state === "hold") m.push({ kind: "event", tone: "neutral", text: "Hold by " + ME.name, time: "11/05/2026 9:05 AM" }, { side: "out", author: ME.name, avatar: "AJ", time: "9:06 AM", status: "read", text: "Hi John! Can you confirm the truck is empty and ready by 10 AM?", readBy: [[d.name, "Driver"]] }, { side: "in", author: d.name, avatar: di, time: "9:08 AM", text: "Yes, empty and ready. Can pick up earlier." });
        if (d.state === "rejected") m.push({ kind: "event", tone: "danger", text: "Declined by " + ME.name + ": " + d.reason, time: "9:30 AM" });
        if (d.unread) m.push({ side: "in", id: "u-" + d.id, author: d.name, avatar: di, time: "9:40 AM", text: "Is the rate negotiable? $800 is low for this lane." });
        d.msgs = m; return m;
    }
    function chat() { var n = document.querySelector("#of-main .emp-chat"); return n && n._empChat; }
    function event(text, tone) { var c = chat(); if (c) { c.push({ kind: "event", tone: tone || "neutral", text: text }); c.scrollBottom(); } }
    function repaintCard() { var c = chat(); if (!c) return; c.msgs.filter(function (m) { return m.kind === "card"; }).forEach(function (m) { c.repaint(m); }); }
    function renderHead() { var d = byId(state.open), h = document.querySelector("#of-main .of-head"); if (d && h) h.outerHTML = headerHtml(d); }
    function renderMain() {
        var box = $("of-main");
        if (state.tab === "archive") {
            var a = ARCHIVE[state.archiveOpen];
            box.innerHTML = '<header class="of-head"><div class="of-actions"><span class="of-sum__stop">' + esc(a.route) + '</span><span class="of-muted">' + esc(a.date) + '</span><span class="of-grow"></span>' + chip(a.result, a.result.indexOf("rejected") >= 0 ? "red" : "green") + '</div></header><div class="of-chat"></div>';
            window.empChat.mount(box.querySelector(".of-chat"), { me: ME, disabled: true, messages: [{ kind: "event", tone: "neutral", text: "Offer sent to " + a.drivers + " drivers by " + ME.name, time: a.date, day: a.date.split(" ")[0] }, { kind: "event", tone: a.result.indexOf("rejected") >= 0 ? "danger" : "success", text: a.result, time: a.date }] });
            return;
        }
        var d = byId(state.open);
        if (!d || (state.tab === "booked" && d.state !== "booked")) { box.innerHTML = '<div class="lc-placeholder">' + icon("chat-dots", "lc-placeholder__ico") + "<strong>Select a driver</strong><span>Choose a driver on the left to open the offer chat.</span></div>"; return; }
        var unread = !d.msgs && d.unread ? "u-" + d.id : null, msgs = messages(d);
        d.unread = 0; if (d.seen) d.seen = "read";
        box.innerHTML = headerHtml(d) + '<div class="of-chat"></div>';
        window.empChat.mount(box.querySelector(".of-chat"), {
            me: ME, messages: msgs, quick: QUICK, channel: "via App", unreadFrom: unread, renderCard: offerCard,
            demo: { name: d.name, avatar: window.empChat.initials(d.name), channel: "via App", replies: ["Got it 👍", "Ok, waiting for your answer.", "I can be there at 2 PM.", "Copy that."] },
            onSend: function () { if (d.state === "notstarted") { d.state = "accepted"; d.rate = d.rate || 1300; } }
        });
    }
    function render() { renderSide(); renderMain(); }

    /* ---------- actions ---------- */
    var declineIds = [];
    function openDecline(ids) { declineIds = ids; $("of-decline-title").textContent = ids.length > 1 ? "Reject the drivers’ offers (" + ids.length + ")" : "Reject the driver’s offer"; window.empOverlay.open($("of-decline")); }
    function decline() {
        var r = document.querySelector('input[name="of-reason"]:checked'), reason = r ? r.value : "Other";
        declineIds.forEach(function (id) { var d = byId(id); d.state = "rejected"; d.reason = reason; d.checked = false; d.holdBy = d.holdBy === "You" ? null : d.holdBy; if (d.msgs) d.msgs.push({ kind: "event", tone: "danger", text: "Declined by " + ME.name + ": " + reason }); });
        window.empOverlay.close($("of-decline"));
        toast("declined", { name: declineIds.length > 1 ? declineIds.length + " drivers" : byId(declineIds[0]).name });
        render();
    }
    document.addEventListener("click", function (e) {
        var a = e.target.closest("[data-of-tab],[data-of-open],[data-of-arch],[data-of-update],[data-of-renew],[data-of-hold],[data-of-release],[data-of-renew-hold],[data-of-book],[data-of-decline],[data-of-decline-save],[data-of-bulk-reject],[data-of-cancel],[data-of-cancel-save],[data-of-add-load],[data-of-add-save],[data-of-build],[data-of-restore],[data-of-new],[data-of-clear],[data-of-noop]");
        if (!a || e.target.closest("[data-of-stop]")) return;
        var dd = a.dataset, d = byId(state.open);
        if ("ofNoop" in dd) { e.preventDefault(); return; }
        if (dd.ofTab) { state.tab = dd.ofTab; if (state.tab === "booked") { var b = DRIVERS.filter(function (x) { return x.state === "booked"; })[0]; state.open = b ? b.id : null; } else if (state.tab === "active" && !byId(state.open)) state.open = visible()[0].id; render(); return; }
        if (dd.ofOpen) { state.open = dd.ofOpen; render(); return; }
        if (dd.ofArch) { state.archiveOpen = +dd.ofArch; render(); return; }
        if ("ofUpdate" in dd) { state.added = state.newDrivers; state.newDrivers = 0; state.timer = 10 * 60; DRIVERS.push(drv("n" + Date.now(), "5521", "Walter White", "NM", "7.12", 12.4, 0, "notstarted", { seen: "sent" })); toast("offerUpdated"); renderSide(); return; }
        if ("ofRenew" in dd) { state.timer = 10 * 60; state.added = 0; DRIVERS.forEach(function (x) { if (x.state === "notstarted") x.seen = "sent"; }); toast("sent", { name: "Offer" }); renderSide(); return; }
        if ("ofHold" in dd) { d.state = "hold"; d.holdBy = "You"; d.hold = 15 * 60; event("Hold by " + ME.name); render(); repaintCard(); return; }
        if ("ofRelease" in dd) { d.state = "accepted"; d.holdBy = null; event("Hold released by " + ME.name); render(); repaintCard(); return; }
        if ("ofRenewHold" in dd) { d.hold = 15 * 60; event("Hold renewed by " + ME.name + " · 15:00"); renderHead(); renderList(); return; }
        if ("ofBook" in dd) { d.state = "booked"; d.holdBy = null; d.bookedAt = new Date().toLocaleString("en-US", { month: "2-digit", day: "2-digit", year: "numeric", hour: "numeric", minute: "2-digit" }).replace(",", ""); event(d.name + " booked for this offer by " + ME.name, "success"); toast("booked", { name: d.name }); render(); repaintCard(); return; }
        if ("ofDecline" in dd) { openDecline([d.id]); return; }
        if ("ofBulkReject" in dd) { openDecline(DRIVERS.filter(function (x) { return x.checked; }).map(function (x) { return x.id; })); return; }
        if ("ofDeclineSave" in dd) { decline(); return; }
        if ("ofCancel" in dd) { $("of-cancel-note").value = ""; window.empOverlay.open($("of-cancel")); return; }
        if ("ofCancelSave" in dd) { var note = $("of-cancel-note").value.trim(); if (!note) { $("of-cancel-note").closest(".emp-field").classList.add("is-error"); $("of-cancel-note").focus(); return; } d.state = "accepted"; event("Booking cancelled by " + ME.name + ": " + note, "danger"); window.empOverlay.close($("of-cancel")); render(); repaintCard(); return; }
        if ("ofAddLoad" in dd) { window.empOverlay.open($("of-add")); return; }
        if ("ofAddSave" in dd) { var pro = $("of-add-load").value; event(d.name + " has been added to the load " + pro + " by " + ME.name, "success"); window.empOverlay.close($("of-add")); toast("updated"); return; }
        if ("ofBuild" in dd) { event("Load #612777 has been built from this offer by " + ME.name, "success"); toast("created"); return; }
        if ("ofRestore" in dd) { d.state = "accepted"; d.reason = ""; event("Driver restored by " + ME.name); render(); return; }
        if ("ofNew" in dd) { toast("offerCreated"); return; }
        if ("ofClear" in dd) { state.q = ""; $("of-q").value = ""; state.status = "All statuses"; renderList(); return; }
    });
    document.addEventListener("change", function (e) {
        var t = e.target;
        if (t.matches("[data-of-check]")) { byId(t.getAttribute("data-of-check")).checked = t.checked; renderList(); }
        if (t.id === "of-all") { var on = t.checked; DRIVERS.forEach(function (d) { if (d.state !== "booked") d.checked = on; }); renderList(); }
        if (t.id === "of-sort") { state.sort = t.value; renderList(); }
        if (t.id === "of-status") { state.status = t.value; renderList(); }
    });
    document.addEventListener("input", function (e) { if (e.target.id === "of-q") { state.q = e.target.value; renderList(); } if (e.target.id === "of-cancel-note") e.target.closest(".emp-field").classList.remove("is-error"); });
    document.addEventListener("keydown", function (e) { if (e.key === "Enter" && e.target.matches && e.target.matches("[data-of-open],[data-of-arch]")) e.target.click(); });

    /* Timers: offer timer (Update / Renew), bid time and hold time; demo — new drivers show up after 15 s. */
    var tick = 0;
    setInterval(function () {
        tick++;
        if (state.timer > 0) state.timer--;
        if (state.bid > 0) state.bid--;
        DRIVERS.forEach(function (d) { if (d.state === "hold" && d.hold > 0) { d.hold--; if (!d.hold) { d.state = "holdover"; d.holdBy = null; } } });
        if (tick === 15 && !state.added) state.newDrivers = 3;
        if (state.tab !== "archive") { renderSummary(); document.querySelectorAll(".of-note--hold").forEach(function () {}); }
        var d = byId(state.open), h = document.querySelector("#of-main .of-head__timers");
        if (d && h && state.tab !== "archive") h.innerHTML = (d.state === "hold" ? chip("Bid is valid for: " + mmss(state.bid), "grey") + chip("Hold time: " + mmss(d.hold), "orange") : h.innerHTML);
        if (tick % 5 === 0 && state.tab !== "archive") renderList();
    }, 1000);

    function init() {
        if (window.empChat.injectSprite) window.empChat.injectSprite();
        if ((location.hash || "") === "#archive") state.tab = "archive";
        render();
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
