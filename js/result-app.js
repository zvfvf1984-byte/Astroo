/**
 * Визуализация результатов (блоки 1–9)
 */
(function () {
  var C = window.BaziConstants;
  var tooltip = null;

  function getChartFromStorage() {
    try {
      var raw = sessionStorage.getItem("baziChart");
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  }

  function showError(msg) {
    document.getElementById("result-loading").hidden = true;
    var el = document.getElementById("result-error");
    el.hidden = false;
    el.textContent = msg;
  }

  function showContent(chart) {
    document.getElementById("result-loading").hidden = true;
    document.getElementById("result-content").hidden = false;
    renderAll(chart);
  }

  function posRu(pos) {
    return { year: "Год", month: "Месяц", day: "День", hour: "Час" }[pos] || pos;
  }

  function renderHeader(chart) {
    var h = document.getElementById("result-title");
    h.textContent = "Карта Бацзы — " + (chart.place.name || chart.input.city);
    var meta = document.getElementById("result-meta");
    meta.innerHTML =
      "<span>" +
      chart.civilTime.day +
      "." +
      chart.civilTime.month +
      "." +
      chart.civilTime.year +
      " " +
      chart.civilTime.hour +
      ":" +
      String(chart.civilTime.minute).padStart(2, "0") +
      "</span>" +
      "<span>" +
      chart.timezone.label +
      " (" +
      chart.timezone.id +
      ")</span>" +
      "<span>" +
      chart.place.latitude.toFixed(2) +
      "°N, " +
      chart.place.longitude.toFixed(2) +
      "°E</span>" +
      (chart.solarTimeInfo
        ? '<span>真太阳时: ' +
          chart.calcTime.hour +
          ":" +
          String(chart.calcTime.minute).padStart(2, "0") +
          "</span>"
        : "");
  }

  /* Блок 1 */
  function renderBaziTable(chart) {
    var order = ["hour", "day", "month", "year"];
    var thead = document.querySelector("#bazi-table thead tr");
    var tbody = document.querySelector("#bazi-table tbody");
    thead.innerHTML = "<th></th>";
    tbody.innerHTML = "";

    order.forEach(function (pos) {
      thead.innerHTML += "<th>" + posRu(pos) + "</th>";
    });

    var rowStem = document.createElement("tr");
    var rowBranch = document.createElement("tr");
    rowStem.innerHTML = "<th>Небесный ствол</th>";
    rowBranch.innerHTML = "<th>Земная ветвь</th>";

    order.forEach(function (pos) {
      var p = chart.pillars[pos];
      var tdS = document.createElement("td");
      tdS.className = "bazi-cell";
      tdS.tabIndex = 0;
      tdS.innerHTML = '<div class="bazi-cell__stem">' + p.stem + "</div>";
      tdS.dataset.tooltip = tooltipText(p, "stem");
      rowStem.appendChild(tdS);

      var tdB = document.createElement("td");
      tdB.className = "bazi-cell";
      tdB.tabIndex = 0;
      tdB.innerHTML = '<div class="bazi-cell__branch">' + p.branch + "</div>";
      tdB.dataset.tooltip = tooltipText(p, "branch");
      rowBranch.appendChild(tdB);
    });

    tbody.appendChild(rowStem);
    tbody.appendChild(rowBranch);
    bindTooltips();
  }

  function tooltipText(p, part) {
    if (part === "stem") {
      return [
        p.stem + " · " + p.stemRu,
        p.yinYangRu + " · " + p.elementRu,
        "Ствол " + posRu(p.position)
      ].join("|");
    }
    var hid = (p.hiddenStems || []).map(function (h) {
      return h.stem + " (" + h.qi + ", " + h.elementRu + ")";
    }).join("|");
    return [p.branch + " · " + p.branchElementRu, "藏干:", hid || "—"].join("|");
  }

  function bindTooltips() {
    if (!tooltip) {
      tooltip = document.createElement("div");
      tooltip.className = "bazi-tooltip";
      document.body.appendChild(tooltip);
    }
    document.querySelectorAll(".bazi-cell").forEach(function (cell) {
      function show(e) {
        var tip = cell.getAttribute("data-tooltip") || "";
        tooltip.textContent = tip.split("|").join("\n");
        tooltip.style.whiteSpace = "pre-line";
        tooltip.classList.add("visible");
        move(e);
      }
      function move(e) {
        tooltip.style.left = (e.clientX || 0) + 12 + "px";
        tooltip.style.top = (e.clientY || 0) + 12 + "px";
      }
      function hide() {
        tooltip.classList.remove("visible");
      }
      cell.addEventListener("mouseenter", show);
      cell.addEventListener("mousemove", move);
      cell.addEventListener("focus", show);
      cell.addEventListener("mouseleave", hide);
      cell.addEventListener("blur", hide);
    });
  }

  /* Блок 2 */
  function renderDayMaster(chart) {
    var dm = chart.dayMaster;
    var t = chart.interpretation.traits;
    document.getElementById("day-master-label").textContent = "Господин дня: " + dm.label;
    document.getElementById("day-master-desc").textContent = chart.interpretation.summary;
    document.getElementById("dm-qualities").textContent = t.qualities;
    document.getElementById("dm-strengths").textContent = t.strengths;
    document.getElementById("dm-challenges").textContent = t.challenges;
  }

  /* Блок 3 */
  function renderElements(chart) {
    var bal = chart.balance;
    var els = ["wood", "fire", "earth", "metal", "water"];
    var total = 0;
    var segments = [];
    var offset = 0;
    var colors = { wood: "#2d6a4f", fire: "#c1121f", earth: "#b08d57", metal: "#6b7280", water: "#115e59" };

    els.forEach(function (el) {
      total += bal[el] || 0;
    });

    var svgParts = [];
    els.forEach(function (el) {
      var pct = bal[el] || 0;
      var angle = (pct / 100) * 360;
      if (pct <= 0) return;
      var r = 80;
      var cx = 90;
      var cy = 90;
      var a0 = (offset / 100) * 2 * Math.PI - Math.PI / 2;
      var a1 = ((offset + pct) / 100) * 2 * Math.PI - Math.PI / 2;
      var x0 = cx + r * Math.cos(a0);
      var y0 = cy + r * Math.sin(a0);
      var x1 = cx + r * Math.cos(a1);
      var y1 = cy + r * Math.sin(a1);
      var large = pct > 50 ? 1 : 0;
      svgParts.push(
        '<path d="M' +
          cx +
          " " +
          cy +
          " L" +
          x0 +
          " " +
          y0 +
          " A" +
          r +
          " " +
          r +
          " 0 " +
          large +
          " 1 " +
          x1 +
          " " +
          y1 +
          ' Z" fill="' +
          colors[el] +
          '"/>'
      );
      offset += pct;
    });

    document.getElementById("elements-donut").innerHTML =
      '<svg class="donut" viewBox="0 0 180 180">' + svgParts.join("") + "</svg>";

    var bars = document.getElementById("element-bars");
    bars.innerHTML = "";
    els.forEach(function (el) {
      var pct = bal[el] || 0;
      var div = document.createElement("div");
      div.className = "element-bar";
      div.innerHTML =
        '<div class="element-bar__head"><span>' +
        C.ELEMENT_RU[el] +
        '</span><span>' +
        pct +
        '%</span></div><div class="element-bar__track"><div class="element-bar__fill el-' +
        el +
        '" style="width:' +
        pct +
        '%"></div></div>';
      bars.appendChild(div);
    });
  }

  /* Блок 4–5 */
  function renderStrength(chart) {
    document.getElementById("strength-label").textContent = "Карта " + chart.strength.levelRu.toLowerCase();
    document.getElementById("strength-pct").textContent = "Индекс опоры: " + chart.strength.percent + "%";
    document.getElementById("strength-reason").textContent = chart.strength.reasoning;
  }

  function renderGods(chart) {
    var g = chart.usefulGods;
    document.getElementById("gods-list").innerHTML =
      '<div class="god-item god-item--yong"><strong>' +
      g.yongShen.role +
      "</strong><br>" +
      g.yongShen.ru +
      '</div><div class="god-item"><strong>' +
      g.xiShen.role +
      "</strong><br>" +
      g.xiShen.ru +
      '</div><div class="god-item god-item--ji"><strong>Неблагоприятные</strong><br>' +
      g.unfavorable.join(", ") +
      "</div>";
  }

  /* Блок 6 */
  function renderInteractions(chart) {
    var map = document.getElementById("interaction-map");
    var positions = ["year", "month", "day", "hour"];
    map.innerHTML = "";
    positions.forEach(function (pos) {
      var p = chart.pillars[pos];
      var node = document.createElement("div");
      node.className = "interaction-node";
      node.dataset.pos = pos;
      node.innerHTML = p.branch + "<span>" + posRu(pos) + "</span>";
      map.appendChild(node);
    });

    var list = document.getElementById("interaction-list");
    if (!chart.interactions.length) {
      list.innerHTML = "<p style='color:var(--text-muted);font-size:0.9rem'>Значимых столкновений не обнаружено.</p>";
      return;
    }
    list.innerHTML = "";
    chart.interactions.forEach(function (intr, idx) {
      var chip = document.createElement("div");
      chip.className = "interaction-chip";
      chip.textContent = intr.typeRu + ": " + intr.description;
      chip.addEventListener("click", function () {
        document.querySelectorAll(".interaction-chip").forEach(function (c) {
          c.classList.remove("active");
        });
        chip.classList.add("active");
        highlightInteraction(intr);
      });
      list.appendChild(chip);
    });
  }

  function highlightInteraction(intr) {
    document.querySelectorAll(".interaction-node").forEach(function (n) {
      n.classList.remove("highlight-clash", "highlight-combine");
    });
    var positions = intr.positions || (intr.a && intr.b ? [intr.a, intr.b] : []);
    positions.forEach(function (pos) {
      var node = document.querySelector('.interaction-node[data-pos="' + pos + '"]');
      if (!node) return;
      if (intr.type === "clash" || intr.type === "harm") node.classList.add("highlight-clash");
      else if (intr.type === "combine") node.classList.add("highlight-combine");
    });
  }

  /* Блок 7 */
  function renderDaYun(chart) {
    var timeline = document.getElementById("dayun-timeline");
    var detail = document.getElementById("dayun-detail");
    timeline.innerHTML = "";

    chart.daYun.cycles.forEach(function (c, i) {
      var step = document.createElement("div");
      step.className = "dayun-step" + (chart.daYun.current && chart.daYun.current.index === i ? " active" : "");
      step.innerHTML =
        '<div class="dayun-step__age">' +
        c.startAge +
        "–" +
        c.endAge +
        " лет</div><div class="dayun-step__gz">' +
        c.ganZhi +
        "</div>";
      step.addEventListener("click", function () {
        document.querySelectorAll(".dayun-step").forEach(function (s) {
          s.classList.remove("active");
        });
        step.classList.add("active");
        detail.innerHTML =
          "<strong>Такт " +
          c.ganZhi +
          "</strong> (" +
          c.startYear +
          "). " +
          c.summary +
          "<br>Направление удачи: " +
          chart.daYun.directionRu +
          ".";
      });
      timeline.appendChild(step);
    });

    if (chart.daYun.current) {
      detail.innerHTML =
        "Текущий период: <strong>" +
        chart.daYun.current.ganZhi +
        "</strong>, возраст " +
        chart.daYun.current.startAge +
        "+ лет.";
    }
  }

  /* Блок 8 */
  function renderHeatmaps(chart) {
    var heat = document.getElementById("month-heatmap");
    heat.innerHTML = "";
    chart.monthlyLuck.forEach(function (m) {
      var cell = document.createElement("div");
      cell.className = "heatmap-cell level-" + m.level;
      cell.title = "Месяц " + m.month + ": " + m.ganZhi;
      heat.appendChild(cell);
    });

    var yearWrap = document.getElementById("year-heatmap");
    yearWrap.innerHTML = "";
    var birthYear = chart.input.year;
    chart.yearly
      .filter(function (y) {
        return y.year >= birthYear - 30 && y.year <= birthYear + 30;
      })
      .forEach(function (y) {
        var cell = document.createElement("div");
        cell.className = "year-cell level-" + y.level;
        cell.title = y.year + " " + y.ganZhi + " (" + y.level + ")";
        yearWrap.appendChild(cell);
      });
  }

  /* Блок 9 */
  function renderAI(chart) {
    var box = document.getElementById("ai-report");
    box.innerHTML = "";
    chart.interpretation.paragraphs.forEach(function (p) {
      var el = document.createElement("p");
      el.textContent = p;
      box.appendChild(el);
    });
    var extra = document.createElement("p");
    extra.innerHTML =
      "<em>Карьера:</em> " +
      chart.interpretation.careerHint +
      "<br><em>Финансы:</em> " +
      chart.interpretation.financeHint +
      "<br><em>Отношения:</em> " +
      chart.interpretation.relationshipHint;
    box.appendChild(extra);

    var steps = document.getElementById("engine-steps");
    steps.innerHTML = "<details><summary>Журнал расчёта (10 шагов)</summary><ol></ol></details>";
    var ol = steps.querySelector("ol");
    chart.meta.steps.forEach(function (s) {
      var li = document.createElement("li");
      li.textContent = "Шаг " + s.step + ": " + s.title;
      ol.appendChild(li);
    });
  }

  function renderAll(chart) {
    renderHeader(chart);
    renderBaziTable(chart);
    renderDayMaster(chart);
    renderElements(chart);
    renderStrength(chart);
    renderGods(chart);
    renderInteractions(chart);
    renderDaYun(chart);
    renderHeatmaps(chart);
    renderAI(chart);
  }

  async function runFromQuery() {
    var params = new URLSearchParams(location.search);
    if (params.get("recalc") === "1") {
      var pending = sessionStorage.getItem("baziPending");
      if (pending) {
        try {
          var input = JSON.parse(pending);
          var chart = await BaziEngine.calculateChart(input);
          sessionStorage.setItem("baziChart", JSON.stringify(chart));
          history.replaceState({}, "", "result.html");
          showContent(chart);
          return;
        } catch (e) {
          showError(e.message || String(e));
          return;
        }
      }
    }

    var chart = getChartFromStorage();
    if (chart) {
      showContent(chart);
      return;
    }
    showError("Нет данных карты. Вернитесь на главную и постройте карту заново.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runFromQuery);
  } else {
    runFromQuery();
  }
})();
