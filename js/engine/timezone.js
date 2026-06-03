/**
 * Шаг 2: IANA Time Zone — смещение на момент рождения (DST / история через Intl)
 */
(function (global) {
  /**
   * Смещение таймзоны в минуах восточнее UTC на указанный момент.
   * Использует встроенную IANA TZ database браузера (ECMA-402).
   */
  function getOffsetMinutesAt(ianaTimezone, year, month, day, hour, minute) {
    var utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0);
    var d = new Date(utcGuess);

    var parts = new Intl.DateTimeFormat("en-US", {
      timeZone: ianaTimezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).formatToParts(d);

    var map = {};
    parts.forEach(function (p) {
      if (p.type !== "literal") map[p.type] = p.value;
    });

    var localAsUtc = Date.UTC(
      +map.year,
      +map.month - 1,
      +map.day,
      +map.hour,
      +map.minute,
      0
    );
    return Math.round((localAsUtc - utcGuess) / 60000);
  }

  function formatOffset(minutes) {
    var sign = minutes >= 0 ? "+" : "-";
    var abs = Math.abs(minutes);
    var h = Math.floor(abs / 60);
    var m = abs % 60;
    return "UTC" + sign + String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
  }

  function standardMeridianDeg(offsetMinutes) {
    return (offsetMinutes / 60) * 15;
  }

  global.BaziTimezone = {
    getOffsetMinutesAt: getOffsetMinutesAt,
    formatOffset: formatOffset,
    standardMeridianDeg: standardMeridianDeg
  };
})(typeof window !== "undefined" ? window : globalThis);
