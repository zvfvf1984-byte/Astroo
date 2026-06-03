/**
 * BAZI PRO — константы метафизической модели
 */
(function (global) {
  var GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
  var ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

  var GAN_PINYIN = ["jia", "yi", "bing", "ding", "wu", "ji", "geng", "xin", "ren", "gui"];
  var GAN_RU = ["Цзя", "И", "Бин", "Дин", "У", "Цзи", "Гэн", "Синь", "Жэнь", "Гуй"];

  var ELEMENT_BY_GAN = {
    甲: "wood", 乙: "wood", 丙: "fire", 丁: "fire", 戊: "earth", 己: "earth",
    庚: "metal", 辛: "metal", 壬: "water", 癸: "water"
  };

  var ELEMENT_BY_ZHI = {
    子: "water", 丑: "earth", 寅: "wood", 卯: "wood", 辰: "earth", 巳: "fire",
    午: "fire", 未: "earth", 申: "metal", 酉: "metal", 戌: "earth", 亥: "water"
  };

  var ELEMENT_RU = {
    wood: "Дерево", fire: "Огонь", earth: "Земля", metal: "Металл", water: "Вода"
  };

  var YIN_YANG_GAN = {
    甲: "yang", 乙: "yin", 丙: "yang", 丁: "yin", 戊: "yang", 己: "yin",
    庚: "yang", 辛: "yin", 壬: "yang", 癸: "yin"
  };

  var YIN_YANG_RU = { yang: "Янский", yin: "Иньский" };

  var HIDDEN_STEMS = {
    子: ["癸"],
    丑: ["己", "癸", "辛"],
    寅: ["甲", "丙", "戊"],
    卯: ["乙"],
    辰: ["戊", "乙", "癸"],
    巳: ["丙", "庚", "戊"],
    午: ["丁", "己"],
    未: ["己", "丁", "乙"],
    申: ["庚", "壬", "戊"],
    酉: ["辛"],
    戌: ["戊", "辛", "丁"],
    亥: ["壬", "甲"]
  };

  var HIDDEN_QI_LABEL = ["Основной Qi", "Вторичный Qi", "Третичный Qi"];

  var JIE_QI_NAMES = [
    { name: "小寒", ru: "Сяохань", lon: 285 },
    { name: "大寒", ru: "Дахань", lon: 300 },
    { name: "立春", ru: "Личунь", lon: 315 },
    { name: "雨水", ru: "Юйшуй", lon: 330 },
    { name: "惊蛰", ru: "Цзинчжэ", lon: 345 },
    { name: "春分", ru: "Чуньфэнь", lon: 0 },
    { name: "清明", ru: "Цинмин", lon: 15 },
    { name: "谷雨", ru: "Гуюй", lon: 30 },
    { name: "立夏", ru: "Лися", lon: 45 },
    { name: "小满", ru: "Сяомань", lon: 60 },
    { name: "芒种", ru: "Манчжун", lon: 75 },
    { name: "夏至", ru: "Сячжи", lon: 90 },
    { name: "小暑", ru: "Сяошу", lon: 105 },
    { name: "大暑", ru: "Дашу", lon: 120 },
    { name: "立秋", ru: "Лицю", lon: 135 },
    { name: "处暑", ru: "Чушу", lon: 150 },
    { name: "白露", ru: "Байлу", lon: 165 },
    { name: "秋分", ru: "Цюфэнь", lon: 180 },
    { name: "寒露", ru: "Ханьлу", lon: 195 },
    { name: "霜降", ru: "Шуанцзян", lon: 210 },
    { name: "立冬", ru: "Лидун", lon: 225 },
    { name: "小雪", ru: "Сяосюэ", lon: 240 },
    { name: "大雪", ru: "Дасюэ", lon: 255 },
    { name: "冬至", ru: "Дунчжи", lon: 270 }
  ];

  var MONTH_JIE = ["立春", "惊蛰", "清明", "立夏", "芒种", "小暑", "立秋", "白露", "寒露", "立冬", "大雪", "小寒"];

  var STRENGTH_LEVELS = [
    { id: "extremely_weak", ru: "Крайне слабая" },
    { id: "weak", ru: "Слабая" },
    { id: "balanced", ru: "Сбалансированная" },
    { id: "strong", ru: "Сильная" },
    { id: "extremely_strong", ru: "Крайне сильная" }
  ];

  var COUNTRY_HINTS = {
    ru: "Russia", kz: "Kazakhstan", by: "Belarus", ua: "Ukraine"
  };

  global.BaziConstants = {
    GAN: GAN,
    ZHI: ZHI,
    GAN_PINYIN: GAN_PINYIN,
    GAN_RU: GAN_RU,
    ELEMENT_BY_GAN: ELEMENT_BY_GAN,
    ELEMENT_BY_ZHI: ELEMENT_BY_ZHI,
    ELEMENT_RU: ELEMENT_RU,
    YIN_YANG_GAN: YIN_YANG_GAN,
    YIN_YANG_RU: YIN_YANG_RU,
    HIDDEN_STEMS: HIDDEN_STEMS,
    HIDDEN_QI_LABEL: HIDDEN_QI_LABEL,
    JIE_QI_NAMES: JIE_QI_NAMES,
    MONTH_JIE: MONTH_JIE,
    STRENGTH_LEVELS: STRENGTH_LEVELS,
    COUNTRY_HINTS: COUNTRY_HINTS
  };
})(typeof window !== "undefined" ? window : globalThis);
