/**
 * Шаг 4: ближайшие Jie Qi (24 节气) через астрономический движок lunar-javascript
 */
(function (global) {
  var C = global.BaziConstants;

  function getJieQiTableAround(solar) {
    var lunar = solar.getLunar();
    var jieQiTable = null;
    try {
      jieQiTable = lunar.getJieQiTable ? lunar.getJieQiTable() : null;
    } catch (e) {
      jieQiTable = null;
    }
    var list = [];
    if (!jieQiTable) return list;

    Object.keys(jieQiTable).forEach(function (name) {
      var jqSolar = jieQiTable[name];
      if (!jqSolar || !jqSolar.getYear) return;
      var meta = C.JIE_QI_NAMES.find(function (j) {
        return j.name === name;
      });
      list.push({
        name: name,
        nameRu: meta ? meta.ru : name,
        solarLongitude: meta ? meta.lon : null,
        ymd: jqSolar.toYmd(),
        hms: jqSolar.toYmdHms ? jqSolar.toYmdHms() : jqSolar.toYmd() + " " + jqSolar.getHour() + ":" + jqSolar.getMinute(),
        solar: jqSolar,
        isJie: C.MONTH_JIE.indexOf(name) >= 0
      });
    });

    list.sort(function (a, b) {
      return a.ymd.localeCompare(b.ymd) || 0;
    });
    return list;
  }

  function nearestJieQi(solar, count) {
    var birthYmd = solar.toYmd();
    var all = getJieQiTableAround(solar);
    var before = all.filter(function (j) {
      return j.ymd <= birthYmd;
    });
    var after = all.filter(function (j) {
      return j.ymd > birthYmd;
    });
    count = count || 4;
    return {
      before: before.slice(-count),
      after: after.slice(0, count),
      liChun: all.find(function (j) {
        return j.name === "立春";
      })
    };
  }

  global.BaziJieQi = {
    getJieQiTableAround: getJieQiTableAround,
    nearestJieQi: nearestJieQi
  };
})(typeof window !== "undefined" ? window : globalThis);
