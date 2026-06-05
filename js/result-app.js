/**
 * Страница result.html — загрузка и отображение в HTML
 */
(function () {
  async function run() {
    if (typeof BaziRender === "undefined") return;

    var params = new URLSearchParams(location.search);

    if (params.get("recalc") === "1") {
      var pending = sessionStorage.getItem("baziPending");
      if (pending) {
        BaziRender.showLoading();
        try {
          var chart = await BaziEngine.calculateChart(JSON.parse(pending));
          sessionStorage.setItem("baziChart", JSON.stringify(chart));
          history.replaceState({}, "", "result.html");
          BaziRender.showContent(chart);
        } catch (e) {
          BaziRender.showError(e.message || String(e));
        }
        return;
      }
    }

    try {
      var raw = sessionStorage.getItem("baziChart");
      if (raw) {
        BaziRender.showContent(JSON.parse(raw));
        return;
      }
    } catch (e) {}

    BaziRender.showError("Нет данных карты. Вернитесь на главную и постройте карту.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
