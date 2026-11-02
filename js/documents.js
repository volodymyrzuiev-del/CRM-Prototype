/* Document checking — data and logic of the section (Figma: CRM 3.0 / Document checking).
   Flow: owner type → upload → assign types → check documents one by one → compare → data mismatch → save → List. */
(function () {
    "use strict";

    var TYPES = ["COI", "Declaration page", "EIN", "W9 Form", "Vehicle registration", "Plate", "VOID/Direct deposit form", "Driving license", "SSN", "TWIC", "Vehicle specification sticker", "Other"];
    var LIST_COLS = ["COI", "Driving license", "SSN", "Vehicle registration", "Plate", "Vehicle specification sticker", "EIN", "VOID/Direct deposit form", "W9 Form"];
    // Recognised data per document type (demo values).
    var FIELDS = {
        "COI": [["Name insured", "Rai"], ["Scheduled driver", "Tom Bobb"], ["Policy number (automobile liability)", "45683337678576856"], ["Policy period", "09/23/2026"], ["Certificate holder", "Empire National Inc, 4600 Hendersonville Rd, Fletcher, NC 28732"]],
        "Declaration page": [["Insured", "Rai Ran B"], ["Policy number", "DP-2231-77"], ["Vehicles", "2021 Ford Transit Cargo"]],
        "EIN": [["Company name", "Rai Trucking LLC"], ["EIN", "22-2030000"]],
        "W9 Form": [["Name", "Rai Ran B"], ["Business name", "Rai Trucking LLC"], ["TIN", "22203"]],
        "Vehicle registration": [["Owner name", "Tom Bob"], ["VIN", "1FTBR3X81MKA73567"], ["Plate", "NC 7KJ-221"], ["Year, make, model", "2021 Ford Transit Cargo"]],
        "Plate": [["Plate number", "7KJ-221"], ["State", "North Carolina"], ["Owner name", "T. Bob"]],
        "VOID/Direct deposit form": [["Bank", "Wells Fargo"], ["Routing number", "053000219"], ["Account number", "•••• 4410"]],
        "Driving license": [["Last name", "Rai"], ["First name", "Ran B"], ["DL No", "W200298022"], ["State", "North Carolina"], ["Exp", "10/28/2026"], ["DOB", "10/28/1985"], ["Address", "4600 Hendersonville Rd, Fletcher, NC 28732"]],
        "SSN": [["Full name", "Thomas Bob"], ["SSN", "•••-••-6789"]],
        "TWIC": [["Name", "Rai Ran B"], ["Card number", "TW-88231"], ["Exp", "01/12/2028"]],
        "Vehicle specification sticker": [["VIN", "1FTBR3X81MKA73567"], ["GVWR", "9 500 lbs"]],
        "Other": [["Description", "Additional document"]]
    };
    var COMPARE = [
        { field: "Last name", rows: [["COI", "Photo21341112.pdf", "Rai"], ["Driving license", "Photo2312.jpeg", "Rai"], ["SSN", "Photo1.jpeg", "Rain"]] },
        { field: "TIN", rows: [["COI", "Photo21341112.pdf", "22203"], ["W9 Form", "W9_scan.pdf", "22203"], ["EIN", "EIN_letter.pdf", "22230"]] }
    ];
    var MISMATCH = [
        { parent: "Driving license", doc: "COI", field: "Scheduled driver", parentValue: "Tom Bob", value: "Tom Bobb", auto: true },
        { parent: "Driving license", doc: "COI", field: "Name insured", parentValue: "Tom Bob", value: "Thomas Bob", auto: true },
        { parent: "Vehicle registration", doc: "Plate", field: "Owner name", parentValue: "Tom Bob", value: "T. Bob", auto: false }
    ];
    var PARENTS = {
        "Driving license": { file: "Photo5492.jpeg", kv: [["Last name", "Bob"], ["First name", "Tom"], ["DL No", "W200298022"], ["DOB", "10/28/1985"]] },
        "Vehicle registration": { file: "VR_scan.pdf", kv: [["Owner name", "Tom Bob"], ["VIN", "1FTBR3X81MKA73567"], ["Plate", "NC 7KJ-221"], ["Year", "2021"]] }
    };
    var ROWS = [
        { date: "07/11/2026", name: "Theresa Webb", owner: "Additional driver", s: "wwwwww---" },
        { date: "07/11/2026", name: "Cody Fisher", owner: "Person", s: "wwwwwwwww" },
        { date: "07/10/2026", name: "Empire Logistics LLC", owner: "Company", s: "oooeooooo" },
        { date: "07/10/2026", name: "Ralph Edwards", owner: "Company", s: "oowewowoo" },
        { date: "07/09/2026", name: "Annette Black", owner: "Additional driver", s: "wwwwww---" },
        { date: "07/09/2026", name: "Devon Lane", owner: "Additional driver", s: "---------" },
        { date: "07/08/2026", name: "Jacob Jones", owner: "Team driver", s: "oooooo---" },
        { date: "07/08/2026", name: "Kristin Watson", owner: "Person", s: "ooooooooo" }
    ];
    var STATUS = { o: ["ok", "file-earmark-check-fill", "Verified"], e: ["error", "file-earmark-x-fill", "Mismatch — needs review"], w: ["wait", "hourglass-split", "Processing"], "-": ["none", "dash", "Not uploaded"] };

    var state = {
        owner: "", files: [], seq: 0, selecting: false, selected: {}, assignIds: [], assignType: "",
        status: {}, type: null, fileId: null, page: 1, zoom: 100, compared: false, decisions: {}, mmTab: "Driving license", viewRow: null, viewType: null
    };

    var $ = function (id) { return document.getElementById(id); };
    var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
    var icon = function (name, cls) { return '<svg class="' + (cls || "emp-icon") + '" viewBox="0 0 16 16" aria-hidden="true"><use href="#dc-' + name + '"></use></svg>'; };
    var toast = function (kind, data) { if (window.empToast) window.empToast(kind, data); };
    var open = function (id) { window.empOverlay.open($(id)); };
    var close = function (id) { window.empOverlay.close($(id)); };
    var field = function (label, value, opts) {
        opts = opts || {};
        var area = value && value.length > 46;
        return '<div class="emp-field' + (opts.error ? " is-error" : "") + '"' + (opts.attr || "") + '><div class="emp-field__title"><span class="emp-field__label">' + esc(label) + "</span>" + (opts.error ? '<span class="emp-field__help">' + esc(opts.error) + "</span>" : "") + "</div>" +
            (area ? '<div class="emp-input emp-input--extended"><textarea class="emp-input__control" rows="2">' + esc(value) + "</textarea></div>"
                  : '<div class="emp-input"><input class="emp-input__control" type="text" value="' + esc(value) + '" aria-label="' + esc(label) + '"></div>') + "</div>";
    };
    var bare = function (value, error) {
        return '<div class="emp-field' + (error ? " is-error" : "") + '"><div class="emp-input"><input class="emp-input__control" type="text" value="' + esc(value) + '"></div></div>';
    };
    var chip = function (text, color, outline) { return '<span class="emp-chip' + (outline ? " emp-chip--outline" : "") + (color ? " emp-chip--" + color : "") + '">' + esc(text) + "</span>"; };
    var info = function (tone, title, text) {
        var ic = { warning: "i-warn-fill", success: "i-success-fill", info: "i-info-circle-fill" }[tone];
        return '<div class="emp-info emp-info--' + tone + ' emp-info--title"><div class="emp-info__head"><svg class="emp-info__icon" viewBox="0 0 16 16" aria-hidden="true"><use href="#' + ic + '"></use></svg><strong>' + esc(title) + "</strong></div><p>" + esc(text) + "</p></div>";
    };
    var btn = function (label, type, attrs) { return '<button class="emp-btn emp-btn--' + type + ' emp-btn--lg" type="button" ' + (attrs || "") + ">" + esc(label) + "</button>"; };

    /* ---------- 1 · owner & upload ---------- */
    function fileCard(f) {
        var pdf = f.kind === "pdf";
        var untyped = !f.type;
        var sel = state.selecting ? '<label class="emp-check dc-file__check"><input class="emp-check__input" type="checkbox" data-dc-sel="' + f.id + '"' + (state.selected[f.id] ? " checked" : "") + ' aria-label="Select ' + esc(f.name) + '"><span class="emp-check__box"><svg class="emp-check__mark" viewBox="0 0 20 20" aria-hidden="true"><use href="#i-check"></use></svg><span class="emp-check__minus"></span></span></label>' : "";
        return '<article class="emp-file dc-file' + (pdf ? " emp-file--pdf" : "") + (untyped ? " is-untyped" : "") + (state.selected[f.id] ? " is-selected" : "") + '" data-dc-file="' + f.id + '" tabindex="0">' +
            '<img class="emp-file__img" src="' + esc(f.src) + '" alt="">' +
            '<div class="emp-file__shade"><div class="emp-file__top"><span class="emp-file__line"><img class="emp-file__type" src="icons/upload/' + (pdf ? "file-pdf" : "file-image") + '.svg" alt="" width="12" height="12"><span class="emp-file__name">' + esc(f.name) + '</span></span>' +
            '<button class="emp-file__kind dc-kind" type="button" data-dc-assign="' + f.id + '">' + esc(f.type || "Type not assigned") + "</button></div>" +
            '<div class="emp-file__mid"><button class="emp-file__act emp-file__act--open" type="button" aria-label="Open"><svg viewBox="0 0 20 20" aria-hidden="true"><use href="#i-file-open"></use></svg></button></div>' +
            '<div class="emp-file__bot"><button class="emp-file__act emp-file__act--delete" type="button" aria-label="Delete" data-dc-del="' + f.id + '"><svg viewBox="0 0 20 20" aria-hidden="true"><use href="#i-trash"></use></svg></button>' +
            '<button class="emp-file__act emp-file__act--download" type="button" aria-label="Download"><svg viewBox="0 0 20 20" aria-hidden="true"><use href="#i-download"></use></svg></button>' +
            '<button class="emp-file__act" type="button" aria-label="Assign type" data-dc-assign="' + f.id + '"><svg viewBox="0 0 20 20" aria-hidden="true"><use href="#i-file-dots"></use></svg></button></div></div>' +
            sel + "</article>";
    }
    function renderUpload() {
        var zone = $("dc-drop-zone"), wrap = $("dc-files"), drop = $("dc-drop");
        wrap.querySelectorAll(".dc-file").forEach(function (n) { n.remove(); });
        drop.insertAdjacentHTML("beforebegin", state.files.map(fileCard).join(""));
        var locked = !state.owner, has = state.files.length > 0;
        zone.classList.toggle("is-disabled", locked);
        zone.classList.toggle("is-empty", !has);
        zone.classList.toggle("is-selecting", state.selecting);
        drop.setAttribute("tabindex", locked ? "-1" : "0");
        $("dc-drop-name").textContent = locked ? "Choose the owner type first" : has ? "Add files" : "Drop files here or click to choose";
        $("dc-drop-hint").textContent = locked ? "Then drop files here or click to choose · PDF, JPG, PNG up to 20 MB" : has ? "or drop them here" : "PDF, JPG, PNG · up to 20 MB each · several files at once";
        $("dc-step2").classList.toggle("is-muted", locked);
        $("dc-demo").hidden = locked || has;
        var untyped = state.files.filter(function (f) { return !f.type; }).length;
        $("dc-count").textContent = has ? state.files.length + " files · " + (untyped ? untyped + " without type" : "all typed") : "";
        $("dc-tools").hidden = !has;
        var n = Object.keys(state.selected).length;
        $("dc-select").querySelector(".emp-btn__label").textContent = state.selecting ? "Cancel selection" : "Select documents";
        $("dc-assign-many").disabled = !state.selecting || !n;
        $("dc-assign-many").querySelector(".emp-btn__label").textContent = n ? "Assign type (" + n + ")" : "Assign type";
        $("dc-start").disabled = !state.owner || !has || untyped > 0;
    }
    function addFiles(list) {
        Array.prototype.forEach.call(list, function (file) {
            var image = /^image\//.test(file.type);
            state.files.push({ id: "f" + (++state.seq), name: file.name, kind: image ? "image" : "pdf", type: "", src: image ? URL.createObjectURL(file) : "icons/upload/bol.png" });
        });
        renderUpload();
    }
    function addDemo() {
        [["Doc_1.pdf", "pdf"], ["Doc_2.pdf", "pdf"], ["Photo5492.jpeg", "image"]].forEach(function (d) {
            state.files.push({ id: "f" + (++state.seq), name: d[0], kind: d[1], type: "", src: d[1] === "pdf" ? "icons/upload/bol.png" : "icons/upload/photo.jpeg.png" });
        });
        renderUpload();
    }

    /* ---------- assign type ---------- */
    function openAssign(ids) {
        state.assignIds = ids;
        var first = state.files.filter(function (f) { return f.id === ids[0]; })[0];
        var same = ids.every(function (id) { var f = state.files.filter(function (x) { return x.id === id; })[0]; return f && f.type === first.type; });
        state.assignType = same ? first.type : "";
        $("dc-assign-title").textContent = ids.length > 1 ? "Assign a type to " + ids.length + " documents" : "Assign a type to the document";
        var idx = state.files.indexOf(first) + 1;
        $("dc-assign-file").innerHTML = (ids.length > 1 ? "" : fileCard(first).replace(/data-dc-[a-z]+="[^"]*"/g, "")) +
            '<div class="dc-assign__meta"><span class="dc-assign__name">' + esc(ids.length > 1 ? ids.length + " documents selected" : first.name) + '</span><span class="dc-assign__sub">' + (ids.length > 1 ? "The type will be set for all of them" : "File " + idx + " of " + state.files.length) + "</span></div>";
        $("dc-assign-types").innerHTML = TYPES.map(function (t) {
            return '<label class="emp-radio"><input class="emp-radio__input" type="radio" name="dc-type" value="' + esc(t) + '"' + (t === state.assignType ? " checked" : "") + '><span class="emp-radio__box"></span><span>' + esc(t) + "</span></label>";
        }).join("");
        $("dc-assign-ok").disabled = !state.assignType;
        open("dc-assign");
    }
    function applyAssign() {
        state.files.forEach(function (f) { if (state.assignIds.indexOf(f.id) >= 0) f.type = state.assignType; });
        close("dc-assign");
        // single file: jump to the next untyped one, like the 2.0 flow
        var next = state.assignIds.length === 1 && state.files.filter(function (f) { return !f.type; })[0];
        if (state.assignIds.length > 1) { state.selecting = false; state.selected = {}; }
        renderUpload();
        if (state.assignIds.length > 1) toast("updated");
        if (next) setTimeout(function () { openAssign([next.id]); }, 250);
    }

    /* ---------- 2 · check ---------- */
    function typesInUse() { return TYPES.filter(function (t) { return state.files.some(function (f) { return f.type === t; }); }); }
    function filesOf(t) { return state.files.filter(function (f) { return f.type === t; }); }
    /* ---------- 1b · AI reads the documents (~8 s) ---------- */
    var SCAN_MS = 8000, scanTimers = [], scanAnim = null;
    function stopScan() {
        scanTimers.forEach(clearTimeout); scanTimers = [];
        if (scanAnim) { scanAnim.destroy(); scanAnim = null; }
        $("dc-scan-anim").innerHTML = "";
        $("dc-scan-bar").classList.remove("is-run");
    }
    function playScanAnimation() {
        var box = $("dc-scan-anim");
        if (window.lottie && window.DC_SCAN_LOTTIE) {
            try {
                scanAnim = window.lottie.loadAnimation({ container: box, renderer: "svg", loop: true, autoplay: true, animationData: JSON.parse(JSON.stringify(window.DC_SCAN_LOTTIE)) });
                // Safety net: if the player did not draw anything, show the CSS version.
                scanTimers.push(setTimeout(function () { if (!box.querySelector("svg g")) { if (scanAnim) { scanAnim.destroy(); scanAnim = null; } fallbackScan(box); } }, 400));
                return;
            } catch (e) { scanAnim = null; }
        }
        fallbackScan(box);
    }
    function fallbackScan(box) {
        box.innerHTML = '<div class="dc-scan__fallback"><svg viewBox="0 0 240 240" width="200" height="200"><rect x="58" y="38" width="124" height="164" rx="12" fill="var(--surface)" stroke="var(--primary)" stroke-width="3"/><rect x="66" y="55" width="30" height="6" rx="3" fill="var(--primary)"/>' +
            [78, 98, 118, 138, 158, 178].map(function (y, i) { return '<rect x="78" y="' + (y - 3.5) + '" width="' + [72, 84, 60, 84, 48, 70][i] + '" height="7" rx="3.5" fill="var(--border)"/>'; }).join("") + '</svg><span class="dc-scan__beam"></span></div>';
    }
    function startScan() {
        stopScan();
        $("dc-upload").hidden = true; $("dc-scan").hidden = false;
        var files = state.files.slice();
        $("dc-scan-sub").textContent = "Recognising the data in " + files.length + " files and filling the fields. It takes a few seconds.";
        $("dc-scan-list").innerHTML = files.map(function (f, i) {
            return '<li class="dc-scan__item" data-i="' + i + '">' + icon("file-earmark-text") + '<span class="dc-scan__name">' + esc(f.name) + " · " + esc(f.type) + '</span><span class="dc-scan__state">Waiting</span></li>';
        }).join("");
        playScanAnimation();
        var bar = $("dc-scan-bar"); bar.style.setProperty("--dc-scan-ms", SCAN_MS + "ms");
        requestAnimationFrame(function () { requestAnimationFrame(function () { bar.classList.add("is-run"); }); });
        var step = SCAN_MS / files.length;
        files.forEach(function (f, i) {
            scanTimers.push(setTimeout(function () { var li = $("dc-scan-list").children[i]; li.className = "dc-scan__item is-run"; li.querySelector(".dc-scan__state").innerHTML = '<span class="dc-spin"></span>Reading…'; }, i * step));
            scanTimers.push(setTimeout(function () { var li = $("dc-scan-list").children[i]; li.className = "dc-scan__item is-done"; li.querySelector(".dc-scan__state").innerHTML = icon("check-circle-fill") + "Fields filled"; bar.setAttribute("aria-valuenow", Math.round((i + 1) / files.length * 100)); }, (i + 1) * step - 250));
        });
        scanTimers.push(setTimeout(function () { stopScan(); $("dc-scan").hidden = true; startCheck(); }, SCAN_MS + 400));
    }
    function cancelScan() { stopScan(); $("dc-scan").hidden = true; $("dc-upload").hidden = false; renderUpload(); }

    function startCheck() {
        state.status = {};
        typesInUse().forEach(function (t) { state.status[t] = "pending"; });
        state.compared = false; state.decisions = {};
        $("dc-upload").hidden = true; $("dc-review").hidden = false;
        selectType(typesInUse()[0]);
    }
    function selectType(t, fileId) {
        state.type = t;
        state.fileId = fileId || filesOf(t)[0].id;
        state.page = 1; state.zoom = 100;
        renderReview();
    }
    function allChecked() { return Object.keys(state.status).every(function (t) { return state.status[t] !== "pending"; }); }
    function renderReview() {
        var types = typesInUse();
        var done = types.filter(function (t) { return state.status[t] !== "pending"; }).length;
        $("dc-progress").textContent = done + " / " + types.length;
        $("dc-accordion").innerHTML = types.map(function (t) {
            var st = state.status[t], files = filesOf(t), cur = t === state.type;
            var ic = st === "ok" ? ["check-circle-fill", "is-ok"] : st === "error" ? ["exclamation-circle-fill", "is-error"] : ["file-earmark-text", "is-pending"];
            return '<div class="emp-accordion__item' + (cur ? " is-open is-current" : "") + '"><button class="emp-accordion__trigger" type="button" data-dc-type="' + esc(t) + '">' +
                '<svg class="emp-accordion__icon ' + ic[1] + '" viewBox="0 0 16 16" aria-hidden="true"><use href="#dc-' + ic[0] + '"></use></svg>' +
                '<span class="emp-accordion__label"><span class="emp-accordion__title">' + esc(t) + (files.length > 1 ? " · " + files.length + " files" : "") + '</span><svg class="emp-accordion__chevron" viewBox="0 0 16 16" aria-hidden="true"><use href="#i-chevron-sm"></use></svg></span></button>' +
                '<div class="emp-accordion__panel">' + files.map(function (f) {
                    var active = f.id === state.fileId;
                    return '<button class="dc-filerow' + (active ? " is-active" : "") + '" type="button" data-dc-type="' + esc(t) + '" data-dc-pick="' + f.id + '">' + icon("file-earmark-text") + '<span class="dc-filerow__name">' + esc(f.name) + '</span><span class="dc-filerow__meta">' + (active ? "Viewing" : f.kind === "pdf" ? "2 pages" : "1 page") + "</span></button>";
                }).join("") + "</div></div>";
        }).join("");
        var file = state.files.filter(function (f) { return f.id === state.fileId; })[0];
        $("dc-doc").src = file.src;
        paintZoom();
        var pages = file.kind === "pdf" ? 2 : 1;
        $("dc-pager").hidden = pages < 2;
        $("dc-page").textContent = state.page + " / " + pages;
        $("dc-pager").querySelector('[data-dc-page="-1"]').disabled = state.page <= 1;
        $("dc-pager").querySelector('[data-dc-page="1"]').disabled = state.page >= pages;
        var st = state.status[state.type];
        $("dc-data-title").textContent = state.type;
        var c = $("dc-data-chip");
        c.className = st === "ok" ? "emp-chip emp-chip--green" : st === "error" ? "emp-chip emp-chip--red" : "emp-chip emp-chip--outline emp-chip--orange";
        c.textContent = st === "ok" ? "Verified" : st === "error" ? "Kept with error" : "Not checked";
        $("dc-fields").innerHTML = (FIELDS[state.type] || FIELDS.Other).map(function (r) { return field(r[0], r[1]); }).join("");
        var finished = allChecked();
        var resolved = state.compared && MISMATCH.every(function (m, i) { return state.decisions[i]; });
        $("dc-done").hidden = !finished;
        $("dc-done").innerHTML = !finished ? "" : resolved
            ? info("success", "All documents are checked", "Mismatches are resolved. Save the check to add the owner to the List.")
            : info("warning", "All documents are checked", "Some values differ between documents. Compare them before saving.");
        $("dc-data-foot").innerHTML = finished
            ? (resolved ? btn("Compare again", "outline", 'data-dc-act="compare"') + btn("Save check", "primary", 'data-dc-act="save"')
                        : btn("Save check", "outline", 'data-dc-act="save" disabled') + btn("Compare documents", "primary", 'data-dc-act="compare"'))
            : btn("Back", "outline", 'data-dc-act="back"') + btn(st === "pending" ? "Confirm & next" : "Next", "primary", 'data-dc-act="next"');
    }
    function paintZoom() {
        $("dc-zoom").textContent = state.zoom + "%";
        $("dc-doc").style.width = state.zoom + "%";
        $("dc-doc").style.maxWidth = (640 * state.zoom / 100) + "px";
    }
    function nextDoc() {
        if (state.status[state.type] === "pending") state.status[state.type] = "ok";
        var types = typesInUse();
        var next = types.filter(function (t) { return state.status[t] === "pending"; })[0];
        if (next) selectType(next); else renderReview();
    }
    function backToUpload() { $("dc-review").hidden = true; $("dc-upload").hidden = false; renderUpload(); }

    /* ---------- compare ---------- */
    function openCompare() {
        $("dc-compare-body").innerHTML = info("info", "These values must be the same in all documents", "Pick the correct value — the others will be updated to it.") +
            COMPARE.map(function (g, gi) {
                return '<section class="dc-card"><div class="dc-card__head"><h3 class="dc-h4">' + esc(g.field) + "</h3>" + chip("2 different values", "red", true) + "</div>" +
                    '<div class="dc-compare__row dc-compare__row--head"><span></span><span>Document</span><span>Value</span></div>' +
                    g.rows.map(function (r, ri) {
                        var differs = r[2] !== g.rows[0][2];
                        return '<div class="dc-compare__row"><label class="emp-radio"><input class="emp-radio__input" type="radio" name="dc-cmp-' + gi + '"' + (ri === 0 ? " checked" : "") + ' aria-label="Use value from ' + esc(r[0]) + '"><span class="emp-radio__box"></span></label>' +
                            '<div class="dc-compare__src"><span>' + esc(r[0]) + '</span><button class="emp-btn emp-btn--link emp-btn--md" type="button" data-dc-open-file><span class="emp-btn__label">' + esc(r[1]) + '</span><span class="emp-btn__glyph">' + icon("box-arrow-up-right") + "</span></button></div>" +
                            bare(r[2], differs) + "</div>";
                    }).join("") + "</section>";
            }).join("");
        open("dc-compare");
    }

    /* ---------- data mismatch ---------- */
    function openMismatch() { state.mmTab = MISMATCH[0].parent; renderMismatch(); open("dc-mismatch"); }
    function renderMismatch() {
        var parents = [];
        MISMATCH.forEach(function (m) { if (parents.indexOf(m.parent) < 0) parents.push(m.parent); });
        var left = MISMATCH.filter(function (m, i) { return !state.decisions[i]; }).length;
        var p = PARENTS[state.mmTab];
        var DEC = { correct: ["Correct", "green"], wrong: ["Wrong", "red"], keep: ["Kept with error", ""] };
        $("dc-mismatch-body").innerHTML =
            (left ? info("warning", left + " of " + MISMATCH.length + " values need a decision", "Compare each value with the parent document and choose what to do. Save becomes available when every value is decided.")
                  : info("success", "All values have a decision", "Save to apply. Values kept with error stay marked in the List.")) +
            '<div class="emp-tabs__list emp-tabs__list--boxed" role="tablist" aria-label="Parent documents">' + parents.map(function (name) {
                var n = MISMATCH.filter(function (m, i) { return m.parent === name && !state.decisions[i]; }).length;
                return '<button class="emp-tab' + (name === state.mmTab ? " is-active" : "") + '" type="button" role="tab" data-dc-mm="' + esc(name) + '">' + esc(name) + (n ? '<span class="emp-tab__count">' + n + "</span>" : "") + "</button>";
            }).join("") + "</div>" +
            '<section class="dc-parent"><div class="dc-parent__head"><h3 class="dc-h4">Parent document · ' + esc(state.mmTab) + " (" + esc(p.file) + ')</h3><button class="emp-btn emp-btn--link emp-btn--md" type="button" data-dc-open-file><span class="emp-btn__label">Edit parent</span></button></div>' +
            '<div class="dc-kv">' + p.kv.map(function (kv) { return '<div><span class="dc-kv__label">' + esc(kv[0]) + '</span><span class="dc-kv__value">' + esc(kv[1]) + "</span></div>"; }).join("") + "</div></section>" +
            MISMATCH.map(function (m, i) {
                if (m.parent !== state.mmTab) return "";
                var d = state.decisions[i];
                var radio = function (val, label) {
                    var off = val === "correct" && !m.auto;
                    return '<label class="emp-radio' + (off ? " is-disabled" : "") + '"><input class="emp-radio__input" type="radio" name="dc-mm-' + i + '" value="' + val + '" data-dc-dec="' + i + '"' + (d === val ? " checked" : "") + (off ? " disabled" : "") + '><span class="emp-radio__box"></span><span>' + label + "</span></label>";
                };
                return '<section class="dc-card' + (d ? "" : " is-open") + '"><div class="dc-card__head"><h3 class="dc-h4">' + esc(m.doc + " · " + m.field) + "</h3>" + (d ? chip(DEC[d][0], DEC[d][1]) : chip("Needs decision", "orange", true)) + "</div>" +
                    '<div class="dc-card__values"><div class="dc-card__col"><span class="dc-card__label">In ' + esc(m.parent) + ' (parent)</span><div class="dc-card__box">' + esc(m.parentValue) + "</div></div>" +
                    '<div class="dc-card__col"><span class="dc-card__label">In ' + esc(m.doc) + "</span>" + bare(m.value) + "</div></div>" +
                    '<div class="dc-card__decision"><span>Decision:</span>' + radio("correct", "Value is correct") + radio("wrong", "Value is wrong") + radio("keep", "Keep with error") + "</div>" +
                    (m.auto ? "" : '<span class="dc-card__label">“Value is correct” is not available — this value cannot be confirmed automatically.</span>') + "</section>";
            }).join("");
        $("dc-mismatch-ok").disabled = left > 0;
    }
    function saveDecisions() {
        close("dc-mismatch");
        var kept = MISMATCH.filter(function (m, i) { return state.decisions[i] === "keep"; });
        MISMATCH.forEach(function (m, i) { if (state.decisions[i] === "keep") state.status[m.doc] = "error"; });
        renderReview();
        toast("saved");
    }
    function saveCheck() {
        var kept = MISMATCH.filter(function (m, i) { return state.decisions[i] === "keep"; });
        if (kept.length) {
            $("dc-confirm-text").textContent = kept.length + (kept.length > 1 ? " values are" : " value is") + " kept with error (" + kept.map(function (m) { return m.doc + " · " + m.field; }).join(", ") + "). The owner will be saved with the “Mismatch” status in the List.";
            open("dc-confirm");
        } else finishCheck();
    }
    function finishCheck() {
        close("dc-confirm");
        var dl = FIELDS["Driving license"];
        var name = state.owner === "Company" ? "Rai Trucking LLC" : dl[1][1] + " " + dl[0][1];
        var s = LIST_COLS.map(function (t) { var st = state.status[t]; return st === "ok" ? "o" : st === "error" ? "e" : "-"; }).join("");
        var d = new Date();
        ROWS.unshift({ date: ("0" + (d.getMonth() + 1)).slice(-2) + "/" + ("0" + d.getDate()).slice(-2) + "/" + d.getFullYear(), name: name, owner: state.owner, s: s, fresh: true });
        resetCheck();
        setTab("list");
        toast("checkSaved", { name: name });
    }
    function resetCheck() {
        state.files.forEach(function (f) { if (/^blob:/.test(f.src)) URL.revokeObjectURL(f.src); });
        state.files = []; state.selecting = false; state.selected = {}; state.status = {}; state.decisions = {}; state.compared = false;
        state.owner = ""; var o = $("dc-owner"); o.value = "";
        $("dc-review").hidden = true; $("dc-upload").hidden = false;
        renderUpload();
    }

    /* ---------- 3 · list ---------- */
    function renderList() {
        var q = ($("dc-f-name").value || "").trim().toLowerCase(), t = $("dc-f-type").value, dt = $("dc-f-date").value;
        var rows = ROWS.map(function (r, i) { return [r, i]; }).filter(function (x) {
            var r = x[0];
            if (q && r.name.toLowerCase().indexOf(q) < 0) return false;
            if (t && t !== "All" && r.owner !== t) return false;
            if (dt === "Today" && !r.fresh) return false;
            return true;
        });
        $("dc-rows").innerHTML = rows.map(function (x) {
            var r = x[0], i = x[1];
            return '<div class="emp-table__row" role="row" data-i="' + i + '">' +
                '<div class="emp-table__cell">' + esc(r.date) + "</div>" +
                '<div class="emp-table__cell"><button class="dc-link" type="button" data-dc-view="' + i + '">' + esc(r.name) + "</button></div>" +
                '<div class="emp-table__cell">' + esc(r.owner) + "</div>" +
                r.s.split("").map(function (c, ci) { var st = STATUS[c]; return '<div class="emp-table__cell dc-cell-mid" title="' + esc(LIST_COLS[ci] + ": " + st[2]) + '">' + icon(st[1], "dc-status dc-status--" + st[0]) + "</div>"; }).join("") +
                '<div class="dc-cell-actions"><button class="dc-icon-btn" type="button" data-dc-view="' + i + '" aria-label="View documents">' + icon("eye") + "</button>" +
                '<div class="emp-amenu"><button class="emp-amenu__hit" type="button" aria-label="Actions" aria-expanded="false"><span class="emp-amenu__dots"></span></button><span class="emp-amenu__list">' +
                '<button class="emp-amenu__item" type="button" data-dc-view="' + i + '"><img src="icons/action-menu/view.svg" alt="" width="16" height="16">View documents</button>' +
                '<button class="emp-amenu__item" type="button" data-dc-view="' + i + '" data-dc-edit><img src="icons/action-menu/edit.svg" alt="" width="16" height="16">Edit</button>' +
                '<button class="emp-amenu__item emp-amenu__item--red" type="button" data-dc-delete="' + i + '"><img src="icons/action-menu/delete.svg" alt="" width="16" height="16">Delete</button></span></div></div></div>';
        }).join("");
        $("dc-empty").hidden = rows.length > 0;
    }
    function setTab(tab) {
        document.querySelectorAll("[data-dc-tab]").forEach(function (b) { var on = b.getAttribute("data-dc-tab") === tab; b.classList.toggle("is-active", on); b.setAttribute("aria-selected", on); });
        var list = tab === "list";
        $("dc-list").hidden = !list;
        if (list) { if (scanTimers.length) cancelScan(); $("dc-upload").hidden = true; $("dc-review").hidden = true; renderList(); }
        else { var reviewing = Object.keys(state.status).length > 0; $("dc-upload").hidden = reviewing; $("dc-review").hidden = !reviewing; if (!reviewing) renderUpload(); }
    }

    /* ---------- view / edit ---------- */
    var VIEW_EXTRA = { "COI": [["Scheduled driver 2", "Ralph Edwards", "del"], ["Year, make, model 1", "2021 Ford Transit Cargo", "add"], ["VIN 1", "1FTBR3X81MKA73567", "add"]] };
    function openView(i, edit) {
        var r = ROWS[i]; state.viewRow = i;
        var types = LIST_COLS.filter(function (t, ci) { return r.s[ci] !== "-"; });
        if (!types.length) { toast("denied"); return; }
        state.viewType = types.indexOf("COI") >= 0 ? "COI" : types[0];
        $("dc-view-title").textContent = r.name + " · documents";
        renderView(types, edit);
        open("dc-view");
    }
    function renderView(types, edit) {
        var r = ROWS[state.viewRow], t = state.viewType;
        var rows = (FIELDS[t] || []).map(function (x) { return [x[0], x[1], x[0] === "Scheduled driver" ? "add" : ""]; }).concat(VIEW_EXTRA[t] || []);
        $("dc-view-body").innerHTML =
            '<div class="dc-viewer"><div class="dc-viewer__pager"><button class="dc-icon-btn" type="button" disabled aria-label="Previous page">' + icon("chevron-left") + '</button><span>1 / 2</span><button class="dc-icon-btn" type="button" aria-label="Next page">' + icon("chevron-right") + '</button></div>' +
            '<div class="dc-viewer__canvas"><img class="dc-viewer__doc" src="icons/upload/bol.png" alt="Document"></div></div>' +
            '<div class="dc-view__side"><div class="dc-doc-chips" role="tablist" aria-label="Documents">' + types.map(function (x) {
                var st = r.s[LIST_COLS.indexOf(x)];
                var cls = x === t ? "emp-chip" : "emp-chip emp-chip--outline" + (st === "e" ? " emp-chip--red" : st === "w" ? " emp-chip--grey" : "");
                return '<button class="' + cls + '" type="button" role="tab" aria-selected="' + (x === t) + '" data-dc-vt="' + esc(x) + '">' + esc(x) + (st === "e" ? " · mismatch" : st === "w" ? " · processing" : "") + "</button>";
            }).join("") + "</div>" +
            '<div class="dc-view__fields" data-emp-fade>' + rows.map(function (x) {
                var act = x[2] === "add" ? '<button class="emp-btn emp-btn--link emp-btn--md" type="button" data-dc-add><span class="emp-btn__glyph">' + icon("plus-circle-fill") + '</span><span class="emp-btn__label">Add</span></button>'
                        : x[2] === "del" ? '<button class="emp-btn emp-btn--link emp-btn--md" type="button" data-dc-remove><span class="emp-btn__glyph">' + icon("dash-circle-fill") + '</span><span class="emp-btn__label">Delete</span></button>' : "";
                return '<div class="dc-view__field">' + (act ? '<div class="dc-field-head"><span></span>' + act + "</div>" : "") + field(x[0], x[1]) + "</div>";
            }).join("") + "</div></div>";
        $("dc-view").querySelectorAll(".dc-field-head").forEach(function (h) { var f = h.nextElementSibling; var t2 = f.querySelector(".emp-field__title"); t2.appendChild(h.querySelector(".emp-btn")); h.remove(); t2.classList.add("dc-field-head"); });
    }

    /* ---------- events ---------- */
    $("dc-owner").addEventListener("change", function () { state.owner = this.value; renderUpload(); });
    $("dc-owner").addEventListener("input", function () { state.owner = this.value; renderUpload(); });
    var input = $("dc-file-input");
    $("dc-drop").addEventListener("click", function () { if (state.owner) input.click(); });
    $("dc-drop").addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && state.owner) { e.preventDefault(); input.click(); } });
    input.addEventListener("change", function () { addFiles(input.files); input.value = ""; });
    ["dragenter", "dragover"].forEach(function (t) { $("dc-drop-zone").addEventListener(t, function (e) { if (!state.owner) return; e.preventDefault(); $("dc-drop-zone").classList.add("is-drag"); }); });
    ["dragleave", "drop"].forEach(function (t) { $("dc-drop-zone").addEventListener(t, function (e) { e.preventDefault(); $("dc-drop-zone").classList.remove("is-drag"); if (t === "drop" && state.owner && e.dataTransfer) addFiles(e.dataTransfer.files); }); });
    $("dc-demo").addEventListener("click", addDemo);
    $("dc-select").addEventListener("click", function () { state.selecting = !state.selecting; state.selected = {}; renderUpload(); });
    $("dc-assign-many").addEventListener("click", function () { openAssign(Object.keys(state.selected)); });
    $("dc-reset").addEventListener("click", resetCheck);
    $("dc-start").addEventListener("click", startScan);
    $("dc-scan-cancel").addEventListener("click", cancelScan);
    $("dc-assign-ok").addEventListener("click", applyAssign);
    $("dc-compare-ok").addEventListener("click", function () { close("dc-compare"); state.compared = true; toast("updated"); setTimeout(openMismatch, 250); });
    $("dc-mismatch-ok").addEventListener("click", saveDecisions);
    $("dc-confirm-ok").addEventListener("click", finishCheck);
    $("dc-view-save").addEventListener("click", function () { close("dc-view"); toast("updated"); });
    $("dc-delete-ok").addEventListener("click", function () { var r = ROWS.splice(state.viewRow, 1)[0]; close("dc-delete"); renderList(); toast("deleted"); });
    ["dc-f-name", "dc-f-type", "dc-f-date"].forEach(function (id) { $(id).addEventListener("input", renderList); $(id).addEventListener("change", renderList); });

    // Selecting files: the click must not reach the global "open file" handler.
    $("dc-files").addEventListener("click", function (e) {
        var card = e.target.closest(".dc-file");
        if (!card) return;
        var id = card.getAttribute("data-dc-file");
        var del = e.target.closest("[data-dc-del]"), as = e.target.closest("[data-dc-assign]");
        if (del) { e.stopPropagation(); state.files = state.files.filter(function (f) { return f.id !== id; }); delete state.selected[id]; renderUpload(); return; }
        if (state.selecting) { e.stopPropagation(); e.preventDefault(); if (state.selected[id]) delete state.selected[id]; else state.selected[id] = true; renderUpload(); return; }
        if (as) { e.stopPropagation(); openAssign([id]); }
    });
    document.addEventListener("change", function (e) {
        if (e.target.name === "dc-type") { state.assignType = e.target.value; $("dc-assign-ok").disabled = false; }
        var dec = e.target.getAttribute && e.target.getAttribute("data-dc-dec");
        if (dec !== null && dec !== undefined && e.target.type === "radio") { state.decisions[dec] = e.target.value; renderMismatch(); }
    });
    document.addEventListener("click", function (e) {
        var t;
        if ((t = e.target.closest("[data-dc-tab]"))) setTab(t.getAttribute("data-dc-tab"));
        else if ((t = e.target.closest("[data-dc-pick]"))) selectType(t.getAttribute("data-dc-type"), t.getAttribute("data-dc-pick"));
        else if ((t = e.target.closest(".emp-accordion__trigger[data-dc-type]"))) {
            var item = t.closest(".emp-accordion__item");
            if (t.getAttribute("data-dc-type") === state.type) item.classList.toggle("is-open"); else selectType(t.getAttribute("data-dc-type"));
        }
        else if ((t = e.target.closest("[data-dc-act]"))) {
            var a = t.getAttribute("data-dc-act");
            if (a === "next") nextDoc();
            else if (a === "back") backToUpload();
            else if (a === "compare") openCompare();
            else if (a === "save") saveCheck();
        }
        else if ((t = e.target.closest("[data-dc-page]"))) { state.page = Math.max(1, Math.min(2, state.page + +t.getAttribute("data-dc-page"))); renderReview(); }
        else if ((t = e.target.closest("[data-dc-zoom]"))) { var z = t.getAttribute("data-dc-zoom"); state.zoom = z === "fit" ? 100 : Math.max(50, Math.min(200, state.zoom + (z === "in" ? 25 : -25))); paintZoom(); }
        else if (e.target.closest("#dc-reload")) { toast("updated"); renderReview(); }
        else if ((t = e.target.closest("[data-dc-mm]"))) { state.mmTab = t.getAttribute("data-dc-mm"); renderMismatch(); }
        else if ((t = e.target.closest("[data-dc-view]"))) openView(+t.getAttribute("data-dc-view"), t.hasAttribute("data-dc-edit"));
        else if ((t = e.target.closest("[data-dc-delete]"))) { state.viewRow = +t.getAttribute("data-dc-delete"); $("dc-delete-text").textContent = "All documents of " + ROWS[state.viewRow].name + " and the check results will be deleted. This cannot be undone."; open("dc-delete"); }
        else if ((t = e.target.closest("[data-dc-vt]"))) { state.viewType = t.getAttribute("data-dc-vt"); var r = ROWS[state.viewRow]; renderView(LIST_COLS.filter(function (x, ci) { return r.s[ci] !== "-"; })); }
        else if ((t = e.target.closest("[data-dc-add]"))) { var f = t.closest(".dc-view__field"), copy = f.cloneNode(true); var lab = copy.querySelector(".emp-field__label"); lab.textContent = lab.textContent.replace(/\s*\d*$/, "") + " 2"; copy.querySelector(".emp-input__control").value = ""; var b = copy.querySelector("[data-dc-add]"); b.removeAttribute("data-dc-add"); b.setAttribute("data-dc-remove", ""); b.querySelector(".emp-btn__label").textContent = "Delete"; b.querySelector("use").setAttribute("href", "#dc-dash-circle-fill"); f.after(copy); copy.querySelector(".emp-input__control").focus(); }
        else if ((t = e.target.closest("[data-dc-remove]"))) t.closest(".dc-view__field").remove();
        else if (e.target.closest("[data-dc-open-file]") && $("preview-overlay")) open("preview-overlay");
    });

    renderUpload();
    renderList();
    if (/[?&]demo=check/.test(location.search)) {
        state.owner = "Company"; $("dc-owner").value = "Company";
        addDemo();
        var t = ["Driving license", "COI", "SSN"]; state.files.forEach(function (f, i) { f.type = t[i]; });
        renderUpload();
    }
})();
