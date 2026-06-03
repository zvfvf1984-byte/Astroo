/**
 * Блок 9: персонализированная интерпретация на основе расчёта (не шаблонный lorem)
 */
(function (global) {
  var C = global.BaziConstants;

  var DAY_MASTER_TRAITS = {
    wood: {
      qualities: "стремление к росту, гибкость, планирование",
      strengths: "стратегическое видение, обучаемость, этика",
      challenges: "нерешительность при давлении, уязвимость к жёсткому контролю"
    },
    fire: {
      qualities: "экспрессия, лидерство, вдохновение",
      strengths: "харизма, скорость решений, публичность",
      challenges: "импульсивность, выгорание, конфликты из-за прямоты"
    },
    earth: {
      qualities: "надёжность, практичность, накопление",
      strengths: "устойчивость, управление ресурсами, доверие",
      challenges: "инерция, избыточная осторожность, застревание в зоне комфорта"
    },
    metal: {
      qualities: "структура, дисциплина, ясные границы",
      strengths: "аналитика, качество, ответственность",
      challenges: "жёсткость, критичность, сложности в мягких переговорах"
    },
    water: {
      qualities: "адаптивность, интуиция, глубина",
      strengths: "исследования, дипломатия, кризисное мышление",
      challenges: "переменчивость настроения, избегание прямых конфронтаций"
    }
  };

  function buildInterpretation(chart) {
    var dm = chart.dayMaster;
    var trait = DAY_MASTER_TRAITS[dm.element] || DAY_MASTER_TRAITS.earth;
    var strength = chart.strength;
    var gods = chart.usefulGods;
    var currentYun = chart.daYun.current;

    var paragraphs = [];

    paragraphs.push(
      "Ваш господин дня — " +
        C.YIN_YANG_RU[dm.yinYang] +
        " " +
        C.ELEMENT_RU[dm.element] +
        " (" +
        dm.stem +
        "). " +
        "Это ядро личности: " +
        trait.qualities +
        "."
    );

    paragraphs.push(
      "Сила карты оценена как «" +
        strength.levelRu +
        "» (" +
        strength.percent +
        "% индекса опоры). " +
        strength.reasoning
    );

    paragraphs.push(
      "Полезная структура: основной элемент — " +
        gods.yongShen.ru +
        ", поддерживающий — " +
        gods.xiShen.ru +
        ". Сдерживающие факторы: " +
        gods.unfavorable.join(", ") +
        "."
    );

    if (currentYun) {
      paragraphs.push(
        "Текущий такт Da Yun (" +
          currentYun.startAge +
          "–" +
          (currentYun.endAge || currentYun.startAge + 10) +
          " лет): столп " +
          currentYun.ganZhi +
          ". " +
          (currentYun.direction === "forward" ? "Прямой порядок удачи." : "Обратный порядок удачи.") +
          " " +
          (currentYun.summary || "")
      );
    }

    var topEl = Object.entries(strength.elementScores).sort(function (a, b) {
      return b[1] - a[1];
    })[0];
    paragraphs.push(
      "Доминирующий элемент в структуре — " +
        C.ELEMENT_RU[topEl[0]] +
        " (" +
        Math.round((topEl[1] / Object.values(strength.elementScores).reduce(function (a, b) { return a + b; }, 0)) * 100) +
        "% веса). Балансируйте решения через " +
        gods.yongShen.ru +
        " в ключевые периоды."
    );

    if (chart.interactions.length) {
      paragraphs.push(
        "В карте " +
          chart.interactions.length +
          " значимых взаимодействий ветвей. " +
          chart.interactions
            .slice(0, 2)
            .map(function (i) { return i.description; })
            .join(" ") +
          (chart.interactions.length > 2 ? " …" : "")
      );
    }

    return {
      summary: paragraphs[0],
      paragraphs: paragraphs,
      traits: trait,
      careerHint: careerHint(dm.element, gods),
      financeHint: financeHint(strength, gods),
      relationshipHint: relationshipHint(chart.interactions, dm.element)
    };
  }

  function careerHint(el, gods) {
    var map = {
      wood: "образование, продукт, HR, экология",
      fire: "медиа, маркетинг, продажи, ивенты",
      earth: "операции, недвижимость, логистика, финансы",
      metal: "инженерия, право, IT, качество",
      water: "аналитика, R&D, консалтинг, международные проекты"
    };
    return "Сильные направления: " + (map[el] || map.earth) + ". Усиливайте активность в периоды элемента «" + gods.yongShen.ru + "».";
  }

  function financeHint(strength, gods) {
    if (strength.level === "weak" || strength.level === "extremely_weak") {
      return "Финансовая стратегия: накопление и партнёрства с элементом «" + gods.xiShen.ru + "», избегайте рискованных циклов «" + gods.jiShen.ru + "».";
    }
    return "Финансовая стратегия: масштабирование в благоприятных тактах; контролируйте избыток «" + gods.jiShen.ru + "».";
  }

  function relationshipHint(interactions, el) {
    var clash = interactions.filter(function (i) { return i.type === "clash"; }).length;
    if (clash >= 2) return "В отношениях важны ясные договорённости — в карте выражены столкновения ветвей.";
    return "Партнёрство: ищите баланс элемента «" + C.ELEMENT_RU[el] + "» и поддерживающий «" + el + "» потенциал.";
  }

  global.BaziInterpretation = { buildInterpretation: buildInterpretation };
})(typeof window !== "undefined" ? window : globalThis);
