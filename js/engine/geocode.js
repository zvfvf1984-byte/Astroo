/**
 * Шаг 1: координаты места рождения (Open-Meteo Geocoding API)
 */
(function (global) {
  var C = global.BaziConstants;

  var CITY_FALLBACK = {
    "москва": { lat: 55.7558, lng: 37.6173, timezone: "Europe/Moscow", name: "Москва" },
    "moscow": { lat: 55.7558, lng: 37.6173, timezone: "Europe/Moscow", name: "Moscow" },
    "санкт-петербург": { lat: 59.9343, lng: 30.3351, timezone: "Europe/Moscow", name: "Санкт-Петербург" },
    "spb": { lat: 59.9343, lng: 30.3351, timezone: "Europe/Moscow", name: "СПб" },
    "новосибирск": { lat: 55.0084, lng: 82.9357, timezone: "Asia/Novosibirsk", name: "Новосибирск" },
    "екатеринбург": { lat: 56.8389, lng: 60.6057, timezone: "Asia/Yekaterinburg", name: "Екатеринбург" },
    "казань": { lat: 55.8304, lng: 49.0661, timezone: "Europe/Moscow", name: "Казань" },
    "алматы": { lat: 43.222, lng: 76.8512, timezone: "Asia/Almaty", name: "Алматы" },
    "астана": { lat: 51.1694, lng: 71.4491, timezone: "Asia/Almaty", name: "Астана" },
    "минск": { lat: 53.9045, lng: 27.5615, timezone: "Europe/Minsk", name: "Минск" },
    "киев": { lat: 50.4501, lng: 30.5234, timezone: "Europe/Kyiv", name: "Киев" },
    "kyiv": { lat: 50.4501, lng: 30.5234, timezone: "Europe/Kyiv", name: "Kyiv" }
  };

  function normalizeCity(s) {
    return (s || "").trim().toLowerCase().replace(/\s+/g, " ");
  }

  function fallback(city, countryCode) {
    var key = normalizeCity(city);
    if (CITY_FALLBACK[key]) return Object.assign({}, CITY_FALLBACK[key]);
    var hint = C && C.COUNTRY_HINTS[countryCode] ? C.COUNTRY_HINTS[countryCode] : "";
    return null;
  }

  async function geocodeBirthPlace(city, countryCode) {
    var fb = fallback(city, countryCode);
    var query = city.trim();
    if (countryCode && C.COUNTRY_HINTS[countryCode]) {
      query += ", " + C.COUNTRY_HINTS[countryCode];
    }

    var url =
      "https://geocoding-api.open-meteo.com/v1/search?name=" +
      encodeURIComponent(query) +
      "&count=5&language=ru&format=json";

    try {
      var res = await fetch(url);
      if (!res.ok) throw new Error("Geocoding HTTP " + res.status);
      var data = await res.json();
      if (data.results && data.results.length) {
        var best = data.results[0];
        return {
          latitude: best.latitude,
          longitude: best.longitude,
          timezone: best.timezone || "UTC",
          name: best.name + (best.admin1 ? ", " + best.admin1 : "") + (best.country ? ", " + best.country : ""),
          source: "open-meteo"
        };
      }
    } catch (e) {
      console.warn("Geocoding API:", e);
    }

    if (fb) {
      fb.source = "fallback";
      return fb;
    }
    throw new Error("Город не найден. Уточните название или выберите крупный город.");
  }

  global.BaziGeocode = { geocodeBirthPlace: geocodeBirthPlace, CITY_FALLBACK: CITY_FALLBACK };
})(typeof window !== "undefined" ? window : globalThis);
