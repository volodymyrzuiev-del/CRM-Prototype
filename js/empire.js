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
        { id: "0000", code: "0000", name: "John Smith", initials: "JS", tone: "green" },
        { id: "1111", code: "1111", name: "Olivia Lee", initials: "OL", tone: "blue" },
        { id: "1245", code: "1245", name: "Maria Lopez", initials: "ML", tone: "orange" },
        { id: "2131", code: "2131", name: "Daniel Kim", initials: "DK", tone: "yellow" },
        { id: "3307", code: "3307", name: "Winston Wolf", initials: "WW", tone: "red" },
        { id: "5512", code: "5512", name: "Charles Gascoigne", initials: "CG", tone: "purple" },
        { id: "7800", code: "7800", name: "Andrew Jameson", initials: "AJ", tone: "blue" }
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
        var order = [];
        buildDrop(combo, "multi");
        function unpick(id) {
            delete selected[id];
            order = order.filter(function (key) { return key !== id; });
        }
        function paint() {
            picks.innerHTML = "";
            var ids = order.slice();
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
                    unpick(id);
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
                unpick(id);
                item.classList.remove("is-selected");
            } else {
                selected[id] = item.getAttribute("data-name");
                order.push(id);
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
        // Clear cross: shown while the value differs from the default; a click restores the default.
        // The default is data-emp-default, or the value the field had when the page loaded.
        var initial = input.getAttribute("data-emp-default");
        if (initial === null) {
            initial = input.value;
            input.setAttribute("data-emp-default", initial);
        }
        var clear = document.createElement("button");
        clear.type = "button";
        clear.className = "emp-input__clear";
        clear.setAttribute("aria-label", "Clear");
        clear.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><use href="#i-chip-x"></use></svg>';
        var chevronSlot = box.querySelector(".emp-input__chevron-btn") || box.querySelector(".emp-input__chevron");
        if (chevronSlot) chevronSlot.parentNode.insertBefore(clear, chevronSlot);
        else box.appendChild(clear);
        function syncClear() {
            var off = input.disabled || field.classList.contains("is-disabled");
            box.classList.toggle("has-clear", !off && input.value !== initial);
            // Narrow filter cells: the clear button and the chevron together would hide the value,
            // so below 130px the chevron gives way to the clear button.
            box.classList.toggle("is-tight", box.offsetWidth > 0 && box.offsetWidth < 130);
        }
        if (window.ResizeObserver) new ResizeObserver(syncClear).observe(box);
        var native = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
        Object.defineProperty(input, "value", {
            configurable: true,
            get: function () { return native.get.call(this); },
            set: function (next) { native.set.call(this, next); syncClear(); }
        });
        input.addEventListener("input", syncClear);
        input.addEventListener("change", syncClear);
        clear.addEventListener("mousedown", function (event) {
            event.preventDefault();
            event.stopPropagation();
            input.value = initial;
            setComboOpen(combo, false);
            input.dispatchEvent(new Event("input", { bubbles: true }));
            input.dispatchEvent(new Event("change", { bubbles: true }));
        });
        syncClear();
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
        var shift = side === "left" || side === "right" ? Math.round((host.height - bh) / 2) : 0;
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

    ["mouseover", "focusin"].forEach(function (type) {
        document.addEventListener(type, function (event) {
            var tip = event.target.closest && event.target.closest(".emp-tip");
            if (tip && !tip.contains(event.relatedTarget)) placeTip(tip);
        });
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
    function syncMw() { if (mwSlot && mwSlot._empFade) mwSlot._empFade(); }
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

/* Scroll shadow: 17px edge shadow on scroll boxes (every scroll box inside .emp-overlay, .emp-mw__slot, [data-emp-fade]).
   Edges are absolute siblings of the box, so the box's own layout is untouched. */
(function () {
    var SKIP = ".emp-chat, .emp-drop, .emp-cal, textarea, input, select";
    function scrolls(el) {
        if (el.nodeType !== 1 || el.matches(SKIP) || el.closest(".emp-chat")) return false;
        if (el.hasAttribute("data-emp-fade") || el.classList.contains("emp-mw__slot")) return true;
        var oy = getComputedStyle(el).overflowY;
        return oy === "auto" || oy === "scroll";
    }
    function empFade(el) {
        if (!el || el._empFade || !el.parentElement) return;
        var parent = el.parentElement;
        if (getComputedStyle(parent).position === "static") parent.style.position = "relative";
        var top = document.createElement("div"), bottom = document.createElement("div");
        top.className = "emp-fade emp-fade--top"; bottom.className = "emp-fade emp-fade--bottom";
        top.setAttribute("aria-hidden", "true"); bottom.setAttribute("aria-hidden", "true");
        var queued = false;
        function sync() {
            queued = false;
            if (!el.isConnected) return;
            if (top.parentNode !== parent || bottom.parentNode !== parent) el.after(top, bottom);
            var over = el.scrollHeight - el.clientHeight > 1 && el.clientHeight > 0;
            var x = el.offsetLeft + el.clientLeft, y = el.offsetTop + el.clientTop, w = el.clientWidth;
            top.style.cssText = "left:" + x + "px;top:" + y + "px;width:" + w + "px";
            bottom.style.cssText = "left:" + x + "px;top:" + (y + el.clientHeight - 17) + "px;width:" + w + "px";
            top.classList.toggle("is-on", over && el.scrollTop > 1);
            bottom.classList.toggle("is-on", over && el.scrollTop + el.clientHeight < el.scrollHeight - 1);
        }
        function queue() { if (!queued) { queued = true; requestAnimationFrame(sync); } }
        el._empFade = queue;
        el.after(top, bottom);
        el.addEventListener("scroll", sync, { passive: true });
        if (window.ResizeObserver) new ResizeObserver(queue).observe(el);
        new MutationObserver(queue).observe(el, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["hidden", "class", "style"] });
        window.addEventListener("resize", queue);
        el.addEventListener("load", queue, true);
        queue();
    }
    function scan(root) {
        if (root.nodeType !== 1) return;
        var inModal = root.closest(".emp-overlay");
        var list = Array.prototype.slice.call(root.querySelectorAll(inModal ? "*" : ".emp-overlay *, .emp-mw__slot, [data-emp-fade]"));
        list.unshift(root);
        list.forEach(function (el) {
            if (el._empFade || el.classList.contains("emp-fade")) return;
            if ((inModal || el.closest(".emp-overlay") || el.matches(".emp-mw__slot, [data-emp-fade]")) && scrolls(el)) empFade(el);
        });
    }
    function start() {
        scan(document.body);
        new MutationObserver(function (records) {
            records.forEach(function (r) { r.addedNodes.forEach(function (n) { if (n.nodeType === 1 && !n.classList.contains("emp-fade") && (n.closest(".emp-overlay") || n.matches("[data-emp-fade]") || n.querySelector("[data-emp-fade], .emp-mw__slot"))) scan(n); }); });
        }).observe(document.body, { childList: true, subtree: true });
        document.addEventListener("transitionend", function (e) { if (e.target.classList && e.target.classList.contains("emp-overlay")) e.target.querySelectorAll("*").forEach(function (n) { if (n._empFade) n._empFade(); }); });
    }
    window.empFade = empFade;
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();

    window.empOverlay = { open: openOverlay, close: closeOverlay };
    document.addEventListener("keydown", function (event) {
        if (event.key !== "Escape") return;
        document.querySelectorAll(".emp-overlay.is-open").forEach(closeOverlay);
    });
})();

/* ===== Chat — emp-chat. Figma: Components / Chat (7728:8082). ===== */
(function () {
    var CHAT_SPRITE = '<symbol id="ci-send" viewBox="0 0 16 16"><path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471z"/></symbol><symbol id="ci-clip" viewBox="0 0 16 16"><path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 1 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a3.5 3.5 0 1 1-7 0z"/></symbol><symbol id="ci-smile" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/> <path d="M4.285 9.567a.5.5 0 0 1 .683.183A3.5 3.5 0 0 0 8 11.5a3.5 3.5 0 0 0 3.032-1.75.5.5 0 1 1 .866.5A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1-3.898-2.25.5.5 0 0 1 .183-.683M7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5m4 0c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5"/></symbol><symbol id="ci-mic" viewBox="0 0 16 16"><path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5"/> <path d="M10 8a2 2 0 1 1-4 0V3a2 2 0 1 1 4 0zM8 0a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V3a3 3 0 0 0-3-3"/></symbol><symbol id="ci-mic-fill" viewBox="0 0 16 16"><path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0z"/> <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5"/></symbol><symbol id="ci-reply" viewBox="0 0 16 16"><path d="M6.598 5.013a.144.144 0 0 1 .202.134V6.3a.5.5 0 0 0 .5.5c.667 0 2.013.005 3.3.822.984.624 1.99 1.76 2.595 3.876-1.02-.983-2.185-1.516-3.205-1.799a8.7 8.7 0 0 0-1.921-.306 7 7 0 0 0-.798.008h-.013l-.005.001h-.001L7.3 9.9l-.05-.498a.5.5 0 0 0-.45.498v1.153c0 .108-.11.176-.202.134L2.614 8.254l-.042-.028a.147.147 0 0 1 0-.252l.042-.028zM7.8 10.386q.103 0 .223.006c.434.02 1.034.086 1.7.271 1.326.368 2.896 1.202 3.94 3.08a.5.5 0 0 0 .933-.305c-.464-3.71-1.886-5.662-3.46-6.66-1.245-.79-2.527-.942-3.336-.971v-.66a1.144 1.144 0 0 0-1.767-.96l-3.994 2.94a1.147 1.147 0 0 0 0 1.946l3.994 2.94a1.144 1.144 0 0 0 1.767-.96z"/></symbol><symbol id="ci-forward" viewBox="0 0 16 16"><path d="M9.502 5.513a.144.144 0 0 0-.202.134V6.65a.5.5 0 0 1-.5.5H2.5v2.9h6.3a.5.5 0 0 1 .5.5v1.003c0 .108.11.176.202.134l3.984-2.933.042-.028a.147.147 0 0 0 0-.252l-.042-.028zM8.3 5.647a1.144 1.144 0 0 1 1.767-.96l3.994 2.94a1.147 1.147 0 0 1 0 1.946l-3.994 2.94a1.144 1.144 0 0 1-1.767-.96v-.503H2a.5.5 0 0 1-.5-.5v-3.9a.5.5 0 0 1 .5-.5h6.3z"/></symbol><symbol id="ci-pin" viewBox="0 0 16 16"><path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a6 6 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707s.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a6 6 0 0 1 1.013.16l3.134-3.133a3 3 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146m.122 2.112v-.002zm0-.002v.002a.5.5 0 0 1-.122.51L6.293 6.878a.5.5 0 0 1-.511.12H5.78l-.014-.004a5 5 0 0 0-.288-.076 5 5 0 0 0-.765-.116c-.422-.028-.836.008-1.175.15l5.51 5.509c.141-.34.177-.753.149-1.175a5 5 0 0 0-.192-1.054l-.004-.013v-.001a.5.5 0 0 1 .12-.512l3.536-3.535a.5.5 0 0 1 .532-.115l.096.022c.087.017.208.034.344.034q.172.002.343-.04L9.927 2.028q-.042.172-.04.343a1.8 1.8 0 0 0 .062.46z"/></symbol><symbol id="ci-pin-fill" viewBox="0 0 16 16"><path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a6 6 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707s.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a6 6 0 0 1 1.013.16l3.134-3.133a3 3 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146"/></symbol><symbol id="ci-dots" viewBox="0 0 16 16"><path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/></symbol><symbol id="ci-check" viewBox="0 0 16 16"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0"/></symbol><symbol id="ci-check-all" viewBox="0 0 16 16"><path d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0zm-4.208 7-.896-.897.707-.707.543.543 6.646-6.647a.5.5 0 0 1 .708.708l-7 7a.5.5 0 0 1-.708 0"/> <path d="m5.354 7.146.896.897-.707.707-.897-.896a.5.5 0 1 1 .708-.708"/></symbol><symbol id="ci-clock" viewBox="0 0 16 16"><path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z"/> <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0"/></symbol><symbol id="ci-fail" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4m.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/></symbol><symbol id="ci-x" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/></symbol><symbol id="ci-x-lg" viewBox="0 0 16 16"><path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/></symbol><symbol id="ci-search" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/></symbol><symbol id="ci-up" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708z"/></symbol><symbol id="ci-down" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/></symbol><symbol id="ci-trash" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/> <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/></symbol><symbol id="ci-stop" viewBox="0 0 16 16"><path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5"/></symbol><symbol id="ci-play" viewBox="0 0 16 16"><path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/></symbol><symbol id="ci-pause" viewBox="0 0 16 16"><path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5"/></symbol><symbol id="ci-lock" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8 0a4 4 0 0 1 4 4v2.05a2.5 2.5 0 0 1 2 2.45v5a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 2 13.5v-5a2.5 2.5 0 0 1 2-2.45V4a4 4 0 0 1 4-4M4.5 7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 7zM8 1a3 3 0 0 0-3 3v2h6V4a3 3 0 0 0-3-3"/></symbol><symbol id="ci-at" viewBox="0 0 16 16"><path d="M13.106 7.222c0-2.967-2.249-5.032-5.482-5.032-3.35 0-5.646 2.318-5.646 5.702 0 3.493 2.235 5.708 5.762 5.708.862 0 1.689-.123 2.304-.335v-.862c-.43.199-1.354.328-2.29.328-2.926 0-4.813-1.88-4.813-4.798 0-2.844 1.921-4.881 4.594-4.881 2.735 0 4.608 1.688 4.608 4.156 0 1.682-.554 2.769-1.416 2.769-.492 0-.772-.28-.772-.76V5.206H8.923v.834h-.11c-.266-.595-.881-.964-1.6-.964-1.4 0-2.378 1.162-2.378 2.823 0 1.737.957 2.906 2.379 2.906.8 0 1.415-.39 1.709-1.087h.11c.081.67.703 1.148 1.503 1.148 1.572 0 2.57-1.415 2.57-3.643zm-7.177.704c0-1.197.54-1.907 1.456-1.907.93 0 1.524.738 1.524 1.907S8.308 9.84 7.371 9.84c-.895 0-1.442-.725-1.442-1.914"/></symbol><symbol id="ci-translate" viewBox="0 0 16 16"><path d="M4.545 6.714 4.11 8H3l1.862-5h1.284L8 8H6.833l-.435-1.286zm1.634-.736L5.5 3.956h-.049l-.679 2.022z"/> <path d="M0 2a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v3h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zm7.138 9.995q.289.451.63.846c-.748.575-1.673 1.001-2.768 1.292.178.217.451.635.555.867 1.125-.359 2.08-.844 2.886-1.494.777.665 1.739 1.165 2.93 1.472.133-.254.414-.673.629-.89-1.125-.253-2.057-.694-2.82-1.284.681-.747 1.222-1.651 1.621-2.757H14V8h-3v1.047h.765c-.318.844-.74 1.546-1.272 2.13a6 6 0 0 1-.415-.492 2 2 0 0 1-.94.31"/></symbol><symbol id="ci-file" viewBox="0 0 16 16"><path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5"/> <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z"/></symbol><symbol id="ci-geo" viewBox="0 0 16 16"><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/></symbol><symbol id="ci-download" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/> <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z"/></symbol><symbol id="ci-edit" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/></symbol><symbol id="ci-copy" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"/></symbol><symbol id="ci-retry" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"/> <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466"/></symbol><symbol id="ci-eye" viewBox="0 0 16 16"><path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/><path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/></symbol><symbol id="ci-image" viewBox="0 0 16 16"><path d="M.002 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-12a2 2 0 0 1-2-2zm1 9v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062zm5-6.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0"/></symbol><symbol id="ci-chat" viewBox="0 0 16 16"><path d="M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0m4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/> <path d="m2.165 15.803.02-.004c1.83-.363 2.948-.842 3.468-1.105A9 9 0 0 0 8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6a10.4 10.4 0 0 1-.524 2.318l-.003.011a11 11 0 0 1-.244.637c-.079.186.074.394.273.362a22 22 0 0 0 .693-.125m.8-3.108a1 1 0 0 0-.287-.801C1.618 10.83 1 9.468 1 8c0-3.192 3.004-6 7-6s7 2.808 7 6-3.004 6-7 6a8 8 0 0 1-2.088-.272 1 1 0 0 0-.711.074c-.387.196-1.24.57-2.634.893a11 11 0 0 0 .398-2"/></symbol><symbol id="ci-deleted" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/> <path d="M11.354 4.646a.5.5 0 0 0-.708 0l-6 6a.5.5 0 0 0 .708.708l6-6a.5.5 0 0 0 0-.708"/></symbol><symbol id="ci-upload" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4.406 1.342A5.53 5.53 0 0 1 8 0c2.69 0 4.923 2 5.166 4.579C14.758 4.804 16 6.137 16 7.773 16 9.569 14.502 11 12.687 11H10a.5.5 0 0 1 0-1h2.688C13.979 10 15 8.988 15 7.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 2.825 10.328 1 8 1a4.53 4.53 0 0 0-2.941 1.1c-.757.652-1.153 1.438-1.153 2.055v.448l-.445.049C2.064 4.805 1 5.952 1 7.318 1 8.785 2.23 10 3.781 10H6a.5.5 0 0 1 0 1H3.781C1.708 11 0 9.366 0 7.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383"/> <path fill-rule="evenodd" d="M7.646 4.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V14.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708z"/></symbol><symbol id="ci-camera" viewBox="0 0 16 16"><path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4z"/> <path d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5m0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M3 6.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0"/></symbol><symbol id="ci-template" viewBox="0 0 16 16"><path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2z"/> <path d="M3 5.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5M3 8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 8m0 2.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5"/></symbol><symbol id="ci-phone" viewBox="0 0 16 16"><path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.6 17.6 0 0 0 4.168 6.608 17.6 17.6 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.68.68 0 0 0-.58-.122l-2.19.547a1.75 1.75 0 0 1-1.657-.459L5.482 8.062a1.75 1.75 0 0 1-.46-1.657l.548-2.19a.68.68 0 0 0-.122-.58zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z"/></symbol><symbol id="ci-offline" viewBox="0 0 16 16"><path d="M10.706 3.294A12.6 12.6 0 0 0 8 3C5.259 3 2.723 3.882.663 5.379a.485.485 0 0 0-.048.736.52.52 0 0 0 .668.05A11.45 11.45 0 0 1 8 4q.946 0 1.852.148zM8 6c-1.905 0-3.68.56-5.166 1.526a.48.48 0 0 0-.063.745.525.525 0 0 0 .652.065 8.45 8.45 0 0 1 3.51-1.27zm2.596 1.404.785-.785q.947.362 1.785.907a.482.482 0 0 1 .063.745.525.525 0 0 1-.652.065 8.5 8.5 0 0 0-1.98-.932zM8 10l.933-.933a6.5 6.5 0 0 1 2.013.637c.285.145.326.524.1.75l-.015.015a.53.53 0 0 1-.611.09A5.5 5.5 0 0 0 8 10m4.905-4.905.747-.747q.886.451 1.685 1.03a.485.485 0 0 1 .047.737.52.52 0 0 1-.668.05 11.5 11.5 0 0 0-1.811-1.07M9.02 11.78c.238.14.236.464.04.66l-.707.706a.5.5 0 0 1-.707 0l-.707-.707c-.195-.195-.197-.518.04-.66A2 2 0 0 1 8 11.5c.374 0 .723.102 1.021.28zm4.355-9.905a.53.53 0 0 1 .75.75l-10.75 10.75a.53.53 0 0 1-.75-.75z"/></symbol><symbol id="ci-plus" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"/></symbol><symbol id="ci-film" viewBox="0 0 16 16"><path d="M0 1a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1zm4 0v6h8V1zm8 8H4v6h8zM1 1v2h2V1zm2 3H1v2h2zM1 7v2h2V7zm2 3H1v2h2zm-2 3v2h2v-2zM15 1h-2v2h2zm-2 3v2h2V4zm2 3h-2v2h2zm-2 3v2h2v-2zm2 3h-2v2h2z"/></symbol>';
    var EMOJI = ["👍","✅","🙏","😊","👌","🚚","📦","⏰","📍","🔥","💯","😅","🤝","👀","❗","⛽","🛣️","📝","💵","🏁","😀","😉","🙂","😎","😂","😍","🤔","😴","😡","👏","🙌","💪","🎉","❤️","⚠️","❌","⭕","🔧","🧾","📞"];
    var QUICK_REACT = ["👍","✅","🙏","😊","🔥","👀"];
    var uid = 0;

    function injectSprite() {
        if (document.getElementById("emp-chat-sprite")) return;
        var holder = document.createElement("div");
        holder.innerHTML = '<svg id="emp-chat-sprite" class="emp-sprite" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">' + CHAT_SPRITE + "</svg>";
        document.body.insertBefore(holder.firstChild, document.body.firstChild);
    }
    function ico(name, mod) { return '<svg class="emp-chat__ico' + (mod ? " emp-chat__ico--" + mod : "") + '" aria-hidden="true"><use href="#ci-' + name + '"></use></svg>'; }
    function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
    function initials(name) { return String(name || "?").split(/\s+/).filter(Boolean).slice(0, 2).map(function (p) { return p[0]; }).join("").toUpperCase(); }
    function nowTime() { return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }); }
    function richText(text, mentions) {
        var html = esc(text);
        html = html.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
        html = html.replace(/(\+?1?[\s(.-]*\d{3}[)\s.-]*\d{3}[\s.-]\d{4})/g, function (m) { return '<a href="tel:' + m.replace(/[^\d+]/g, "") + '">' + m + "</a>"; });
        (mentions || []).forEach(function (p) { html = html.split("@" + esc(p.name)).join('<span class="emp-chat__mention">@' + esc(p.name) + "</span>"); });
        return html;
    }
    function statusHtml(s) {
        if (!s) return "";
        var map = { sending: ["clock", "Sending"], sent: ["check", "Sent"], delivered: ["check-all", "Delivered"], read: ["check-all", "Read"] };
        if (s === "failed") return '<span class="emp-chat__status emp-chat__status--failed">' + ico("fail", "sm") + ' Not sent · <button type="button" data-act="retry">Retry</button></span>';
        var it = map[s] || map.sent;
        return '<span class="emp-chat__status emp-chat__status--' + s + '" title="' + it[1] + '">' + ico(it[0]) + "</span>";
    }
    function waveHtml(n) {
        var h = [6, 12, 18, 10, 22, 14, 8, 16, 24, 12, 6, 18, 10, 20, 14, 8, 12, 6, 16, 10, 22, 12, 8, 14], out = "";
        for (var i = 0; i < n; i++) out += '<i style="height:' + h[i % h.length] + 'px"></i>';
        return out;
    }

    /* File row — one look for a file everywhere (chat, BOL review, Files modal, widget). Figma: Chat / File (Document / Photo / Voice). */
    function fileHtml(f, author) {
        f = f || {};
        var ext = String(f.name || "").split(".").pop().toLowerCase();
        var kind = f.kind || (/^(jpe?g|png|heic|gif|webp)$/.test(ext) ? "photo" : /^(mp3|m4a|ogg|wav)$/.test(ext) || f.voice ? "voice" : "doc");
        var meta = f.meta || [f.author || author, ext && kind !== "voice" ? ext.toUpperCase() : "", f.size].filter(Boolean).join(" · ");
        return '<a class="emp-chat__file emp-chat__file--' + kind + '" href="' + esc(f.url || "#") + '" download="' + esc(f.name || "") + '"><span class="emp-chat__file-tile">' + ico(kind === "photo" ? "image" : kind === "voice" ? "mic-fill" : "file") + '</span><span class="emp-chat__file-info"><span class="emp-chat__file-name">' + esc(f.name) + '</span><span class="emp-chat__file-size">' + esc(meta) + "</span></span>" + ico("download") + "</a>";
    }
    function Chat(root, opts) {
        this.root = root;
        this.o = opts || {};
        this.me = this.o.me || { name: "Andrew Jameson", avatar: "AJ" };
        this.msgs = [];
        this.reply = null;
        this.editing = null;
        this.mode = "message";
        this.atts = [];
        this.pinned = [];
        this.unseen = 0;
        this.build();
        (this.o.messages || []).forEach(function (m) { this.push(m, true); if (m.pinned) this.pinned.push(m.id); }, this);
        this.renderAll();
        this.scrollBottom(true);
        if (this.o.disabled) this.setDisabled(true);
        root._empChat = this;
    }
    Chat.prototype.build = function () {
        var o = this.o, r = this.root;
        r.classList.add("emp-chat");
        if (o.size === "compact") r.classList.add("emp-chat--compact");
        var h = "";
        if (o.header) {
            var hd = o.header;
            h += '<header class="emp-chat__head">' +
                '<span class="emp-avatar emp-avatar--lg' + (hd.alt ? " emp-avatar--alt" : "") + '">' + esc(hd.avatar || initials(hd.name)) + (hd.presence ? '<span class="emp-avatar__dot' + (hd.presence === "offline" ? " is-offline" : "") + '"></span>' : "") + "</span>" +
                '<div class="emp-chat__who"><div class="emp-chat__title"><h3 class="emp-chat__name">' + esc(hd.name) + "</h3>" + (hd.tags || []).map(function (t) { return '<span class="emp-chip emp-chip--sm ' + (t.cls || "") + '">' + esc(t.text) + "</span>"; }).join("") + "</div>" +
                (hd.sub ? '<span class="emp-chat__sub">' + esc(hd.sub) + "</span>" : "") + "</div>" +
                '<div class="emp-chat__actions">' + (hd.phone ? '<a class="emp-chat__btn emp-chat__btn--accent" href="tel:' + esc(hd.phone) + '" aria-label="Call">' + ico("phone") + "</a>" : "") +
                '<button class="emp-chat__btn emp-chat__btn--accent" type="button" data-act="search" aria-label="Search in chat">' + ico("search") + "</button>" +
                (hd.menu !== false ? '<button class="emp-chat__btn emp-chat__btn--accent" type="button" data-act="chat-menu" aria-label="Chat menu">' + ico("dots") + "</button>" : "") +
                "</div></header>";
        }
        h += '<div class="emp-chat__pinned" hidden data-act="goto-pin"><span class="emp-chat__pinned-bar"></span><div class="emp-chat__pinned-body"><span class="emp-chat__pinned-label"></span><span class="emp-chat__pinned-text"></span></div><button class="emp-chat__btn emp-chat__btn--accent" type="button" data-act="pins-open" aria-label="Show all pinned messages">' + ico("down") + '</button><button class="emp-chat__btn emp-chat__btn--accent" type="button" data-act="unpin" aria-label="Unpin">' + ico("pin-fill") + "</button></div>";
        h += '<div class="emp-chat__pins" hidden></div>';
        h += '<div class="emp-chat__search" hidden><label class="emp-chat__search-field">' + ico("search") + '<input type="search" placeholder="Search in chat" aria-label="Search in chat"></label><span class="emp-chat__search-count"></span>' +
            '<button class="emp-chat__btn" type="button" data-act="search-prev" aria-label="Previous match">' + ico("up") + '</button><button class="emp-chat__btn" type="button" data-act="search-next" aria-label="Next match">' + ico("down") + '</button><button class="emp-chat__btn" type="button" data-act="search-close" aria-label="Close search">' + ico("x") + "</button></div>";
        h += '<div class="emp-chat__body"><div class="emp-chat__list" role="log" aria-live="polite" aria-relevant="additions" tabindex="0"></div>' +
            '<button class="emp-chat__jump" type="button" hidden data-act="jump" aria-label="Jump to latest">' + ico("down") + '<span class="emp-chat__jump-count"></span></button>' +
            '<div class="emp-chat__drop">' + ico("upload", "lg") + "<span>Drop files to send</span><small>Up to 10 files, 25 MB each</small></div></div>";
        h += '<footer class="emp-chat__foot">';
        if (o.quick && o.quick.length) h += '<div class="emp-chat__quick">' + o.quick.map(function (q) { return '<button class="emp-chip emp-chip--outline emp-chip--grey" type="button" data-act="quick">' + esc(q) + "</button>"; }).join("") + '<button class="emp-chat__btn emp-chat__btn--accent" type="button" data-act="quick-add" aria-label="Add template">' + ico("plus") + "</button></div>";
        if (o.notes) h += '<div class="emp-chat__modes" role="tablist"><button class="emp-chat__mode is-active" type="button" data-act="mode" data-mode="message" role="tab">Message</button><button class="emp-chat__mode emp-chat__mode--note" type="button" data-act="mode" data-mode="note" role="tab">' + ico("lock", "sm") + "Internal note</button></div>";
        var full = o.size !== "compact";
        h += '<div class="emp-chat__composer">' +
            '<div class="emp-chat__context" hidden><div class="emp-chat__context-body"><span class="emp-chat__context-title"></span><span class="emp-chat__context-text"></span></div><button class="emp-chat__btn" type="button" data-act="context-x" aria-label="Cancel">' + ico("x") + "</button></div>" +
            '<div class="emp-chat__atts"></div>' +
            '<div class="emp-chat__row">' +
            (full && o.attach !== false ? '<button class="emp-chat__btn" type="button" data-act="attach" aria-label="Attach">' + ico("clip", "lg") + "</button>" : "") +
            (full && o.emoji !== false ? '<button class="emp-chat__btn" type="button" data-act="emoji" aria-label="Emoji">' + ico("smile", "lg") + "</button>" : "") +
            '<textarea class="emp-chat__input" rows="1" placeholder="' + esc(o.placeholder || "Write a message") + '" aria-label="Message"></textarea>' +
            '<div class="emp-chat__rec" hidden><button class="emp-chat__btn emp-chat__btn--danger" type="button" data-act="rec-cancel" aria-label="Cancel recording">' + ico("trash", "lg") + '</button><span class="emp-chat__rec-dot"></span><span class="emp-chat__rec-time">Recording 0:00</span><span class="emp-chat__wave">' + waveHtml(14) + "</span></div>" +
            '<div class="emp-chat__closed" hidden>' + ico("lock") + "<span>This conversation is closed. Messages can’t be sent.</span>" + '<button class="emp-btn emp-btn--link emp-btn--md" type="button" data-act="reopen"><span class="emp-btn__label">Reopen</span></button></div>' +
            (full && o.voice !== false ? '<button class="emp-chat__btn" type="button" data-act="voice" aria-label="Record voice message">' + ico("mic", "lg") + "</button>" : "") +
            '<button class="emp-chat__btn emp-chat__send" type="button" data-act="send" aria-label="Send">' + ico("send", "lg") + "</button>" +
            "</div></div>";
        h += '<input type="file" multiple hidden data-chat-file>';
        h += "</footer>";
        h += '<div class="emp-chat__pop" hidden data-pop></div>';
        r.innerHTML = h;
        this.list = r.querySelector(".emp-chat__list");
        this.input = r.querySelector(".emp-chat__input");
        this.composer = r.querySelector(".emp-chat__composer");
        this.pop = r.querySelector("[data-pop]");
        this.file = r.querySelector("[data-chat-file]");
        this.bind();
    };
    Chat.prototype.push = function (m, silent) {
        m.id = m.id || "m" + (++uid);
        m.time = m.time || nowTime();
        m.day = m.day || (this.msgs.length ? this.msgs[this.msgs.length - 1].day : "Today");
        this.msgs.push(m);
        if (!silent) this.append(m);
        return m;
    };
    Chat.prototype.byId = function (id) { for (var i = 0; i < this.msgs.length; i++) if (this.msgs[i].id === id) return this.msgs[i]; return null; };
    Chat.prototype.isGrouped = function (m, prev) {
        if (!prev || m.kind || prev.kind) return false;
        return prev.side === m.side && prev.author === m.author && prev.day === m.day && (prev.type === "note") === (m.type === "note");
    };
    Chat.prototype.renderAll = function () {
        var html = "";
        if (this.o.earlier && this.o.earlier.length) html += '<button class="emp-chat__load" type="button" data-act="load">' + ico("retry", "sm") + "Load earlier messages</button>";
        if (!this.msgs.length) html += this.stateHtml(this.o.state || "empty");
        var prev = null, day = null;
        for (var i = 0; i < this.msgs.length; i++) {
            var m = this.msgs[i];
            if (m.day !== day) { html += '<div class="emp-chat__divider"><span>' + esc(m.day) + "</span></div>"; day = m.day; prev = null; }
            if (this.o.unreadFrom && m.id === this.o.unreadFrom) { html += '<div class="emp-chat__divider emp-chat__divider--unread"><span>New messages</span></div>'; prev = null; }
            html += this.msgHtml(m, this.isGrouped(m, prev));
            prev = m;
        }
        html += '<div class="emp-chat__typing" hidden><span class="emp-chat__dots"><i></i><i></i><i></i></span><span class="emp-chat__typing-text"></span></div>';
        this.list.innerHTML = html;
        this.typing = this.list.querySelector(".emp-chat__typing");
        this.paintPinned();
    };
    Chat.prototype.stateHtml = function (kind) {
        var s = { empty: ["chat", "No messages yet", "Send the first message or use a quick reply."], loading: ["retry", "Loading messages…", ""], error: ["offline", "Connection lost", "Messages will be sent when the connection is back."] }[kind];
        return '<div class="emp-chat__state emp-chat__state--' + kind + '">' + ico(s[0]) + '<p class="emp-chat__state-title">' + s[1] + "</p>" + (s[2] ? "<span>" + s[2] + "</span>" : "") + (kind === "error" ? '<button class="emp-btn emp-btn--outline emp-btn--md" type="button" data-act="state-retry"><span class="emp-btn__label">Retry</span></button>' : "") + "</div>";
    };
    Chat.prototype.msgHtml = function (m, grouped) {
        var o = this.o;
        if (m.kind === "event") return '<div class="emp-chat__event emp-chat__event--' + (m.tone || "neutral") + '" data-id="' + m.id + '"><span>' + esc(m.text) + '</span><span class="emp-chat__event-time">' + esc(m.time) + "</span></div>";
        if (m.kind === "card") return '<div class="emp-chat__event" data-id="' + m.id + '">' + (o.renderCard ? o.renderCard(m) : "") + "</div>";
        var out = m.side === "out", cls = "emp-chat__msg" + (out ? " emp-chat__msg--out" : "") + (m.type === "note" ? " emp-chat__msg--note" : "") + (m.type === "deleted" ? " is-deleted" : "") + (m.status === "failed" ? " is-failed" : "") + (grouped ? " is-grouped" : "");
        var meta = '<div class="emp-chat__meta"><span class="emp-chat__author">' + esc(m.author) + "</span><span>" + esc(m.time) + "</span>" + (m.edited ? "<span>· edited</span>" : "") + (m.channel ? "<span>" + esc(m.channel) + "</span>" : "") + (out ? statusHtml(m.status) : "") + "</div>";
        var b = "";
        if (m.forwarded) b += '<span class="emp-chat__label emp-chat__label--fwd">' + ico("forward", "sm") + "Forwarded from " + esc(m.forwarded) + "</span>";
        if (m.type === "note") b += '<span class="emp-chat__label emp-chat__label--note">' + ico("lock", "sm") + "Internal note · visible to team only</span>";
        if (m.reply) b += '<button class="emp-chat__quote" type="button" data-act="goto" data-target="' + esc(m.reply.id) + '"><span class="emp-chat__quote-body"><span class="emp-chat__quote-author">' + esc(m.reply.author) + '</span><span class="emp-chat__quote-text">' + esc(m.reply.text) + "</span></span></button>";
        var t = m.type || "text";
        if (t === "deleted") b += '<span class="emp-chat__label">' + ico("deleted", "sm") + "This message was deleted</span>";
        if (t === "file") b += fileHtml(m.file, m.author);
        if (t === "image") b += '<img class="emp-chat__img" src="' + esc(m.src || "") + '" alt="' + esc(m.alt || "Image") + '">';
        if (t === "gallery") b += '<div class="emp-chat__gallery">' + (m.srcs || ["", "", ""]).slice(0, 3).map(function (s) { return '<img src="' + esc(s) + '" alt="">'; }).join("") + '<span class="emp-chat__gallery-more">+' + (m.more || 3) + "</span></div>";
        if (t === "video") b += '<span class="emp-chat__video">' + ico("play") + "</span>";
        if (t === "voice") b += '<div class="emp-chat__voice"><button class="emp-chat__play" type="button" data-act="play" aria-label="Play voice message">' + ico("play") + '</button><span class="emp-chat__wave">' + waveHtml(o.size === "compact" ? 16 : 24) + '</span><span class="emp-chat__dur">' + esc(m.duration || "0:24") + "</span>" + (m.audio ? '<audio preload="metadata" src="' + esc(m.audio) + '"></audio>' : "") + "</div>";
        if (t === "location") b += '<span class="emp-chat__map">' + ico("geo") + '</span><span><strong class="emp-chat__file-name">' + esc(m.place || "") + '</strong><br><span class="emp-chat__file-size">' + esc(m.placeNote || "Live location") + "</span></span>";
        if (m.text && t !== "deleted") b += '<p class="emp-chat__text">' + richText(m.text, o.mentions) + "</p>";
        if (t === "link" && m.preview) b += '<a class="emp-chat__linkcard" href="' + esc(m.preview.url) + '" target="_blank" rel="noopener"><span class="emp-chat__linkcard-body"><span>' + esc(m.preview.domain) + '</span><span class="emp-chat__linkcard-title">' + esc(m.preview.title) + "</span><span>" + esc(m.preview.text || "") + "</span></span></a>";
        if (m.caption) b += '<p class="emp-chat__text emp-chat__file-size">' + esc(m.caption) + "</p>";
        if (m.translated) b += '<button class="emp-chat__trans" type="button" data-act="translate">' + ico("translate", "sm") + '<span>Translated from ' + esc(m.translated.from) + " · " + (m.showOriginal ? "Show translation" : "Show original") + "</span></button>";
        var reacts = (m.reactions || []).length ? '<div class="emp-chat__reactions">' + m.reactions.map(function (r, i) { return '<button class="emp-chat__reaction' + (r.mine ? " is-mine" : "") + '" type="button" data-act="toggle-react" data-index="' + i + '" title="' + esc(r.who || "") + '"><span class="emp-chat__reaction-emoji">' + r.e + "</span>" + r.n + "</button>"; }).join("") + '<button class="emp-chat__reaction" type="button" data-act="react" aria-label="Add reaction">' + ico("smile", "sm") + "</button></div>" : "";
        var seen = m.seenBy ? '<span class="emp-chat__seen">' + m.seenBy.map(function (p) { return '<span class="emp-avatar">' + esc(initials(p)) + "</span>"; }).join("") + "<span>Seen by " + esc(m.seenBy.slice(0, 2).join(", ")) + (m.seenBy.length > 2 ? " +" + (m.seenBy.length - 2) : "") + "</span></span>" : "";
        /* On hover — only ⋮ next to the bubble; everything else is in the message menu (Figma: Chat / Hover toolbar). */
        var tools = '<div class="emp-chat__tools" role="toolbar" aria-label="Message actions"><button class="emp-chat__btn" type="button" data-act="more" aria-label="Message actions" title="Reply, pin, copy…">' + ico("dots") + "</button></div>";
        var shownText = m.showOriginal && m.translated ? m.translated.original : null;
        if (shownText) b = b.replace(/<p class="emp-chat__text">[\s\S]*?<\/p>/, '<p class="emp-chat__text">' + richText(shownText, o.mentions) + "</p>");
        return '<div class="' + cls + '" data-id="' + m.id + '"><span class="emp-avatar emp-avatar--lg' + (m.alt ? " emp-avatar--alt" : "") + '">' + esc(m.avatar || initials(m.author)) + "</span>" +
            '<div class="emp-chat__content">' + meta + '<div class="emp-chat__bubble">' + b + "</div>" + reacts + seen + tools + "</div></div>";
    };
    Chat.prototype.append = function (m) {
        var state = this.list.querySelector(".emp-chat__state"); if (state) state.remove();
        var last = null;
        for (var i = this.msgs.length - 2; i >= 0; i--) { last = this.msgs[i]; break; }
        var near = this.nearBottom();
        var tmp = document.createElement("div");
        var html = "";
        if (!last || last.day !== m.day) html += '<div class="emp-chat__divider"><span>' + esc(m.day) + "</span></div>";
        html += this.msgHtml(m, this.isGrouped(m, last && last.day === m.day ? last : null));
        tmp.innerHTML = html;
        while (tmp.firstChild) this.list.insertBefore(tmp.firstChild, this.typing);
        if (near || m.side === "out") this.scrollBottom();
        else { this.unseen++; this.paintJump(); }
    };
    Chat.prototype.repaint = function (m) {
        var node = this.list.querySelector('[data-id="' + m.id + '"]');
        if (!node) return;
        var idx = this.msgs.indexOf(m), prev = idx > 0 ? this.msgs[idx - 1] : null;
        var tmp = document.createElement("div");
        tmp.innerHTML = this.msgHtml(m, node.classList.contains("is-grouped") && this.isGrouped(m, prev));
        node.replaceWith(tmp.firstChild);
    };
    Chat.prototype.nearBottom = function () { var l = this.list; return l.scrollHeight - l.scrollTop - l.clientHeight < 80; };
    Chat.prototype.scrollBottom = function (instant) {
        var l = this.list;
        l.scrollTo({ top: l.scrollHeight, behavior: instant ? "auto" : "smooth" });
        this.unseen = 0; this.paintJump();
    };
    Chat.prototype.paintJump = function () {
        var j = this.root.querySelector(".emp-chat__jump");
        j.hidden = this.nearBottom() && !this.unseen;
        j.querySelector(".emp-chat__jump-count").textContent = this.unseen ? String(this.unseen) : "";
    };
    Chat.prototype.highlight = function (id) {
        var node = this.list.querySelector('[data-id="' + id + '"]');
        if (!node) return;
        node.scrollIntoView({ block: "center", behavior: "smooth" });
        node.classList.add("is-highlight");
        setTimeout(function () { node.classList.remove("is-highlight"); }, 1600);
    };
    Chat.prototype.setTyping = function (on, name) {
        if (!this.typing) return;
        this.typing.hidden = !on;
        this.typing.querySelector(".emp-chat__typing-text").textContent = on ? (name || "Someone") + " is typing…" : "";
        if (on && this.nearBottom()) this.scrollBottom();
    };
    Chat.prototype.setDisabled = function (on) {
        this.root.querySelector(".emp-chat__closed").hidden = !on;
        this.input.hidden = on;
        this.composer.classList.toggle("is-disabled", on);
        this.root.querySelectorAll(".emp-chat__row > .emp-chat__btn").forEach(function (b) { b.hidden = on; });
        var q = this.root.querySelector(".emp-chat__quick"); if (q) q.hidden = on;
    };
    Chat.prototype.autosize = function () {
        var t = this.input;
        t.style.height = "auto";
        var max = parseFloat(getComputedStyle(t).maxHeight) || 64;
        t.style.height = Math.min(t.scrollHeight, max) + "px";
        t.classList.toggle("is-scroll", t.scrollHeight > max);
        this.root.querySelector(".emp-chat__send").classList.toggle("is-ready", !!t.value.trim() || this.atts.length > 0);
    };
    Chat.prototype.setContext = function (kind, m) {
        var c = this.root.querySelector(".emp-chat__context");
        this.reply = kind === "reply" ? m : null;
        this.editing = kind === "edit" ? m : null;
        c.hidden = !kind;
        if (!kind) return;
        c.querySelector(".emp-chat__context-title").textContent = kind === "edit" ? "Edit message" : "Reply to " + m.author;
        c.querySelector(".emp-chat__context-text").textContent = m.text || (m.file ? m.file.name : m.type);
        if (kind === "edit") { this.input.value = m.text || ""; }
        this.input.focus(); this.autosize();
    };
    Chat.prototype.send = function (textOverride) {
        var self = this, text = (textOverride != null ? textOverride : this.input.value).trim();
        if (this.editing) {
            if (text) { this.editing.text = text; this.editing.edited = true; this.repaint(this.editing); }
            this.input.value = ""; this.setContext(null); this.autosize(); return;
        }
        var files = this.atts.filter(function (a) { return a.state === "ready"; });
        if (!text && !files.length) return;
        var base = { side: "out", author: this.me.name, avatar: this.me.avatar, status: "sending", channel: this.o.channel || "" };
        if (this.reply) base.reply = { id: this.reply.id, author: this.reply.author, text: this.reply.text || (this.reply.file ? this.reply.file.name : "") };
        if (this.mode === "note") { base.type = "note"; base.status = ""; }
        var sent = [];
        files.forEach(function (a) {
            var m = Object.assign({}, base, a.image ? { type: "image", src: a.url, alt: a.name } : { type: "file", file: { name: a.name, size: a.size, url: a.url } });
            sent.push(self.push(m));
        });
        if (text) sent.push(this.push(Object.assign({}, base, { type: base.type || "text", text: text })));
        this.atts = []; this.paintAtts();
        this.input.value = ""; this.setContext(null); this.autosize();
        this.closePop();
        sent.forEach(function (m) { if (m.type !== "note") self.progress(m); });
        if (this.o.onSend) sent.forEach(function (m) { self.o.onSend(m, self); });
        if (this.o.demo && this.mode !== "note") this.demoReply();
    };
    Chat.prototype.progress = function (m) {
        var self = this, steps = ["sent", "delivered", "read"], i = 0;
        if (/\bfail\b/i.test(m.text || "")) { setTimeout(function () { m.status = "failed"; self.repaint(m); }, 700); return; }
        (function next() { setTimeout(function () { m.status = steps[i++]; self.repaint(m); if (i < steps.length) next(); }, i === 0 ? 500 : 1200); })();
    };
    Chat.prototype.demoReply = function () {
        var d = this.o.demo, self = this;
        clearTimeout(this._demo);
        this._demo = setTimeout(function () {
            self.setTyping(true, d.name);
            self._demo = setTimeout(function () {
                self.setTyping(false);
                var replies = d.replies || ["Got it 👍"];
                self._r = ((self._r || 0) + 1) % replies.length;
                self.push({ side: "in", author: d.name, avatar: d.avatar, text: replies[self._r], channel: d.channel || "" });
            }, 1600);
        }, 900);
    };
    Chat.prototype.paintAtts = function () {
        var box = this.root.querySelector(".emp-chat__atts");
        box.innerHTML = this.atts.map(function (a, i) {
            var failed = a.state === "failed";
            return '<div class="emp-chat__att' + (failed ? " is-failed" : "") + '"><div class="emp-chat__att-row">' + ico(failed ? "fail" : "file", "sm") + '<span class="emp-chat__att-name">' + esc(a.name) + '</span><span class="emp-chat__att-meta">' + (a.state === "uploading" ? a.pct + "%" : failed ? 'Upload failed · <button type="button" class="emp-chat__att-x" data-act="att-retry" data-index="' + i + '">Retry</button>' : esc(a.size)) + '</span><button class="emp-chat__att-x" type="button" data-act="att-x" data-index="' + i + '" aria-label="Remove">' + ico("x", "sm") + "</button></div>" + (a.state === "uploading" ? '<span class="emp-chat__att-bar"><i style="width:' + a.pct + '%"></i></span>' : "") + "</div>";
        }).join("");
        this.autosize();
    };
    Chat.prototype.addFiles = function (list) {
        var self = this;
        Array.prototype.slice.call(list || []).slice(0, 10).forEach(function (f) {
            var a = { name: f.name, size: f.size > 1048576 ? (f.size / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(f.size / 1024)) + " KB", url: URL.createObjectURL(f), image: /^image\//.test(f.type), state: "uploading", pct: 0 };
            if (f.size > 25 * 1048576) { a.state = "failed"; if (window.empToast) window.empToast("large", { size: 25 }); }
            self.atts.push(a);
            if (a.state === "uploading") self.upload(a);
        });
        this.paintAtts();
    };
    Chat.prototype.upload = function (a) {
        var self = this;
        a.state = "uploading"; a.pct = 0;
        var t = setInterval(function () { a.pct = Math.min(100, a.pct + 18 + Math.round(Math.random() * 14)); if (a.pct >= 100) { clearInterval(t); a.state = "ready"; } self.paintAtts(); }, 180);
    };
    Chat.prototype.openPop = function (html, anchor, cls, above) {
        var p = this.pop, rr = this.root.getBoundingClientRect(), ar = anchor.getBoundingClientRect();
        p.className = "emp-chat__pop" + (cls ? " " + cls : "");
        p.innerHTML = html; p.hidden = false;
        var w = p.offsetWidth, hgt = p.offsetHeight;
        var left = Math.min(Math.max(8, ar.left - rr.left), rr.width - w - 8);
        var top = above ? ar.top - rr.top - hgt - 6 : ar.bottom - rr.top + 6;
        if (top + hgt > rr.height - 4) top = ar.top - rr.top - hgt - 6;
        p.style.left = left + "px"; p.style.top = Math.max(4, top) + "px";
        this._popFor = anchor;
    };
    Chat.prototype.closePop = function () { this.pop.hidden = true; this.pop.innerHTML = ""; this._popFor = null; this._mention = null; };
    Chat.prototype.emojiHtml = function (forReact) {
        var list = forReact ? QUICK_REACT.concat(EMOJI.filter(function (e) { return QUICK_REACT.indexOf(e) < 0; })) : EMOJI;
        return '<label class="emp-chat__emoji-search">' + ico("search") + '<input type="search" placeholder="Search emoji" data-emoji-search></label><span class="emp-chat__emoji-cap">' + (forReact ? "React" : "Recent") + '</span><div class="emp-chat__emoji-grid">' + list.map(function (e) { return '<button type="button" data-act="' + (forReact ? "pick-react" : "pick-emoji") + '" data-emoji="' + e + '">' + e + "</button>"; }).join("") + "</div>";
    };
    Chat.prototype.paintPinned = function () {
        var bar = this.root.querySelector(".emp-chat__pinned"), self = this;
        this.pinned = this.pinned.filter(function (id) { return self.byId(id); });
        bar.hidden = !this.pinned.length || this._pinsOpen;
        this.paintPins();
        if (!this.pinned.length) return;
        this._pinIndex = Math.min(this._pinIndex || 0, this.pinned.length - 1);
        var m = this.byId(this.pinned[this._pinIndex]);
        bar.querySelector(".emp-chat__pinned-label").textContent = "Pinned message " + (this._pinIndex + 1) + " of " + this.pinned.length;
        bar.querySelector(".emp-chat__pinned-text").textContent = m.text || (m.file ? m.file.name : m.type);
    };
    /* Pinned messages expanded (Figma: Chat / Pinned bar, State=Expanded): the current one in full + the others with Unpin. */
    Chat.prototype.paintPins = function () {
        var box = this.root.querySelector(".emp-chat__pins"), self = this;
        if (!box) return;
        if (!this.pinned.length) this._pinsOpen = false;
        box.hidden = !this._pinsOpen;
        if (!this._pinsOpen) { box.innerHTML = ""; return; }
        var cur = this._pinIndex || 0;
        function who(m) { return '<span class="emp-chat__pins-who"><span class="emp-chat__pins-author">' + esc(m.author || "System") + ':</span><span class="emp-chat__pins-role">' + esc(m.role || "") + "</span></span>"; }
        function when(m) { return '<span class="emp-chat__pins-time">' + esc(m.day || "") + "<br>" + esc(m.time || "") + "</span>"; }
        function body(m) { return m.text || (m.file ? m.file.name : m.type === "voice" ? "Voice message · " + (m.duration || "") : m.type || ""); }
        var m0 = self.byId(this.pinned[cur]);
        var html = '<span class="emp-chat__pinned-label">Pinned message ' + (cur + 1) + " of " + this.pinned.length + "</span>" +
            '<div class="emp-chat__pins-main" data-act="goto" data-target="' + m0.id + '">' + who(m0) + '<p class="emp-chat__pins-text">' + esc(body(m0)) + "</p>" + when(m0) + "</div>" +
            '<button class="emp-chat__pins-collapse" type="button" data-act="pins-close" aria-label="Collapse pinned messages">' + ico("up") + "</button>";
        this.pinned.forEach(function (id, i) {
            if (i === cur) return;
            var m = self.byId(id);
            html += '<div class="emp-chat__pins-row" data-act="pins-pick" data-index="' + i + '">' + who(m) + '<span class="emp-chat__pins-line">' + esc(body(m)) + "</span>" + when(m) +
                '<button class="emp-chat__btn emp-chat__btn--accent" type="button" data-act="pins-unpin" data-index="' + i + '" aria-label="Unpin">' + ico("pin-fill") + "</button></div>";
        });
        box.innerHTML = html;
    };
    Chat.prototype.search = function (q) {
        var self = this;
        this.list.querySelectorAll("mark.emp-chat__hit").forEach(function (mk) { mk.replaceWith(document.createTextNode(mk.textContent)); });
        this.list.querySelectorAll(".emp-chat__text").forEach(function (p) { p.normalize(); });
        this.hits = [];
        var count = this.root.querySelector(".emp-chat__search-count");
        if (!q) { count.textContent = ""; return; }
        var re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
        this.list.querySelectorAll(".emp-chat__text, .emp-chat__file-name").forEach(function (p) {
            var walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT), nodes = [], n;
            while ((n = walker.nextNode())) nodes.push(n);
            nodes.forEach(function (node) {
                var s = node.nodeValue, last = 0, frag = document.createDocumentFragment(), mm, found = false;
                re.lastIndex = 0;
                while ((mm = re.exec(s))) { found = true; frag.appendChild(document.createTextNode(s.slice(last, mm.index))); var mk = document.createElement("mark"); mk.className = "emp-chat__hit"; mk.textContent = mm[0]; frag.appendChild(mk); self.hits.push(mk); last = mm.index + mm[0].length; }
                if (found) { frag.appendChild(document.createTextNode(s.slice(last))); node.replaceWith(frag); }
            });
        });
        this.hit = this.hits.length ? this.hits.length - 1 : -1;
        this.paintHit();
    };
    Chat.prototype.paintHit = function () {
        var count = this.root.querySelector(".emp-chat__search-count");
        this.hits.forEach(function (h) { h.classList.remove("is-current"); });
        if (this.hit < 0) { count.textContent = this.hits ? "0 of 0" : ""; return; }
        var h = this.hits[this.hit]; h.classList.add("is-current"); h.scrollIntoView({ block: "center", behavior: "smooth" });
        count.textContent = (this.hit + 1) + " of " + this.hits.length;
    };
    Chat.prototype.recStart = function () {
        var self = this;
        this.rec = { started: Date.now(), chunks: [] };
        var row = this.root.querySelector(".emp-chat__row");
        row.querySelectorAll('[data-act="attach"],[data-act="emoji"],[data-act="voice"]').forEach(function (b) { b.hidden = true; });
        this.input.hidden = true;
        this.root.querySelector(".emp-chat__rec").hidden = false;
        this.root.querySelector(".emp-chat__send").classList.add("is-ready");
        this.rec.timer = setInterval(function () { var s = Math.round((Date.now() - self.rec.started) / 1000); self.root.querySelector(".emp-chat__rec-time").textContent = "Recording " + Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2); }, 250);
        if (navigator.mediaDevices && window.MediaRecorder) {
            navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
                if (!self.rec) { stream.getTracks().forEach(function (t) { t.stop(); }); return; }
                self.rec.stream = stream; self.rec.mr = new MediaRecorder(stream);
                self.rec.mr.ondataavailable = function (e) { self.rec && self.rec.chunks.push(e.data); };
                self.rec.mr.start();
            }).catch(function () {});
        }
    };
    Chat.prototype.recStop = function (send) {
        var self = this, rec = this.rec;
        if (!rec) return;
        clearInterval(rec.timer);
        var secs = Math.max(1, Math.round((Date.now() - rec.started) / 1000)), dur = Math.floor(secs / 60) + ":" + ("0" + (secs % 60)).slice(-2);
        function finish(url) {
            if (send) {
                var m = self.push({ side: "out", author: self.me.name, avatar: self.me.avatar, type: "voice", duration: dur, audio: url || "", status: "sending" });
                self.progress(m);
            }
        }
        if (rec.mr && rec.mr.state !== "inactive") { rec.mr.onstop = function () { finish(send ? URL.createObjectURL(new Blob(rec.chunks, { type: "audio/webm" })) : ""); rec.stream.getTracks().forEach(function (t) { t.stop(); }); }; rec.mr.stop(); }
        else { if (rec.stream) rec.stream.getTracks().forEach(function (t) { t.stop(); }); finish(""); }
        this.rec = null;
        this.root.querySelector(".emp-chat__rec").hidden = true;
        this.input.hidden = false;
        this.root.querySelectorAll(".emp-chat__row > .emp-chat__btn").forEach(function (b) { b.hidden = false; });
        this.autosize();
    };
    Chat.prototype.mentionCheck = function () {
        var o = this.o; if (!o.mentions) return;
        var v = this.input.value.slice(0, this.input.selectionStart), m = v.match(/@([\w ]{0,20})$/);
        if (!m) { if (this._mention) this.closePop(); return; }
        var q = m[1].toLowerCase(), list = o.mentions.filter(function (p) { return p.name.toLowerCase().indexOf(q) === 0; });
        if (!list.length) { this.closePop(); return; }
        this._mention = { start: v.length - m[0].length, list: list, index: 0 };
        this.paintMention();
    };
    Chat.prototype.paintMention = function () {
        var mt = this._mention;
        this.openPop(mt.list.map(function (p, i) { return '<button class="emp-chat__menu-item emp-chat__mention-item' + (i === mt.index ? " is-active" : "") + '" type="button" data-act="pick-mention" data-index="' + i + '"><span class="emp-avatar">' + esc(p.avatar || initials(p.name)) + "</span><span>" + esc(p.name) + '<span class="emp-chat__mention-role">' + esc(p.role || "") + "</span></span></button>"; }).join(""), this.composer, "", true);
        this._mention = mt;
    };
    Chat.prototype.pickMention = function (i) {
        var mt = this._mention, p = mt.list[i], v = this.input.value, end = this.input.selectionStart;
        this.input.value = v.slice(0, mt.start) + "@" + p.name + " " + v.slice(end);
        this.closePop(); this.input.focus(); this.autosize();
    };
    Chat.prototype.bind = function () {
        var self = this, r = this.root, list = this.list, input = this.input;
        input.addEventListener("input", function () { self.autosize(); self.mentionCheck(); });
        input.addEventListener("focus", function () { self.composer.classList.add("is-focus"); });
        input.addEventListener("blur", function () { self.composer.classList.remove("is-focus"); });
        input.addEventListener("keydown", function (e) {
            if (self._mention && !self.pop.hidden) {
                if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); var mt = self._mention; mt.index = (mt.index + (e.key === "ArrowDown" ? 1 : mt.list.length - 1)) % mt.list.length; self.paintMention(); return; }
                if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); self.pickMention(self._mention.index); return; }
            }
            if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); self.send(); return; }
            if (e.key === "Escape") { if (!self.pop.hidden) self.closePop(); else if (self.reply || self.editing) { self.input.value = self.editing ? "" : self.input.value; self.setContext(null); } return; }
            if (e.key === "ArrowUp" && !input.value) {
                for (var i = self.msgs.length - 1; i >= 0; i--) { var m = self.msgs[i]; if (m.side === "out" && (m.type || "text") === "text") { e.preventDefault(); self.setContext("edit", m); return; } }
            }
        });
        input.addEventListener("paste", function (e) { var f = e.clipboardData && e.clipboardData.files; if (f && f.length) { e.preventDefault(); self.addFiles(f); } });
        list.addEventListener("load", function (e) { if (e.target.tagName === "IMG" && self._stick !== false) self.scrollBottom(true); }, true);
        list.addEventListener("scroll", function () { self._stick = self.nearBottom(); if (self.nearBottom()) self.unseen = 0; self.paintJump(); if (!self.pop.hidden && self._popFor && list.contains(self._popFor)) self.closePop(); });
        this.file.addEventListener("change", function () { self.addFiles(self.file.files); self.file.value = ""; });
        var depth = 0;
        r.addEventListener("dragenter", function (e) { if (e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types, "Files") >= 0 && !self.composer.classList.contains("is-disabled")) { depth++; r.classList.add("is-dragover"); } });
        r.addEventListener("dragover", function (e) { if (r.classList.contains("is-dragover")) e.preventDefault(); });
        r.addEventListener("dragleave", function () { depth = Math.max(0, depth - 1); if (!depth) r.classList.remove("is-dragover"); });
        r.addEventListener("drop", function (e) { if (!r.classList.contains("is-dragover")) return; e.preventDefault(); depth = 0; r.classList.remove("is-dragover"); self.addFiles(e.dataTransfer.files); });
        var searchInput = r.querySelector(".emp-chat__search input");
        searchInput.addEventListener("input", function () { self.search(searchInput.value.trim()); });
        searchInput.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); r.querySelector('[data-act="' + (e.shiftKey ? "search-next" : "search-prev") + '"]').click(); } if (e.key === "Escape") r.querySelector('[data-act="search-close"]').click(); });
        document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !self.pop.hidden) self.closePop(); });
        document.addEventListener("mousedown", function (e) { if (!self.pop.hidden && !self.pop.contains(e.target) && e.target !== self._popFor && !(self._popFor && self._popFor.contains(e.target))) self.closePop(); });
        r.addEventListener("input", function (e) { if (e.target.hasAttribute("data-emoji-search")) { var q = e.target.value.trim(); self.pop.querySelectorAll(".emp-chat__emoji-grid button").forEach(function (b, i) { b.hidden = !!q && i % 3 !== q.length % 3; }); } });
        r.addEventListener("click", function (e) {
            var a = e.target.closest("[data-act]"); if (!a || !r.contains(a)) return;
            var act = a.getAttribute("data-act"), row = a.closest("[data-id]"), m = row ? self.byId(row.getAttribute("data-id")) : null;
            switch (act) {
                case "send": if (self.rec) self.recStop(true); else self.send(); break;
                case "quick": self.send(a.textContent); break;
                case "quick-add": var t = window.prompt("New quick reply"); if (t && t.trim()) { var b = document.createElement("button"); b.className = "emp-chip emp-chip--outline emp-chip--grey"; b.type = "button"; b.setAttribute("data-act", "quick"); b.textContent = t.trim(); a.parentNode.insertBefore(b, a); } break;
                case "attach": self.openPop([["camera", "Photo or video", "pick-file"], ["file", "File", "pick-file"], ["geo", "Location", "send-location"], ["template", "Template", "pick-template"]].map(function (x) { return '<button class="emp-chat__menu-item" type="button" data-act="' + x[2] + '">' + ico(x[0]) + x[1] + "</button>"; }).join(""), a, "", true); break;
                case "pick-file": self.closePop(); self.file.click(); break;
                case "send-location": self.closePop(); var lm = self.push({ side: "out", author: self.me.name, avatar: self.me.avatar, type: "location", place: self.o.location || "Dallas, TX 75001", placeNote: "Shared location", status: "sending" }); self.progress(lm); break;
                case "pick-template": self.closePop(); input.value = (self.o.template || "Hi {name}, please confirm pickup time and send your current location.").replace("{name}", (self.o.demo && self.o.demo.name || "").split(" ")[0] || "there"); self.autosize(); input.focus(); break;
                case "emoji": if (self._popFor === a) { self.closePop(); break; } self.openPop(self.emojiHtml(false), a, "emp-chat__emoji", true); break;
                case "pick-emoji": var pos = input.selectionStart || input.value.length; input.value = input.value.slice(0, pos) + a.getAttribute("data-emoji") + input.value.slice(pos); self.autosize(); input.focus(); break;
                case "react": var target = a.closest("[data-id]"); self._reactFor = target && target.getAttribute("data-id"); self.openPop(self.emojiHtml(true), a, "emp-chat__emoji", false); if (target) target.classList.add("is-menu"); break;
                case "pick-react":
                    var rm = self.byId(self._reactFor); self.closePop(); if (!rm) break;
                    rm.reactions = rm.reactions || [];
                    var em = a.getAttribute("data-emoji"), ex = rm.reactions.filter(function (x) { return x.e === em; })[0];
                    if (ex) { if (!ex.mine) { ex.n++; ex.mine = true; } } else rm.reactions.push({ e: em, n: 1, mine: true, who: self.me.name });
                    self.repaint(rm); break;
                case "toggle-react": var rr = m.reactions[+a.getAttribute("data-index")]; rr.mine = !rr.mine; rr.n += rr.mine ? 1 : -1; if (rr.n <= 0) m.reactions.splice(m.reactions.indexOf(rr), 1); self.repaint(m); break;
                case "reply": self.setContext("reply", m); break;
                case "forward": if (window.empToast) window.empToast("forwarded"); break;
                case "pin": if (self.pinned.indexOf(m.id) < 0) self.pinned.unshift(m.id); self._pinIndex = 0; self.paintPinned(); if (window.empToast) window.empToast("pinned"); break;
                case "unpin": e.stopPropagation(); self.pinned.splice(self._pinIndex || 0, 1); self.paintPinned(); break;
                case "goto-pin": var pid = self.pinned[self._pinIndex || 0]; self.highlight(pid); self._pinIndex = ((self._pinIndex || 0) + 1) % self.pinned.length; self.paintPinned(); break;
                case "goto": self.highlight(a.getAttribute("data-target")); break;
                case "more":
                    var own = m.side === "out", isPinned = self.pinned.indexOf(m.id) >= 0;
                    var items = [["reply", "Reply", "reply"], [isPinned ? "pin-fill" : "pin", isPinned ? "Unpin" : "Pin", "pin"], ["copy", "Copy text", "copy"]];
                    if (m.status === "failed") items.push(["retry", "Resend", "retry"]);
                    if (own) items.push(["trash", "Delete", "delete"]);
                    var readers = own && m.status !== "failed" ? (m.readBy || (m.seenBy || []).map(function (n) { return [n, ""]; })) : [];
                    row.classList.add("is-menu"); self._menuFor = m.id;
                    self.openPop(items.map(function (x) { return '<button class="emp-chat__menu-item' + (x[2] === "delete" ? " emp-chat__menu-item--danger" : "") + '" type="button" data-act="menu-' + x[2] + '">' + ico(x[0]) + x[1] + "</button>"; }).join("") +
                        (readers.length ? '<div class="emp-chat__readby"><span class="emp-chat__readby-title">Read by</span>' + readers.map(function (r) { return '<span class="emp-chat__reader"><span class="emp-chat__reader-name">' + esc(r[0]) + '</span><span class="emp-chat__reader-role">' + esc(r[1] || "") + "</span>" + ico("eye") + "</span>"; }).join("") + "</div>" : ""), a, "", false); break;
                case "menu-pin": self.closePop(); var pm = self.byId(self._menuFor), pi = self.pinned.indexOf(pm.id); if (pi >= 0) self.pinned.splice(pi, 1); else { self.pinned.unshift(pm.id); self._pinIndex = 0; if (window.empToast) window.empToast("pinned"); } self.paintPinned(); break;
                case "pins-open": e.stopPropagation(); self._pinsOpen = true; self.paintPinned(); break;
                case "pins-close": self._pinsOpen = false; self.paintPinned(); break;
                case "pins-pick": self._pinIndex = +a.getAttribute("data-index"); self.paintPinned(); self.highlight(self.pinned[self._pinIndex]); break;
                case "pins-unpin": e.stopPropagation(); self.pinned.splice(+a.getAttribute("data-index"), 1); self._pinIndex = 0; self.paintPinned(); break;
                case "menu-reply": self.closePop(); self.setContext("reply", self.byId(self._menuFor)); break;
                case "menu-copy": self.closePop(); var cm = self.byId(self._menuFor); if (navigator.clipboard) navigator.clipboard.writeText(cm.text || "").catch(function () {}); if (window.empToast) window.empToast("messageCopied"); break;
                case "menu-edit": self.closePop(); self.setContext("edit", self.byId(self._menuFor)); break;
                case "menu-retry": case "retry": self.closePop(); var fm = m || self.byId(self._menuFor); fm.status = "sending"; fm.text = (fm.text || "").replace(/\bfail\b/ig, "").trim() || fm.text; self.repaint(fm); self.progress(fm); break;
                case "menu-delete": self.closePop(); var dm = self.byId(self._menuFor); dm.type = "deleted"; dm.text = ""; dm.reactions = []; self.repaint(dm); break;
                case "translate": m.showOriginal = !m.showOriginal; self.repaint(m); break;
                case "play":
                    var audio = row.querySelector("audio"), waves = row.querySelectorAll(".emp-chat__wave i"), use = a.querySelector("use");
                    if (audio && audio.src) { if (audio.paused) { audio.play(); use.setAttribute("href", "#ci-pause"); audio.onended = function () { use.setAttribute("href", "#ci-play"); }; audio.ontimeupdate = function () { var p = audio.currentTime / (audio.duration || 1); waves.forEach(function (w, i) { w.classList.toggle("is-done", i / waves.length < p); }); }; } else { audio.pause(); use.setAttribute("href", "#ci-play"); } }
                    else { var k = 0; use.setAttribute("href", "#ci-pause"); var iv = setInterval(function () { waves.forEach(function (w, i) { w.classList.toggle("is-done", i < k); }); if (++k > waves.length) { clearInterval(iv); use.setAttribute("href", "#ci-play"); waves.forEach(function (w) { w.classList.remove("is-done"); }); } }, 120); }
                    break;
                case "context-x": if (self.editing) input.value = ""; self.setContext(null); break;
                case "att-x": self.atts.splice(+a.getAttribute("data-index"), 1); self.paintAtts(); break;
                case "att-retry": self.upload(self.atts[+a.getAttribute("data-index")]); break;
                case "voice": self.recStart(); break;
                case "rec-cancel": self.recStop(false); break;
                case "mode": self.mode = a.getAttribute("data-mode"); r.querySelectorAll(".emp-chat__mode").forEach(function (b) { b.classList.toggle("is-active", b === a); }); self.composer.classList.toggle("is-note", self.mode === "note"); input.placeholder = self.mode === "note" ? "Only your team will see this note. Use @ to mention" : (self.o.placeholder || "Write a message"); input.focus(); break;
                case "jump": self.scrollBottom(); break;
                case "load":
                    a.classList.add("is-loading");
                    setTimeout(function () { var older = (self.o.earlier || []).map(function (x) { x.id = x.id || "m" + (++uid); return x; }); self.o.earlier = []; self.msgs = older.concat(self.msgs); var h = list.scrollHeight; self.renderAll(); list.scrollTop = list.scrollHeight - h; }, 700); break;
                case "search": var sb = r.querySelector(".emp-chat__search"); sb.hidden = !sb.hidden; if (!sb.hidden) searchInput.focus(); else { searchInput.value = ""; self.search(""); } break;
                case "search-close": r.querySelector(".emp-chat__search").hidden = true; searchInput.value = ""; self.search(""); break;
                case "search-prev": if (self.hits && self.hits.length) { self.hit = (self.hit - 1 + self.hits.length) % self.hits.length; self.paintHit(); } break;
                case "search-next": if (self.hits && self.hits.length) { self.hit = (self.hit + 1) % self.hits.length; self.paintHit(); } break;
                case "chat-menu": self.openPop([["pin", "Pinned messages", "cm-pins"], ["search", "Search in chat", "cm-search"], ["lock", self.composer.classList.contains("is-disabled") ? "Reopen conversation" : "Close conversation", "cm-close"]].map(function (x) { return '<button class="emp-chat__menu-item" type="button" data-act="' + x[2] + '">' + ico(x[0]) + x[1] + "</button>"; }).join(""), a, "", false); break;
                case "cm-pins": self.closePop(); if (self.pinned.length) self.highlight(self.pinned[0]); break;
                case "cm-search": self.closePop(); r.querySelector('[data-act="search"]').click(); break;
                case "cm-close": self.closePop(); var dis = !self.composer.classList.contains("is-disabled"); self.setDisabled(dis); self.push({ kind: "event", tone: "neutral", text: (dis ? "Conversation closed by " : "Conversation reopened by ") + self.me.name }); break;
                case "reopen": self.setDisabled(false); self.push({ kind: "event", tone: "neutral", text: "Conversation reopened by " + self.me.name }); break;
                case "state-retry": if (self.o.onRetry) self.o.onRetry(self); break;
                case "pick-mention": self.pickMention(+a.getAttribute("data-index")); break;
            }
        });
        r.addEventListener("mouseleave", function () { r.querySelectorAll(".emp-chat__msg.is-menu").forEach(function (n) { if (self.pop.hidden) n.classList.remove("is-menu"); }); });
        new MutationObserver(function () { if (self.pop.hidden) r.querySelectorAll(".emp-chat__msg.is-menu").forEach(function (n) { n.classList.remove("is-menu"); }); }).observe(this.pop, { attributes: true, attributeFilter: ["hidden"] });
    };

    window.empChat = {
        mount: function (root, opts) { injectSprite(); if (root._empChat) return root._empChat; return new Chat(root, opts); },
        icon: ico,
        injectSprite: injectSprite,
        fileHtml: fileHtml,
        esc: esc,
        initials: initials
    };
})();
