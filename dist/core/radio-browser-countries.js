export const RADIO_BROWSER_COUNTRY_CODES = Object.freeze(
  "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS XK YE YT ZA ZM ZW"
    .split(" ")
    .filter((code, index, list) => code && list.indexOf(code) === index),
);

export const RADIO_BROWSER_COUNTRY_I18N_KEYS = Object.freeze({
  AU: "ui.australia",
  CA: "ui.canada",
  DE: "ui.germany",
  ES: "ui.spain",
  FR: "ui.france",
  GB: "ui.united_kingdom",
  GR: "ui.greece",
  IL: "ui.israel",
  IT: "ui.italy",
  NL: "ui.netherlands",
  TR: "ui.turkey",
  US: "ui.united_states",
});

const regionDisplayNamesCache = new Map();

export function regionDisplayName(code = "", language = "en") {
  const normalized = String(code || "").trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(normalized)) return normalized;
  const lang = String(language || "en").trim() || "en";
  const cacheKey = `${lang}:${normalized}`;
  if (regionDisplayNamesCache.has(cacheKey)) return regionDisplayNamesCache.get(cacheKey);
  let label = normalized;
  try {
    const displayNames = new Intl.DisplayNames([lang], { type: "region" });
    label = displayNames.of(normalized) || normalized;
  } catch {}
  regionDisplayNamesCache.set(cacheKey, label);
  return label;
}

export function radioBrowserCountryLabel(code = "", translateFn = null, language = "en") {
  const normalized = String(code || "").trim().toUpperCase();
  const i18nKey = RADIO_BROWSER_COUNTRY_I18N_KEYS[normalized];
  if (i18nKey && typeof translateFn === "function") {
    const translated = translateFn(i18nKey);
    if (translated && translated !== i18nKey) return translated;
  }
  return regionDisplayName(normalized, language);
}

export function radioBrowserCountrySelectorOptions(translateFn = null, language = "en") {
  const safeTranslate = typeof translateFn === "function" ? translateFn : (key) => key;
  return [
    { value: "all", label: safeTranslate("ui.all_countries") },
    ...RADIO_BROWSER_COUNTRY_CODES.map((code) => ({
      value: code,
      label: radioBrowserCountryLabel(code, safeTranslate, language),
    })),
  ];
}

export function countryFlagEmoji(code = "") {
  const cc = String(code || "").trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return "";
  return String.fromCodePoint(...[...cc].map((char) => 127397 + char.charCodeAt(0)));
}
