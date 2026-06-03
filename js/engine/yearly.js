/**
 * Шаг 10: годовые влияния ±100 лет
 */
(function (global) {
  var C = global.BaziConstants;

  function ganZhiForYear(solarYear) {
    var solar = Solar.fromYmd(solarYear, 6, 15);
    var ec = solar.getLunar().getEightChar();
    return { stem: ec.getYear().substring(0, 1), branch: ec.getYear().substring(1, 2), ganZhi: ec.getYear() };
  }

  function scoreYearImpact(yearPillar, chart, usefulGods) {
    var yEl = C.ELEMENT_BY_GAN[yearPillar.stem];
    var bEl = C.ELEMENT_BY_ZHI[yearPillar.branch];
    var score = 0;
    if (usefulGods.yongShen.element === yEl || usefulGods.yongShen.element === bEl) score += 2;
    if (usefulGods.xiShen.element === yEl || usefulGods.xiShen.element === bEl) score += 1;
    if (usefulGods.jiShen.element === yEl || usefulGods.jiShen.element === bEl) score -= 2;
    if (usefulGods.chouShen.element === yEl || usefulGods.chouShen.element === bEl) score -= 1;

    (chart.interactions || []).forEach(function (i) {
      if (i.branches && i.branches.indexOf(yearPillar.branch) >= 0) {
        if (i.type === "clash") score -= 2;
        if (i.type === "combine") score += 1;
      }
    });
    return score;
  }

  function buildYearlyInfluences(birthYear, chart, usefulGods, range) {
    range = range || 100;
    var years = [];
    var start = birthYear - range;
    var end = birthYear + range;
    for (var y = start; y <= end; y++) {
      var gz = ganZhiForYear(y);
      var impact = scoreYearImpact(gz, chart, usefulGods);
      years.push({
        year: y,
        ganZhi: gz.ganZhi,
        stem: gz.stem,
        branch: gz.branch,
        impact: impact,
        level: impact >= 2 ? "favorable" : impact <= -2 ? "challenging" : "neutral"
      });
    }
    return years;
  }

  function buildMonthlyLuck(year, usefulGods) {
    var months = [];
    for (var m = 1; m <= 12; m++) {
      var solar = Solar.fromYmd(year, m, 15);
      var ec = solar.getLunar().getEightChar();
      var gz = { stem: ec.getMonth().substring(0, 1), branch: ec.getMonth().substring(1, 2) };
      var impact = scoreYearImpact(gz, { interactions: [] }, usefulGods);
      months.push({ month: m, ganZhi: ec.getMonth(), impact: impact, level: impact >= 1 ? "favorable" : impact <= -1 ? "challenging" : "neutral" });
    }
    return months;
  }

  global.BaziYearly = {
    buildYearlyInfluences: buildYearlyInfluences,
    buildMonthlyLuck: buildMonthlyLuck
  };
})(typeof window !== "undefined" ? window : globalThis);
