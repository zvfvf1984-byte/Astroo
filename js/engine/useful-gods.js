/**
 * Шаг 8: полезные элементы (Yong / Xi / Ji / Chou)
 */
(function (global) {
  var C = global.BaziConstants;

  var GENERATES = { wood: "fire", fire: "earth", earth: "metal", metal: "water", water: "wood" };
  var GENERATED_BY = { wood: "water", fire: "wood", earth: "fire", metal: "earth", water: "metal" };
  var CONTROLS = { wood: "earth", earth: "water", water: "fire", fire: "metal", metal: "wood" };
  var CONTROLLED_BY = { wood: "metal", fire: "water", earth: "wood", metal: "fire", water: "earth" };

  function pickUsefulGods(dayElement, strengthLevel) {
    var weak = strengthLevel === "extremely_weak" || strengthLevel === "weak";
    var strong = strengthLevel === "strong" || strengthLevel === "extremely_strong";

    var yong, xi, ji, chou;

    if (weak) {
      yong = dayElement;
      xi = GENERATED_BY[dayElement];
      ji = CONTROLS[dayElement];
      chou = CONTROLLED_BY[dayElement];
    } else if (strong) {
      yong = CONTROLLED_BY[dayElement];
      xi = CONTROLS[dayElement];
      ji = dayElement;
      chou = GENERATED_BY[dayElement];
    } else {
      yong = GENERATES[dayElement];
      xi = dayElement;
      ji = CONTROLS[dayElement];
      chou = CONTROLLED_BY[dayElement];
    }

    return {
      yongShen: { element: yong, ru: C.ELEMENT_RU[yong], role: "Основной полезный (Yong Shen)" },
      xiShen: { element: xi, ru: C.ELEMENT_RU[xi], role: "Поддерживающий (Xi Shen)" },
      jiShen: { element: ji, ru: C.ELEMENT_RU[ji], role: "Неблагоприятный (Ji Shen)" },
      chouShen: { element: chou, ru: C.ELEMENT_RU[chou], role: "Враждебный (Chou Shen)" },
      unfavorable: [ji, chou].map(function (e) { return C.ELEMENT_RU[e]; })
    };
  }

  global.BaziUsefulGods = { pickUsefulGods: pickUsefulGods };
})(typeof window !== "undefined" ? window : globalThis);
