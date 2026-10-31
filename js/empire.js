(function () {
    var clocks = document.querySelectorAll("[data-emp-clock]");
    function paintClocks() {
        if (!clocks.length) return;
        var parts = new Intl.DateTimeFormat("en-US", {
            timeZone: "America/New_York",
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        }).formatToParts(new Date());
        var read = {};
        parts.forEach(function (part) { read[part.type] = part.value; });
        var text = read.hour + ":" + read.minute + " " + read.dayPeriod;
        clocks.forEach(function (node) { node.textContent = text; });
    }
    paintClocks();
    if (clocks.length) setInterval(paintClocks, 30000);

    function setShowOpen(combo, open) {
        combo.classList.toggle("is-open", open);
        var button = combo.querySelector(".emp-input__chevron-btn");
        if (button) button.setAttribute("aria-expanded", open ? "true" : "false");
    }
    document.querySelectorAll("[data-emp-show]").forEach(function (combo) {
        var input = combo.querySelector(".emp-input__control");
        combo.addEventListener("click", function (event) {
            var item = event.target.closest("[data-size]");
            if (!item) {
                setShowOpen(combo, !combo.classList.contains("is-open"));
                return;
            }
            var size = item.getAttribute("data-size");
            input.value = size;
            combo.querySelectorAll(".emp-drop__item").forEach(function (entry) {
                entry.classList.toggle("is-selected", entry === item);
            });
            var meta = combo.closest(".emp-meta");
            var range = meta && meta.querySelector("[data-emp-show-range]");
            if (range) range.textContent = "1-" + size;
            setShowOpen(combo, false);
            input.dispatchEvent(new Event("change", { bubbles: true }));
        });
    });

    function closeMenus(except) {
        document.querySelectorAll(".emp-amenu.is-open").forEach(function (menu) {
            if (menu === except || !menu.querySelector(".emp-amenu__list")) return;
            menu.classList.remove("is-open");
            var hit = menu.querySelector(".emp-amenu__hit");
            if (hit) hit.setAttribute("aria-expanded", "false");
        });
    }
    window.empCloseMenus = function () { closeMenus(null); };

    document.addEventListener("click", function (event) {
        var hit = event.target.closest(".emp-amenu__hit");
        var menu = hit && hit.closest(".emp-amenu");
        if (menu && menu.querySelector(".emp-amenu__list")) {
            var open = !menu.classList.contains("is-open");
            closeMenus(menu);
            menu.classList.toggle("is-open", open);
            hit.setAttribute("aria-expanded", open ? "true" : "false");
        } else if (!event.target.closest(".emp-amenu__list") || event.target.closest(".emp-amenu__item")) {
            closeMenus(null);
        }
        document.querySelectorAll("[data-emp-show].is-open").forEach(function (combo) {
            if (!combo.contains(event.target)) setShowOpen(combo, false);
        });

        var copy = event.target.closest(".emp-copy");
        if (copy) {
            var holder = copy.closest(".emp-kv__row, [data-copy-row]");
            var source = holder && holder.querySelector(".emp-kv__value, [data-copy]");
            if (source) copyText(source.textContent.trim());
        }
    });
    document.addEventListener("keydown", function (event) {
        if (event.key !== "Escape") return;
        closeMenus(null);
        document.querySelectorAll("[data-emp-show].is-open").forEach(function (combo) { setShowOpen(combo, false); });
    });

    function copied() { if (window.empToast) window.empToast("copied"); }
    function fallbackCopy(value) {
        var area = document.createElement("textarea");
        area.value = value;
        area.setAttribute("readonly", "");
        area.className = "emp-copy-sink";
        document.body.appendChild(area);
        area.select();
        try { document.execCommand("copy"); } catch (error) { /* clipboard blocked */ }
        area.remove();
    }
    function copyText(value) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(value).then(copied, function () {
                fallbackCopy(value);
                copied();
            });
            return;
        }
        fallbackCopy(value);
        copied();
    }
})();

