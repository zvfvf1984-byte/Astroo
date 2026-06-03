/**
 * BAZI PRO — расчётное ядро (оркестратор шагов 1–10)
 * Астрономические столпы: lunar-javascript (Jie Qi / Li Chun / 60 Цзя Цзы)
 * TZ: IANA через Intl | TST: долгота + уравнение времени
 */
(function (global) {
  var C = global.BaziConstants;
  var Geo = global.BaziGeocode;
  var TZ = global.BaziTimezone;
  var ST = global.BaziSolarTime;
  var JQ = global.BaziJieQi;
  var Str = global.BaziStrength;
  var UG = global.BaziUsefulGods;
  var Int = global.BaziInteractions;
  var Yr = global.BaziYearly;
  var Interp = global.BaziInterpretation;

  function parseInput(raw) {
    var dateParts = raw.birthDate.split("-").map(Number);
    var timeParts = (raw.birthTime || "12:00").split(":").map(Number);
    return {
      year: dateParts[0],
      month: dateParts[1],
      day: dateParts[2],
      hour: raw.unknownTime ? 12 : timeParts[0],
      minute: raw.unknownTime ? 0 : (timeParts[1] || 0),
      gender: raw.gender === "female" ? 0 : 1,
      city: raw.city,
      countryCode: raw.country,
      useTrueSolarTime: !!raw.useTrueSolarTime,
      manualTimezone: raw.manualTimezone || null,
      sect: raw.sect === 2 ? 2 : 1
    };
  }

  function pillarFromGanZhi(gz, pos) {
    var stem = gz.substring(0, 1);
    var branch = gz.substring(1, 2);
    return {
      position: pos,
      ganZhi: gz,
      stem: stem,
      branch: branch,
      stemRu: C.GAN_RU[C.GAN.indexOf(stem)],
      element: C.ELEMENT_BY_GAN[stem],
      elementRu: C.ELEMENT_RU[C.ELEMENT_BY_GAN[stem]],
      yinYang: C.YIN_YANG_GAN[stem],
      yinYangRu: C.YIN_YANG_RU[C.YIN_YANG_GAN[stem]],
      branchElement: C.ELEMENT_BY_ZHI[branch],
      branchElementRu: C.ELEMENT_RU[C.ELEMENT_BY_ZHI[branch]],
      hiddenStems: hiddenStemsDetail(branch)
    };
  }

  function hiddenStemsDetail(branch) {
    var stems = C.HIDDEN_STEMS[branch] || [];
    return stems.map(function (s, i) {
      return {
        stem: s,
        qi: C.HIDDEN_QI_LABEL[i] || "Qi",
        element: C.ELEMENT_BY_GAN[s],
        elementRu: C.ELEMENT_RU[C.ELEMENT_BY_GAN[s]]
      };
    });
  }

  function buildDaYun(eightChar, gender, sect) {
    var yun = eightChar.getYun(gender, sect);
    var daYunArr = yun.getDaYun(10);
    var startY = yun.getStartYear();
    var startA = yun.getStartAge();
    var forward = yun.isForward();

    var cycles = daYunArr.map(function (dy, idx) {
      var gz = dy.getGanZhi();
      return {
        index: idx,
        ganZhi: gz,
        stem: gz.substring(0, 1),
        branch: gz.substring(1, 2),
        startAge: dy.getStartAge(),
        endAge: dy.getStartAge() + 10,
        startYear: dy.getStartYear(),
        summary: "Такт " + gz + " — влияние на 10-летний цикл"
      };
    });

    var now = new Date().getFullYear();
    var birthYear = null;
    var current = cycles[0];
    cycles.forEach(function (c) {
      if (c.startYear <= now) current = c;
    });

    return {
      startYear: startY,
      startAge: startA,
      direction: forward ? "forward" : "backward",
      directionRu: forward ? "Вперёд" : "Назад",
      cycles: cycles,
      current: current
    };
  }

  function elementBalancePercent(scores) {
    var total = Object.values(scores).reduce(function (a, b) { return a + b; }, 0) || 1;
    var out = {};
    Object.keys(scores).forEach(function (k) {
      out[k] = Math.round((scores[k] / total) * 100);
    });
    return out;
  }

  /**
   * Полный расчёт карты
   */
  async function calculateChart(rawInput) {
    if (typeof Solar === "undefined") {
      throw new Error("Движок lunar-javascript не загружен.");
    }

    var input = parseInput(rawInput);
    var meta = { steps: [], engine: "BAZI PRO Engine v1", computedAt: new Date().toISOString() };

    /* Шаг 1 */
    var place = await Geo.geocodeBirthPlace(input.city, input.countryCode);
    meta.steps.push({
      step: 1,
      title: "Координаты",
      result: { latitude: place.latitude, longitude: place.longitude, name: place.name, source: place.source }
    });

    /* Шаг 2 */
    var tzId = input.manualTimezone || place.timezone;
    var offsetMin = TZ.getOffsetMinutesAt(tzId, input.year, input.month, input.day, input.hour, input.minute);
    meta.steps.push({
      step: 2,
      title: "Часовой пояс (IANA)",
      result: { timezone: tzId, offset: TZ.formatOffset(offsetMin), offsetMinutes: offsetMin }
    });

    var civil = {
      year: input.year,
      month: input.month,
      day: input.day,
      hour: input.hour,
      minute: input.minute
    };

    var calcTime = Object.assign({}, civil);
    var solarInfo = null;

    /* Шаг 3 */
    if (input.useTrueSolarTime) {
      var stdMeridian = TZ.standardMeridianDeg(offsetMin);
      solarInfo = ST.toTrueSolarTime(civil, place.longitude, stdMeridian);
      calcTime = {
        year: solarInfo.year,
        month: solarInfo.month,
        day: solarInfo.day,
        hour: solarInfo.hour,
        minute: solarInfo.minute
      };
      meta.steps.push({
        step: 3,
        title: "Истинное солнечное время",
        result: {
          civil: civil,
          trueSolar: calcTime,
          deltaMinutes: Math.round(solarInfo.deltaMinutes * 10) / 10,
          eot: Math.round(solarInfo.eot * 10) / 10,
          longitudeCorr: Math.round(solarInfo.longitudeCorr * 10) / 10
        }
      });
    } else {
      meta.steps.push({ step: 3, title: "Истинное солнечное время", result: { enabled: false, used: civil } });
    }

    /* Шаг 4–5 */
    var solar = Solar.fromYmdHms(calcTime.year, calcTime.month, calcTime.day, calcTime.hour, calcTime.minute, 0);
    var lunar = solar.getLunar();
    var eightChar = lunar.getEightChar();
    var jieQi = JQ.nearestJieQi(solar, 3);

    meta.steps.push({
      step: 4,
      title: "Jie Qi (24 сезона)",
      result: {
        nearestBefore: jieQi.before,
        nearestAfter: jieQi.after,
        liChun: jieQi.liChun
      }
    });

    var pillars = {
      year: pillarFromGanZhi(eightChar.getYear(), "year"),
      month: pillarFromGanZhi(eightChar.getMonth(), "month"),
      day: pillarFromGanZhi(eightChar.getDay(), "day"),
      hour: pillarFromGanZhi(eightChar.getTime(), "hour")
    };

    meta.steps.push({ step: 5, title: "Четыре столпа", result: pillars });

    var dayMaster = {
      stem: pillars.day.stem,
      branch: pillars.day.branch,
      ganZhi: pillars.day.ganZhi,
      element: pillars.day.element,
      elementRu: pillars.day.elementRu,
      yinYang: pillars.day.yinYang,
      yinYangRu: pillars.day.yinYangRu,
      label: C.YIN_YANG_RU[pillars.day.yinYang] + " " + pillars.day.elementRu + " (" + pillars.day.stem + ")"
    };

    /* Шаг 6 */
    meta.steps.push({ step: 6, title: "Скрытые стволы", result: {
      year: pillars.year.hiddenStems,
      month: pillars.month.hiddenStems,
      day: pillars.day.hiddenStems,
      hour: pillars.hour.hiddenStems
    }});

    var interactions = Int.detectInteractions(pillars);
    var strength = Str.computeStrength(pillars, pillars.month.branch, interactions);
    var usefulGods = UG.pickUsefulGods(pillars.day.element, strength.level);
    var balance = elementBalancePercent(strength.elementScores);

    meta.steps.push({ step: 7, title: "Сила карты", result: strength });
    meta.steps.push({ step: 8, title: "Полезные элементы", result: usefulGods });

    var daYun = buildDaYun(eightChar, input.gender, input.sect);
    meta.steps.push({ step: 9, title: "Такты Da Yun", result: daYun });

    var yearly = Yr.buildYearlyInfluences(input.year, { interactions: interactions }, usefulGods, 100);
    var monthlyLuck = Yr.buildMonthlyLuck(new Date().getFullYear(), usefulGods);
    meta.steps.push({ step: 10, title: "Годовые влияния", result: { range: "±100 лет", count: yearly.length } });

    var chart = {
      input: input,
      place: place,
      timezone: { id: tzId, offsetMinutes: offsetMin, label: TZ.formatOffset(offsetMin) },
      civilTime: civil,
      calcTime: calcTime,
      solarTimeInfo: solarInfo,
      unknownTime: !!rawInput.unknownTime,
      pillars: pillars,
      dayMaster: dayMaster,
      balance: balance,
      strength: strength,
      usefulGods: usefulGods,
      interactions: interactions,
      daYun: daYun,
      yearly: yearly,
      monthlyLuck: monthlyLuck,
      jieQi: jieQi,
      meta: meta
    };

    chart.interpretation = Interp.buildInterpretation(chart);
    return chart;
  }

  global.BaziEngine = {
    calculateChart: calculateChart,
    parseInput: parseInput
  };
})(typeof window !== "undefined" ? window : globalThis);
