/**
 * Калькулятор на главной — расчёт и отображение в HTML на той же странице
 */
(function () {
  var unknownTimeCb = document.getElementById("unknown-time");
  var birthTimeInput = document.getElementById("birth-time");

  if (unknownTimeCb && birthTimeInput) {
    unknownTimeCb.addEventListener("change", function () {
      birthTimeInput.disabled = unknownTimeCb.checked;
      if (unknownTimeCb.checked) birthTimeInput.value = "12:00";
    });
  }

  var form = document.getElementById("bazi-form");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (typeof BaziEngine === "undefined" || typeof BaziRender === "undefined") {
      alert("Запустите сайт через: node server.js → http://localhost:3080/");
      return;
    }

    var btn = document.getElementById("calc-submit");
    var status = document.getElementById("calc-status");

    btn.disabled = true;
    status.hidden = false;
    status.textContent = "Расчёт: координаты → IANA TZ → Jie Qi → столпы…";

    BaziRender.showLoading("chart-results");

    var input = {
      birthDate: document.getElementById("birth-date").value,
      birthTime: document.getElementById("birth-time").value,
      gender: document.getElementById("gender").value,
      country: document.getElementById("country").value,
      city: document.getElementById("city").value,
      unknownTime: unknownTimeCb ? unknownTimeCb.checked : false,
      useTrueSolarTime: document.getElementById("true-solar").checked,
      manualTimezone: document.getElementById("manual-tz").value.trim() || null
    };

    try {
      var chart = await BaziEngine.calculateChart(input);
      sessionStorage.setItem("baziChart", JSON.stringify(chart));
      sessionStorage.removeItem("baziPending");
      BaziRender.showContent(chart);
      status.textContent = "Карта построена. Результат ниже ↓";
      if (history.replaceState) history.replaceState(null, "", "#chart-results");
      document.getElementById("chart-results").scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      BaziRender.showError(err.message || String(err));
      status.textContent = "Ошибка расчёта";
    } finally {
      btn.disabled = false;
    }
  });

  /* Восстановить последнюю карту при загрузке */
  document.addEventListener("DOMContentLoaded", function () {
    try {
      var raw = sessionStorage.getItem("baziChart");
      if (raw && location.hash === "#chart-results") {
        BaziRender.showContent(JSON.parse(raw));
      }
    } catch (e) {}
  });
})();
