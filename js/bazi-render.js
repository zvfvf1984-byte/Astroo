/**
 * Рендер результатов в готовую HTML-разметку (блоки 1–9 + журнал расчёта)
 */
(function (global) {
  var C = global.BaziConstants;
  var tooltip = null;

  function $(id) {
    return document.getElementById(id);
  }

  function posRu(pos) {
    return { year: "Год", month: "Месяц", day: "День", hour: "Час" }[pos] || pos;
  }

  function showLoading(rootId) {
    var root = $(rootId || "chart-results");
    if (!root) return;
    root.hidden = false;
    $("result-loading").hidden = false;
    $("result-error").hidden = true;
    $("result-content").hidden = true;
    root.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function showError(msg) {
    $("result-loading").hidden = true;
    var el = $("result-error");
    el.hidden = false;
    el.textContent = msg;
    $("result-content").hidden = true;
    var root = $("chart-results");
    if (root) root.hidden = false;
  }

  function showContent(chart) {
    $("result-loading").hidden = true;
    $("result-error").hidden = true;
    $("result-content").hidden = false;
    var root = $("chart-results");
    if (root) root.hidden = false;
    renderAll(chart);
  }

  function setText(id, text) {
    var el = $(id);
    if (el) el.textContent = text;
  }

  function renderHeader(chart) {
    setText("result-title", "Карта Бацзы — " + (chart.place.name || chart.input.city));
    var meta = $("result-meta");
    if (!meta) return;
    meta.innerHTML =
      "<span><strong>Дата:</strong> " +
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
      "<span><strong>TZ:</strong> " +
      chart.timezone.label +
      " (" +
      chart.timezone.id +
      ")</span>" +
      "<span><strong>Координаты:</strong> " +
      chart.place.latitude.toFixed(4) +
      "°N, " +
      chart.place.longitude.toFixed(4) +
      "°E</span>" +
      (chart.solarTimeInfo
        ? "<span><strong>真太阳时:</strong> " +
          chart.calcTime.hour +
          ":" +
          String(chart.calcTime.minute).padStart(2, "0") +
          "</span>"
        : "");
  }

  function renderBaziTable(chart) {
    var order = ["hour", "day", "month", "year"];
    order.forEach(function (pos) {
      var p = chart.pillars[pos];
      var stemEl = $("stem-" + pos);
      var branchEl = $("branch-" + pos);
      var gzEl = $("gz-" + pos);
      if (stemEl) {
        stemEl.textContent = p.stem;
        stemEl.parentElement.setAttribute("data-tooltip", tooltipStem(p));
        stemEl.parentElement.title = p.stemRu + " · " + p.yinYangRu + " · " + p.elementRu;
      }
      if (branchEl) {
        branchEl.textContent = p.branch;
        branchEl.parentElement.setAttribute("data-tooltip", tooltipBranch(p));
        branchEl.parentElement.title = p.branchElementRu;
      }
      if (gzEl) gzEl.textContent = p.ganZhi;
    });
    bindTooltips();
  }

  function tooltipStem(p) {
    return [p.stem + " · " + p.stemRu, p.yinYangRu + " · " + p.elementRu, posRu(p.position)].join("|");
  }

  function tooltipBranch(p) {
    var hid = (p.hiddenStems || []).map(function (h) {
      return h.stem + " (" + h.qi + ")";
    }).join("|");
    return [p.branch + " · " + p.branchElementRu, "藏干:", hid || "—"].join("|");
  }

  function bindTooltips() {
    if (!tooltip) {
      tooltip = document.createElement("div");
      tooltip.className = "bazi-tooltip";
      tooltip.setAttribute("role", "tooltip");
      document.body.appendChild(tooltip);
    }
    document.querySelectorAll(".bazi-cell[data-tooltip]").forEach(function (cell) {
      if (cell._tipBound) return;
      cell._tipBound = true;
      cell.addEventListener("mouseenter", function (e) {
        tooltip.textContent = (cell.getAttribute("data-tooltip") || "").split("|").join("\n");
        tooltip.style.whiteSpace = "pre-line";
        tooltip.classList.add("visible");
        moveTip(e);
      });
      cell.addEventListener("mousemove", moveTip);
      cell.addEventListener("mouseleave", function () {
        tooltip.classList.remove("visible");
      });
      cell.addEventListener("focus", function (e) {
        tooltip.textContent = (cell.getAttribute("data-tooltip") || "").split("|").join("\n");
        tooltip.style.whiteSpace = "pre-line";
        tooltip.classList.add("visible");
        moveTip(e);
      });
      cell.addEventListener("blur", function () {
        tooltip.classList.remove("visible");
      });
    });
  }

  function moveTip(e) {
    tooltip.style.left = (e.clientX || 0) + 12 + "px";
    tooltip.style.top = (e.clientY || 0) + 12 + "px";
  }

  function renderDayMaster(chart) {
    var t = chart.interpretation.traits;
    setText("day-master-label", "Господин дня: " + chart.dayMaster.label);
    setText("day-master-desc", chart.interpretation.summary);
    setText("dm-qualities", t.qualities);
    setText("dm-strengths", t.strengths);
    setText("dm-challenges", t.challenges);
  }

  function renderElements(chart) {
    var bal = chart.balance;
    var els = ["wood", "fire", "earth", "metal", "water"];
    var colors = { wood: "#2d6a4f", fire: "#c1121f", earth: "#b08d57", metal: "#6b7280", water: "#115e59" };
    var offset = 0;
    var svgParts = [];

    els.forEach(function (el) {
      var pct = bal[el] || 0;
      setText("el-pct-" + el, pct + "%");
      var fill = $("el-bar-" + el);
      if (fill) fill.style.width = pct + "%";
      if (pct <= 0) return;
      var r = 80, cx = 90, cy = 90;
      var a0 = (offset / 100) * 2 * Math.PI - Math.PI / 2;
      var a1 = ((offset + pct) / 100) * 2 * Math.PI - Math.PI / 2;
      var x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
      var x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      svgParts.push(
        '<path d="M' + cx + " " + cy + " L" + x0 + " " + y0 + " A" + r + " " + r + " 0 " + (pct > 50 ? 1 : 0) + " 1 " + x1 + " " + y1 + ' Z" fill="' + colors[el] + '"/>'
      );
      offset += pct;
    });

    var donut = $("elements-donut-svg");
    if (donut) donut.innerHTML = svgParts.join("");
  }

  function renderStrength(chart) {
    setText("strength-label", "Карта " + chart.strength.levelRu.toLowerCase());
    setText("strength-pct", "Индекс опоры: " + chart.strength.percent + "%");
    setText("strength-reason", chart.strength.reasoning);
  }

  function renderGods(chart) {
    var g = chart.usefulGods;
    setText("god-yong", g.yongShen.ru);
    setText("god-xi", g.xiShen.ru);
    setText("god-ji", g.unfavorable.join(", "));
    setText("god-chou", g.chouShen.ru);
  }

  function renderInteractions(chart) {
    var positions = ["year", "month", "day", "hour"];
    positions.forEach(function (pos) {
      var node = $("inode-" + pos);
      if (node) {
        var label = posRu(pos);
        node.innerHTML = chart.pillars[pos].branch + "<span>" + label + "</span>";
        node.classList.remove("highlight-clash", "highlight-combine");
      }
    });

    var list = $("interaction-list");
    if (!list) return;
    list.innerHTML = "";
    if (!chart.interactions.length) {
      list.innerHTML = "<li class=\"interaction-chip\">Значимых столкновений не обнаружено.</li>";
      return;
    }
    chart.interactions.forEach(function (intr) {
      var li = document.createElement("li");
      li.className = "interaction-chip";
      li.textContent = intr.typeRu + ": " + intr.description;
      li.addEventListener("click", function () {
        list.querySelectorAll(".interaction-chip").forEach(function (c) {
          c.classList.remove("active");
        });
        li.classList.add("active");
        highlightInteraction(intr);
      });
      list.appendChild(li);
    });
  }

  function highlightInteraction(intr) {
    document.querySelectorAll(".interaction-node").forEach(function (n) {
      n.classList.remove("highlight-clash", "highlight-combine");
    });
    var positions = intr.positions || (intr.a && intr.b ? [intr.a, intr.b] : []);
    positions.forEach(function (pos) {
      var node = $("inode-" + pos);
      if (!node) return;
      if (intr.type === "clash" || intr.type === "harm") node.classList.add("highlight-clash");
      else if (intr.type === "combine") node.classList.add("highlight-combine");
    });
  }

  function renderDaYun(chart) {
    var timeline = $("dayun-timeline");
    var detail = $("dayun-detail");
    if (!timeline) return;
    timeline.innerHTML = "";

    chart.daYun.cycles.forEach(function (c, i) {
      var li = document.createElement("li");
      li.className = "dayun-step" + (chart.daYun.current && chart.daYun.current.index === i ? " active" : "");
      li.innerHTML =
        '<span class="dayun-step__age">' + c.startAge + "–" + c.endAge + " лет</span>" +
        '<span class="dayun-step__gz">' + c.ganZhi + "</span>" +
        '<span class="dayun-step__year">' + c.startYear + " г.</span>";
      li.addEventListener("click", function () {
        timeline.querySelectorAll(".dayun-step").forEach(function (s) {
          s.classList.remove("active");
        });
        li.classList.add("active");
        if (detail) {
          detail.innerHTML =
            "<p><strong>Такт " + c.ganZhi + "</strong> (" + c.startYear + "–" + (c.startYear + 9) + ").</p>" +
            "<p>" + c.summary + "</p><p>Направление удачи: " + chart.daYun.directionRu + ".</p>";
        }
      });
      timeline.appendChild(li);
    });

    if (detail && chart.daYun.current) {
      detail.innerHTML =
        "<p>Текущий период: <strong>" + chart.daYun.current.ganZhi + "</strong>, с " + chart.daYun.current.startAge + " лет (" + chart.daYun.current.startYear + ").</p>";
    }
  }

  function renderHeatmaps(chart) {
    var heat = $("month-heatmap");
    if (heat) {
      heat.innerHTML = "";
      chart.monthlyLuck.forEach(function (m) {
        var cell = document.createElement("div");
        cell.className = "heatmap-cell level-" + m.level;
        cell.title = "Месяц " + m.month + ": " + m.ganZhi;
        cell.setAttribute("aria-label", "Месяц " + m.month);
        heat.appendChild(cell);
      });
    }

    var yearWrap = $("year-heatmap");
    if (yearWrap) {
      yearWrap.innerHTML = "";
      var birthYear = chart.input.year;
      chart.yearly
        .filter(function (y) {
          return y.year >= birthYear - 30 && y.year <= birthYear + 30;
        })
        .forEach(function (y) {
          var cell = document.createElement("div");
          cell.className = "year-cell level-" + y.level;
          cell.title = y.year + " " + y.ganZhi;
          cell.setAttribute("aria-label", y.year + " " + y.ganZhi);
          yearWrap.appendChild(cell);
        });
    }
  }

  function renderAI(chart) {
    var box = $("ai-report");
    if (!box) return;
    box.innerHTML = "";
    chart.interpretation.paragraphs.forEach(function (p) {
      var el = document.createElement("p");
      el.textContent = p;
      box.appendChild(el);
    });
    var extra = document.createElement("p");
    extra.innerHTML =
      "<em>Карьера:</em> " + chart.interpretation.careerHint +
      "<br><em>Финансы:</em> " + chart.interpretation.financeHint +
      "<br><em>Отношения:</em> " + chart.interpretation.relationshipHint;
    box.appendChild(extra);
  }

  function renderPipeline(chart) {
    var tbody = $("pipeline-tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    chart.meta.steps.forEach(function (s) {
      var tr = document.createElement("tr");
      var resultText = "";
      if (s.step === 1 && s.result.latitude) {
        resultText = s.result.latitude.toFixed(4) + "°N, " + s.result.longitude.toFixed(4) + "°E — " + s.result.name;
      } else if (s.step === 2) {
        resultText = s.result.timezone + " (" + s.result.offset + ")";
      } else if (s.step === 3) {
        resultText = s.result.enabled === false ? "Гражданское время" : "Δ " + s.result.deltaMinutes + " мин";
      } else if (s.step === 5) {
        var p = s.result;
        resultText = p.year.ganZhi + " " + p.month.ganZhi + " " + p.day.ganZhi + " " + p.hour.ganZhi;
      } else if (s.step === 7) {
        resultText = s.result.levelRu + " (" + s.result.percent + "%)";
      } else if (s.step === 8) {
        resultText = "Yong: " + s.result.yongShen.ru + ", Xi: " + s.result.xiShen.ru;
      } else if (s.step === 9) {
        resultText = "Старт: " + s.result.startAge + " лет, " + s.result.directionRu;
      } else {
        resultText = "✓ выполнено";
      }
      tr.innerHTML = "<td>" + s.step + "</td><td>" + s.title + "</td><td>" + resultText + "</td>";
      tbody.appendChild(tr);
    });
  }

  function renderHiddenStems(chart) {
    var tbody = $("hidden-stems-tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    ["year", "month", "day", "hour"].forEach(function (pos) {
      var p = chart.pillars[pos];
      var tr = document.createElement("tr");
      var cells = (p.hiddenStems || []).map(function (h) {
        return h.stem + " <small>(" + h.qi + ", " + h.elementRu + ")</small>";
      }).join("<br>") || "—";
      tr.innerHTML = "<td>" + posRu(pos) + "</td><td>" + p.branch + "</td><td>" + cells + "</td>";
      tbody.appendChild(tr);
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
    renderPipeline(chart);
    renderHiddenStems(chart);
  }

  global.BaziRender = {
    showLoading: showLoading,
    showError: showError,
    showContent: showContent,
    renderAll: renderAll
  };
})(typeof window !== "undefined" ? window : globalThis);