(function () {
    var root = document.documentElement;
    var themeInput = document.getElementById("theme-toggle");
    var themeLabel = document.getElementById("theme-label");

    function applyTheme(theme) {
        root.setAttribute("data-theme", theme);
        localStorage.setItem("emp-theme", theme);
        if (themeInput) themeInput.checked = theme === "dark";
        if (themeLabel) themeLabel.textContent = theme === "dark" ? "Dark" : "Light";
    }

    if (themeInput) {
        themeInput.addEventListener("change", function () {
            applyTheme(themeInput.checked ? "dark" : "light");
        });
        applyTheme(root.getAttribute("data-theme") === "dark" ? "dark" : "light");
    }

    document.querySelectorAll("[data-emp-tabs]").forEach(function (tabs) {
        var buttons = tabs.querySelectorAll(".emp-tab");
        var panels = tabs.querySelectorAll(".emp-tabs__panel");
        buttons.forEach(function (button, index) {
            button.addEventListener("click", function () {
                buttons.forEach(function (item) {
                    item.classList.remove("is-active");
                    item.setAttribute("aria-selected", "false");
                });
                panels.forEach(function (panel) { panel.hidden = true; });
                button.classList.add("is-active");
                button.setAttribute("aria-selected", "true");
                if (panels[index]) panels[index].hidden = false;
            });
        });
    });

    document.querySelectorAll("[data-emp-accordion]").forEach(function (accordion) {
        accordion.querySelectorAll(".emp-accordion__trigger").forEach(function (trigger) {
            trigger.addEventListener("click", function () {
                var item = trigger.closest(".emp-accordion__item");
                var open = item.classList.contains("is-open");
                accordion.querySelectorAll(".emp-accordion__item").forEach(function (node) {
                    node.classList.remove("is-open");
                });
                if (!open) item.classList.add("is-open");
            });
        });
    });

    document.querySelectorAll("[data-emp-pages]").forEach(function (pager) {
        var pages = Array.prototype.slice.call(pager.querySelectorAll(".emp-page[data-page]"));
        var prev = pager.querySelector(".emp-page__arrow[aria-label='Back']");
        var next = pager.querySelector(".emp-page__arrow[aria-label='Forward']");
        function activeIndex() {
            var index = 0;
            pages.forEach(function (item, i) {
                if (item.classList.contains("is-active")) index = i;
            });
            return index;
        }
        function select(index) {
            if (index < 0 || index >= pages.length) return;
            pages.forEach(function (item) { item.classList.remove("is-active"); });
            pages[index].classList.add("is-active");
            var atStart = index === 0;
            var atEnd = index === pages.length - 1;
            if (prev) {
                prev.classList.toggle("is-inactive", atStart);
                prev.disabled = atStart;
            }
            if (next) {
                next.classList.toggle("is-inactive", atEnd);
                next.disabled = atEnd;
            }
        }
        pages.forEach(function (page, index) {
            page.addEventListener("click", function () { select(index); });
        });
        if (prev) prev.addEventListener("click", function () { select(activeIndex() - 1); });
        if (next) next.addEventListener("click", function () { select(activeIndex() + 1); });
    });

    document.querySelectorAll("[data-emp-chip]").forEach(function (chip) {
        var remove = chip.querySelector(".emp-chip__x");
        if (!remove) return;
        remove.addEventListener("click", function (event) {
            event.stopPropagation();
            chip.remove();
        });
        chip.addEventListener("click", function () {
            chip.classList.toggle("is-active");
        });
    });

    var mixed = document.getElementById("check-mixed");
    if (mixed) mixed.indeterminate = true;

    function fileActions() {
        return '<div class="emp-file__mid"><button class="emp-file__act emp-file__act--open" type="button" aria-label="Open"><svg viewBox="0 0 20 20" aria-hidden="true"><use href="#i-file-open"></use></svg></button></div>' +
            '<div class="emp-file__bot">' +
                '<button class="emp-file__act emp-file__act--delete" type="button" aria-label="Delete"><svg viewBox="0 0 20 20" aria-hidden="true"><use href="#i-trash"></use></svg></button>' +
                '<button class="emp-file__act emp-file__act--download" type="button" aria-label="Download"><svg viewBox="0 0 20 20" aria-hidden="true"><use href="#i-download"></use></svg></button>' +
                '<button class="emp-file__act" type="button" aria-label="More"><svg viewBox="0 0 20 20" aria-hidden="true"><use href="#i-file-dots"></use></svg></button>' +
            '</div>';
    }

    document.querySelectorAll("[data-emp-upload]").forEach(function (zone) {
        var drop = zone.querySelector(".emp-upload__drop");
        var input = zone.querySelector(".emp-upload__file");
        var content = zone.querySelector(".emp-upload__content");
        if (!drop || !input || !content) return;

        // File kinds from Figma "File preview": 12px type marker + 80px placeholder when there is no preview.
        var KINDS = {
            image: ["file-image", "ph-image"],
            pdf: ["file-pdf", "file-rich"],
            doc: ["file-word", "ph-text"],
            excel: ["file-excel", "ph-table"],
            text: ["file-text", "ph-text"],
            video: ["file-play", "ph-video"],
            archive: ["file-zip", "ph-zip"],
            sound: ["file-music", "soundwave"],
            other: ["file-other", "ph-other"]
        };
        function kindOf(file) {
            var name = file.name || "";
            var type = file.type || "";
            if (type.indexOf("image/") === 0) return "image";
            if (type === "application/pdf" || /\.pdf$/i.test(name)) return "pdf";
            if (/\.(docx?|odt|rtf)$/i.test(name)) return "doc";
            if (/\.(xlsx?|csv|ods)$/i.test(name)) return "excel";
            if (type === "text/plain" || /\.(txt|md)$/i.test(name)) return "text";
            if (type.indexOf("video/") === 0) return "video";
            if (type.indexOf("audio/") === 0) return "sound";
            if (/\.(zip|rar|7z|tar|gz)$/i.test(name)) return "archive";
            return "other";
        }

        function card(file) {
            var item = document.createElement("article");
            var kind = KINDS[kindOf(file)];
            item.className = "emp-file";
            var image = file.type.indexOf("image/") === 0;
            var url = image ? URL.createObjectURL(file) : "";
            if (url) item.setAttribute("data-url", url);
            if (!image) item.classList.add("emp-file--empty");
            var media = image
                ? '<img class="emp-file__img" src="' + url + '" alt="">'
                : '<img class="emp-file__ghost" src="icons/upload/' + kind[1] + '.svg" alt="" width="80" height="80">';
            item.innerHTML = media +
                '<div class="emp-file__shade">' +
                    '<div class="emp-file__top">' +
                        '<span class="emp-file__line"><img class="emp-file__type" src="icons/upload/' + kind[0] + '.svg" alt="" width="12" height="12"><span class="emp-file__name"></span></span>' +
                        '<span class="emp-file__kind">Attachment type</span>' +
                    '</div>' +
                    fileActions() +
                '</div>';
            item.querySelector(".emp-file__name").textContent = file.name;
            item.querySelector(".emp-file__act--open").addEventListener("click", function (event) {
                if (document.querySelector(".emp-preview")) return;
                event.stopPropagation();
                if (url) window.open(url, "_blank");
            });
            item.querySelector(".emp-file__act--download").addEventListener("click", function (event) {
                event.stopPropagation();
                var link = document.createElement("a");
                link.href = url || URL.createObjectURL(file);
                link.download = file.name;
                link.click();
            });
            item.querySelector(".emp-file__act--delete").addEventListener("click", function (event) {
                event.stopPropagation();
                if (url) URL.revokeObjectURL(url);
                item.remove();
            });
            return item;
        }

        function addFiles(list) {
            Array.prototype.forEach.call(list, function (file) {
                content.insertBefore(card(file), drop);
            });
        }

        var samples = [
            { name: "photo.jpeg", src: "icons/upload/photo.jpeg.png", icon: "i-file-image", pdf: false },
            { name: "BOL.pdf", src: "icons/upload/bol.png", icon: "i-file-pdf", pdf: true },
            { name: "VID_123_45.mp4", src: "icons/upload/video.png", icon: "i-file-play", pdf: false }
        ];
        var sampleAt = 0;
        function sampleCard(sample) {
            var item = document.createElement("article");
            item.className = "emp-file" + (sample.pdf ? " emp-file--pdf" : "");
            item.innerHTML =
                '<img class="emp-file__img" src="' + sample.src + '" alt="">' +
                '<div class="emp-file__shade">' +
                    '<div class="emp-file__top">' +
                        '<span class="emp-file__line"><svg class="emp-file__type" viewBox="0 0 12 12" aria-hidden="true"><use href="#' + sample.icon + '"></use></svg><span class="emp-file__name"></span></span>' +
                        '<span class="emp-file__kind">Attachment type</span>' +
                    '</div>' +
                    fileActions() +
                '</div>';
            item.querySelector(".emp-file__name").textContent = sample.name;
            item.querySelector(".emp-file__act--delete").addEventListener("click", function (event) {
                event.stopPropagation();
                item.remove();
            });
            return item;
        }
        var add = zone.parentElement.querySelector("[data-upload-add]");
        if (add) {
            add.addEventListener("click", function () {
                content.insertBefore(sampleCard(samples[sampleAt % samples.length]), drop);
                sampleAt += 1;
            });
        }

        drop.addEventListener("click", function (event) {
            if (event.target.closest(".emp-file__act")) return;
            input.click();
        });
        drop.addEventListener("keydown", function (event) {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            input.click();
        });
        input.addEventListener("change", function () {
            addFiles(input.files);
            input.value = "";
        });
        drop.addEventListener("dragenter", function (event) {
            event.preventDefault();
            zone.classList.add("is-drag");
        });
        drop.addEventListener("dragover", function (event) {
            event.preventDefault();
            if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
        });
        drop.addEventListener("dragleave", function (event) {
            if (event.relatedTarget && drop.contains(event.relatedTarget)) return;
            zone.classList.remove("is-drag");
        });
        drop.addEventListener("drop", function (event) {
            event.preventDefault();
            zone.classList.remove("is-drag");
            if (event.dataTransfer) addFiles(event.dataTransfer.files);
        });
    });

    var dateMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var dateWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    function datePad(value) {
        return value < 10 ? "0" + value : String(value);
    }

    function dateKey(year, month, day) {
        return year * 10000 + month * 100 + day;
    }

    function dateText(key) {
        var year = Math.floor(key / 10000);
        var month = Math.floor((key % 10000) / 100);
        var day = key % 100;
        return datePad(month) + "/" + datePad(day) + "/" + year;
    }

    function dateAbs(year, month) {
        return year * 12 + (month - 1);
    }

    document.querySelectorAll("[data-emp-date]").forEach(function (root) {
        var mode = root.getAttribute("data-emp-date");
        var ranged = mode === "range" || mode === "double";
        var today = new Date();
        var todayKey = dateKey(today.getFullYear(), today.getMonth() + 1, today.getDate());
        var cursor = dateAbs(today.getFullYear(), today.getMonth() + 1);
        var view = "days";
        var viewSide = 0;
        var yearBase = today.getFullYear() - (today.getFullYear() % 12);
        var draftStart = null;
        var draftEnd = null;
        var appliedStart = null;
        var appliedEnd = null;
        var panel = root.querySelector(".emp-date__panel");
        var value = root.querySelector(".emp-date__value");
        var time = root.querySelector(".emp-date__time");

        function paneYear(side) {
            var abs = cursor + side;
            return Math.floor(abs / 12);
        }

        function paneMonth(side) {
            return (cursor + side) % 12;
        }

        function complete() {
            return draftStart !== null && (!ranged || draftEnd !== null);
        }

        function paintValue() {
            if (appliedStart === null) {
                value.textContent = ranged ? "MM/DD/YYYY - MM/DD/YYYY" : "MM/DD/YYYY";
                value.classList.add("is-empty");
                return;
            }
            value.classList.remove("is-empty");
            value.textContent = ranged ? dateText(appliedStart) + " - " + dateText(appliedEnd) : dateText(appliedStart);
        }

        function summaryHtml() {
            if (mode === "time") {
                var datePart = draftStart === null
                    ? '<span class="is-empty">MM/DD/YYYY,</span>'
                    : "<span>" + dateText(draftStart) + ",</span>";
                var clock = time && time.value.trim() ? time.value.trim() : "";
                var timePart = clock
                    ? "<span>" + clock + "</span>"
                    : '<span class="is-empty">hh:mm</span>';
                return datePart + timePart;
            }
            if (!ranged) {
                return draftStart === null
                    ? '<span class="is-empty">MM/DD/YYYY</span>'
                    : "<span>" + dateText(draftStart) + "</span>";
            }
            if (draftStart === null) return '<span class="is-empty">MM/DD/YYYY - MM/DD/YYYY</span>';
            if (draftEnd === null) return "<span>" + dateText(draftStart) + ' - </span><span class="is-empty">MM/DD/YYYY</span>';
            return "<span>" + dateText(Math.min(draftStart, draftEnd)) + " - " + dateText(Math.max(draftStart, draftEnd)) + "</span>";
        }

        function dayClass(key) {
            if (draftStart === null) return "";
            if (!ranged || draftEnd === null) return key === draftStart ? " is-selected" : "";
            var start = Math.min(draftStart, draftEnd);
            var end = Math.max(draftStart, draftEnd);
            if (start === end && key === start) return " is-selected";
            var name = "";
            if (key === start) name += " is-selected is-start";
            else if (key === end) name += " is-selected is-end";
            else if (key > start && key < end) name += " is-range";
            return name;
        }

        function daysFor(side) {
            var year = paneYear(side);
            var month = paneMonth(side);
            var first = new Date(year, month, 1).getDay();
            var count = new Date(year, month + 1, 0).getDate();
            var cells = [];
            var index;
            for (index = 0; index < first; index += 1) {
                var prev = new Date(year, month, 1 - (first - index));
                cells.push({ year: prev.getFullYear(), month: prev.getMonth() + 1, day: prev.getDate(), out: true });
            }
            for (index = 1; index <= count; index += 1) cells.push({ year: year, month: month + 1, day: index, out: false });
            while (cells.length % 7 !== 0) {
                var last = cells[cells.length - 1];
                var next = new Date(last.year, last.month - 1, last.day + 1);
                cells.push({ year: next.getFullYear(), month: next.getMonth() + 1, day: next.getDate(), out: true });
            }
            return cells;
        }

        function monthMarkup(side) {
            var year = paneYear(side);
            var month = paneMonth(side);
            var nav = "";
            if (side === 0) {
                nav = '<button class="emp-date__nav" type="button" data-act="prev" aria-label="Previous"><svg viewBox="0 0 16 16" aria-hidden="true"><use href="#i-date-prev"></use></svg></button>';
            }
            var title = '<div class="emp-date__title">' +
                '<button class="emp-date__pick" type="button" data-act="months">' + dateMonths[month] + '</button>' +
                '<button class="emp-date__pick" type="button" data-act="years">' + year + '</button>' +
                '</div>';
            if (side === (mode === "double" ? 1 : 0)) {
                nav += title;
                nav += '<button class="emp-date__nav" type="button" data-act="next" aria-label="Next"><svg viewBox="0 0 16 16" aria-hidden="true"><use href="#i-date-next"></use></svg></button>';
                if (side === 0) nav = '<button class="emp-date__nav" type="button" data-act="prev" aria-label="Previous"><svg viewBox="0 0 16 16" aria-hidden="true"><use href="#i-date-prev"></use></svg></button>' + title +
                    '<button class="emp-date__nav" type="button" data-act="next" aria-label="Next"><svg viewBox="0 0 16 16" aria-hidden="true"><use href="#i-date-next"></use></svg></button>';
            } else {
                nav += title;
            }
            var body = "";
            if (view === "days" || viewSide !== side) {
                var week = dateWeek.map(function (name) { return "<span>" + name + "</span>"; }).join("");
                var cells = daysFor(side).map(function (cell) {
                    var key = dateKey(cell.year, cell.month, cell.day);
                    var dot = key === todayKey ? '<span class="emp-date__dot"></span>' : "";
                    return '<button class="emp-date__day' + (cell.out ? " is-out" : "") + dayClass(key) + '" type="button" data-act="day" data-key="' + key + '"><span class="emp-date__fill">' + cell.day + dot + '</span></button>';
                }).join("");
                body = '<div class="emp-date__week">' + week + '</div><div class="emp-date__grid">' + cells + '</div>';
            } else if (view === "months") {
                var months = dateMonths.map(function (name, index) {
                    return '<button class="emp-date__choice' + (index === month ? " is-selected" : "") + '" type="button" data-act="month" data-month="' + (index + 1) + '">' + name + '</button>';
                }).join("");
                body = '<div class="emp-date__choices">' + months + '</div>';
            } else {
                var years = "";
                var offset;
                for (offset = 0; offset < 12; offset += 1) {
                    var item = yearBase + offset;
                    years += '<button class="emp-date__choice' + (item === year ? " is-selected" : "") + '" type="button" data-act="year" data-year="' + item + '">' + item + '</button>';
                }
                body = '<div class="emp-date__choices">' + years + '</div>';
            }
            return '<div class="emp-date__month" data-side="' + side + '"><div class="emp-date__head">' + nav + '</div>' + body + '</div>';
        }

        function render() {
            var panes = monthMarkup(0);
            if (mode === "double") panes += monthMarkup(1);
            var ready = complete();
            var clean = draftStart === null;
            panel.innerHTML =
                '<div class="emp-date__months">' + panes + '</div>' +
                '<div class="emp-date__foot">' +
                    '<div class="emp-date__summary">' + summaryHtml() + '</div>' +
                    '<div class="emp-date__actions">' +
                        '<button class="emp-btn emp-btn--secondary emp-btn--md" type="button" data-act="clean"' + (clean ? " disabled" : "") + '>Clean</button>' +
                        '<button class="emp-btn emp-btn--outline emp-btn--md" type="button" data-act="cancel">Cancel</button>' +
                        '<button class="emp-btn emp-btn--primary emp-btn--md" type="button" data-act="apply"' + (ready ? "" : " disabled") + '>Apply</button>' +
                    '</div>' +
                '</div>';
        }

        function open() {
            document.querySelectorAll("[data-emp-date].is-open").forEach(function (other) {
                if (other !== root) other.classList.remove("is-open");
            });
            draftStart = appliedStart;
            draftEnd = appliedEnd;
            view = "days";
            render();
            root.classList.add("is-open");
        }

        function close() {
            root.classList.remove("is-open");
        }

        function showKey(key) {
            var year = Math.floor(key / 10000);
            var month = Math.floor((key % 10000) / 100);
            var abs = dateAbs(year, month);
            if (mode === "double") {
                if (abs !== cursor && abs !== cursor + 1) cursor = abs;
            } else {
                cursor = abs;
            }
        }

        var field = root.querySelector(".emp-date__field");
        field.addEventListener("click", function (event) {
            if (event.target.closest(".emp-ampm")) return;
            if (event.target.closest(".emp-date__time")) {
                open();
                return;
            }
            if (root.classList.contains("is-open")) close();
            else open();
        });
        if (time) {
            time.addEventListener("input", function () {
                if (root.classList.contains("is-open")) render();
            });
        }
        root.querySelectorAll("[data-half]").forEach(function (half) {
            half.addEventListener("click", function () {
                root.querySelectorAll("[data-half]").forEach(function (item) {
                    item.classList.toggle("is-on", item === half);
                });
                if (root.classList.contains("is-open")) render();
            });
        });
        function onPanel(event) {
            var button = event.target.closest("button");
            if (!button || !panel.contains(button)) return;
            var act = button.getAttribute("data-act");
            var sideNode = button.closest(".emp-date__month");
            var side = sideNode ? Number(sideNode.getAttribute("data-side")) : 0;
            if (act === "prev" || act === "next") {
                var step = act === "prev" ? -1 : 1;
                if (view === "years") yearBase += step * 12;
                else if (view === "months") cursor += step * 12;
                else cursor += step;
                render();
            } else if (act === "months" || act === "years") {
                viewSide = side;
                if (act === "years") yearBase = paneYear(side) - (paneYear(side) % 12);
                view = view === (act === "months" ? "months" : "years") ? "days" : (act === "months" ? "months" : "years");
                render();
            } else if (act === "month") {
                var picked = paneYear(viewSide) * 12 + (Number(button.getAttribute("data-month")) - 1);
                cursor = viewSide === 1 ? picked - 1 : picked;
                view = "days";
                render();
            } else if (act === "year") {
                var nextYear = Number(button.getAttribute("data-year"));
                var keep = paneMonth(viewSide);
                var abs = nextYear * 12 + keep;
                cursor = viewSide === 1 ? abs - 1 : abs;
                view = "days";
                render();
            } else if (act === "day") {
                var key = Number(button.getAttribute("data-key"));
                if (!ranged) draftStart = key;
                else if (draftStart === null || draftEnd !== null) {
                    draftStart = key;
                    draftEnd = null;
                } else draftEnd = key;
                showKey(key);
                view = "days";
                render();
            } else if (act === "clean") {
                draftStart = null;
                draftEnd = null;
                render();
            } else if (act === "cancel") {
                close();
            } else if (act === "apply" && complete()) {
                appliedStart = ranged ? Math.min(draftStart, draftEnd) : draftStart;
                appliedEnd = ranged ? Math.max(draftStart, draftEnd) : null;
                paintValue();
                close();
            }
        }
        panel.addEventListener("click", onPanel);
        document.addEventListener("mousedown", function (event) {
            if (!root.contains(event.target)) close();
        });
    });

    document.addEventListener("keydown", function (event) {
        if (event.key !== "Escape") return;
        document.querySelectorAll("[data-emp-date].is-open").forEach(function (root) {
            root.classList.remove("is-open");
        });
    });

    var form = document.getElementById("field-check");
    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var field = form.querySelector(".emp-field");
            var input = field.querySelector(".emp-input__control");
            var help = field.querySelector(".emp-field__help");
            var empty = input.value.trim() === "";
            field.classList.toggle("is-required", empty);
            help.textContent = empty ? "This field is required" : "";
        });
    }

    var people = [
        { id: "4444", code: "4444", name: "Alex Green", initials: "AG", tone: "purple" },
        { id: "0000", code: "0000", name: "John Smith", initials: "AG", tone: "green" }
    ];

    document.querySelectorAll("#fields .emp-field").forEach(function (field) {
        if (field.closest(".emp-combo") || field.classList.contains("is-disabled")) return;
        var box = field.querySelector(".emp-input");
        if (box && box.classList.contains("emp-input--extended")) return;
        var control = box && box.querySelector(".emp-input__control");
        var chevron = box && box.querySelector(".emp-input__chevron");
        if (!box || !control || !chevron || control.disabled || chevron.closest("button")) return;
        var combo = document.createElement("div");
        combo.className = "emp-combo";
        combo.setAttribute("data-emp-suggest", "");
        field.parentNode.insertBefore(combo, field);
        combo.appendChild(field);
        var anchor = document.createElement("div");
        anchor.className = "emp-combo__anchor";
        box.parentNode.insertBefore(anchor, box);
        anchor.appendChild(box);
        var button = document.createElement("button");
        button.type = "button";
        button.className = "emp-input__chevron-btn";
        button.setAttribute("aria-label", "Open suggestions");
        button.setAttribute("aria-expanded", "false");
        chevron.parentNode.insertBefore(button, chevron);
        button.appendChild(chevron);
        var drop = document.createElement("div");
        drop.className = "emp-drop";
        anchor.appendChild(drop);
        control.setAttribute("autocomplete", "off");
    });

    function closeCombos(except) {
        document.querySelectorAll(".emp-combo.is-open").forEach(function (combo) {
            if (combo !== except) setComboOpen(combo, false);
        });
    }

    function setComboOpen(combo, open) {
        var drop = combo.querySelector(".emp-drop");
        var button = combo.querySelector(".emp-input__chevron-btn");
        combo.classList.toggle("is-open", open);
        if (drop) drop.hidden = !open;
        if (button) button.setAttribute("aria-expanded", open ? "true" : "false");
    }

    function showCombo(combo) {
        combo.querySelectorAll(".emp-drop__item").forEach(function (item) { item.hidden = false; });
        var empty = combo.querySelector(".emp-drop__empty");
        if (empty) empty.hidden = true;
    }

    function filterCombo(combo) {
        var input = combo.querySelector(".emp-input__control");
        var query = input.value.trim().toLowerCase();
        var visible = 0;
        combo.querySelectorAll(".emp-drop__item").forEach(function (item) {
            var match = !query || item.getAttribute("data-search").indexOf(query) !== -1;
            item.hidden = !match;
            if (match) visible += 1;
        });
        var empty = combo.querySelector(".emp-drop__empty");
        if (empty) empty.hidden = visible !== 0;
    }

    function buildDrop(combo, mode) {
        var drop = combo.querySelector(".emp-drop");
        people.forEach(function (person) {
            var item = document.createElement("button");
            item.type = "button";
            item.className = "emp-drop__item";
            item.setAttribute("data-id", person.id);
            item.setAttribute("data-name", person.name);
            item.setAttribute("data-search", (person.code + " " + person.name).toLowerCase());
            if (mode === "multi") {
                var box = document.createElement("span");
                box.className = "emp-drop__box";
                item.appendChild(box);
            }
            var avatar = document.createElement("span");
            avatar.className = "emp-drop__ava emp-drop__ava--" + person.tone;
            avatar.textContent = person.initials;
            var code = document.createElement("span");
            code.className = "emp-drop__code";
            code.textContent = person.code;
            var name = document.createElement("span");
            name.className = "emp-drop__name";
            name.textContent = person.name;
            item.appendChild(avatar);
            item.appendChild(code);
            item.appendChild(name);
            drop.appendChild(item);
        });
        var empty = document.createElement("div");
        empty.className = "emp-drop__empty";
        empty.hidden = true;
        empty.innerHTML = '<svg class="emp-drop__question" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-question"></use></svg><p>No results</p>';
        drop.appendChild(empty);
    }

    document.querySelectorAll("[data-emp-suggest]").forEach(function (combo) {
        var input = combo.querySelector(".emp-input__control");
        var button = combo.querySelector(".emp-input__chevron-btn");
        buildDrop(combo, "suggest");
        function open(filter) {
            closeCombos(combo);
            setComboOpen(combo, true);
            if (filter) filterCombo(combo);
            else showCombo(combo);
        }
        button.addEventListener("mousedown", function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (combo.classList.contains("is-open")) setComboOpen(combo, false);
            else open(false);
        });
        input.addEventListener("focus", function () { open(false); });
        input.addEventListener("input", function () { open(true); });
        combo.addEventListener("mousedown", function (event) { event.stopPropagation(); });
        combo.querySelector(".emp-drop").addEventListener("mousedown", function (event) {
            var item = event.target.closest(".emp-drop__item");
            if (!item) return;
            event.preventDefault();
            input.value = item.getAttribute("data-name");
            setComboOpen(combo, false);
        });
    });

    document.querySelectorAll("[data-emp-multi]").forEach(function (combo) {
        var input = combo.querySelector(".emp-input__control");
        var button = combo.querySelector(".emp-input__chevron-btn");
        var picks = combo.querySelector(".emp-input__picks");
        var selected = {};
        buildDrop(combo, "multi");
        function paint() {
            picks.innerHTML = "";
            var ids = Object.keys(selected);
            input.closest(".emp-input").classList.toggle("has-picks", ids.length > 0);
            ids.forEach(function (id) {
                var chip = document.createElement("span");
                chip.className = "emp-select-chip";
                var label = document.createElement("span");
                label.textContent = selected[id];
                var remove = document.createElement("button");
                remove.type = "button";
                remove.className = "emp-select-chip__x";
                remove.setAttribute("aria-label", "Remove " + selected[id]);
                remove.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><use href="#i-chip-x"></use></svg>';
                remove.addEventListener("mousedown", function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    delete selected[id];
                    var row = combo.querySelector('.emp-drop__item[data-id="' + id + '"]');
                    if (row) row.classList.remove("is-selected");
                    paint();
                });
                chip.appendChild(label);
                chip.appendChild(remove);
                picks.appendChild(chip);
            });
        }
        function open(filter) {
            closeCombos(combo);
            setComboOpen(combo, true);
            if (filter) filterCombo(combo);
            else showCombo(combo);
        }
        button.addEventListener("mousedown", function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (combo.classList.contains("is-open")) setComboOpen(combo, false);
            else open(false);
        });
        input.addEventListener("focus", function () { open(false); });
        input.addEventListener("input", function () { open(true); });
        combo.addEventListener("mousedown", function (event) { event.stopPropagation(); });
        combo.querySelector(".emp-drop").addEventListener("mousedown", function (event) {
            var item = event.target.closest(".emp-drop__item");
            if (!item) return;
            event.preventDefault();
            var id = item.getAttribute("data-id");
            if (selected[id]) {
                delete selected[id];
                item.classList.remove("is-selected");
            } else {
                selected[id] = item.getAttribute("data-name");
                item.classList.add("is-selected");
            }
            input.value = "";
            paint();
            showCombo(combo);
        });
    });

    document.querySelectorAll("[data-emp-options]").forEach(function (input) {
        if (input.closest(".emp-combo")) return;
        var field = input.closest(".emp-field");
        var box = input.closest(".emp-input");
        if (!field || !box) return;
        var combo = document.createElement("div");
        combo.className = "emp-combo";
        field.parentNode.insertBefore(combo, field);
        combo.appendChild(field);
        var anchor = document.createElement("div");
        anchor.className = "emp-combo__anchor";
        box.parentNode.insertBefore(anchor, box);
        anchor.appendChild(box);
        var chevron = box.querySelector(".emp-input__chevron");
        if (chevron && !chevron.closest("button")) {
            var button = document.createElement("button");
            button.type = "button";
            button.className = "emp-input__chevron-btn";
            button.setAttribute("aria-label", "Open list");
            button.setAttribute("aria-expanded", "false");
            chevron.parentNode.insertBefore(button, chevron);
            button.appendChild(chevron);
        }
        var drop = document.createElement("div");
        drop.className = "emp-drop";
        input.getAttribute("data-emp-options").split("|").forEach(function (label) {
            var item = document.createElement("button");
            item.type = "button";
            item.className = "emp-drop__item";
            item.textContent = label;
            drop.appendChild(item);
        });
        anchor.appendChild(drop);
        var opener = combo.querySelector(".emp-input__chevron-btn");
        function openList() {
            closeCombos(combo);
            drop.querySelectorAll(".emp-drop__item").forEach(function (item) { item.hidden = false; });
            setComboOpen(combo, true);
        }
        if (opener) {
            opener.addEventListener("mousedown", function (event) {
                event.preventDefault();
                event.stopPropagation();
                if (combo.classList.contains("is-open")) setComboOpen(combo, false);
                else openList();
            });
        }
        input.addEventListener("focus", openList);
        input.addEventListener("input", function () {
            if (input.readOnly || !combo.classList.contains("is-open")) return;
            var query = input.value.trim().toLowerCase();
            drop.querySelectorAll(".emp-drop__item").forEach(function (item) {
                item.hidden = query !== "" && item.textContent.toLowerCase().indexOf(query) === -1;
            });
        });
        combo.addEventListener("mousedown", function (event) { event.stopPropagation(); });
        drop.addEventListener("mousedown", function (event) {
            var item = event.target.closest(".emp-drop__item");
            if (!item) return;
            event.preventDefault();
            input.value = item.textContent;
            setComboOpen(combo, false);
            input.dispatchEvent(new Event("input", { bubbles: true }));
        });
    });

    document.addEventListener("mousedown", function (event) {
        var node = event.target && event.target.nodeType === 1 ? event.target : event.target && event.target.parentElement;
        if (!node || !node.closest(".emp-combo")) closeCombos(null);
    });
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") closeCombos(null);
    });

    var links = document.querySelectorAll(".ds-index a");
    var sections = [];
    links.forEach(function (link) {
        var id = link.getAttribute("href").slice(1);
        var section = document.getElementById(id);
        if (section) sections.push({ link: link, section: section });
    });

    function markCurrent() {
        var current = sections[0];
        sections.forEach(function (item) {
            if (item.section.getBoundingClientRect().top < 120) current = item;
        });
        links.forEach(function (link) { link.classList.remove("is-current"); });
        if (current) current.link.classList.add("is-current");
    }

    window.addEventListener("scroll", markCurrent, { passive: true });
    markCurrent();

    function placeTip(tip) {
        var bubble = tip.querySelector(".emp-tip__bubble");
        if (!bubble) return;
        var host = tip.getBoundingClientRect();
        if (!host.width && !host.height) return;
        var bw = bubble.offsetWidth;
        var bh = bubble.offsetHeight;
        var gap = 8;
        var margin = 8;
        var vw = document.documentElement.clientWidth;
        var vh = window.innerHeight;
        var space = {
            top: host.top,
            bottom: vh - host.bottom,
            left: host.left,
            right: vw - host.right
        };
        var prefer = tip.getAttribute("data-place") || "auto";
        var onScreen = host.bottom > 0 && host.top < vh && host.right > 0 && host.left < vw;
        var order = !onScreen || prefer === "auto"
            ? ["bottom", "top", "right", "left"]
            : [prefer, "bottom", "top", "right", "left"];
        if (!onScreen && prefer !== "auto") order = [prefer];
        var seen = {};
        var side = order[0];
        var placed = false;
        order.forEach(function (name) {
            if (placed || seen[name]) return;
            seen[name] = true;
            var need = name === "left" || name === "right" ? bw + gap : bh + gap;
            if (!onScreen || space[name] >= need) {
                side = name;
                placed = true;
            }
        });
        tip.setAttribute("data-placed", side);
        var shift = side === "left" || side === "right" ? 0 : 15;
        if (onScreen && (side === "top" || side === "bottom")) {
            if (host.left + shift + bw > vw - margin) shift -= host.left + shift + bw - (vw - margin);
            if (host.left + shift < margin) shift = margin - host.left;
        } else if (onScreen) {
            if (host.top + shift + bh > vh - margin) shift -= host.top + shift + bh - (vh - margin);
            if (host.top + shift < margin) shift = margin - host.top;
        }
        tip.style.setProperty("--tip-shift", shift + "px");
    }

    function placeTips() {
        document.querySelectorAll(".emp-tip").forEach(placeTip);
    }

    document.querySelectorAll(".emp-tip").forEach(function (tip) {
        tip.addEventListener("mouseenter", function () { placeTip(tip); });
        tip.addEventListener("focusin", function () { placeTip(tip); });
    });
    document.addEventListener("scroll", placeTips, true);
    window.addEventListener("resize", placeTips);
    placeTips();

    function openOverlay(node) {
        node.classList.add("is-open");
        document.body.style.overflow = "hidden";
    }
    function closeOverlay(node) {
        node.classList.remove("is-open");
        node.querySelectorAll("video, audio").forEach(function (media) { media.pause(); });
        if (!document.querySelector(".emp-overlay.is-open")) document.body.style.overflow = "";
    }
    document.querySelectorAll("[data-overlay-close]").forEach(function (button) {
        button.addEventListener("click", function () {
            var overlay = button.closest(".emp-overlay");
            if (overlay) closeOverlay(overlay);
        });
    });
    document.querySelectorAll(".emp-overlay").forEach(function (overlay) {
        overlay.addEventListener("mousedown", function (event) {
            if (event.target === overlay) closeOverlay(overlay);
        });
    });

    var mw = document.querySelector("#mw-overlay .emp-mw");
    var mwOverlay = document.getElementById("mw-overlay");
    var mwSlot = mw && mw.querySelector("[data-mw-slot]");
    function syncMw() {
        if (!mwSlot) return;
        var over = mwSlot.scrollHeight - mwSlot.clientHeight > 1;
        var top = mwSlot.scrollTop > 1;
        var more = mwSlot.scrollTop + mwSlot.clientHeight < mwSlot.scrollHeight - 1;
        mw.classList.toggle("is-scrolled", over && top);
        mw.classList.toggle("is-more", over && more);
    }
    if (mwSlot) mwSlot.addEventListener("scroll", syncMw);
    function openModal(size, scroll) {
            mw.className = "emp-mw emp-mw--" + size + (scroll ? " is-scroll" : "");
            if (scroll) {
                var lines = [
                    "Confirm the attachment type and the description before this document is submitted.",
                    "The file name, upload date and author stay with the document and are shown in the preview.",
                    "A short window keeps the body inside the frame, so the scrollbar stays hidden.",
                    "When the text is longer than the body, the scrollbar appears and the header stays in place.",
                    "Scrolling the body draws a line between the title and the text, and again above the buttons.",
                    "Cancel closes the window. Submit sends the values from the body.",
                    "Wide, medium and small windows follow the same rule. Only the width and the maximum height change.",
                    "The footer stays under the body on every size.",
                    "Extra lines are here so the scroll state can be checked on the small, medium and wide windows.",
                    "Keep scrolling to reach the end. The lower line disappears when the last line is in view.",
                    "The upper line appears only after the body has moved.",
                    "This is the last block. The buttons stay fixed under it."
                ];
                var copy = lines.concat(lines).concat(lines);
                mwSlot.innerHTML = copy.map(function (line) { return '<p class="emp-mw__copy">' + line + '</p>'; }).join("");
            } else {
                mwSlot.innerHTML = '<p class="emp-mw__copy">The request is ready to submit.</p>';
            }
            mwSlot.scrollTop = 0;
            openOverlay(mwOverlay);
            requestAnimationFrame(function () { syncMw(); requestAnimationFrame(syncMw); });
    }
    document.querySelectorAll("[data-mw]").forEach(function (button) {
        button.addEventListener("click", function () {
            openModal(button.getAttribute("data-mw"), button.getAttribute("data-mw-scroll") === "1");
        });
    });
    document.querySelectorAll("[data-overlay-open]").forEach(function (button) {
        button.addEventListener("click", function () {
            var target = document.getElementById(button.getAttribute("data-overlay-open"));
            if (target) openOverlay(target);
        });
    });

    var previewFiles = [
        { id: "image", name: "photo.jpeg", kind: "Attachment type", type: "BOL", note: "photo of the BOL", date: "02/12/2025", author: "Charles Gascoigne", media: "image", marker: "file-image", src: "icons/upload/photo.jpeg.png" },
        { id: "pdf", name: "BOL.pdf", kind: "Attachment type", type: "BOL", note: "photo of the BOL", date: "02/12/2025", author: "Charles Gascoigne", media: "pdf", marker: "file-pdf", src: "icons/upload/bol.png", pdf: true },
        { id: "doc", name: "Letter.docx", kind: "Attachment type", type: "BOL", note: "photo of the BOL", date: "02/12/2025", author: "Charles Gascoigne", media: "doc", marker: "file-word", ghost: "ph-text", src: "icons/upload/ph-text.svg" },
        { id: "xls", name: "Zvit.xls", kind: "Attachment type", type: "BOL", note: "photo of the BOL", date: "02/12/2025", author: "Charles Gascoigne", media: "doc", marker: "file-excel", ghost: "ph-table", src: "icons/upload/ph-table.svg" },
        { id: "video", name: "VID_123_45.mp4", kind: "Attachment type", type: "Rate confirmation", note: "photo of the BOL", date: "02/12/2025", author: "Charles Gascoigne", media: "video", marker: "file-play", src: "icons/upload/video.png" }
    ];
    var previewRoot = document.querySelector(".emp-preview");
    var previewList = document.querySelector("[data-preview-list]");
    var previewOverlay = document.getElementById("preview-overlay");
    var previewZoom = 100;

    function previewById(id) {
        for (var i = 0; i < previewFiles.length; i++) {
            if (previewFiles[i].id === id) return previewFiles[i];
        }
        return previewFiles[0];
    }
    function paintPreview(id, panel) {
        var empty = id === "empty";
        var audio = id === "audio";
        var file = empty || audio ? null : previewById(id);
        var media = empty ? "empty" : audio ? "audio" : file.media;
        previewRoot.setAttribute("data-media", media);
        previewRoot.setAttribute("data-panel", panel || "inputs");
        if (empty) {
            previewList.innerHTML = '<div class="emp-file emp-preview__empty"><svg viewBox="0 0 16 16" aria-hidden="true"><use href="#i-folder"></use></svg><span>No files found</span></div>';
        } else {
            previewList.innerHTML = previewFiles.map(function (item) {
                // A file without a preview image shows the Figma "Preview=No" placeholder for its type.
                var media = item.ghost
                    ? '<img class="emp-file__ghost" src="icons/upload/' + item.ghost + '.svg" alt="" width="80" height="80">'
                    : '<img class="emp-file__img" src="' + item.src + '" alt="">';
                return '<article class="emp-file' + (item.pdf ? " emp-file--pdf" : "") + (item.ghost ? " emp-file--empty" : "") + (file && item.id === file.id ? " is-selected" : "") + '" tabindex="0" data-file="' + item.id + '">' +
                    media +
                    '<div class="emp-file__shade"><div class="emp-file__top"><span class="emp-file__line"><img class="emp-file__type" src="icons/upload/' + item.marker + '.svg" alt="" width="12" height="12"><span class="emp-file__name">' + item.name + '</span></span><span class="emp-file__kind">' + item.kind + '</span></div>' +
                    fileActions() +
                    '</div></article>';
            }).join("");
        }
        var sheet = previewRoot.querySelector("[data-preview-sheet]");
        var frame = previewRoot.querySelector("[data-preview-pdf]");
        var video = previewRoot.querySelector("[data-preview-video]");
        var audio = previewRoot.querySelector("[data-preview-audio]");
        if (video) { video.pause(); video.currentTime = 0; }
        if (audio) { audio.pause(); audio.currentTime = 0; }
        var pdfFile = !!(file && /\.pdf($|\?)/i.test(file.src || ""));
        if (frame) {
            frame.hidden = !pdfFile;
            if (pdfFile) frame.src = file.src;
            else frame.removeAttribute("src");
        }
        if (sheet) {
            sheet.hidden = pdfFile;
            sheet.style.width = "";
            sheet.style.height = "";
            if (file && file.src && media !== "video") sheet.src = file.src;
            sheet.classList.toggle("is-ghost", !!(file && file.ghost));
        }
        if (video && file && media === "video") video.poster = file.src;
        previewRoot.querySelectorAll("video, audio").forEach(paintMedia);
        var source = file || { type: "Rate confirmation", note: "photo of the BOL", date: "02/12/2025", author: "Charles Gascoigne", name: "audio.mp3" };
        var type = empty ? "Choose type" : source.type;
        var note = empty ? "" : source.note;
        var date = empty ? "-" : source.date;
        var author = empty ? "-" : source.author;
        var name = empty ? "-" : (media === "image" ? "image.jpg" : source.name);
        previewRoot.querySelector("[data-preview-type]").textContent = type;
        var area = previewRoot.querySelector("[data-preview-note]");
        area.value = note;
        area.placeholder = empty ? "Enter description" : "";
        previewRoot.querySelector('[data-meta="name"]').textContent = name;
        previewRoot.querySelector('[data-meta="type"]').textContent = empty ? "-" : source.type;
        previewRoot.querySelectorAll('[data-meta="date"], [data-meta="date2"]').forEach(function (node) { node.textContent = date; });
        previewRoot.querySelectorAll('[data-meta="author"], [data-meta="author2"]').forEach(function (node) { node.textContent = author; });
        previewRoot.querySelector('[data-meta="note"]').textContent = empty ? "-" : source.note;
        previewZoom = 100;
        zoomValue = 100;
        previewRoot.querySelector("[data-zoom-label]").textContent = "100%";
        requestAnimationFrame(function () { paintZoom(100); });
    }
    var zoomValue = 100;
    var zoomFrame = 0;
    function sheetNode() {
        var frame = previewRoot.querySelector("[data-preview-pdf]");
        var img = previewRoot.querySelector("[data-preview-sheet]");
        return frame && !frame.hidden ? frame : img;
    }
    function fitSize(view) {
        var img = previewRoot.querySelector("[data-preview-sheet]");
        var ratio = img && !img.classList.contains("is-ghost") && img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 0.77;
        var boxW = Math.max(40, view.clientWidth - 24);
        var boxH = Math.max(40, view.clientHeight - 24);
        var w = boxW;
        var h = w / ratio;
        if (h > boxH) { h = boxH; w = h * ratio; }
        return { w: w, h: h };
    }
    function paintZoom(z, focus) {
        var view = previewRoot.querySelector("[data-preview-view]");
        var page = previewRoot.querySelector(".emp-preview__page");
        var sheet = sheetNode();
        if (!view || !page || !sheet) return;
        var fit = fitSize(view);
        var nw = Math.max(1, fit.w * z / 100);
        var nh = Math.max(1, fit.h * z / 100);
        var relX = focus ? focus.x : 0.5;
        var relY = focus ? focus.y : 0.5;
        var pw = Math.max(view.clientWidth, nw);
        var ph = Math.max(view.clientHeight, nh);
        page.style.width = pw + "px";
        page.style.height = ph + "px";
        sheet.style.width = nw + "px";
        sheet.style.height = nh + "px";
        sheet.style.transform = "none";
        var left = (pw - nw) / 2;
        var top = (ph - nh) / 2;
        view.scrollLeft = left + relX * nw - view.clientWidth / 2;
        view.scrollTop = top + relY * nh - view.clientHeight / 2;
    }
    function zoomFocus() {
        var view = previewRoot.querySelector("[data-preview-view]");
        var sheet = sheetNode();
        if (!view || !sheet || !sheet.offsetWidth) return { x: 0.5, y: 0.5 };
        return {
            x: (view.scrollLeft + view.clientWidth / 2 - sheet.offsetLeft) / sheet.offsetWidth,
            y: (view.scrollTop + view.clientHeight / 2 - sheet.offsetTop) / sheet.offsetHeight
        };
    }
    function animateZoom(target) {
        target = Math.max(50, Math.min(200, target));
        var from = zoomValue;
        var focus = zoomFocus();
        var start = performance.now();
        cancelAnimationFrame(zoomFrame);
        previewZoom = target;
        function step(now) {
            var t = Math.min(1, (now - start) / 220);
            var eased = 1 - Math.pow(1 - t, 3);
            zoomValue = from + (target - from) * eased;
            previewRoot.querySelector("[data-zoom-label]").textContent = Math.round(zoomValue) + "%";
            paintZoom(zoomValue, focus);
            if (t < 1) zoomFrame = requestAnimationFrame(step);
            else {
                zoomValue = target;
                previewRoot.querySelector("[data-zoom-label]").textContent = Math.round(target) + "%";
                paintZoom(target, focus);
            }
        }
        zoomFrame = requestAnimationFrame(step);
    }
    function clock(sec) {
        if (!isFinite(sec) || sec < 0) sec = 0;
        sec = Math.floor(sec);
        var m = Math.floor(sec / 60);
        var s = sec % 60;
        return m + ":" + (s < 10 ? "0" : "") + s;
    }
    function paintMedia(media) {
        if (!media) return;
        var stage = media.closest(".emp-preview__stage");
        if (!stage) return;
        var cur = media.currentTime || 0;
        var dur = media.duration;
        var time = stage.querySelector("[data-time]");
        if (time) time.textContent = clock(cur) + " / " + (isFinite(dur) ? clock(dur) : "0:00");
        var pct = isFinite(dur) && dur ? (cur / dur) * 100 : 0;
        var done = stage.querySelector("[data-seek-done]");
        var knob = stage.querySelector("[data-knob]");
        if (done) done.style.flexBasis = pct + "%";
        if (knob) knob.style.left = pct + "%";
        var big = stage.querySelector(".emp-preview__play");
        if (big) big.hidden = !media.paused && !media.ended;
        var mute = stage.querySelector("[data-mute]");
        if (mute) mute.classList.toggle("is-muted", media.muted);
    }
    function toggleMedia(media) {
        if (!media) return;
        if (media.paused || media.ended) {
            previewRoot.querySelectorAll("video, audio").forEach(function (el) { if (el !== media) el.pause(); });
            var pending = media.play();
            if (pending && pending.catch) pending.catch(function () {});
        } else {
            media.pause();
        }
        paintMedia(media);
    }
    function seekMedia(bar, media, clientX) {
        var rect = bar.getBoundingClientRect();
        if (!rect.width || !isFinite(media.duration)) return;
        var ratio = (clientX - rect.left) / rect.width;
        ratio = Math.max(0, Math.min(1, ratio));
        media.currentTime = ratio * media.duration;
        paintMedia(media);
    }
    function openPreview(id, panel) {
        paintPreview(id, panel);
        openOverlay(previewOverlay);
    }
    document.querySelectorAll("[data-preview-open]").forEach(function (button) {
        button.addEventListener("click", function () {
            openPreview(button.getAttribute("data-preview-open"), button.getAttribute("data-preview-panel"));
        });
    });
    if (previewList) {
        function previewIdFrom(card) {
            return card.getAttribute("data-file");
        }
        function selectPreview(card) {
            paintPreview(previewIdFrom(card), previewRoot.getAttribute("data-panel"));
        }
        previewList.addEventListener("click", function (event) {
            var card = event.target.closest("[data-file]");
            if (!card) return;
            var act = event.target.closest(".emp-file__act");
            if (!act) {
                selectPreview(card);
                return;
            }
            event.stopPropagation();
            var id = previewIdFrom(card);
            if (act.classList.contains("emp-file__act--open")) {
                selectPreview(card);
                return;
            }
            if (act.classList.contains("emp-file__act--download")) {
                var item = previewById(id);
                var link = document.createElement("a");
                link.href = item.src;
                link.download = item.name;
                link.click();
                return;
            }
            if (act.classList.contains("emp-file__act--delete")) {
                var selected = previewList.querySelector(".emp-file.is-selected");
                var selectedId = selected ? selected.getAttribute("data-file") : "";
                previewFiles = previewFiles.filter(function (entry) { return entry.id !== id; });
                var next = selectedId === id ? (previewFiles[0] ? previewFiles[0].id : "empty") : (selectedId || "empty");
                paintPreview(next, previewRoot.getAttribute("data-panel"));
            }
        });
        previewList.addEventListener("keydown", function (event) {
            if (event.key !== "Enter" && event.key !== " ") return;
            if (event.target.closest(".emp-file__act")) return;
            var card = event.target.closest("[data-file]");
            if (!card || event.target !== card) return;
            event.preventDefault();
            selectPreview(card);
        });
    }
    if (previewRoot) document.addEventListener("click", function (event) {
        var openAct = event.target.closest(".emp-file__act--open");
        var card = openAct ? openAct.closest(".emp-file") : event.target.closest(".emp-file");
        if (!card || card.closest(".emp-preview")) return;
        if (!openAct && event.target.closest("button, a, input, textarea")) return;
        var nameNode = card.querySelector(".emp-file__name");
        if (!nameNode) return;
        var name = nameNode.textContent.trim();
        var id = name === "photo.jpeg" || /\.(png|jpe?g|gif|webp)$/i.test(name) ? "image" : name === "BOL.pdf" || /\.pdf$/i.test(name) ? "pdf" : name === "VID_123_45.mp4" || /\.(mp4|mov|webm)$/i.test(name) ? "video" : name === "Record.mp3" || /\.(mp3|wav|m4a)$/i.test(name) ? "audio" : /\.(docx?|rtf|txt)$/i.test(name) ? "doc" : /\.(xlsx?|csv)$/i.test(name) ? "xls" : "";
        if (id) openPreview(id, "inputs");
    });
    var sheetImg = previewRoot && previewRoot.querySelector("[data-preview-sheet]");
    if (sheetImg) sheetImg.addEventListener("load", function () { paintZoom(zoomValue, zoomFocus()); });
    var previewView = previewRoot && previewRoot.querySelector("[data-preview-view]");
    if (previewView) {
        previewView.addEventListener("wheel", function (event) {
            if (!event.ctrlKey && !event.metaKey) return;
            event.preventDefault();
            cancelAnimationFrame(zoomFrame);
            var next = zoomValue * Math.exp(-event.deltaY * 0.0015);
            zoomValue = Math.max(50, Math.min(200, next));
            previewZoom = zoomValue;
            previewRoot.querySelector("[data-zoom-label]").textContent = Math.round(zoomValue) + "%";
            paintZoom(zoomValue, zoomFocus());
        }, { passive: false });
    }
    if (previewRoot) previewRoot.querySelectorAll("[data-zoom]").forEach(function (button) {
        button.addEventListener("click", function () {
            var act = button.getAttribute("data-zoom");
            if (act === "full") {
                var stage = previewRoot.querySelector('[data-for="doc"]');
                if (document.fullscreenElement) document.exitFullscreen();
                else if (stage && stage.requestFullscreen) stage.requestFullscreen();
                return;
            }
            var next = previewZoom;
            if (act === "in") next = Math.min(200, previewZoom + 25);
            if (act === "out") next = Math.max(50, previewZoom - 25);
            animateZoom(next);
        });
    });
    if (previewRoot) previewRoot.addEventListener("click", function (event) {
        var play = event.target.closest("[data-play]");
        var mute = event.target.closest("[data-mute]");
        var full = event.target.closest("[data-full]");
        var stage = event.target.closest(".emp-preview__stage");
        if (!stage) return;
        var media = stage.querySelector("video, audio");
        if (play) toggleMedia(media);
        if (mute && media) {
            media.muted = !media.muted;
            paintMedia(media);
        }
        if (full) {
            var screen = stage.querySelector(".emp-preview__screen") || stage;
            if (document.fullscreenElement) document.exitFullscreen();
            else if (screen.requestFullscreen) screen.requestFullscreen();
        }
    });
    if (previewRoot) previewRoot.querySelectorAll("[data-seek]").forEach(function (bar) {
        function fromEvent(event) {
            var media = bar.closest(".emp-preview__stage").querySelector("video, audio");
            if (media) seekMedia(bar, media, event.clientX);
        }
        bar.addEventListener("click", fromEvent);
        bar.addEventListener("mousedown", function (event) {
            fromEvent(event);
            function move(ev) { fromEvent(ev); }
            function up() {
                document.removeEventListener("mousemove", move);
                document.removeEventListener("mouseup", up);
            }
            document.addEventListener("mousemove", move);
            document.addEventListener("mouseup", up);
        });
    });
    if (previewRoot) previewRoot.querySelectorAll("video, audio").forEach(function (media) {
        ["timeupdate", "loadedmetadata", "play", "pause", "ended"].forEach(function (name) {
            media.addEventListener(name, function () { paintMedia(media); });
        });
    });

    document.addEventListener("keydown", function (event) {
        if (event.key !== "Escape") return;
        document.querySelectorAll(".emp-overlay.is-open").forEach(closeOverlay);
    });
})();
