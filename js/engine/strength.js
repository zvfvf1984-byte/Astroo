/**
 * Шаг 7: сила карты
 */
(function (global) {
  var C = global.BaziConstants;

  var SEASON_ELEMENT = {
    寅: "wood", 卯: "wood", 辰: "earth",
    巳: "fire", 午: "fire", 未: "earth",
    申: "metal", 酉: "metal", 戌: "earth",
    亥: "water", 子: "water", 丑: "earth"
  };

  var GENERATES = { wood: "fire", fire: "earth", earth: "metal", metal: "water", water: "wood" };
  var CONTROLS = { wood: "earth", earth: "water", water: "fire", fire: "metal", metal: "wood" };

  function elementScore(pillars, dayElement) {
    var scores = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    var positions = ["year", "month", "day", "hour"];

    positions.forEach(function (pos) {
      var p = pillars[pos];
      if (!p) return;
      var w = pos === "month" ? 2.2 : pos === "day" ? 1.8 : pos === "hour" ? 1.4 : 1;
      scores[C.ELEMENT_BY_GAN[p.stem]] = (scores[C.ELEMENT_BY_GAN[p.stem]] || 0) + w;
      scores[C.ELEMENT_BY_ZHI[p.branch]] = (scores[C.ELEMENT_BY_ZHI[p.branch]] || 0) + w * 0.9;
      (C.HIDDEN_STEMS[p.branch] || []).forEach(function (hs, i) {
        scores[C.ELEMENT_BY_GAN[hs]] = (scores[C.ELEMENT_BY_GAN[hs]] || 0) + w * (0.35 - i * 0.08);
      });
    });

    return scores;
  }

  function computeStrength(pillars, monthBranch, interactions) {
    var dayElement = C.ELEMENT_BY_GAN[pillars.day.stem];
    var scores = elementScore(pillars, dayElement);
    var total = Object.values(scores).reduce(function (a, b) {
      return a + b;
    }, 0);
    var self = scores[dayElement] || 0;
    var seasonEl = SEASON_ELEMENT[monthBranch] || "earth";
    var seasonBonus = seasonEl === dayElement ? 1.35 : GENERATES[seasonEl] === dayElement ? 1.15 : CONTROLS[seasonEl] === dayElement ? 0.75 : 1;

    var rootBonus = 0;
    ["year", "month", "day", "hour"].forEach(function (pos) {
      var br = pillars[pos].branch;
      (C.HIDDEN_STEMS[br] || []).forEach(function (hs) {
        if (C.ELEMENT_BY_GAN[hs] === dayElement) rootBonus += 0.35;
      });
      if (C.ELEMENT_BY_ZHI[br] === dayElement) rootBonus += 0.25;
    });

    var clashPenalty = 0;
    (interactions || []).forEach(function (i) {
      if (i.type === "clash" || i.type === "harm" || i.type === "punishment") clashPenalty += 0.15;
      if (i.type === "combine") rootBonus += 0.08;
    });

    var ratio = total > 0 ? (self * seasonBonus + rootBonus - clashPenalty) / total : 0;
    var pct = Math.round(ratio * 100);

    var level;
    if (pct < 18) level = "extremely_weak";
    else if (pct < 32) level = "weak";
    else if (pct < 48) level = "balanced";
    else if (pct < 62) level = "strong";
    else level = "extremely_strong";

    var levelRu = C.STRENGTH_LEVELS.find(function (l) {
      return l.id === level;
    });

    return {
      level: level,
      levelRu: levelRu ? levelRu.ru : level,
      percent: pct,
      elementScores: scores,
      seasonElement: seasonEl,
      reasoning: buildReasoning(level, dayElement, seasonEl, rootBonus, clashPenalty, interactions)
    };
  }

  function buildReasoning(level, dayEl, seasonEl, roots, clash, interactions) {
    var parts = [];
    parts.push(
      "Господин дня — элемент «" + C.ELEMENT_RU[dayEl] + "». Месяц рождения даёт сезон «" + C.ELEMENT_RU[seasonEl] + "»."
    );
    if (roots > 0.5) parts.push("В карте есть корни (藏干) поддержки господина дня.");
    if (clash > 0) parts.push("Столкновения и вред снижают устойчивость структуры.");
    if (interactions && interactions.some(function (i) { return i.type === "combine"; }))
      parts.push("Слияния ветвей частично компенсируют напряжение.");
    parts.push("Итоговая оценка: «" + (C.STRENGTH_LEVELS.find(function (l) { return l.id === level; }) || {}).ru + "».");
    return parts.join(" ");
  }

  global.BaziStrength = { computeStrength: computeStrength, elementScore: elementScore };
})(typeof window !== "undefined" ? window : globalThis);
