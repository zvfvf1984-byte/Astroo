/**
 * Шаг 6–7: взаимодействия ветвей (冲合刑害破)
 */
(function (global) {
  var CLASH = {
    子: "午", 午: "子", 丑: "未", 未: "丑", 寅: "申", 申: "寅", 卯: "酉", 酉: "卯", 辰: "戌", 戌: "辰", 巳: "亥", 亥: "巳"
  };

  var COMBINE = {
    子: "丑", 丑: "子", 寅: "亥", 亥: "寅", 卯: "戌", 戌: "卯", 辰: "酉", 酉: "辰", 巳: "申", 申: "巳", 午: "未", 未: "午"
  };

  var HARM = {
    子: "未", 未: "子", 丑: "午", 午: "丑", 寅: "巳", 巳: "寅", 卯: "辰", 辰: "卯", 申: "亥", 亥: "申", 酉: "戌", 戌: "酉"
  };

  var PUNISH_GROUPS = [
    ["寅", "巳", "申"],
    ["丑", "戌", "未"],
    ["子", "卯"]
  ];

  var DESTROY = {
    子: "酉", 酉: "子", 午: "卯", 卯: "午", 辰: "丑", 丑: "辰", 戌: "未", 未: "戌"
  };

  function detectInteractions(pillars) {
    var positions = ["year", "month", "day", "hour"];
    var branches = positions.map(function (p) {
      return { pos: p, branch: pillars[p].branch };
    });
    var out = [];

    for (var i = 0; i < branches.length; i++) {
      for (var j = i + 1; j < branches.length; j++) {
        var a = branches[i];
        var b = branches[j];
        if (CLASH[a.branch] === b.branch) {
          out.push({
            type: "clash",
            typeRu: "Столкновение (冲)",
            a: a.pos,
            b: b.pos,
            branches: [a.branch, b.branch],
            description: "Столкновение " + a.branch + " и " + b.branch + " между столпами " + a.pos + " и " + b.pos
          });
        }
        if (COMBINE[a.branch] === b.branch) {
          out.push({
            type: "combine",
            typeRu: "Слияние (合)",
            a: a.pos,
            b: b.pos,
            branches: [a.branch, b.branch],
            description: "Слияние " + a.branch + "–" + b.branch
          });
        }
        if (HARM[a.branch] === b.branch) {
          out.push({
            type: "harm",
            typeRu: "Вред (害)",
            a: a.pos,
            b: b.pos,
            branches: [a.branch, b.branch],
            description: "Вред " + a.branch + " → " + b.branch
          });
        }
        if (DESTROY[a.branch] === b.branch) {
          out.push({
            type: "destroy",
            typeRu: "Разрушение (破)",
            a: a.pos,
            b: b.pos,
            branches: [a.branch, b.branch],
            description: "Разрушение " + a.branch + " и " + b.branch
          });
        }
      }
    }

    PUNISH_GROUPS.forEach(function (group) {
      var hits = branches.filter(function (x) {
        return group.indexOf(x.branch) >= 0;
      });
      if (hits.length >= 2) {
        out.push({
          type: "punishment",
          typeRu: "Наказание (刑)",
          branches: hits.map(function (h) { return h.branch; }),
          positions: hits.map(function (h) { return h.pos; }),
          description: "Наказание в группе " + hits.map(function (h) { return h.branch; }).join("–")
        });
      }
    });

    return out;
  }

  global.BaziInteractions = { detectInteractions: detectInteractions };
})(typeof window !== "undefined" ? window : globalThis);
