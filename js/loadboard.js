/* Load Board (Figma CRM 3.0 · Load board). Data, rendering and screen logic only.
   Renders before empire.js so its widgets (options, dates, uploads) bind to the generated filters. */
(function () {
    var root = document.getElementById("lb");
    if (!root) return;

    function ico(name, cls) { return '<svg class="' + (cls || "lb-ico") + '" viewBox="0 0 16 16" aria-hidden="true"><use href="#lb-' + name + '"></use></svg>'; }
    function lc(s) { return String(s || "").toLowerCase(); }

    /* ---------- data ---------- */
    var STOPS = [
        ["Fletcher, North Carolina", "09/27 07:48", "09/27 09:48"],
        ["Miami, FL 33133", "09/28 06:16", "09/28 07:20"],
        ["Dallas, TX 75247", "09/28 13:35", "09/28 14:35"],
        ["Chicago, IL 60632", "09/29 05:00", "09/29 10:00"],
        ["Atlanta, GA 30033", "09/29 08:10", "09/29 09:00"],
        ["Querétaro, QU 56000", "09/30 13:35", "09/30 17:50"]
    ];
    function stop(i) { var s = STOPS[i % STOPS.length]; return { city: s[0], d1: s[1], d2: s[2], wt: "Wt 16 · Plt 55" }; }
    var DRIVERS = [
        { name: "John Luis", dot: "green", os: "apple", owner: "Minahoshi INC", pay: "$6.04", eta: true },
        { name: "Mutaki Kawanibu", dot: "red", os: "apple", owner: "Minahoshi INC", pay: "$6.04" },
        { name: "Aratus Grumbleforged", dot: "red", os: "apple", owner: "Clear Corporate3 INC", pay: "$6.04" },
        { name: "Lesley Shaw", dot: "green", os: "android", owner: "Clear Corporate INC", pay: "$5.80", eta: true }
    ];
    function load(i, o) {
        var l = {
            id: "L" + i,
            office: ["UA2 | DNa", "UA1 | JSn", "UA3 | MKo"][i % 3],
            pro: String(123456 + i * 7),
            truck: String(1258 + i * 11),
            auto: false,
            drivers: [DRIVERS[i % 2 ? 3 : 0]],
            broker: { name: ["UA2ITDi 39 OY", "BrokerX 001 OTR", "Modex Systems Inc", "TQL Logistics"][i % 4], flag: false, contact: "gerrgerg", watcher: "Ryan King", miles: (902 - (i % 8) * 37) + " mi · $6.04" },
            origin: stop(i), dest: stop(i + 2),
            rate: "$" + (1000 + i * 125).toLocaleString("en-US") + ".04",
            cc: { status: "Pick Check In", box: null },
            chat: [14, 3, 0, 7, 1, 0, 2, 5][i % 8],
            warn: i % 3 !== 2,
            note: null, attention: false, mine: i % 2 === 0
        };
        Object.keys(o || {}).forEach(function (k) { l[k] = o[k]; });
        return l;
    }
    var BOX_SYS = { tone: "note", title: "System Check-call", text: "Driver shared the location via the app. ETA to the receiver 1h 20m." };
    var BOX_ALERT = function (t) { return { tone: "error", title: "Alert", text: t }; };

    var DATA = {
        enroute: [
            load(0),
            load(1, { note: "777777888 Test555" }),
            load(2, { auto: true, truck: "7777778", drivers: [DRIVERS[0], DRIVERS[1], DRIVERS[2]], broker: { name: "BrokerX 001 OTR", flag: true, contact: "gerrgerg", watcher: "Ryan King", miles: "902 mi · $6.04" }, cc: { status: "CCP Ready", box: BOX_SYS } }),
            load(3, { attention: true, cc: { status: "Will PU", box: BOX_ALERT("Load moved from Delivered to En Route with the comment: MAX CHAT TEST") } }),
            load(4), load(5, { cc: { status: "Pick Check Out", box: null } }), load(6, { cc: { status: "On Transit", box: null } }), load(7)
        ],
        delivered: [0, 1, 2, 3, 4, 5].map(function (i) { return load(i + 10, { cc: { status: "Delivered", box: i === 1 ? { tone: "info", title: "Check-call", text: "POD received, waiting for review" } : null }, otr: i % 2 === 0 }); }),
        issue: [0, 1, 2, 3, 4].map(function (i) { return load(i + 20, { cc: { status: "Incident Report", box: BOX_ALERT(["Driver reported damaged pallets at the receiver.", "Receiver refused two pallets.", "Truck accident on I-40, driver is safe."][i % 3]) }, claim: ["Shortage", "Load damaged", "Accidents", "Shortage", "Stolen truck"][i], lost: "$" + (450 + i * 50) + ".00" }); }),
        invoiced: [0, 1, 2, 3, 4, 5].map(function (i) { var c = i === 1 || i === 4; return load(i + 30, { type: c ? "Claimed" : "Invoiced", paidAmt: c ? "$50.00" : "", cc: { status: "Delivered", box: c ? BOX_ALERT("Load marked as TONU") : null }, days: String(483 - i * 12) }); }),
        claims: [0, 1, 2].map(function (i) { return load(i + 40, { type: "Claimed", paidAmt: ["$50.00", "", "$33.00"][i], cc: { status: "Delivered", box: BOX_ALERT(["Load marked as TONU", "Broker short-paid the invoice", "Damaged freight"][i]) }, days: String(120 + i * 30) }); }),
        paid: [],
        accounting: [0, 1, 2, 3, 4, 5, 6, 7].map(function (i) {
            var cat = ["Carrier pay", "Rate", "Driver", "Broker", "Carrier pay", "Rate", "Driver", "Carrier pay"][i];
            return { id: "A" + i, pro: String(123456 + i * 3), trucks: ["125845", "3433"], date: "09/" + (20 + i) + "/2024 16:18", user: ["John Luis", "Anna Horda", "Nicole Medina"][i % 3], category: cat,
                before: cat + ": " + ["0.11 $", "$950.00", "Mutaki K.", "TQL"][i % 4], after: cat + ": " + ["0.05 $", "$1,000.04", "John Luis", "BrokerX"][i % 4], reason: ["Load marked as TONU", "Rate confirmed by broker", "Driver replaced", "Broker changed"][i % 4], ar: i % 3 === 0 ? "No" : "Yes", pr: i % 2 ? "No" : "Yes", processed: false };
        }),
        archive: [0, 1, 2].map(function (i) { return { id: "R" + i, pro: String(120400 + i * 5), trucks: ["125845", "3433"], date: "09/1" + i + "/2024 10:02", user: "Anna Horda", category: "Carrier pay", before: "Carrier pay: 0.11 $", after: "Carrier pay: 0.07 $", reason: "Load marked as TONU", ar: "Yes", pr: "Yes", by: "Nicole Medina", at: "09/1" + (i + 2) + "/2024 18:40" }; })
    };
    DATA.paid = [0, 1, 2].map(function (i) { return load(i + 50, { type: "Invoiced", paidAmt: "$" + (1000 + i * 125) + ".04", cc: { status: "Delivered", box: null }, days: String(30 + i * 4) }); });

    var TABS = [
        { id: "enroute", label: "Loads en Route", count: 110 },
        { id: "delivered", label: "Loads Delivered", count: 369 },
        { id: "issue", label: "Loads Issue", count: 30 },
        { id: "invoiced", label: "Loads Invoiced", count: 32 },
        { id: "claims", label: "Accounting claims", count: 9 },
        { id: "paid", label: "Loads Paid", count: 3 },
        { id: "accounting", label: "Accounting Page", count: 2219 }
    ];

    /* Columns: [label, width, filter] — filter: text key | {sel: key, opts} | {date: key} | "check" | null (header only) */
    var CC_OPTS = "All statuses|Driver Dispatched|Will PU|Pick Check In|Pick Check Out|Incident Report|CCP Ready|On Transit|Delivered";
    var C = {
        type: ["Type", "96fr", { sel: "type", opts: "All|Invoiced|Claimed" }],
        pro: ["Pro", "112fr", { text: "pro", ph: "Pro #" }],
        truck: ["Truck", "96fr", { text: "truck", ph: "Trk / 1" }],
        driver: ["Driver/Carrier", "240fr", { text: "driver", ph: "Driver / Ref#" }],
        broker: ["Customer/Broker", "216fr", { text: "broker", ph: "Customer / Ref#" }],
        origin: ["Origin", "264fr", { text: "origin", ph: "City / State / Day" }],
        dest: ["Destination", "264fr", { text: "dest", ph: "City / State / Day" }],
        rate: ["Rate", "104fr", null],
        brate: ["BRate", "104fr", null],
        paidAmt: ["Amount paid", "96fr", null],
        cc: ["Check Call", "300fr", { sel: "cc", opts: CC_OPTS }],
        otr: ["OTR", "72fr", null],
        claim: ["Possible claim", "150fr", { sel: "claim", opts: "All issues|Load damaged|Stolen truck|Shortage|Accidents" }],
        lost: ["Lost $", "110fr", null],
        days: ["Days", "56fr", null],
        move: ["Move to Paid", "96fr", "check"],
        actions: ["Actions", "108fr", null],
        actions2: ["Actions", "80fr", null],
        menu: ["", "40px", null]
    };
    var LAYOUT = {
        enroute: [["pro"], ["truck"], ["driver"], ["broker"], ["origin"], ["dest"], ["rate"], ["cc", "340fr"], ["actions"], ["menu"]],
        delivered: [["pro"], ["truck"], ["driver"], ["broker"], ["origin"], ["dest"], ["rate"], ["cc"], ["otr"], ["actions"], ["menu"]],
        issue: [["pro"], ["truck"], ["driver", "210fr"], ["broker", "190fr"], ["origin", "240fr"], ["dest", "240fr"], ["rate"], ["cc", "228fr"], ["claim"], ["lost"], ["actions"], ["menu"]],
        invoiced: [["type"], ["pro"], ["truck"], ["driver", "190fr"], ["broker", "180fr"], ["origin", "240fr"], ["dest", "240fr"], ["brate"], ["paidAmt"], ["cc", "182fr"], ["days"], ["move"], ["actions2"], ["menu"]],
        claims: [["type"], ["pro"], ["truck"], ["driver", "190fr"], ["broker", "180fr"], ["origin", "240fr"], ["dest", "240fr"], ["brate"], ["paidAmt"], ["cc", "230fr"], ["days"], ["actions2"], ["menu"]],
        paid: [["type"], ["pro"], ["truck"], ["driver", "190fr"], ["broker", "180fr"], ["origin", "240fr"], ["dest", "240fr"], ["brate"], ["paidAmt"], ["cc", "230fr"], ["days"], ["actions2"], ["menu"]]
    };
    var LOG = {
        accounting: [["Pro", "112fr", { text: "pro", ph: "Pro #" }], ["Trucks", "112fr", { text: "truck", ph: "Trk / 1" }], ["Date changed", "150fr", { date: true }], ["User", "150fr", { sel: "user", opts: "All users|John Luis|Anna Horda|Nicole Medina" }], ["Category", "170fr", { sel: "category", opts: "All categories|Carrier pay|Rate|Driver|Broker" }], ["Before changes", "210fr", null], ["Changed", "210fr", null], ["Reason for change", "300fr", { text: "reason", ph: "Search reason" }], ["AR", "64fr", null], ["PR", "64fr", null], ["Mail", "72fr", null], ["Processed", "104fr", "check"]],
        archive: [["Pro", "112fr", { text: "pro", ph: "Pro #" }], ["Trucks", "112fr", { text: "truck", ph: "Trk / 1" }], ["Date changed", "150fr", { date: true }], ["User", "150fr", { sel: "user", opts: "All users|John Luis|Anna Horda|Nicole Medina" }], ["Category", "170fr", { sel: "category", opts: "All categories|Carrier pay|Rate|Driver|Broker" }], ["Before changes", "210fr", null], ["Changed", "210fr", null], ["Reason for change", "260fr", { text: "reason", ph: "Search reason" }], ["AR", "64fr", null], ["PR", "64fr", null], ["User who marked", "150fr", { sel: "by", opts: "All users|Nicole Medina|Arthur Treutel" }], ["Date", "130fr", { date: true }], ["Return", "88fr", null]]
    };

    function M(icon, label, target, tone) { return { icon: icon, label: label, target: target, tone: tone }; }
    var MENU_FULL = [
        M("edit-load.svg", "Edit Load", "ld-load"), M("edit-dispatch.svg", "Edit Dispatch", "ld-load"), M("check-call.svg", "Check Call", "ld-check"), M("split.svg", "Split the Load", "ld-split"), M("documents.svg", "Documents", "preview"),
        M("rating.svg", "Add rating to driver", "lb-rating"), M("confirmation.svg", "Get load confirmation", "lb-confirm"), M("bol.svg", "Get BOL", "lb-bol"), M("dispatch-message.svg", "Dispatch message", "lb-dispatch"), M("note.svg", "Add note", "lb-note-add"),
        M("delivered.svg", "Mark as delivered", "lb-delivered", "green"), M("link.svg", "Link for broker", "lb-brokerlink"), M("change-profit.svg", "Manage profit", "ld-profit"), M("ap-ar.svg", "AP / AR", "ld-apar"),
        M("suspicious.svg", "Suspicious activity", "lb-suspicious"), M("tonu.svg", "TONU", "lb-tonu"), M("claim.svg", "Possible claim", "lb-claim"), M("delete.svg", "Canceled load", "lb-cancel", "red"), M("release.svg", "Release the driver", "lb-release", "red")
    ];
    var MENUS = {
        enroute: MENU_FULL,
        delivered: [MENU_FULL[0], MENU_FULL[2], MENU_FULL[4], M("back.svg", "Bounce to en Route", "lb-bounce"), M("confirmation.svg", "Mark as invoiced", "lb-invoiced"), MENU_FULL[9], MENU_FULL[16], MENU_FULL[13]],
        issue: [MENU_FULL[0], MENU_FULL[4], MENU_FULL[16], MENU_FULL[9], M("back.svg", "Bounce to en Route", "lb-bounce"), MENU_FULL[15]],
        invoiced: [MENU_FULL[0], MENU_FULL[4], M("confirmation.svg", "Mark as Paid", "lb-paid"), M("claim.svg", "Accounting claim", "lb-acc-create"), MENU_FULL[9]],
        claims: [M("view.svg", "View claim", "lb-acc-view"), M("edit.svg", "Update claim", "lb-acc-create"), M("back.svg", "Back to in progress", "lb-back"), MENU_FULL[4]],
        paid: [M("view.svg", "View load", "ld-load"), MENU_FULL[4], M("confirmation.svg", "Owners payout", "lb-paid-owners")]
    };

    /* ---------- cells ---------- */
    function cell(html, cls) { return '<div class="emp-table__cell' + (cls ? " " + cls : "") + '">' + html + "</div>"; }
    function open(target, html, cls) { return '<button class="lb-plain' + (cls ? " " + cls : "") + '" type="button" data-lb-open="' + target + '">' + html + "</button>"; }

    function proCell(l) {
        return cell('<span class="lb-office">' + open("lb-office", l.office) + '</span><span class="lb-line">' + open("lb-users", l.pro, "emp-table__link") +
            open("lb-brokerlink", ico("link45"), "lb-icobtn") + open("lb-brokerlink", ico("link"), "lb-icobtn") + "</span>" + (l.auto ? '<span class="lb-line lb-auto">' + ico("send") + "Auto</span>" : ""), "lb-pro");
    }
    function truckCell(l) { return cell(open("lb-truck", l.truck, "lb-truck") + '<span class="lb-line">' + open("lb-location", ico("pin"), "lb-icobtn") + open("preview", ico("box"), "lb-icobtn lb-orange") + "</span>"); }
    function driverCell(l) {
        return cell(l.drivers.map(function (d, i) {
            return '<div class="lb-driver"><span class="lb-line"><span class="lb-dot lb-dot--' + d.dot + '"></span>' + open(i ? "lb-related" : "lb-driver", d.name, "emp-table__link") + ico(d.os, "lb-ico lb-os lb-os--" + d.os) + "</span>" +
                open("lb-owner", d.owner, "emp-table__muted") + (i === 0 ? '<span class="lb-line emp-table__muted">' + d.pay + (d.eta ? ' <button class="emp-chip emp-chip--outline emp-chip--sm" type="button" data-lb-open="lb-eta">Send ETA</button>' : "") + "</span>" : "") + "</div>";
        }).join(""), "lb-drivers");
    }
    function brokerCell(l) {
        var b = l.broker;
        return cell('<span class="lb-between"><span class="lb-line">' + open("lb-broker", b.name, "emp-table__link") + (b.flag ? ico("flag", "lb-ico lb-red") : "") + '</span><span class="lb-green lb-small">Original</span></span><span class="emp-table__muted">' + b.contact + '</span><span class="emp-table__muted">Watcher: ' + b.watcher + '</span><span class="emp-table__muted">' + b.miles + "</span>", "lb-broker");
    }
    function stopCell(s, kind) {
        return cell('<span class="lb-between lb-top">' + open("lb-warehouse", s.city, "lb-city lb-city--" + kind) + '<span class="lb-dates"><span>' + s.d1 + "</span><span>" + s.d2 + '</span></span></span><strong class="lb-wt">' + s.wt + "</strong>", "lb-stop");
    }
    function ccCell(l) {
        var box = "";
        if (l.cc.box) {
            var icon = { note: "i-info-circle", error: "i-error-fill", info: "i-info-circle-fill" }[l.cc.box.tone];
            box = '<div class="emp-info emp-info--' + l.cc.box.tone + ' emp-info--frame lb-ccbox"><div class="emp-info__head"><svg class="emp-info__icon" viewBox="0 0 16 16" aria-hidden="true"><use href="#' + icon + '"></use></svg><strong>' + l.cc.box.title + "</strong></div><p>" + l.cc.box.text + "</p></div>";
        }
        return cell('<span class="emp-chip emp-chip--outline emp-chip--green lb-ccchip">' + l.cc.status + "</span>" + '<span class="lb-line lb-loc">' + ico("pin") + open("lb-location", "Maplewood Avenue 12B, Crestview", "emp-table__link") + "</span>" + box, "lb-cc");
    }
    function actionsCell(l, compact) {
        if (compact) return cell(open("lb-acc-create", ico("pencil"), "lb-icobtn") + open("lb-acc-view", ico("eye"), "lb-icobtn"), "lb-acts");
        return cell('<a class="lb-icobtn lb-chat" href="loadchats.html#' + l.pro + '" aria-label="Load chat">' + ico("chat") + (l.chat ? '<span class="emp-tab__count">' + l.chat + "</span>" : "") + "</a>" +
            (l.warn ? open("lb-suspicious", ico("warn"), "lb-icobtn lb-red") : "") + open("lb-history", ico("eye"), "lb-icobtn"), "lb-acts");
    }
    function menuHtml(tab) {
        return '<div class="emp-amenu"><button class="emp-amenu__hit" type="button" aria-label="Actions" aria-expanded="false"><span class="emp-amenu__dots"></span></button><span class="emp-amenu__list">' +
            MENUS[tab].map(function (m) { return '<button class="emp-amenu__item' + (m.tone ? " emp-amenu__item--" + m.tone : "") + '" type="button" data-lb-open="' + m.target + '"><img src="icons/action-menu/' + m.icon + '" alt="" width="16" height="16">' + m.label + "</button>"; }).join("") + "</span></div>";
    }
    function check(attr, on) { return '<label class="emp-check"><input class="emp-check__input" type="checkbox" ' + attr + (on ? " checked" : "") + '><span class="emp-check__box"><svg class="emp-check__mark" viewBox="0 0 20 20" aria-hidden="true"><use href="#i-check"></use></svg><span class="emp-check__minus"></span></span></label>'; }

    function loadRow(tab, l) {
        var html = LAYOUT[tab].map(function (c) {
            switch (c[0]) {
                case "type": return cell('<span class="lb-type lb-type--' + lc(l.type) + '">' + l.type + "</span>");
                case "pro": return proCell(l);
                case "truck": return truckCell(l);
                case "driver": return driverCell(l);
                case "broker": return brokerCell(l);
                case "origin": return stopCell(l.origin, "origin");
                case "dest": return stopCell(l.dest, "dest");
                case "rate": case "brate": return cell('<strong class="lb-rate">' + l.rate + "</strong>");
                case "paidAmt": return cell(l.paidAmt ? '<strong class="lb-green">' + l.paidAmt + '</strong><span class="lb-green lb-small">Paid</span>' : '<span class="emp-table__muted">—</span>');
                case "cc": return ccCell(l);
                case "otr": return cell(check("data-lb-otr", l.otr), "emp-table__cell--center");
                case "claim": return cell('<button class="emp-chip emp-chip--outline emp-chip--orange" type="button" data-lb-open="lb-claim">' + ico("excl") + l.claim + "</button>");
                case "lost": return cell('<span class="lb-line"><strong>' + l.lost + "</strong>" + open("lb-claim", ico("pencil"), "lb-icobtn") + '<button class="lb-plain lb-icobtn lb-red" type="button" data-lb-lost-clear aria-label="Delete">' + ico("trash") + "</button></span>");
                case "days": return cell('<span class="emp-table__muted">' + l.days + "</span>", "emp-table__cell--center");
                case "move": return cell(l.type === "Invoiced" ? check("data-lb-move") : "", "emp-table__cell--center");
                case "actions": return actionsCell(l, false);
                case "actions2": return actionsCell(l, true);
                case "menu": return menuHtml(tab);
            }
            return cell("");
        }).join("");
        if (l.note) html += '<button class="lb-note" type="button" data-lb-open="lb-notes">' + l.note + "</button>";
        var f = [l.pro, l.truck, l.drivers.map(function (d) { return d.name + " " + d.owner; }).join(" "), l.broker.name + " " + l.broker.contact, l.origin.city, l.dest.city];
        return '<div class="emp-table__row lb-row' + (l.attention ? " lb-row--attention" : "") + '" role="row" data-id="' + l.id + '" data-mine="' + (l.mine ? 1 : 0) + '" data-office="' + l.office.split(" ")[0] + '"' +
            ' data-f-pro="' + lc(f[0]) + '" data-f-truck="' + lc(f[1]) + '" data-f-driver="' + lc(f[2]) + '" data-f-broker="' + lc(f[3]) + '" data-f-origin="' + lc(f[4]) + '" data-f-dest="' + lc(f[5]) + '" data-f-cc="' + lc(l.cc.status) + '" data-f-type="' + lc(l.type) + '" data-f-claim="' + lc(l.claim) + '">' + html + "</div>";
    }
    function logRow(tab, r) {
        var cells = [
            cell(open("lb-history", r.pro, "emp-table__link")), cell("<span>" + r.trucks[0] + "</span><span>" + r.trucks[1] + "</span>"), cell(r.date), cell(r.user), cell(r.category),
            cell('<span class="lb-red">' + r.before + "</span>"), cell('<span class="lb-green">' + r.after + "</span>"), cell('<span class="emp-table__muted">' + r.reason + "</span>", "emp-table__wrap"),
            cell('<span class="' + (r.ar === "Yes" ? "lb-green" : "lb-red") + '">' + r.ar + "</span>", "emp-table__cell--center"), cell('<span class="' + (r.pr === "Yes" ? "lb-green" : "lb-red") + '">' + r.pr + "</span>", "emp-table__cell--center")
        ];
        if (tab === "accounting") {
            cells.push(cell('<button class="lb-plain lb-icobtn" type="button" data-lb-mail aria-label="Notify by email">' + ico("mail") + "</button>", "emp-table__cell--center"));
            cells.push(cell(check("data-lb-processed", r.processed), "emp-table__cell--center"));
        } else {
            cells.push(cell(r.by), cell(r.at), cell('<button class="lb-plain lb-icobtn" type="button" data-lb-return aria-label="Return to Accounting Page">' + ico("undo") + "</button>", "emp-table__cell--center"));
        }
        return '<div class="emp-table__row lb-row lb-logrow" role="row" data-id="' + r.id + '" data-mine="1" data-office="all" data-f-pro="' + lc(r.pro) + '" data-f-truck="' + lc(r.trucks.join(" ")) + '" data-f-user="' + lc(r.user) + '" data-f-category="' + lc(r.category) + '" data-f-reason="' + lc(r.reason) + '" data-f-by="' + lc(r.by) + '">' + cells.join("") + "</div>";
    }

    /* ---------- filters ---------- */
    function filterField(def) {
        var label = def[0], f = def[2];
        if (!label) return "<span></span>";
        if (f === "check") return '<div class="lb-fhead lb-fhead--check"><span class="emp-field__label">' + label + "</span>" + check("data-lb-all") + "</div>";
        if (!f) return '<div class="lb-fhead"><span class="emp-field__label">' + label + "</span></div>";
        if (f.date) return '<div class="emp-date emp-date--sm" data-emp-date="single"><span class="emp-date__label">' + label + '</span><button class="emp-date__field" type="button"><svg class="emp-date__icon" viewBox="0 0 18 18" aria-hidden="true"><use href="#i-calendar-fill"></use></svg><span class="emp-date__value is-empty">MM/DD/YYYY</span></button><div class="emp-date__panel"></div></div>';
        if (f.sel) return '<div class="emp-field emp-field--sm"><div class="emp-field__title"><span class="emp-field__label">' + label + '</span></div><div class="emp-input"><input class="emp-input__control" type="text" value="' + f.opts.split("|")[0] + '" readonly data-emp-options="' + f.opts + '" data-lb-f="' + f.sel + '" data-lb-any="' + f.opts.split("|")[0] + '"><svg class="emp-input__chevron" viewBox="0 0 20 20" aria-hidden="true"><use href="#i-input-chevron"></use></svg></div></div>';
        return '<div class="emp-field emp-field--sm"><div class="emp-field__title"><span class="emp-field__label">' + label + '</span></div><div class="emp-input"><input class="emp-input__control" type="text" placeholder="' + f.ph + '" data-lb-f="' + f.text + '"></div></div>';
    }
    function defs(tab) { return LOG[tab] || LAYOUT[tab].map(function (c) { var d = C[c[0]]; return [d[0], c[1] || d[1], d[2]]; }); }

    /* ---------- panels ---------- */
    var panels = document.getElementById("lb-panels");
    var tabsNode = document.getElementById("lb-tabs");
    tabsNode.innerHTML = TABS.map(function (t, i) { return '<button class="emp-tab' + (i ? "" : " is-active") + '" type="button" role="tab" aria-selected="' + (i ? "false" : "true") + '" data-lb-tab="' + t.id + '">' + t.label + '<span class="emp-tab__count" data-lb-count="' + t.id + '">' + t.count + "</span></button>"; }).join("");
    var ALL = ["enroute", "delivered", "issue", "invoiced", "claims", "paid", "accounting", "archive"];
    panels.innerHTML = ALL.map(function (tab) {
        var d = defs(tab);
        var cols = d.map(function (x) { return /px$/.test(x[1]) ? x[1] : "minmax(0, " + x[1] + ")"; }).join(" ");
        var bulk = tab === "invoiced" ? '<div class="lb-bulk" data-lb-bulk hidden><span><strong data-lb-bulk-count>0</strong> loads selected</span><button class="emp-btn emp-btn--outline emp-btn--md" type="button" data-lb-bulk-clear><span class="emp-btn__label">Clear selection</span></button><button class="emp-btn emp-btn--primary emp-btn--md" type="button" data-lb-open="lb-paid"><span class="emp-btn__label">Move to Paid</span></button></div>' : "";
        return '<section class="emp-table lb-table" data-lb-panel="' + tab + '"' + (tab === "enroute" ? "" : " hidden") + ' style="--emp-cols: ' + cols + '">' +
            '<div class="emp-table__filters" role="search">' + d.map(filterField).join("") + "</div>" +
            '<div class="emp-table__rows" data-lb-rows="' + tab + '"></div><div class="lb-empty lb-empty--table" data-lb-empty hidden>' + ico("box", "lb-empty__icon") + "<strong>No loads on this tab yet</strong></div>" + bulk + "</section>";
    }).join("");

    function paint(tab) {
        var box = panels.querySelector('[data-lb-rows="' + tab + '"]');
        box.innerHTML = DATA[tab].map(function (x) { return LOG[tab] ? logRow(tab, x) : loadRow(tab, x); }).join("");
        apply(tab);
    }

    var current = "enroute";
    function apply(tab) {
        var panel = panels.querySelector('[data-lb-panel="' + tab + '"]');
        var q = {};
        panel.querySelectorAll("[data-lb-f]").forEach(function (input) {
            var v = lc(input.value.trim());
            if (input.hasAttribute("data-lb-any") && v === lc(input.getAttribute("data-lb-any"))) v = "";
            if (v) q[input.getAttribute("data-lb-f")] = { v: v, exact: input.hasAttribute("data-lb-any") };
        });
        var mine = root.querySelector("[data-lb-mine]").checked;
        var office = root.querySelector("[data-lb-office]").value;
        var shown = 0;
        panel.querySelectorAll(".lb-row").forEach(function (row) {
            var ok = true;
            Object.keys(q).forEach(function (k) {
                var have = row.getAttribute("data-f-" + k) || "";
                if (q[k].exact ? have !== q[k].v : have.indexOf(q[k].v) === -1) ok = false;
            });
            if (mine && row.getAttribute("data-mine") !== "1") ok = false;
            if (office !== "All Offices" && row.getAttribute("data-office") !== office && row.getAttribute("data-office") !== "all") ok = false;
            row.hidden = !ok;
            if (ok) shown++;
        });
        panel.querySelector("[data-lb-empty]").hidden = shown > 0;
        if (tab === current) {
            root.querySelector("[data-lb-range]").textContent = shown ? "1-" + shown : "0";
            root.querySelector("[data-lb-total]").textContent = shown;
        }
    }
    function counts() {
        TABS.forEach(function (t) {
            var n = root.querySelector('[data-lb-count="' + t.id + '"]');
            if (t.id === "paid") n.textContent = DATA.paid.length;
            if (t.id === "claims") n.textContent = 6 + DATA.claims.length;
        });
    }
    ALL.forEach(paint);
    counts();

    function show(tab) {
        current = tab;
        panels.querySelectorAll("[data-lb-panel]").forEach(function (p) { p.hidden = p.getAttribute("data-lb-panel") !== tab; });
        var tabId = tab === "archive" ? "accounting" : tab;
        tabsNode.querySelectorAll("[data-lb-tab]").forEach(function (b) {
            var on = b.getAttribute("data-lb-tab") === tabId;
            b.classList.toggle("is-active", on);
            b.setAttribute("aria-selected", on ? "true" : "false");
        });
        root.querySelectorAll("[data-lb-only]").forEach(function (b) { b.hidden = b.getAttribute("data-lb-only") !== tab; });
        apply(tab);
    }

    /* ---------- events ---------- */
    root.addEventListener("input", function (e) { if (e.target.matches("[data-lb-f]")) apply(current); });
    root.addEventListener("change", function (e) {
        var t = e.target;
        if (t.matches("[data-lb-f], [data-lb-mine], [data-lb-office]")) { ALL.forEach(apply); return; }
        if (t.matches("[data-lb-all]")) {
            var panel = t.closest("[data-lb-panel]");
            panel.querySelectorAll(".lb-row:not([hidden]) [data-lb-move], .lb-row:not([hidden]) [data-lb-processed]").forEach(function (c) { c.checked = t.checked; });
            syncBulk();
            return;
        }
        if (t.matches("[data-lb-move]")) syncBulk();
        if (t.matches("[data-lb-processed]")) {
            var r = byId(DATA.accounting, t.closest(".lb-row").getAttribute("data-id"));
            if (r) r.processed = t.checked;
        }
    });

    function byId(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
    function selectedMoves() { return Array.prototype.map.call(panels.querySelectorAll('[data-lb-panel="invoiced"] [data-lb-move]:checked'), function (c) { return c.closest(".lb-row").getAttribute("data-id"); }); }
    function syncBulk() {
        var bar = panels.querySelector("[data-lb-bulk]");
        var n = selectedMoves().length;
        bar.hidden = n === 0;
        bar.querySelector("[data-lb-bulk-count]").textContent = n;
    }

    var undo = null;
    function moveRows(from, to, ids, mapFn) {
        var moved = [];
        DATA[from] = DATA[from].filter(function (x) { if (ids.indexOf(x.id) !== -1) { moved.push(x); return false; } return true; });
        moved.forEach(function (x) { DATA[to].unshift(mapFn ? mapFn(x) : x); });
        paint(from); paint(to); counts();
        return moved;
    }

    tabsNode.addEventListener("click", function (e) { var b = e.target.closest("[data-lb-tab]"); if (b) show(b.getAttribute("data-lb-tab")); });

    var now = function () { return "11/17/2026 14:33"; };
    document.addEventListener("click", function (e) {
        var t = e.target;
        var go = t.closest("[data-lb-tab-go]");
        if (go) { show(go.getAttribute("data-lb-tab-go")); return; }

        if (t.closest("[data-lb-process]")) {
            var ids = DATA.accounting.filter(function (r) { return r.processed; }).map(function (r) { return r.id; });
            if (!ids.length) { if (window.empToast) window.empToast("saveFailed"); return; }
            var moved = moveRows("accounting", "archive", ids, function (r) { var c = {}; Object.keys(r).forEach(function (k) { c[k] = r[k]; }); c.by = "Winston Wolf"; c.at = now(); c.processed = false; return c; });
            undo = function () { moveRows("archive", "accounting", moved.map(function (r) { return r.id; }), function (r) { r.processed = false; return r; }); undo = null; root.querySelector("[data-lb-undo]").disabled = true; };
            root.querySelector("[data-lb-undo]").disabled = false;
            if (window.empToast) window.empToast("updated", { action: { label: "Undo", run: function () { if (undo) undo(); } } });
            return;
        }
        if (t.closest("[data-lb-undo]")) { if (undo) undo(); return; }
        var ret = t.closest("[data-lb-return]");
        if (ret) {
            var rid = ret.closest(".lb-row").getAttribute("data-id");
            moveRows("archive", "accounting", [rid], function (r) { r.processed = false; return r; });
            if (window.empToast) window.empToast("restored", { name: "Pro #" + byId(DATA.accounting, rid).pro });
            return;
        }
        if (t.closest("[data-lb-mail]")) { if (window.empToast) window.empToast("sent", { name: "Change notice" }); return; }
        if (t.closest("[data-lb-bulk-clear]")) { panels.querySelectorAll("[data-lb-move]:checked, [data-lb-panel=\"invoiced\"] [data-lb-all]").forEach(function (c) { c.checked = false; }); syncBulk(); return; }
        var lost = t.closest("[data-lb-lost-clear]");
        if (lost) { var cellNode = lost.closest(".emp-table__cell"); cellNode.innerHTML = '<span class="emp-table__muted">—</span>'; if (window.empToast) window.empToast("deleted"); return; }
        var copy = t.closest("[data-lb-copy]");
        if (copy) { if (navigator.clipboard) navigator.clipboard.writeText(copy.getAttribute("data-lb-copy")).catch(function () {}); if (window.empToast) window.empToast("loadCopied", { name: "Link for broker" }); return; }
        var star = t.closest(".lb-star");
        if (star) { var all = star.parentNode.querySelectorAll(".lb-star"), idx = Array.prototype.indexOf.call(all, star); all.forEach(function (s, i) { s.classList.toggle("is-on", i <= idx); }); return; }
        if (t.closest("[data-lb-preview]")) { var seed0 = document.getElementById("ld-preview-open"); if (seed0) seed0.click(); return; }

        var opener = t.closest("[data-lb-open]");
        if (!opener) return;
        e.preventDefault();
        var id = opener.getAttribute("data-lb-open");
        if (window.empCloseMenus) window.empCloseMenus();
        if (id === "preview") { var seed = document.getElementById("ld-preview-open"); if (seed) seed.click(); return; }
        if (id === "lb-notes" && opener.closest(".lb-row") && opener.closest(".lb-row").getAttribute("data-id") === "L1") id = "lb-notes";
        var target = document.getElementById(id === "ld-new" ? "ld-load" : id);
        if (!target || !window.empOverlay) return;
        if (id === "ld-load" || id === "ld-new") {
            var isNew = id === "ld-new";
            var tt = document.getElementById("ld-load-title"), ex = document.getElementById("ld-load-extra"), sb = document.getElementById("ld-load-submit");
            if (tt) tt.textContent = isNew ? "New load" : "Update load";
            if (ex) ex.hidden = !isNew;
            if (sb) sb.textContent = isNew ? "Save" : "Submit";
        }
        var stack = opener.closest(".emp-overlay");
        if (stack && stack !== target) window.empOverlay.close(stack);
        window.empOverlay.open(target);
    });

    document.addEventListener("submit", function (e) {
        var form = e.target.closest(".emp-overlay form");
        if (!form) return;
        e.preventDefault();
        var overlay = form.closest(".emp-overlay");
        var id = overlay.id;
        if (id === "lb-paid" || id === "lb-paid-owners") {
            var moveBox = form.querySelector('[name="lb-move"]');
            var ids = selectedMoves();
            if (moveBox && moveBox.checked && ids.length) {
                moveRows("invoiced", "paid", ids, function (l) { l.paidAmt = l.rate; return l; });
                syncBulk();
            }
        }
        if (id === "lb-notes" || id === "lb-notes-empty") {
            var text = form.querySelector("textarea");
            var list = document.querySelector("#lb-notes [data-lb-notes]");
            if (text && text.value.trim() && list) {
                var card = document.createElement("div");
                card.className = "lb-card";
                card.innerHTML = '<p class="lb-card__head"><span><strong>Winston Wolf</strong> <span class="emp-table__muted">Dispatcher</span></span><span class="emp-table__muted">' + now() + "</span></p><p></p>";
                card.lastChild.textContent = text.value.trim();
                list.appendChild(card);
                text.value = "";
            }
        }
        window.empOverlay.close(overlay);
        var kind = form.getAttribute("data-lb-toast");
        if (kind && window.empToast) window.empToast(kind, { name: overlay.querySelector(".emp-mw__title").textContent });
    });

    var hash = (location.hash || "").replace("#", "");
    if (ALL.indexOf(hash) !== -1) show(hash);
})();
