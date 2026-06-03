/**
 * Шаг 3: истинное солнечное время (долгота + уравнение времени, Meeus)
 * Солнечное время = гражданское + 4*(λ - λ_std) мин + EoT
 */
(function (global) {
  function dayOfYear(year, month, day) {
    var dt = new Date(Date.UTC(year, month - 1, day));
    var start = new Date(Date.UTC(year, 0, 1));
    return Math.floor((dt - start) / 86400000) + 1;
  }

  /** Уравнение времени, минуты (приближение NOAA) */
  function equationOfTimeMinutes(year, month, day) {
    var n = dayOfYear(year, month, day);
    var B = (2 * Math.PI * (n - 81)) / 364;
    return 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  }

  /**
   * @returns {{ year, month, day, hour, minute, second, deltaMinutes, eot, longitudeCorr }}
   */
  function toTrueSolarTime(civil, longitudeDeg, standardMeridianDeg) {
    var eot = equationOfTimeMinutes(civil.year, civil.month, civil.day);
    var lonCorr = 4 * (longitudeDeg - standardMeridianDeg);
    var delta = lonCorr + eot;

    var totalMin = civil.hour * 60 + civil.minute + delta;
    var dayShift = 0;
    while (totalMin < 0) {
      totalMin += 1440;
      dayShift -= 1;
    }
    while (totalMin >= 1440) {
      totalMin -= 1440;
      dayShift += 1;
    }

    var d = new Date(Date.UTC(civil.year, civil.month - 1, civil.day + dayShift, 0, 0, 0));
    var y = d.getUTCFullYear();
    var m = d.getUTCMonth() + 1;
    var day = d.getUTCDate();
    var hour = Math.floor(totalMin / 60);
    var minute = Math.floor(totalMin % 60);
    var second = Math.round((totalMin % 1) * 60) || 0;

    return {
      year: y,
      month: m,
      day: day,
      hour: hour,
      minute: minute,
      second: second,
      deltaMinutes: delta,
      eot: eot,
      longitudeCorr: lonCorr
    };
  }

  global.BaziSolarTime = {
    equationOfTimeMinutes: equationOfTimeMinutes,
    toTrueSolarTime: toTrueSolarTime
  };
})(typeof window !== "undefined" ? window : globalThis);
