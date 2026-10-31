(function () {
    var rows = document.getElementById("cd-rows");
    if (!rows) return;

    var OPTIONS = "New|Waiting for Pictures|Not answered|Called|Sent application|Interview Scheduled|In process of hiring|Hired|Declined";
    var STATUS = {
        "New": { icon: "flag.svg", tone: "new" },
        "Waiting for Pictures": { icon: "dots.svg", tone: "waiting" },
        "Not answered": { icon: "phone-x.svg", tone: "not" },
        "Called": { icon: "phone.svg", tone: "called" },
        "Sent application": { icon: "loading.svg", tone: "sent" },
        "Interview Scheduled": { icon: "calendar.svg", tone: "interview" },
        "In process of hiring": { icon: "check-loading.svg", tone: "process" },
        "Hired": { icon: "check.svg", tone: "hired" },
        "Declined": { icon: "x-circle.svg", tone: "declined" }
    };
    var MARK = {
        new: { icon: "", act: "icons/candidates/plus.svg", label: "Add check call" },
        missed: { icon: "x-circle.svg", act: "icons/candidates/pen.svg", label: "Edit check call" },
        called: { icon: "check.svg", act: "icons/action-menu/view.svg", label: "View check call" }
    };

    var PEOPLE = [
        { team: "MX", hr: "Winston Wolf", name: "Gregg Orn", place: "United States, Miami, FL, 33176", phone: "(305) 561-6591", mark: "new", email: "yagcargollc@gmail.com", find: "Website", link: "https://app.betterteam.com/jobs", cv: true, status: "New" },
        { team: "US", hr: "Winston Wolf", name: "Oliver Koelpin", place: "United States, Sheboygan, New Hampshire, 69026-8736", phone: "(385) 972-6525", mark: "new", email: "Levi.Stark98@gmail.com", find: "Betterteam", link: "https://app.betterteam.com/jobs", cv: true, status: "New" },
        { team: "MX", hr: "Matthew Hyde", name: "Brendan Feest", place: "United States, El Paso, Montana, 82009-0008", phone: "", mark: "", email: "Travis.Christiansen86@gmail.com", find: "Website", link: "", cv: true, status: "Waiting for Pictures" },
        { team: "LIA", hr: "", name: "Mrs. Mathew Emard", place: "United States, Kennewick, Mississippi, 26955", phone: "(230) 229-0814", mark: "missed", email: "Brando_Bartell@gmail.com", find: "Email", link: "https://app.betterteam.com/jobs", cv: true, status: "Not answered" },
        { team: "LIA", hr: "Ricky Norman", name: "Beulah King", place: "United States, Sierra Vista, Iowa, 64184-0364", phone: "(444) 280-2898", mark: "missed", email: "Jayde.Casper98@gmail.com", find: "Betterteam", link: "https://app.betterteam.com/jobs", cv: true, status: "Not answered" },
        { team: "LIA", hr: "Ricky Norman", name: "Rodolfo Ratke", place: "United States, San Bernardino, Oregon, 56616-5151", phone: "(305) 561-6991", mark: "called", email: "Quentin_Little11@gmail.com", find: "Betterteam", link: "https://app.betterteam.com/jobs", cv: true, status: "Called" },
        { team: "LIA", hr: "Ricky Norman", name: "Carlton Mante", place: "United States, Tampa, Alaska, 68150", phone: "(090) 562-3496", mark: "called", email: "Destini.Daniel@gmail.com", find: "Betterteam", link: "https://app.betterteam.com/jobs", cv: true, status: "Sent application" },
        { team: "MX", hr: "Matthew Hyde", name: "Rebecca Nienow", place: "United States, Aspen Hill, Vermont, 11398-6948", phone: "(741) 921-0555", mark: "called", email: "Retha.Kshlerin93@gmail.com", find: "Website", link: "https://app.betterteam.com/jobs", cv: true, status: "Interview Scheduled" },
        { team: "LIA", hr: "Ricky Norman", name: "Johanna Langworth", place: "United States, Pinellas Park, Virginia, 67413-2163", phone: "(391) 163-1865", mark: "called", email: "Antwon_Fadel31@gmail.com", find: "Website", link: "https://app.betterteam.com/jobs", cv: true, status: "In process of hiring" },
        { team: "MX", hr: "Winston Wolf", name: "Marianne Weissnat", place: "United States, Spokane, Utah, 97974-4550", phone: "(013) 719-9164", mark: "called", email: "Cassidy_Shields@gmail.com", find: "Call", link: "", cv: true, status: "Hired" }
    ];

    function esc(value) {
        return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
    }

    function statusField(status) {
        var spec = STATUS[status];
        return '<div class="emp-field emp-field--sm cd-status cd-status--' + spec.tone + '"><div class="emp-input"><img class="cd-status__icon" src="icons/candidates/' + spec.icon + '" alt="" width="12" height="12"><input class="emp-input__control" type="text" value="' + esc(status) + '" readonly data-emp-options="' + OPTIONS + '" data-cd-status aria-label="Status"><svg class="emp-input__chevron" viewBox="0 0 20 20" aria-hidden="true"><use href="#i-input-chevron"></use></svg></div></div>';
    }

    function menu() {
        return '<div class="emp-amenu"><button class="emp-amenu__hit" type="button" aria-label="Actions" aria-expanded="false"><span class="emp-amenu__dots"></span></button><span class="emp-amenu__list">'
            + '<button class="emp-amenu__item" type="button" data-cd-open="cd-view"><img src="icons/action-menu/view.svg" alt="" width="16" height="16">View candidate</button>'
            + '<button class="emp-amenu__item" type="button" data-cd-open="cd-edit" data-cd-edit><img src="icons/action-menu/edit.svg" alt="" width="16" height="16">Edit candidate</button>'
            + '<button class="emp-amenu__item emp-amenu__item--red" type="button" data-cd-open="cd-decline" data-cd-decline><img src="icons/candidates/decline.svg" alt="" width="16" height="16">Decline the candidate</button>'
            + '</span></div>';
    }

    function rowHtml(person, index) {
        var spec = MARK[person.mark] || { icon: "", act: "", label: "" };
        var mark = spec.icon ? '<img class="cd-phone__mark" src="icons/candidates/' + spec.icon + '" alt="" width="12" height="12">' : "";
        var act = person.phone ? '<button class="cd-ico cd-phone__act" type="button" data-cd-open="cd-check" aria-label="' + esc(spec.label) + '"><img src="' + spec.act + '" alt="" width="16" height="16"></button>' : "";
        var phone = person.phone ? '<span class="cd-phone__main"><span>' + esc(person.phone) + '</span>' + mark + '</span>' + act : "";
        var hr = person.hr ? esc(person.hr) : '<span class="emp-table__unset">(not set)</span>';
        var link = person.link ? '<a class="cd-hit" href="' + esc(person.link) + '" target="_blank" rel="noopener" aria-label="Open link"><img src="icons/candidates/link.svg" alt="" width="16" height="16"></a>' : "";
        var cv = person.cv ? '<button class="cd-hit" type="button" aria-label="CV"><img src="icons/candidates/pdf.svg" alt="" width="16" height="16"></button>' : "";
        return '<div class="emp-table__row" role="row" data-i="' + index + '" data-team="' + esc(person.team.toLowerCase()) + '" data-hr="' + esc((person.hr || "(not set)").toLowerCase()) + '" data-name="' + esc(person.name.toLowerCase()) + '" data-place="' + esc(person.place.toLowerCase()) + '" data-phone="' + esc(person.phone.toLowerCase()) + '" data-email="' + esc(person.email.toLowerCase()) + '" data-find="' + esc(person.find.toLowerCase()) + '" data-status="' + esc(person.status.toLowerCase()) + '" data-reason="poor english">'
            + '<div class="emp-table__cell"><p>' + esc(person.team) + '</p></div>'
            + '<div class="emp-table__cell"><p>' + hr + '</p></div>'
            + '<div class="emp-table__cell cd-when"><span>05/25/2026</span><span>06:20 AM</span></div>'
            + '<div class="emp-table__cell"><button class="cd-name emp-table__link" type="button" data-cd-open="cd-view">' + esc(person.name) + '</button></div>'
            + '<div class="emp-table__cell cd-place"><p>' + esc(person.place) + '</p></div>'
            + '<div class="emp-table__cell cd-phone">' + phone + '</div>'
            + '<div class="emp-table__cell"><p>' + esc(person.email) + '</p></div>'
            + '<div class="emp-table__cell"><p>' + esc(person.find) + '</p></div>'
            + '<div class="emp-table__cell cd-mid">' + link + '</div>'
            + '<div class="emp-table__cell cd-mid">' + cv + '</div>'
            + '<div class="emp-table__cell cd-last">' + statusField(person.status)
            + '<div class="cd-reason"><p><span class="cd-reason__k">Reason:</span> Poor English</p><p><span class="cd-reason__k">Note:</span> Coment////</p></div></div>'
            + menu()
            + '</div>';
    }

    rows.innerHTML = PEOPLE.map(rowHtml).join("");

    function personFrom(node) {
        var row = node && node.closest(".emp-table__row");
        if (!row) return null;
        return PEOPLE[Number(row.getAttribute("data-i"))] || null;
    }

    function paintStatus(input) {
        var spec = STATUS[input.value];
        if (!spec) return;
        var field = input.closest(".cd-status");
        if (!field) return;
        field.className = "emp-field cd-status cd-status--" + spec.tone + (field.classList.contains("emp-field--sm") ? " emp-field--sm" : "");
        var icon = field.querySelector(".cd-status__icon");
        if (icon) icon.src = "icons/candidates/" + spec.icon;
        var row = input.closest(".emp-table__row");
        if (row) row.setAttribute("data-status", input.value.toLowerCase());
    }

    function paintPill(pill, status) {
        var spec = STATUS[status] || STATUS.New;
        pill.className = "emp-pill cd-pill cd-tone--" + spec.tone;
        pill.innerHTML = '<img src="icons/candidates/' + spec.icon + '" alt="" width="12" height="12"><span></span>';
        pill.querySelector("span").textContent = status;
    }

    function text(id, value) {
        var node = document.getElementById(id);
        if (node) node.textContent = value || "—";
    }

    function fillView(person) {
        text("cd-view-name", person.name);
        paintPill(document.getElementById("cd-view-pill"), person.status);
        text("cd-view-location", person.place);
        text("cd-view-phone", person.phone);
        text("cd-view-email", person.email);
        text("cd-view-find", person.find);
        text("cd-view-hr", person.hr || "(not set)");
        text("cd-view-note", "—");
    }

    function fillDecline(person) {
        text("cd-decline-name", person.name);
        text("cd-decline-phone", person.phone);
        paintPill(document.getElementById("cd-decline-pill"), person.status);
    }

    function fillCheck(person) {
        text("cd-check-name", person.name);
        text("cd-check-phone", person.phone);
        paintPill(document.getElementById("cd-check-pill"), person.status);
    }

    function setValue(id, value) {
        var node = document.getElementById(id);
        if (node) node.value = value || "";
    }

    function fillEdit(person) {
        setValue("cd-edit-name", person.name);
        setValue("cd-edit-location", person.place);
        setValue("cd-edit-phone", person.phone);
        setValue("cd-edit-email", person.email);
        setValue("cd-edit-find", person.find);
        setValue("cd-edit-status", person.status);
        setValue("cd-edit-note", "");
        setValue("cd-edit-hr", person.hr);
        setValue("cd-edit-link", person.link);
        var status = document.getElementById("cd-edit-status");
        if (status) paintStatus(status);
    }

    function clearCreate() {
        ["cd-create-name", "cd-create-location", "cd-create-phone", "cd-create-email", "cd-create-note", "cd-create-link"].forEach(function (id) {
            setValue(id, "");
        });
        setValue("cd-create-find", "");
        setValue("cd-create-hr", "");
        setValue("cd-create-status", "New");
        var status = document.getElementById("cd-create-status");
        if (status) paintStatus(status);
    }

    function openOverlay(id) {
        if (window.empCloseMenus) window.empCloseMenus();
        document.querySelectorAll(".emp-overlay.is-open").forEach(function (overlay) {
            overlay.classList.remove("is-open");
        });
        var overlay = document.getElementById(id);
        if (!overlay) return;
        overlay.classList.add("is-open");
        document.body.style.overflow = "hidden";
    }

    function closeOpen() {
        document.querySelectorAll(".emp-overlay.is-open").forEach(function (overlay) {
            overlay.classList.remove("is-open");
        });
        document.body.style.overflow = "";
    }

    function setTab(tab) {
        var declined = tab === "declined";
        document.querySelector(".cd-table").classList.toggle("is-declined", declined);
        var phoneLabel = document.getElementById("cd-phone-label");
        var lastLabel = document.getElementById("cd-last-label");
        var lastInput = document.querySelector("[data-cd-filter='status']");
        if (phoneLabel) phoneLabel.textContent = declined ? "Cell phone" : "Phone number";
        if (lastLabel) lastLabel.textContent = declined ? "Reason of decline" : "Status";
        if (lastInput) {
            lastInput.placeholder = declined ? "Choose status" : "Select status";
            lastInput.value = "";
        }
        document.querySelectorAll("[data-cd-decline]").forEach(function (button) {
            button.setAttribute("data-cd-open", declined ? "cd-return" : "cd-decline");
        });
        paint();
    }

    function paint() {
        var declined = document.querySelector(".cd-table").classList.contains("is-declined");
        var query = {};
        document.querySelectorAll("[data-cd-filter]").forEach(function (input) {
            query[input.getAttribute("data-cd-filter")] = input.value.trim().toLowerCase();
        });
        Array.prototype.forEach.call(rows.children, function (row) {
            var ok = true;
            ["team", "hr", "name", "place", "phone", "email", "find"].forEach(function (key) {
                if (query[key] && (row.getAttribute("data-" + key) || "").indexOf(query[key]) === -1) ok = false;
            });
            if (query.status) {
                var field = declined ? "reason" : "status";
                if ((row.getAttribute("data-" + field) || "").indexOf(query.status) === -1) ok = false;
            }
            row.hidden = !ok;
        });
    }

    rows.addEventListener("input", function (event) {
        if (event.target.hasAttribute("data-cd-status")) paintStatus(event.target);
    });
    document.querySelectorAll("[data-cd-filter]").forEach(function (input) {
        input.addEventListener("input", paint);
    });
    document.querySelectorAll("[data-cd-tab]").forEach(function (button) {
        button.addEventListener("click", function () { setTab(button.getAttribute("data-cd-tab")); });
    });
    document.addEventListener("click", function (event) {
        var opener = event.target.closest("[data-cd-open]");
        if (!opener) return;
        var id = opener.getAttribute("data-cd-open");
        var person = personFrom(opener);
        if (id === "cd-view" && person) fillView(person);
        if (id === "cd-edit" && person) fillEdit(person);
        if (id === "cd-decline" && person) fillDecline(person);
        if (id === "cd-check" && person) fillCheck(person);
        if (id === "cd-create") clearCreate();
        openOverlay(id);
    });
    document.addEventListener("submit", function (event) {
        var form = event.target.closest("#cd-create, #cd-edit, #cd-decline, #cd-export, #cd-check");
        if (!form) return;
        event.preventDefault();
        closeOpen();
    });
})();
