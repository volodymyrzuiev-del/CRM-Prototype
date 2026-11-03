/* Statistics dispatchers — data and logic (Figma: CRM 3.0 / Statistics dispatchers, frame 490:29812).
   Office, year and date filters re-scale the demo numbers so every control visibly changes the tables. */
(function () {
    "use strict";

    // Daily report: [name, current, goals, dailyGoal, profitToday, loadsToday, bestMonth, loadsCount, datLoads]; lead = first of a team.
    var TEAMS = [
        { team: "Guy Hawkins team", rows: [
            ["Guy Hawkins", 31245, 42000, 1900, 2540, 3, 39800, 213, 18],
            ["Darrell Steward", 18230, 26000, 1180, 1460, 2, 24900, 141, 9],
            ["Albert Flores", 12410, 20000, 910, 720, 1, 17450, 96, 4],
            ["Ronald Richards", 22980, 28000, 1270, 1990, 3, 25310, 168, 12]
        ] },
        { team: "Jane Cooper team", rows: [
            ["Jane Cooper", 27640, 36000, 1640, 2210, 3, 33120, 187, 15],
            ["Eleanor Pena", 15320, 24000, 1090, 980, 1, 21870, 118, 6],
            ["Darlene Robertson", 19870, 25000, 1140, 1520, 2, 22460, 152, 11],
            ["Bessie Cooper", 14210, 22000, 1000, 640, 1, 19880, 104, 5]
        ] },
        { team: "Robert Fox team", rows: [
            ["Robert Fox", 24560, 33000, 1500, 1870, 2, 30140, 176, 14],
            ["Arlene McCoy", 16980, 23000, 1050, 1310, 2, 20720, 127, 8],
            ["Savannah Nguyen", 11240, 19000, 860, 0, 0, 16390, 88, 3]
        ] }
    ];
    var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    // [loads, profit] per month for the base year (2026); months after "now" are 0.
    var YEARS = [[214, 275355], [198, 241120], [236, 298410], [221, 284930], [245, 312780], [232, 296300], [251, 325640], [240, 309870], [228, 290410], [262, 338120], [41, 52890], [0, 0]];
    var TEAM_STATS = [["AJ Team", 446610, 475000], ["MD Team", 378350, 420000], ["KD Team", 293010, 351000], ["RK Team", 273850, 328000], ["LE Team", 275430, 300000], ["MC Team", 306580, 348000], ["OD Team", 290510, 310000], ["LF Team", 339650, 367000]];
    var SOURCES_TODAY = [["DAT", 2446.61, 7], ["Brokers", 12778.35, 34], ["Truck stop", 1890.4, 3], ["ArcBest", 0, 0]];
    var SOURCES_MONTH = [["Brokers", 244612.61, 2134], ["DAT", 12778.35, 34], ["Truck stop", 8420.1, 21], ["ArcBest", 3110, 6]];
    var OFFICE = { MX1: 1, MX2: 0.82, MX3: 1.14 };
    var YEAR = { "2026": 1, "2025": 0.91, "2024": 0.84 };
    var WORKDAYS = 21, WORKDAYS_PASSED = 14; // working days in the month / passed so far

    var $ = function (id) { return document.getElementById(id); };
    var money = function (v) { return "$" + Number(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
    var int = function (v) { return Math.round(v).toLocaleString("en-US"); };
    var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
    var val = function (sel) { var n = document.querySelector(sel); return n ? n.value : ""; };
    var dateSet = function (key) { var n = document.querySelector('[data-st-date="' + key + '"] .emp-date__value'); return n && !n.classList.contains("is-empty"); };
    var row = function (cells, cls) { return "<tr" + (cls ? ' class="' + cls + '"' : "") + ">" + cells.map(function (c) { return "<td>" + c + "</td>"; }).join("") + "</tr>"; };

    function daily() {
        var k = (OFFICE[val('[data-st="office"]')] || 1) * (YEAR[val('[data-st="daily-year"]')] || 1);
        var team = val('[data-st="team"]');
        var html = "", tot = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        TEAMS.forEach(function (t) {
            if (team && team !== "All teams" && team !== t.team) return;
            t.rows.forEach(function (r, i) {
                var cur = r[1] * k, goal = r[2] * k, daily = r[3] * k, today = r[4] * k, best = r[6] * k;
                var left = Math.max(goal - cur, 0), leftToday = Math.max(daily - today, 0);
                var perDay = cur / WORKDAYS_PASSED, perLoad = r[7] ? cur / r[7] : 0;
                var pace = perDay * WORKDAYS, cmp = best ? (cur / best - 1) * 100 : 0;
                html += row([esc(r[0]), money(cur), money(goal), money(left), money(daily), money(leftToday), money(today), r[5], money(perDay), money(perLoad), money(pace), money(best),
                    '<span class="' + (cmp >= 0 ? "st-up" : "st-down") + '">' + (cmp >= 0 ? "+" : "") + cmp.toFixed(1) + "%</span>", r[7], r[8]], i === 0 ? "is-lead" : "");
                [cur, goal, left, daily, leftToday, today, r[5], r[7], r[8]].forEach(function (v, j) { tot[j] += v; });
            });
        });
        html += row(["Total", money(tot[0]), money(tot[1]), money(tot[2]), money(tot[3]), money(tot[4]), money(tot[5]), tot[6], "", "", "", "", "", tot[7], tot[8]], "is-total");
        $("st-daily").innerHTML = html;
    }
    function years() {
        var k = (OFFICE[val('[data-st="office"]')] || 1) * (YEAR[val('[data-st="years-year"]')] || 1);
        var full = val('[data-st="years-year"]') !== "2026";
        var tl = 0, tp = 0;
        var html = MONTHS.map(function (m, i) {
            var r = YEARS[i], loads = Math.round((full && !r[0] ? YEARS[i - 1][0] : r[0]) * k), profit = (full && !r[1] ? YEARS[i - 1][1] : r[1]) * k;
            if (full && i === 10) { loads = Math.round(250 * k); profit = 318000 * k; }
            tl += loads; tp += profit;
            return row([m, int(loads), money(profit), money(loads ? profit / loads : 0), money(profit / 21)]);
        }).join("");
        $("st-years").innerHTML = html + row(["Total", int(tl), money(tp), money(tl ? tp / tl : 0), money(tp / 12 / 21)], "is-total");
    }
    function teams() {
        var k = (OFFICE[val('[data-st="office"]')] || 1) * (YEAR[val('[data-st="teams-year"]')] || 1);
        $("st-teams").innerHTML = TEAM_STATS.map(function (t) { var p = t[1] * k, g = t[2] * k; return row([esc(t[0]), money(p), money(g), money(Math.max(g - p, 0))]); }).join("");
    }
    function cards() {
        var k = OFFICE[val('[data-st="office"]')] || 1;
        var kt = k * (dateSet("today") ? 1.6 : 1), ks = k * (dateSet("source") ? 1.6 : 1), km = k * (dateSet("month") ? 0.7 : 1);
        var profit = 0, loads = 0, left = 0;
        TEAMS.forEach(function (t) { t.rows.forEach(function (r) { profit += r[4]; loads += r[5]; left += Math.max(r[3] - r[4], 0); }); });
        $("st-today").innerHTML = row(["Total profit today", money(profit * kt)]) + row(["Total loads today", int(loads * kt)]) + row(["Left to get the goal today", money(left * kt)]);
        $("st-source").innerHTML = SOURCES_TODAY.map(function (s) { return row([s[0], money(s[1] * ks), int(s[2] * ks)]); }).join("");
        var d = new Date();
        $("st-month-label").textContent = MONTHS[d.getMonth()] + " " + d.getFullYear();
        $("st-month").innerHTML = SOURCES_MONTH.map(function (s) { return row([s[0], money(s[1] * km), int(s[2] * km)]); }).join("");
    }
    function render() { daily(); years(); teams(); cards(); }

    document.addEventListener("change", function (e) { if (e.target.closest && e.target.closest("[data-st], .emp-show")) render(); });
    document.addEventListener("input", function (e) { if (e.target.hasAttribute && e.target.hasAttribute("data-st")) render(); });
    // The date picker writes the chosen range into .emp-date__value — watch it to refresh the cards.
    document.querySelectorAll("[data-st-date] .emp-date__value, [data-st-date-top] .emp-date__value, .st-bar__date .emp-date__value").forEach(function (node) {
        new MutationObserver(render).observe(node, { childList: true, characterData: true, subtree: true, attributes: true });
    });
    render();
})();
