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
    /* Demo day is 11/05/2026 (as in Figma); the clock part is real */
    function nowStamp() { return "11/05/2026 " + new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }); }
    var QUICK = ["You are welcome", "Thank you", "Please, share your current location"];
    var RED = 3 * 60; /* timers turn red under 3 min */

    function drv(id, unit, name, st, rating, miles, rate, state, o) {
        o = o || {};
        return { id: id, unit: unit, name: name, st: st, rating: rating, miles: miles, rate: rate, state: state, holdBy: o.holdBy || null, team: o.team || null, seen: o.seen || null, unread: o.unread || 0,
            unreliable: !!o.unreliable, reason: o.reason || "", tz: !!o.tz, noGps: !!o.noGps, avail: o.avail || "Av", hold: 14 * 60 + 54, msgs: null, checked: false, loc: o.loc || "Dallas TX, 75001", prevState: o.prevState || null };
    }
    var DRIVERS = [
        drv("d1", "2323", "John Driver", "TX", "9.75", 6.9, 1500, "hold", { holdBy: "You", seen: "read", tz: true, team: { name: "Oliver Smith", rating: "5.00" } }),
        drv("d2", "4637", "Bryden Williams", "GA", "9.75", 4.9, 1200, "accepted", { holdBy: "Anna Lu", seen: "read", loc: "Irving TX, 75038" }),
        drv("d3", "4440", "Gavin Chesterton", "OK", "9.75", 7, 800, "accepted", { unread: 1, noGps: true, seen: "read", loc: "Garland TX, 75040" }),
        drv("d4", "3463", "Benjamin Blare", "GA", "9.75", 6.1, 0, "notstarted", { seen: "sent", loc: "Marietta GA, 30060" }),
        drv("d5", "4638", "Eddie Lake", "NM", "8.10", 9.2, 0, "notstarted", { unreliable: true, seen: "sent", loc: "Plano TX, 75074" }),
        drv("d6", "7866", "Dave Mustaine", "CA", "9.40", 12, 1900, "rejected", { reason: "The rate was too high", avail: "Av On", seen: "read", prevState: "accepted", loc: "Mesquite TX, 75149" })
    ];
    var NEW_NAMES = [["5521", "Walter White", "NM"], ["5522", "Jesse Pinkman", "NM"], ["5523", "Saul Goodman", "NM"]];
    function snapshotMsgs(name) {
        var di = name.split(" ").map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase(), T = "11/04/2026";
        return [{ kind: "event", tone: "success", text: name + " accepted offer", time: "11/04/2026 9:02 AM", day: T }, { kind: "card", card: "offer", driver: "a1", time: "9:02 AM", day: T },
            { kind: "event", tone: "neutral", text: "Hold by " + ME.name, time: "11/04/2026 9:05 AM", day: T }, { kind: "event", tone: "success", text: name + " booked for this offer by " + ME.name, time: "11/04/2026 9:20 AM", day: T },
            { side: "out", author: ME.name, avatar: "AJ", time: "9:12 AM", day: T, status: "read", text: "Load info will come to your app shortly, please confirm." }, { side: "in", author: name, avatar: di, time: "9:13 AM", day: T, text: "Confirmed 👍" },
            { kind: "event", tone: "neutral", text: "Load built — offer moved to archive. Other drivers got “Broker covered the load”.", time: "11/04/2026 9:40 AM", day: T }];
    }
    var ARCHIVE = [
        { drivers: 3, pu: "PU1: Dallas, TX 75001 / 11/03 08:00", del: "DEL1: Atlanta, GA, 30033 / 11/04 10:00", date: "11/04/2026", result: "Load built · John Driver", tone: "green", driver: drv("a1", "2323", "John Driver", "TX", "9.75", 6.9, 1050, "booked", { seen: "read" }) },
        { drivers: 5, pu: "PU1: Miami, FL 33101 / 11/02 ASAP", del: "DEL1: Orlando, FL 32801 / 11/02 18:00", date: "11/04/2026", result: "All drivers rejected", tone: "grey" },
        { drivers: 2, pu: "PU1: Phoenix, AZ 85001 / 11/01", del: "DEL1: El Paso, TX 79901 / 11/02", date: "11/04/2026", result: "Broker covered the load", tone: "red" }
    ];
    ARCHIVE[0].driver.bookedAt = "11/04/2026 9:20 AM"; ARCHIVE[0].msgs = snapshotMsgs("John Driver");
    var state = { tab: "active", open: "d1", sort: "Mi away", status: "All statuses", q: "", timer: 2 * 60 + 54, newDrivers: 0, added: 0, bid: 14 * 60 + 12, archiveOpen: 0, closed: false, range: null };
    function byId(id) { for (var i = 0; i < DRIVERS.length; i++) if (DRIVERS[i].id === id) return DRIVERS[i]; for (var j = 0; j < ARCHIVE.length; j++) if (ARCHIVE[j].driver && ARCHIVE[j].driver.id === id) return ARCHIVE[j].driver; return null; }
    function selectable(d) { return d.state !== "booked" && d.state !== "rejected"; }

    /* ---------- left column ---------- */
    var summaryKey = "";
    function renderSummary() {
        var upd = state.newDrivers ? { cls: "is-available", text: "New drivers are available", n: state.newDrivers, type: "primary", dis: false }
            : state.added ? { cls: "is-added", text: "New drivers were added", n: state.added, type: "secondary", dis: true }
            : { cls: "", text: "No new drivers available", n: 0, type: "secondary", dis: true };
        var renewOff = state.timer > 0, booked = state.tab === "booked";
        summaryKey = [state.newDrivers, state.added, renewOff, booked, DRIVERS.length].join("|");
        $("of-summary").innerHTML =
            '<div class="of-sum__row"><span class="of-sum__drivers">' + DRIVERS.length + ' DRIVERS</span><span class="emp-tab__count">26</span><span class="of-grow"></span><span class="of-muted">Andrew J. · 11/05/2026 13:13</span></div>' +
            '<div class="of-sum__row"><span class="of-sum__stop">PU1: Dallas, TX 75001 / ASAP</span><span class="of-grow"></span><a class="of-link" href="#" data-of-noop>' + icon("ci-geo") + "Google Maps</a></div>" +
            '<div class="of-muted">+2 PU on the way · +2 DEL on the way · <a class="of-link" href="#" data-of-noop>See more</a></div>' +
            '<div class="of-sum__row"><span class="of-sum__stop of-sum__stop--cut">DEL3: Atlanta, GA, 30033 / Tomorrow by 10 AM</span><span class="of-grow"></span><button class="of-link of-link--btn" type="button" data-of-renew' + (renewOff || booked ? ' disabled title="Available when the offer timer ends"' : "") + ">" + icon("ci-retry") + "Renew offer</button></div>" +
            '<div class="of-sum__row of-sum__timer"><span class="of-timer' + (state.timer > 0 && state.timer < RED ? " is-red" : "") + '">' + icon("ci-clock") + '<span data-of-timer>' + mmss(state.timer) + '</span></span><span class="of-status ' + upd.cls + '">' + icon("people") + "<span>" + upd.text + "</span>" + (upd.n ? '<span class="of-plus">+' + upd.n + "</span>" : "") + '</span><span class="of-grow"></span>' +
            btn("Update offer", upd.type, "data-of-update", upd.dis || booked) + "</div>";
    }
    function ticks(d) {
        if (d.unread) return '<span class="of-unread">' + d.unread + "</span>";
        if (!d.seen) return "";
        return '<span class="emp-chat__status emp-chat__status--' + (d.seen === "read" ? "read" : "sent") + '" title="' + (d.seen === "read" ? "Read" : "Sent") + '">' + icon(d.seen === "read" ? "ci-check-all" : "ci-check", "emp-chat__ico") + "</span>";
    }
    function holdColor(d) { return d.hold < RED ? "red" : "orange"; }
    function stateChip(d) {
        if (d.state === "booked") return chip("Booked by You", "green");
        if (d.state === "hold") return chip("Hold by " + d.holdBy + (d.holdBy === "You" ? " · " + mmss(d.hold) : ""), d.holdBy === "You" ? holdColor(d) : "grey");
        if (d.state === "holdover") return chip("Hold time is over", "red");
        if (d.state === "rejected") return chip(d.reason || "Declined", "red");
        if (d.state === "accepted") return d.holdBy ? chip("Hold by " + d.holdBy, "grey") : chip("Driver accepted offer", "blue");
        return chip("Chat not started", "grey");
    }
    function sideNote(d) { return d.unreliable ? '<span class="of-note">unreliable</span>' : ""; }
    function rowHtml(d) {
        var cls = "of-driver" + (state.open === d.id ? " is-active" : "") + (d.unreliable ? " is-unreliable" : "") + (d.state === "rejected" ? " is-rejected" : "");
        var av = '<span class="of-avatars' + (d.team ? " is-team" : "") + '">' + (d.team ? '<span class="emp-avatar emp-avatar--lg emp-avatar--alt">' + window.empChat.initials(d.team.name) + "</span>" : "") + '<span class="emp-avatar emp-avatar--lg">' + window.empChat.initials(d.name) + "</span></span>";
        return '<div class="' + cls + '" role="button" tabindex="0" data-of-open="' + d.id + '">' +
            '<label class="emp-check" data-of-stop><input class="emp-check__input" type="checkbox" aria-label="Select ' + esc(d.name) + '"' + (d.checked ? " checked" : "") + (selectable(d) && state.tab !== "booked" ? "" : " disabled") + ' data-of-check="' + d.id + '"><span class="emp-check__box"><svg class="emp-check__mark" viewBox="0 0 20 20" aria-hidden="true"><use href="#i-check"></use></svg><span class="emp-check__minus"></span></span></label>' + av +
            '<div class="of-driver__body">' +
            '<div class="of-line"><span class="of-driver__name"><b>' + d.unit + '</b><span class="of-driver__nm" title="' + esc(d.name) + '">' + esc(d.name) + "</span>" + icon("star", "of-star") + '<span class="of-rating">' + d.rating + '</span></span><span class="of-line__end">' + sideNote(d) + '<span class="emp-chip emp-chip--sm emp-chip--outline emp-chip--green">' + d.avail + "</span></span></div>" +
            (d.team ? '<div class="of-line"><span class="of-driver__name of-driver__name--team"><span class="of-driver__nm" title="' + esc(d.team.name) + '">' + esc(d.team.name) + "</span>" + icon("star", "of-star") + '<span class="of-rating">' + d.team.rating + "</span></span></div>" : "") +
            '<div class="of-line"><span class="of-muted of-nowrap">' + icon("ci-geo", "of-geo") + d.miles + ' mi away</span><span class="of-line__end">' + (d.rate ? '<span class="of-driver__rate">$' + d.rate.toLocaleString("en-US") + "</span>" : "") + "</span></div>" +
            '<div class="of-line"><span class="of-line__chip" data-of-chip="' + d.id + '">' + stateChip(d) + '</span><span class="of-line__end">' + ticks(d) + "</span></div></div></div>";
    }
    function filtered() {
        var order = { hold: 0, accepted: 1, booked: 1, holdover: 2, notstarted: 3, rejected: 5 };
        var list = DRIVERS.filter(function (d) {
            if (state.status !== "All statuses") { var m = { "On hold": ["hold", "holdover"], "Accepted": ["accepted"], "Chat not started": ["notstarted"], "Rejected": ["rejected"] }[state.status]; if (m && m.indexOf(d.state) < 0) return false; }
            if (state.q && (d.name + " " + d.unit + " " + d.loc + " " + (d.team ? d.team.name : "")).toLowerCase().indexOf(state.q.toLowerCase()) < 0) return false;
            return true;
        });
        list.sort(function (a, b) {
            var oa = (a.unreliable && a.state !== "rejected" ? 4 : order[a.state]), ob = (b.unreliable && b.state !== "rejected" ? 4 : order[b.state]);
            if (oa !== ob) return oa - ob;
            if (state.sort === "Rate") return (a.rate || 1e9) - (b.rate || 1e9);
            if (state.sort === "Rating") return parseFloat(b.rating) - parseFloat(a.rating);
            return a.miles - b.miles;
        });
        return list;
    }
    /* Booked tab (Figma 4.4) shows the offers that have a booked driver — the whole offer with all its drivers */
    function visible() {
        if (state.closed && state.tab !== "archive") return [];
        if (state.tab === "booked" && !DRIVERS.some(function (d) { return d.state === "booked"; })) return [];
        return filtered();
    }
    function archVisible() {
        var q = state.q.trim().toLowerCase();
        return ARCHIVE.map(function (a, i) { a.i = i; return a; }).filter(function (a) {
            if (q && (a.pu + " " + a.del + " " + a.result + " " + (a.driver ? a.driver.name : "")).toLowerCase().indexOf(q) < 0) return false;
            if (state.range) { var t = new Date(a.date).getTime(); if (t < state.range[0] || t > state.range[1]) return false; }
            return true;
        });
    }
    function renderList() {
        /* Selection lives only on what is visible and selectable */
        var vis = state.tab === "archive" ? [] : visible();
        DRIVERS.forEach(function (d) { if (d.checked && (vis.indexOf(d) < 0 || !selectable(d) || state.tab === "booked")) d.checked = false; });
        var sel = DRIVERS.filter(function (d) { return d.checked; }), pool = vis.filter(selectable);
        $("of-bulk").hidden = !sel.length; $("of-sorts").hidden = !!sel.length;
        $("of-sel-count").textContent = sel.length + " selected";
        var all = $("of-all"); all.disabled = !pool.length || state.tab === "booked"; all.checked = !!sel.length && sel.length === pool.length; all.indeterminate = !!sel.length && !all.checked;
        all.closest(".emp-check").classList.toggle("is-indeterminate", all.indeterminate);
        if (state.tab === "archive") {
            var al = archVisible();
            $("of-list").innerHTML = al.length ? al.map(function (a) {
                return '<div class="of-arch' + (state.archiveOpen === a.i ? " is-active" : "") + '" role="button" tabindex="0" data-of-arch="' + a.i + '"><div class="of-sum__row"><span class="of-sum__drivers">' + a.drivers + ' DRIVERS</span><span class="emp-tab__count">26</span><span class="of-grow"></span><span class="of-muted">Archived ' + esc(a.date) + "</span></div>" +
                    '<div class="of-sum__row"><span class="of-sum__stop of-sum__stop--cut">' + esc(a.pu) + '</span><span class="of-grow"></span><a class="of-link" href="#" data-of-noop>' + icon("ci-geo") + "Google Maps</a></div>" +
                    '<span class="of-sum__stop of-sum__stop--cut">' + esc(a.del) + '</span><span class="of-arch__result">' + chip(a.result, a.tone) + icon("people", "of-arch__ico") + "</span></div>";
            }).join("") : '<p class="of-empty">No offers in this period</p>';
            return;
        }
        var list = vis;
        $("of-list").innerHTML = list.length ? list.map(rowHtml).join("") : '<p class="of-empty">' + (state.closed ? "The offer moved to Archive" : state.tab === "booked" && !DRIVERS.some(function (d) { return d.state === "booked"; }) ? "No booked offers yet" : "No drivers") + "</p>";
    }
    function renderSide() {
        document.querySelectorAll("[data-of-tab]").forEach(function (t) { var on = t.getAttribute("data-of-tab") === state.tab; t.classList.toggle("is-active", on); t.setAttribute("aria-selected", on); });
        $("of-booked-count").textContent = state.closed ? 0 : DRIVERS.filter(function (d) { return d.state === "booked"; }).length ? 1 : 0;
        var arch = state.tab === "archive";
        $("of-summary").hidden = arch || state.closed || (state.tab === "booked" && !DRIVERS.some(function (d) { return d.state === "booked"; }));
        $("of-listbar").hidden = arch || state.closed;
        $("of-arch-date").hidden = !arch;
        renderSummary(); renderList();
    }

    /* ---------- header + actions bar ---------- */
    function actionsHtml(d, archived) {
        var left, b = [];
        if (archived) return '<div class="of-actions"><span class="emp-offer__done">' + icon("ci-check") + "Booked by " + ME.name + " · " + esc(d.bookedAt) + " · Offer archived</span></div>";
        if (d.state === "notstarted") { left = '<span class="of-muted">Waiting for the driver’s offer — the driver writes first (rate + ETA to PU)</span>'; b = [btn("Decline the driver", "secondary", "data-of-decline"), btn("Put on hold", "primary", "", true)]; }
        else if (d.state === "accepted") { left = d.holdBy && d.holdBy !== "You" ? chip("On hold by " + d.holdBy, "grey") : chip("Driver accepted offer", "blue"); b = [btn("Decline the driver", "secondary", "data-of-decline"), btn("Put on hold", "primary", "data-of-hold", !!(d.holdBy && d.holdBy !== "You"))]; }
        else if (d.state === "hold") { left = chip("On hold by You", holdColor(d)); b = [btn("Decline the driver", "secondary", "data-of-decline"), btn("Release hold", "secondary", "data-of-release"), btn("Renew hold", "secondary", "data-of-renew-hold"), btn("Book driver on this load", "primary", "data-of-book")]; }
        else if (d.state === "holdover") { left = chip("Hold time is over", "red"); b = [btn("Decline the driver", "secondary", "data-of-decline"), btn("Put on hold", "primary", "data-of-hold")]; }
        else if (d.state === "booked") { left = '<span class="emp-offer__done">' + icon("ci-check") + "Booked by " + ME.name + " · " + esc(d.bookedAt || "11/05/2026 9:20 AM") + "</span>"; b = [btn("Cancel booking", "secondary", "data-of-cancel"), btn("Add to existing load", "secondary", "data-of-add-load"), btn("Build the load", "primary", "data-of-build")]; }
        else { left = '<span class="of-muted">Declined by You · ' + esc(d.reason) + "</span>"; b = [btn("Restore the driver", "secondary", "data-of-restore")]; }
        return '<div class="of-actions">' + left + '<span class="of-grow"></span>' + b.join("") + "</div>";
    }
    function timersHtml(d, archived) {
        if (archived || d.state === "booked") return chip("Bid time is over", "grey") + chip("Booked by You", "green");
        var bid = state.bid > 0 ? chip("Bid is valid for: " + mmss(state.bid), state.bid < RED ? "red" : "grey") : chip("Bid time is over", "red");
        if (d.state === "hold") return bid + chip("Hold time: " + mmss(d.hold), holdColor(d));
        if (d.state === "holdover") return bid + chip("Hold time is over", "red");
        return bid + (d.state === "notstarted" ? chip("Chat not started", "red") : "");
    }
    function headerHtml(d, archived) {
        return '<header class="of-head">' +
            '<div class="of-head__driver"><div class="of-head__who"><div class="of-head__name">' + icon("octagon", "of-flag of-flag--red") + icon("box", "of-flag of-flag--orange") + "<b>" + d.unit + '</b><span class="of-head__driver-name">' + esc(d.name) + " (" + d.st + ")</span>" + icon("star", "of-star") + '<span class="of-rating">7/2.61</span>' + chip("Only ENG", "orange") + chip("Other company sticker", "red") + (archived ? "" : '<button class="lc-icon-btn" type="button" data-of-noop aria-label="Edit driver">' + icon("ci-edit") + "</button>") + "</div>" +
            (d.team ? '<div class="of-head__name"><span class="of-head__driver-name of-head__driver-name--team">' + esc(d.team.name) + " (GA)</span>" + icon("star", "of-star") + '<span class="of-rating">' + d.team.rating + "</span></div>" : "") +
            '<div class="of-head__company"><span class="of-muted">Rojer Holloway LLC [11]</span>' + chip("TWIC", "grey") + chip("Hazmat", "grey") + chip("US citizen", "grey") + "</div></div>" +
            '<span class="of-vr"></span><div class="of-head__col"><b>' + esc(d.loc) + '</b><span class="of-muted">' + d.miles + " mi away · 11/05/2026 00:18</span>" + chip("Available", "green") + "</div>" +
            '<span class="of-vr"></span><div class="of-head__col of-kv"><span><span class="of-muted">DIMS</span>155 x 53 x 74</span><span><span class="of-muted">Payload</span>3200</span></div>' +
            '<span class="of-vr"></span><div class="of-head__col of-kv"><span><span class="of-muted">Ow</span><a href="tel:+11111111111">' + icon("ci-phone", "of-phone") + "(111) 111 - 1111</a></span><span><span class=\"of-muted\">Dr</span><a href=\"tel:+12222222222\">" + icon("ci-phone", "of-phone") + "(222) 222 - 2222</a></span></div></div>" +
            '<div class="of-head__details"><b>Details:</b><div class="of-kv of-kv--grid"><span><span class="of-muted">Loaded miles</span>891</span><span><span class="of-muted">Weight, lbs</span>1,500</span><span><span class="of-muted">Pallets</span>2</span><span><span class="of-muted">DIMS, in</span>48x48x48</span></div>' +
            '<span class="of-vr"></span><div class="of-head__note"><b>Note:</b><span>The driver must be a US citizen, and have TWIC card</span></div><span class="of-grow"></span><div class="of-head__timers">' + timersHtml(d, archived) + "</div></div>" +
            actionsHtml(d, archived) + "</header>";
    }
    function offerCard(m) {
        var d = byId(m.driver); if (!d) return "";
        var foot = d.state === "booked" ? '<span class="emp-offer__done">' + icon("ci-check") + "Booked by " + ME.name + "</span>" : d.state === "hold" ? chip("On hold by You · " + mmss(d.hold), holdColor(d)) : d.state === "holdover" ? chip("Hold time is over", "red") : "";
        var tz = d.tz ? '<span class="emp-tip" data-place="top"><span class="emp-offer__tz" tabindex="0" aria-label="Time zone warning">' + icon("excl") + '</span><span class="emp-tip__bubble" role="tooltip"><span class="emp-tip__line">Driver crossing a time zone.</span><span class="emp-tip__line">Arrival time is shown in CDT (GMT-5)</span></span></span>' : "";
        return '<div class="emp-offer" data-of-card="' + d.id + '"><div class="emp-offer__row"><b>ETA to PU:</b><span class="emp-offer__value">1h : 30m</span><span class="emp-offer__muted">05:47 PM (CDT, GMT-5)</span>' + tz + "</div>" +
            '<div class="emp-offer__row"><b>Rate:</b><span class="emp-offer__value">$' + (d.rate || 0).toLocaleString("en-US") + '</span></div><div class="emp-offer__row"><b>Note:</b><span>can pick up the load earlier</span></div>' +
            '<div class="emp-offer__loc' + (d.noGps ? " is-missing" : "") + '"><span class="emp-offer__muted">Driver’s current location:</span>' + (d.noGps ? '<span class="emp-offer__nogps">Can’t get current location</span>' : '<a href="#" data-of-noop>Coeur d’Alene, NM, 04205</a>') + "</div>" + foot + "</div>";
    }
    function messages(d) {
        if (d.msgs) return d.msgs;
        var di = window.empChat.initials(d.name), m = [];
        /* Not started (Figma 4.2): the feed is empty until the driver sends his rate and ETA */
        if (d.state !== "notstarted" && !(d.state === "rejected" && d.prevState === "notstarted")) {
            m.push({ side: "in", author: d.name, avatar: di, time: "8:55 AM", channel: "via App", text: "Yes, I can be there in about 1.5 hours. Can pick up earlier if needed." });
            m.push({ kind: "event", tone: "success", text: d.name + " accepted offer", time: "11/05/2026 9:02 AM" });
            m.push({ kind: "card", card: "offer", driver: d.id, time: "9:02 AM" });
        }
        if (d.state === "hold") m.push({ kind: "event", tone: "neutral", text: "Hold by " + ME.name, time: "11/05/2026 9:05 AM" }, { side: "out", author: ME.name, avatar: "AJ", time: "9:06 AM", status: "read", text: "Hi John! Can you confirm the truck is empty and ready by 10 AM?", readBy: [[d.name, "Driver"]] }, { side: "in", author: d.name, avatar: di, time: "9:08 AM", text: "Yes, empty and ready. Can pick up earlier." });
        if (d.state === "rejected") m.push({ kind: "event", tone: "danger", text: "Declined by " + ME.name + ": " + d.reason, time: "11/05/2026 9:30 AM" });
        if (d.unread) m.push({ side: "in", id: "u-" + d.id, author: d.name, avatar: di, time: "9:40 AM", text: "Is the rate negotiable? $800 is low for this lane." });
        d.msgs = m; return m;
    }
    function chat() { var n = document.querySelector("#of-main .emp-chat"); return n && n._empChat; }
    function event(d, text, tone) { var c = chat(); var m = { kind: "event", tone: tone || "neutral", text: text, time: nowStamp() }; if (c && state.open === d.id) { c.push(m); c.scrollBottom(); } else if (d.msgs) d.msgs.push(m); }
    function repaintCard() { var c = chat(); if (!c) return; c.msgs.filter(function (m) { return m.kind === "card"; }).forEach(function (m) { c.repaint(m); }); }
    function renderHead() { var d = byId(state.open), h = document.querySelector("#of-main .of-head"); if (d && h && state.tab !== "archive") h.outerHTML = headerHtml(d); }
    function renderMain() {
        var box = $("of-main");
        if (state.tab === "archive") {
            var a = ARCHIVE[state.archiveOpen];
            if (!a) { box.innerHTML = '<div class="lc-placeholder">' + icon("chat-dots", "lc-placeholder__ico") + "<strong>Select an offer</strong></div>"; return; }
            /* Archive is read-only (Figma 6.1): no actions, the composer is closed */
            if (a.driver) { box.innerHTML = headerHtml(a.driver, true) + '<div class="of-chat"></div>'; window.empChat.mount(box.querySelector(".of-chat"), { me: ME, disabled: true, reopen: false, closedText: "Archived offer. Messages can’t be sent.", messages: a.msgs, renderCard: offerCard }); return; }
            box.innerHTML = '<header class="of-head"><div class="of-actions"><span class="of-sum__stop">' + esc(a.pu) + '</span><span class="of-muted">' + esc(a.del) + '</span><span class="of-grow"></span>' + chip(a.result, a.tone) + '</div></header><div class="of-chat"></div>';
            window.empChat.mount(box.querySelector(".of-chat"), { me: ME, disabled: true, reopen: false, closedText: "Archived offer. Messages can’t be sent.", messages: [{ kind: "event", tone: "neutral", text: "Offer sent to " + a.drivers + " drivers by " + ME.name, time: a.date + " 8:30 AM", day: a.date }, { kind: "event", tone: a.tone === "green" ? "success" : "danger", text: a.result + " — offer moved to archive", time: a.date + " 6:00 PM", day: a.date }] });
            return;
        }
        var d = byId(state.open);
        if (state.closed || !d || visible().indexOf(d) < 0) { box.innerHTML = '<div class="lc-placeholder">' + icon("chat-dots", "lc-placeholder__ico") + "<strong>" + (state.closed ? "The offer is in Archive" : "Select a driver") + "</strong><span>" + (state.closed ? "The load was built. Open Archive to see the offer." : "Choose a driver on the left to open the offer chat.") + "</span></div>"; return; }
        var unread = !d.msgs && d.unread ? "u-" + d.id : null, msgs = messages(d);
        d.unread = 0;
        box.innerHTML = headerHtml(d) + '<div class="of-chat"></div>';
        var waiting = d.state === "notstarted";
        var c = window.empChat.mount(box.querySelector(".of-chat"), {
            me: ME, messages: msgs, quick: QUICK, channel: "via App", unreadFrom: unread, renderCard: offerCard,
            disabled: waiting, reopen: false, closedText: "You can write after the driver answers the offer.",
            demo: { name: d.name, avatar: window.empChat.initials(d.name), channel: "via App", replies: ["Got it 👍", "Ok, waiting for your answer.", "I can be there at 2 PM.", "Copy that."] }
        });
        if (waiting) { var st = box.querySelector(".emp-chat__state"); if (st) st.outerHTML = '<div class="emp-chat__state of-wait">' + icon("chat-dots", "of-wait__ico") + '<p class="emp-chat__state-title">Waiting for the driver</p><span>The chat opens when the driver sends his rate and ETA to PU. Bid is valid for 15 min after that.</span></div>'; driverAnswerSoon(d); }
    }
    function render() { renderMain(); renderSide(); }
    /* Demo: a not-started driver answers 10 s after you open his chat — then the chat opens */
    function driverAnswerSoon(d) {
        if (d._answering) return; d._answering = true;
        setTimeout(function () {
            if (d.state !== "notstarted") return;
            d.state = "accepted"; d.rate = d.rate || 1300; d.seen = "read";
            var di = window.empChat.initials(d.name);
            d.msgs = [{ side: "in", author: d.name, avatar: di, time: "Now", channel: "via App", text: "I can take it. ETA to PU 1h 30m, rate $" + d.rate.toLocaleString("en-US") + "." }, { kind: "event", tone: "success", text: d.name + " accepted offer", time: nowStamp() }, { kind: "card", card: "offer", driver: d.id, time: "Now" }];
            if (state.open === d.id && state.tab !== "archive") render(); else { d.unread = 1; renderList(); }
        }, 10000);
    }

    /* ---------- actions ---------- */
    var declineIds = [];
    function openDecline(ids) {
        declineIds = ids; $("of-decline-title").textContent = ids.length > 1 ? "Reject the drivers’ offers (" + ids.length + ")" : "Reject the driver’s offer";
        var def = document.querySelector('input[name="of-reason"][value="The rate was too high"]'); if (def) def.checked = true; $("of-unreliable").checked = false;
        window.empOverlay.open($("of-decline"));
    }
    function decline() {
        var r = document.querySelector('input[name="of-reason"]:checked'), reason = r ? r.value : "Other reason", unrel = $("of-unreliable").checked;
        var undo = declineIds.map(function (id) { var d = byId(id); return { d: d, state: d.state, holdBy: d.holdBy, reason: d.reason, unreliable: d.unreliable, len: d.msgs ? d.msgs.length : 0 }; });
        undo.forEach(function (u) { var d = u.d; d.prevState = d.state; d.state = "rejected"; d.reason = reason; d.checked = false; if (d.holdBy === "You") d.holdBy = null; if (unrel) d.unreliable = true; event(d, "Declined by " + ME.name + ": " + reason + (unrel ? " · marked as unreliable" : ""), "danger"); });
        window.empOverlay.close($("of-decline"));
        render();
        toast("rejected", { name: undo.length > 1 ? undo.length + " drivers" : undo[0].d.name, action: { label: "Undo", run: function () {
            undo.forEach(function (u) { var d = u.d; d.state = u.state; d.holdBy = u.holdBy; d.reason = u.reason; d.unreliable = u.unreliable; if (d.msgs) d.msgs.length = u.len; });
            render();
        } } });
    }
    function buildLoad(d) {
        var snap = JSON.parse(JSON.stringify(d)); snap.state = "booked";
        var msgs = (d.msgs || messages(d)).slice(); msgs.push({ kind: "event", tone: "success", text: "Load #612777 has been built from this offer by " + ME.name, time: nowStamp() }, { kind: "event", tone: "neutral", text: "Load built — offer moved to archive. Other drivers got “Broker covered the load”.", time: nowStamp() });
        snap.id = "arch-" + d.id + "-" + Date.now();
        msgs = msgs.map(function (m) { return m.kind === "card" ? { kind: "card", card: "offer", driver: snap.id, time: m.time, day: m.day } : m; });
        ARCHIVE.unshift({ drivers: DRIVERS.length, pu: "PU1: Dallas, TX 75001 / 11/05 ASAP", del: "DEL3: Atlanta, GA, 30033 / 11/06 10:00", date: "11/05/2026", result: "Load built · " + d.name, tone: "green", driver: snap, msgs: msgs });
        DRIVERS.forEach(function (x) { if (x !== d && x.state !== "rejected") { x.prevState = x.state; x.state = "rejected"; x.reason = "Broker covered the load"; if (x.msgs) x.msgs.push({ kind: "event", tone: "danger", text: "Broker covered the load", time: nowStamp() }); } });
        state.closed = true; state.tab = "archive"; state.archiveOpen = 0;
        toast("created", {}); render();
    }
    document.addEventListener("click", function (e) {
        var a = e.target.closest("[data-of-tab],[data-of-open],[data-of-arch],[data-of-update],[data-of-renew],[data-of-hold],[data-of-release],[data-of-renew-hold],[data-of-book],[data-of-decline],[data-of-decline-save],[data-of-bulk-reject],[data-of-cancel],[data-of-cancel-save],[data-of-add-load],[data-of-add-save],[data-of-build],[data-of-restore],[data-of-new],[data-of-clear],[data-of-noop],[data-of-nt-hold],[data-of-nt-unhold],[data-of-nt-find],[data-of-nt-send],[data-of-mk-stop],[data-of-mk-miles],[data-of-mk-rate],[data-of-mk-send]");
        if (!a || e.target.closest("[data-of-stop]")) return;
        var dd = a.dataset, d = byId(state.open);
        if ("ofNoop" in dd) { e.preventDefault(); return; }
        if (dd.ofTab) { state.tab = dd.ofTab; if (state.tab !== "archive") { var v = visible(); if (!d || v.indexOf(d) < 0) { var bk = v.filter(function (x) { return x.state === "booked"; })[0]; state.open = (bk || v[0] || {}).id || null; } } render(); return; }
        if (dd.ofOpen) { state.open = dd.ofOpen; render(); return; }
        if (dd.ofArch) { state.archiveOpen = +dd.ofArch; render(); return; }
        if ("ofUpdate" in dd) {
            var n = state.newDrivers; if (!n) return;
            for (var i = 0; i < n; i++) { var nn = NEW_NAMES[i % NEW_NAMES.length]; DRIVERS.push(drv("n" + Date.now() + i, nn[0], nn[1], nn[2], "7.12", 10 + i * 1.3, 0, "notstarted", { seen: "sent", loc: "Fort Worth TX, 7610" + i })); }
            state.added = n; state.newDrivers = 0; state.timer = 10 * 60; toast("offerUpdated"); renderSide(); return;
        }
        if ("ofRenew" in dd) { state.timer = 10 * 60; state.added = 0; DRIVERS.forEach(function (x) { if (x.state === "notstarted") x.seen = "sent"; }); toast("sent", { name: "Offer" }); renderSide(); return; }
        if ("ofHold" in dd) { d.state = "hold"; d.holdBy = "You"; d.hold = 15 * 60; event(d, "Hold by " + ME.name); render(); repaintCard(); return; }
        if ("ofRelease" in dd) { d.state = "accepted"; d.holdBy = null; event(d, "Hold released by " + ME.name); render(); repaintCard(); return; }
        if ("ofRenewHold" in dd) { d.hold = 15 * 60; event(d, "Hold renewed by " + ME.name + " · 15:00"); renderHead(); renderList(); repaintCard(); return; }
        if ("ofBook" in dd) { d.state = "booked"; d.holdBy = null; d.bookedAt = nowStamp(); event(d, d.name + " booked for this offer by " + ME.name, "success"); toast("booked", { name: d.name }); render(); repaintCard(); return; }
        if ("ofDecline" in dd) { openDecline([d.id]); return; }
        if ("ofBulkReject" in dd) { openDecline(DRIVERS.filter(function (x) { return x.checked; }).map(function (x) { return x.id; })); return; }
        if ("ofDeclineSave" in dd) { decline(); return; }
        if ("ofCancel" in dd) { $("of-cancel-note").value = ""; var oc = document.querySelector('input[name="of-cancel-reason"][value="Other reason"]'); if (oc) oc.checked = true; syncCancel(); window.empOverlay.open($("of-cancel")); return; }
        if ("ofCancelSave" in dd) {
            var cr = (document.querySelector('input[name="of-cancel-reason"]:checked') || {}).value || "Other reason", note = $("of-cancel-note").value.trim();
            if (cr === "Other reason" && !note) { $("of-cancel-field").classList.add("is-error"); $("of-cancel-error").hidden = false; $("of-cancel-note").focus(); return; }
            d.state = "accepted"; d.bookedAt = null; event(d, "Booking cancelled by " + ME.name + ": " + (cr === "Other reason" ? note : cr), "danger"); window.empOverlay.close($("of-cancel")); toast("bookingCancelled", { name: d.name });
            state.tab = "active"; render(); repaintCard(); return;
        }
        if ("ofAddLoad" in dd) { $("of-add-load").value = ""; $("of-add-amount").value = "$ 450.00"; $("of-add-chat").checked = true; $("of-add-error").hidden = true; $("of-add-load-field").classList.remove("is-error"); window.empOverlay.open($("of-add")); return; }
        if ("ofAddSave" in dd) {
            var pro = $("of-add-load").value.trim(), amt = $("of-add-amount").value.replace(/[^\d.]/g, "");
            if (!pro || !parseFloat(amt)) { $("of-add-error").hidden = false; if (!pro) $("of-add-load-field").classList.add("is-error"); return; }
            event(d, d.name + " has been added to the load " + pro.split(" ")[0] + " by " + ME.name + " · $" + parseFloat(amt).toFixed(2) + ($("of-add-chat").checked ? " · added to the load's chat" : ""), "success");
            window.empOverlay.close($("of-add")); toast("added", { name: d.name + " → " + pro.split(" ")[0] }); return;
        }
        if ("ofBuild" in dd) { buildLoad(d); return; }
        if ("ofRestore" in dd) { d.state = d.prevState && d.prevState !== "rejected" ? d.prevState : "accepted"; if (d.state === "hold") { d.state = "accepted"; } d.reason = ""; event(d, "Driver restored by " + ME.name); render(); return; }
        if ("ofNew" in dd) { paintTrucks(); window.empOverlay.open($("of-new")); return; }
        if ("ofClear" in dd) {
            state.q = ""; $("of-q").value = ""; state.status = "All statuses"; state.sort = "Mi away"; state.range = null;
            $("of-status").value = "All statuses"; $("of-sort").value = "Mi away";
            var dv = document.querySelector("#of-arch-date .emp-date__value"); if (dv) { dv.textContent = "MM/DD/YYYY - MM/DD/YYYY"; dv.classList.add("is-empty"); }
            DRIVERS.forEach(function (x) { x.checked = false; }); renderList(); return;
        }
        /* New offer modal */
        if (dd.ofNtHold) { var hi = +dd.ofNtHold; TRUCK_HOLD[hi] = true; paintTrucks(); return; }
        if (dd.ofNtUnhold) { TRUCK_HOLD[+dd.ofNtUnhold] = false; paintTrucks(); return; }
        if ("ofNtFind" in dd) { paintTrucks(); toast("updated"); return; }
        if ("ofNtSend" in dd) { if (!pickedTrucks().length) return; window.empOverlay.close($("of-new")); resetMake(); setTimeout(function () { window.empOverlay.open($("of-make")); }, 50); return; }
        /* Make offer modal */
        if (dd.ofMkStop) { addStop(dd.ofMkStop); return; }
        if ("ofMkMiles" in dd) { $("of-mk-miles").value = "891"; return; }
        if ("ofMkRate" in dd) { $("of-mk-rate").value = "$ 1,050"; return; }
        if ("ofMkSend" in dd) {
            var req = Array.prototype.slice.call(document.querySelectorAll("#of-make [data-of-mk-req]")), miss = req.filter(function (x) { return !x.value.trim(); });
            req.forEach(function (x) { x.closest(".emp-field").classList.toggle("is-error", !x.value.trim()); });
            $("of-mk-error").hidden = !miss.length; if (miss.length) { miss[0].focus(); return; }
            window.empOverlay.close($("of-make")); toast("offerCreated"); return;
        }
    });
    function syncCancel() { var other = ((document.querySelector('input[name="of-cancel-reason"]:checked') || {}).value || "") === "Other reason"; $("of-cancel-field").hidden = !other; $("of-cancel-field").classList.remove("is-error"); $("of-cancel-error").hidden = true; }
    /* New offer: trucks, holds and selection */
    var TRUCK_HOLD = { 2: true };
    function pickedTrucks() { return Array.prototype.filter.call(document.querySelectorAll("[data-of-nt-pick]"), function (x) { return x.checked; }); }
    function paintTrucks() {
        document.querySelectorAll("[data-of-nt-row]").forEach(function (row) {
            var i = +row.getAttribute("data-of-nt-row"), cell = row.querySelector(".of-nt__hold"), txt = row.querySelector("[data-of-nt-holdtext]"), fired = i === 4;
            if (TRUCK_HOLD[i]) { txt.textContent = "Hold " + (i === 2 ? "14" : "15") + " min by Andrew Jameson"; cell.innerHTML = btn("Renew hold", "secondary", 'data-of-nt-hold="' + i + '"') + btn("Delete hold", "alarm", 'data-of-nt-unhold="' + i + '"'); }
            else { txt.textContent = ""; cell.innerHTML = btn("Put on hold", "secondary", 'data-of-nt-hold="' + i + '"', fired); }
        });
        var n = pickedTrucks().length, all = $("of-nt-all"), boxes = document.querySelectorAll("[data-of-nt-pick]");
        $("of-nt-count").textContent = "Showing 1-" + boxes.length + " of 9 trucks · Selected: " + n;
        all.checked = n === boxes.length; all.indeterminate = n > 0 && n < boxes.length;
        document.querySelector("[data-of-nt-send]").disabled = !n;
    }
    function resetMake() {
        document.querySelectorAll("#of-make .of-stop--extra").forEach(function (x) { x.remove(); });
        document.querySelectorAll("#of-make input:not([type=checkbox]), #of-make textarea").forEach(function (x) { if (x.id !== "of-mk-weight") x.value = ""; });
        document.querySelectorAll("#of-make .emp-field.is-error").forEach(function (x) { x.classList.remove("is-error"); });
        $("of-mk-error").hidden = true; syncMake();
    }
    function addStop(kind) {
        var box = $(kind === "pu" ? "of-mk-pu" : "of-mk-del"), n = box.children.length + 1, lab = (kind === "pu" ? "PU" : "DEL") + n;
        var div = document.createElement("div"); div.className = "of-stop of-stop--extra";
        div.innerHTML = '<div class="emp-field emp-field--sm"><div class="emp-field__title"><span class="emp-field__label">' + lab + '</span><button class="emp-btn emp-btn--link emp-btn--md of-stop__x" type="button" data-of-mk-x><span class="emp-btn__label">Delete</span></button></div><div class="emp-input"><input class="emp-input__control" type="text" placeholder="City, State, ZIP" aria-label="' + lab + '"></div></div><div class="emp-field emp-field--sm"><div class="emp-field__title"><span class="emp-field__label">Date/Time</span></div><div class="emp-input"><input class="emp-input__control" type="text" placeholder="Enter date/time (any text)" aria-label="' + lab + ' date and time"></div></div>';
        box.appendChild(div); div.querySelector("input").focus();
    }
    document.addEventListener("click", function (e) { var x = e.target.closest("[data-of-mk-x]"); if (x) x.closest(".of-stop").remove(); });
    function syncMake() { var ok = Array.prototype.every.call(document.querySelectorAll("#of-make [data-of-mk-req]"), function (x) { return x.value.trim(); }); document.querySelector("[data-of-mk-miles]").disabled = !ok; document.querySelector("[data-of-mk-rate]").disabled = !ok; }
    document.addEventListener("change", function (e) {
        var t = e.target;
        if (t.matches("[data-of-check]")) { byId(t.getAttribute("data-of-check")).checked = t.checked; renderList(); }
        if (t.id === "of-all") { var on = t.checked; visible().forEach(function (d) { if (selectable(d)) d.checked = on; }); renderList(); }
        if (t.id === "of-sort") { state.sort = t.value; renderList(); }
        if (t.id === "of-status") { state.status = t.value; renderList(); }
        if (t.name === "of-cancel-reason") syncCancel();
        if (t.matches("[data-of-nt-pick]")) paintTrucks();
        if (t.id === "of-nt-all") { document.querySelectorAll("[data-of-nt-pick]").forEach(function (x) { x.checked = t.checked; }); paintTrucks(); }
    });
    document.addEventListener("input", function (e) {
        if (e.target.id === "of-q") { state.q = e.target.value; renderList(); }
        if (e.target.id === "of-cancel-note") { $("of-cancel-field").classList.remove("is-error"); $("of-cancel-error").hidden = true; }
        if (e.target.matches && e.target.matches("[data-of-mk-req]")) { e.target.closest(".emp-field").classList.remove("is-error"); syncMake(); }
        if (e.target.id === "of-add-amount") $("of-add-exp").textContent = e.target.value || "$ 0.00";
        if (e.target.id === "of-add-load") { $("of-add-load-field").classList.remove("is-error"); $("of-add-error").hidden = true; }
    });
    document.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target.matches && e.target.matches("[data-of-open],[data-of-arch]")) { e.preventDefault(); e.target.click(); } });
    /* Archive date range: filter when the range field gets a value */
    function watchRange() {
        var v = document.querySelector("#of-arch-date .emp-date__value"); if (!v) return;
        new MutationObserver(function () {
            var m = v.textContent.match(/(\d\d\/\d\d\/\d{4})\s*-\s*(\d\d\/\d\d\/\d{4})/);
            state.range = m ? [new Date(m[1]).getTime(), new Date(m[2]).getTime() + 86399999] : null;
            if (state.tab === "archive") renderList();
        }).observe(v, { childList: true, characterData: true, subtree: true });
    }

    /* Timers tick in place every second: offer timer, bid time and hold time. Nothing is re-rendered unless a state changes,
       so focus and hover in the list stay put. Demo — new drivers show up after 15 s. */
    var tick = 0;
    setInterval(function () {
        tick++;
        if (state.timer > 0) state.timer--;
        if (state.bid > 0) state.bid--;
        var expired = [];
        DRIVERS.forEach(function (d) { if (d.state === "hold" && d.hold > 0) { d.hold--; if (!d.hold) { d.state = "holdover"; d.holdBy = null; expired.push(d); } } });
        if (tick === 15 && !state.added) state.newDrivers = 3;
        expired.forEach(function (d) { event(d, "Hold time is over", "danger"); });
        if (state.tab === "archive" || state.closed) return;
        var key = [state.newDrivers, state.added, state.timer > 0, state.tab === "booked", DRIVERS.length].join("|");
        if (key !== summaryKey) renderSummary();
        else { var tn = document.querySelector("[data-of-timer]"); if (tn) { tn.textContent = mmss(state.timer); tn.parentNode.classList.toggle("is-red", state.timer > 0 && state.timer < RED); } }
        if (expired.length) { renderList(); if (expired.indexOf(byId(state.open)) >= 0) { renderHead(); repaintCard(); } }
        else DRIVERS.forEach(function (d) { if (d.state === "hold" && d.holdBy === "You") { var c = document.querySelector('[data-of-chip="' + d.id + '"]'); if (c) c.innerHTML = stateChip(d); } });
        var d = byId(state.open), h = document.querySelector("#of-main .of-head__timers");
        if (d && h) h.innerHTML = timersHtml(d);
        var left = document.querySelector("#of-main .of-actions > .emp-chip"); if (d && left && d.state === "hold") left.outerHTML = chip("On hold by You", holdColor(d));
        if (d && d.state === "hold") { var card = document.querySelector('#of-main [data-of-card="' + d.id + '"] .emp-chip'); if (card) card.outerHTML = chip("On hold by You · " + mmss(d.hold), holdColor(d)); }
    }, 1000);

    function init() {
        if (window.empChat.injectSprite) window.empChat.injectSprite();
        if ((location.hash || "") === "#archive") state.tab = "archive";
        render(); watchRange(); paintTrucks();
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
