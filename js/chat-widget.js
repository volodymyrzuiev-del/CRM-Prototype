/* Chat widget — our compact chat fixed in the bottom-right corner of every page.
   Figma: CRM 3.0 / Load's Chats / 4 · Chat widget (Collapsed, Collapsed + new message, List, Chat).
   Turned on/off in Load's Chats → Chat settings (localStorage "empChatWidget.off"). Hidden on Load's Chats and Offers.
   Also injects the shared icon sprite (lc-*) used by loadchats.js and offers.js. Chat itself is the global emp-chat. */
(function () {
    var SPRITE = '<symbol id="lc-grip" viewBox="0 0 16 16"><path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/></symbol><symbol id="lc-archive" viewBox="0 0 16 16"><path d="M0 2C0 1.44771 0.447716 1 1 1H15C15.5523 1 16 1.44772 16 2V4C16 4.55228 15.5523 5 15 5V12.5C15 13.8807 13.8807 15 12.5 15H3.5C2.11929 15 1 13.8807 1 12.5V5C0.447715 5 0 4.55228 0 4V2ZM2 5V12.5C2 13.3284 2.67157 14 3.5 14H12.5C13.3284 14 14 13.3284 14 12.5V5H2ZM15 2H1V4H15V2ZM5 7.5C5 7.22386 5.22386 7 5.5 7H10.5C10.7761 7 11 7.22386 11 7.5C11 7.77614 10.7761 8 10.5 8H5.5C5.22386 8 5 7.77614 5 7.5Z"/></symbol><symbol id="lc-archive-fill" viewBox="0 0 16 16"><path d="M12.6429 15C13.9789 15 15 13.8452 15 12.5V5H1V12.5C1 13.8452 2.02108 15 3.35714 15H12.6429ZM5.5 7H10.5C10.7761 7 11 7.22386 11 7.5C11 7.77614 10.7761 8 10.5 8H5.5C5.22386 8 5 7.77614 5 7.5C5 7.22386 5.22386 7 5.5 7Z"/><path d="M0.8 1C0.358172 1 0 1.35817 0 1.8V3C0 3.44183 0.358172 3.8 0.8 3.8H15.2C15.6418 3.8 16 3.44183 16 3V1.8C16 1.35817 15.6418 1 15.2 1H0.8Z"/></symbol><symbol id="lc-megaphone" viewBox="0 0 16 16"><path d="M13 2.5a1.5 1.5 0 0 1 3 0v11a1.5 1.5 0 0 1-3 0v-.214c-2.162-1.241-4.49-1.843-6.912-2.083l.405 2.712A1 1 0 0 1 5.51 15.1h-.548a1 1 0 0 1-.916-.599l-1.85-3.49-.202-.003A2.014 2.014 0 0 1 0 9V7a2.02 2.02 0 0 1 1.992-2.013 75 75 0 0 0 2.483-.075c3.043-.154 6.148-.849 8.525-2.199zm1 0v11a.5.5 0 0 0 1 0v-11a.5.5 0 0 0-1 0m-1 1.35c-2.344 1.205-5.209 1.842-8 2.033v4.233q.27.015.537.036c2.568.189 5.093.744 7.463 1.993zm-9 6.215v-4.13a95 95 0 0 1-1.992.052A1.02 1.02 0 0 0 1 7v2c0 .55.448 1.002 1.006 1.009A61 61 0 0 1 4 10.065m-.657.975 1.609 3.037.01.024h.548l-.002-.014-.443-2.966a68 68 0 0 0-1.722-.082z"/></symbol><symbol id="lc-people" viewBox="0 0 16 16"><path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/></symbol><symbol id="lc-gear" viewBox="0 0 16 16"><path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/></symbol><symbol id="lc-ext" viewBox="0 0 16 16"><path d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5"/><path d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z"/></symbol><symbol id="lc-star" viewBox="0 0 16 16"><path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.56.56 0 0 0-.163-.505L1.71 6.745l4.052-.576a.53.53 0 0 0 .393-.288L8 2.223l1.847 3.658a.53.53 0 0 0 .393.288l4.052.575-2.906 2.77a.56.56 0 0 0-.163.506l.694 3.957-3.686-1.894a.5.5 0 0 0-.461 0z"/></symbol><symbol id="lc-file-text" viewBox="0 0 16 16"><path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1M4.5 9a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1zM4 10.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m.5 2.5a.5.5 0 0 1 0-1h4a.5.5 0 0 1 0 1z"/></symbol><symbol id="lc-image" viewBox="0 0 16 16"><path d="M.002 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-12a2 2 0 0 1-2-2zm1 9v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062zm5-6.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0"/></symbol><symbol id="lc-info" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/><path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/></symbol><symbol id="lc-dbl-up" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M7.646 2.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 3.707 2.354 9.354a.5.5 0 1 1-.708-.708z"/><path fill-rule="evenodd" d="M7.646 6.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 7.707l-5.646 5.647a.5.5 0 0 1-.708-.708z"/></symbol><symbol id="lc-dots-v" viewBox="0 0 16 16"><path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/></symbol><symbol id="lc-chat-dots" viewBox="0 0 16 16"><path d="M16 8c0 3.866-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7M5 8a1 1 0 1 0-2 0 1 1 0 0 0 2 0m4 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0m3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/></symbol><symbol id="lc-chev-up" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708z"/></symbol><symbol id="lc-left" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/></symbol><symbol id="lc-box" viewBox="0 0 16 16"><path d="M7.443.184a1.5 1.5 0 0 1 1.114 0l6.943 2.778-.186.074L8 5.962 5.595 5l6.34-2.536-.37-.928L4.25 4.462.686 3.036.5 2.962zM15.686 3.964 16 3.838v8.324a1 1 0 0 1-.629.928L8.5 15.838v-9zM7.5 6.838v9L.629 13.09A1 1 0 0 1 0 12.162V3.838l.314.126z"/></symbol><symbol id="lc-octagon" viewBox="0 0 16 16"><path d="M11.46.146A.5.5 0 0 0 11.107 0H4.893a.5.5 0 0 0-.353.146L.146 4.54A.5.5 0 0 0 0 4.893v6.214a.5.5 0 0 0 .146.353l4.394 4.394a.5.5 0 0 0 .353.146h6.214a.5.5 0 0 0 .353-.146l4.394-4.394a.5.5 0 0 0 .146-.353V4.893a.5.5 0 0 0-.146-.353zM8 4c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995A.905.905 0 0 1 8 4m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/></symbol><symbol id="lc-excl" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4m.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/></symbol>';
    function injectSprite() {
        if (document.getElementById("lc-sprite")) return;
        var d = document.createElement("div");
        d.innerHTML = '<svg id="lc-sprite" class="emp-sprite" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">' + SPRITE + "</svg>";
        document.body.insertBefore(d.firstChild, document.body.firstChild);
    }
    function icon(name, cls) { return '<svg class="' + (cls || "lc-ico") + '" aria-hidden="true"><use href="#' + (name.indexOf("ci-") === 0 ? name : "lc-" + name) + '"></use></svg>'; }
    function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
    window.empLc = { icon: icon, esc: esc, injectSprite: injectSprite };

    var ME = { name: "Andrew Jameson", avatar: "AJ" };
    var CHATS = [
        { id: "136275", kind: "load", title: "#136275 · Atlanta → Chicago", full: "#136275 Atlanta, GA → Chicago, IL", av: "JD", last: "John Driver: Arrived at the shipper", time: "12:34", unread: 3, labels: [["Canada load", "blue"], ["Urgent Issues", "red"]],
          pinned: "Andrew Jameson: PU dock #4, call the shipper 30 min before arrival",
          messages: [
              { kind: "event", tone: "success", text: "Check In at PU1", time: "11:40 AM", day: "Today" },
              { side: "in", author: "John Driver", avatar: "JD", time: "11:58 AM", text: "Arrived at the shipper, waiting for the dock." },
              { side: "out", author: "Andrew Jameson", avatar: "AJ", time: "12:02 PM", status: "read", text: "Thanks! Please send the BOL right after loading.", readBy: [["John Driver", "Driver"], ["Natali Wilson", "Tracker"]] },
              { side: "in", author: "John Driver", avatar: "JD", time: "12:03 PM", text: "Sure 👍" }
          ] },
        { id: "o2323", kind: "offer", title: "2323 John Driver · Offer", full: "2323 John Driver · Offer", av: "JD", last: "Driver accepted offer", time: "12:31", unread: 1, labels: [],
          messages: [{ kind: "event", tone: "success", text: "John Driver accepted offer", time: "12:31 PM", day: "Today" }, { side: "in", author: "John Driver", avatar: "JD", time: "12:31 PM", text: "I can be there in 1.5 hours, $1,500." }] },
        { id: "345263", kind: "load", title: "#345263 · Harrisburg → Bismarck", full: "#345263 Harrisburg, PA → Bismarck, ND", av: "AH", last: "Anna Horda: Shared the location", time: "12:20", unread: 0, labels: [["Urgent Issues", "red"]],
          messages: [{ side: "in", author: "Anna Horda", avatar: "AH", time: "12:20 PM", day: "Today", type: "location", place: "Harrisburg, PA 17101", placeNote: "Shared the current location" }] },
        { id: "team", kind: "team", title: "Dispatch team", full: "Dispatch team", av: "DT", last: "Anna Lu: @Andrew check load #1245360", time: "11:58", unread: 0, labels: [],
          messages: [{ side: "in", author: "Anna Lu", avatar: "AL", time: "11:58 AM", day: "Today", text: "@Andrew Jameson check load #1245360 please" }] },
        { id: "876678", kind: "load", title: "#876678 · Miami → Atlanta", full: "#876678 Miami, FL → Atlanta, GA", av: "AG", last: "Alex Green: Sent a file", time: "11:40", unread: 0, labels: [["Team Driver", "purple"]],
          messages: [{ side: "in", author: "Alex Green", avatar: "AG", time: "11:40 AM", day: "Today", type: "file", file: { name: "BOL_876678.pdf", size: "1.2 MB" } }] },
        { id: "o4637", kind: "offer", title: "4637 Bryden Williams · Offer", full: "4637 Bryden Williams · Offer", av: "BW", last: "You: Can you confirm the truck?", time: "10:12", unread: 0, labels: [],
          messages: [{ side: "out", author: "Andrew Jameson", avatar: "AJ", time: "10:12 AM", day: "Today", status: "read", text: "Can you confirm the truck is empty?" }] },
        { id: "523411", kind: "load", title: "#523411 · Chicago → Detroit", full: "#523411 Chicago, IL → Detroit, MI", av: "MR", last: "Mike Ross: At the receiver", time: "09:58", unread: 0, labels: [],
          messages: [{ side: "in", author: "Mike Ross", avatar: "MR", time: "09:58 AM", day: "Today", text: "At the receiver, waiting for unloading." }] }
    ];
    var INCOMING = [
        { chat: "136275", author: "John Driver", text: "BOL attached", file: { name: "BOL_136275.pdf", size: "860 KB" } },
        { chat: "345263", author: "Anna Horda", text: "Driver is En Route, ETA to DEL 4:30 PM." },
        { chat: "o2323", author: "John Driver", text: "Can I pick up earlier, at 2 PM?" },
        { chat: "876678", author: "Alex Green", text: "Unloaded, sending the POD now." }
    ];
    var KEY = "empChatWidget.v1";
    var st = { open: false, chat: null, q: "" };
    try { var saved = JSON.parse(localStorage.getItem(KEY) || "null"); if (saved) { st.open = !!saved.open; st.chat = saved.chat || null; } } catch (e) {}
    function save() { try { localStorage.setItem(KEY, JSON.stringify({ open: st.open, chat: st.chat })); } catch (e) {} }
    function byId(id) { for (var i = 0; i < CHATS.length; i++) if (CHATS[i].id === id) return CHATS[i]; return null; }
    function unreadTotal() { return CHATS.reduce(function (n, c) { return n + (c.unread || 0); }, 0); }
    function linkFor(c) { return c.kind === "offer" ? "offers.html" : "loadchats.html" + (c.kind === "load" ? "#" + c.id : ""); }
    function chip(l) { return '<span class="emp-chip emp-chip--sm emp-chip--outline' + (l[1] && l[1] !== "blue" ? " emp-chip--" + l[1] : "") + '">' + esc(l[0]) + "</span>"; }

    var root, previewTimer;
    function render() {
        var total = unreadTotal();
        if (!st.open) {
            root.className = "emp-cw is-collapsed";
            root.innerHTML = '<div class="emp-cw__preview" hidden></div><button class="emp-cw__fab" type="button" data-cw="open" aria-label="Open chats' + (total ? ", " + total + " unread" : "") + '">' + icon("chat-dots", "emp-cw__fab-ico") + (total ? '<span class="emp-cw__count">' + (total > 99 ? "99+" : total) + "</span>" : "") + "</button>";
            return;
        }
        var c = st.chat && byId(st.chat);
        root.className = "emp-cw is-open";
        if (!c) {
            var q = st.q.toLowerCase();
            var rows = CHATS.filter(function (x) { return !q || (x.title + " " + x.last).toLowerCase().indexOf(q) >= 0; }).map(function (x) {
                return '<button class="emp-cw__row' + (x.unread ? " is-unread" : "") + '" type="button" data-cw-chat="' + x.id + '"><span class="emp-avatar emp-avatar--lg">' + esc(x.av) + '</span><span class="emp-cw__row-body"><span class="emp-cw__row-title">' + esc(x.title) + '</span><span class="emp-cw__row-last">' + esc(x.last) + "</span>" +
                    (x.labels.length ? '<span class="emp-cw__row-labels">' + x.labels.map(chip).join("") + "</span>" : "") + '</span><span class="emp-cw__row-meta"><span class="emp-cw__row-time">' + esc(x.time) + "</span>" + (x.unread ? '<span class="emp-cw__unread">' + x.unread + "</span>" : "") + "</span></button>";
            }).join("") || '<p class="emp-cw__empty">No chats found</p>';
            root.innerHTML = '<section class="emp-cw__panel" role="dialog" aria-label="Chats"><header class="emp-cw__head">' + icon("chat-dots", "emp-cw__head-ico") + '<h2 class="emp-cw__title">Chats</h2>' +
                '<a class="emp-cw__btn" href="loadchats.html" aria-label="Open in Load\'s Chats">' + icon("ext") + '</a><button class="emp-cw__btn" type="button" data-cw="close" aria-label="Collapse">' + icon("ci-x-lg") + "</button></header>" +
                '<div class="emp-cw__search"><div class="emp-field emp-field--sm"><div class="emp-input"><span class="emp-input__icon" aria-hidden="true">' + icon("ci-search", "emp-input__search") + '</span><input class="emp-input__control" type="search" placeholder="Search by # or name" aria-label="Search chats" data-cw-search value="' + esc(st.q) + '"></div></div></div>' +
                '<div class="emp-cw__list" data-emp-fade>' + rows + "</div></section>";
            var inp = root.querySelector("[data-cw-search]"); if (st.q) { inp.focus(); inp.setSelectionRange(st.q.length, st.q.length); }
            return;
        }
        c.unread = 0;
        root.innerHTML = '<section class="emp-cw__panel" role="dialog" aria-label="' + esc(c.full) + '"><header class="emp-cw__head"><button class="emp-cw__btn" type="button" data-cw="back" aria-label="Back to chats">' + icon("left") + '</button><h2 class="emp-cw__title">' + esc(c.full) + "</h2>" +
            '<a class="emp-cw__btn" href="' + linkFor(c) + '" aria-label="Open in the section">' + icon("ext") + '</a><button class="emp-cw__btn" type="button" data-cw="close" aria-label="Collapse">' + icon("ci-x-lg") + '</button></header><div class="emp-cw__chat"></div></section>';
        var host = root.querySelector(".emp-cw__chat");
        var msgs = c.messages.slice();
        if (c.pinned && !c._pinMsg) { c._pinMsg = { side: "out", author: "Andrew Jameson", avatar: "AJ", time: "09:10 AM", day: "Today", status: "read", text: c.pinned.replace(/^Andrew Jameson: /, ""), pinned: true }; c.messages.unshift(c._pinMsg); msgs.unshift(c._pinMsg); }
        window.empChat.mount(host, { size: "compact", me: ME, messages: c.messages, placeholder: "Write a message", attach: false, emoji: false, onSend: function () { c.last = "You: " + (c.messages[c.messages.length - 1].text || "file"); c.time = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }); } });
    }
    function showPreview(inc) {
        var c = byId(inc.chat); if (!c) return;
        c.unread = (c.unread || 0) + 1; c.last = inc.author + ": " + inc.text; c.time = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
        var m = { side: "in", author: inc.author, avatar: window.empChat.initials(inc.author), text: inc.file ? "" : inc.text, type: inc.file ? "file" : "text", file: inc.file };
        c.messages.push(m);
        if (st.open && st.chat === c.id) { var node = root.querySelector(".emp-chat"); if (node && node._empChat) { node._empChat.push(m); node._empChat.scrollBottom(); } c.unread = 0; return; }
        render();
        if (st.open) return;
        var p = root.querySelector(".emp-cw__preview");
        p.innerHTML = '<button class="emp-cw__card" type="button" data-cw-chat="' + c.id + '"><span class="emp-avatar emp-avatar--lg">' + esc(window.empChat.initials(inc.author)) + '</span><span class="emp-cw__row-body"><span class="emp-cw__row-title">' + esc(inc.author) + " · " + esc(c.title.split(" · ")[0]) + '</span><span class="emp-cw__row-last">' + esc(inc.text) + "</span></span></button>";
        p.hidden = false; requestAnimationFrame(function () { p.classList.add("is-show"); });
        clearTimeout(previewTimer);
        previewTimer = setTimeout(function () { p.classList.remove("is-show"); setTimeout(function () { p.hidden = true; }, 250); }, 5000);
    }
    var simI = 0;
    function simulate() { showPreview(INCOMING[simI++ % INCOMING.length]); }

    function init() {
        injectSprite();
        var off = false; try { off = localStorage.getItem("empChatWidget.off") === "1"; } catch (e) {}
        if (document.body.getAttribute("data-chat-widget") === "off" || off || !window.empChat) return;
        if (window.empChat.injectSprite) window.empChat.injectSprite();
        root = document.createElement("div"); root.className = "emp-cw"; document.body.appendChild(root);
        render();
        root.addEventListener("click", function (e) {
            var a = e.target.closest("[data-cw],[data-cw-chat]"); if (!a) return;
            if (a.hasAttribute("data-cw-chat")) { st.open = true; st.chat = a.getAttribute("data-cw-chat"); }
            else { var act = a.getAttribute("data-cw"); if (act === "open") st.open = true; if (act === "close") st.open = false; if (act === "back") st.chat = null; }
            save(); render();
        });
        root.addEventListener("input", function (e) { if (e.target.hasAttribute("data-cw-search")) { st.q = e.target.value; render(); } });
        document.addEventListener("keydown", function (e) { if (e.key === "Escape" && st.open && !document.querySelector(".emp-overlay.is-open")) { st.open = false; save(); render(); } });
        setTimeout(simulate, 6000);
        (function loop() { setTimeout(function () { simulate(); loop(); }, 150000 + Math.random() * 60000); })();
    }
    window.empChatWidget = { simulate: simulate, open: function () { st.open = true; save(); render(); } };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
