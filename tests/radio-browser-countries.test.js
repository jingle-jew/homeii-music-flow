import { describe, expect, it } from "vitest";

import {
  RADIO_BROWSER_COUNTRY_CODES,
  countryFlagEmoji,
  radioBrowserCountryLabel,
  radioBrowserCountrySelectorOptions,
  regionDisplayName,
} from "../src/core/radio-browser-countries.js";

describe("radio browser countries", () => {
  it("keeps the static country list unique and includes common defaults", () => {
    expect(new Set(RADIO_BROWSER_COUNTRY_CODES).size).toBe(RADIO_BROWSER_COUNTRY_CODES.length);
    expect(RADIO_BROWSER_COUNTRY_CODES).toContain("IL");
    expect(RADIO_BROWSER_COUNTRY_CODES).toContain("US");
  });

  it("uses translated labels before Intl display-name fallback", () => {
    const translate = (key) => (key === "ui.israel" ? "Israel translated" : key);
    expect(radioBrowserCountryLabel("il", translate, "en")).toBe("Israel translated");
    expect(radioBrowserCountryLabel("zz", translate, "en")).toBe(regionDisplayName("ZZ", "en"));
  });

  it("builds selector options with all countries first", () => {
    const translate = (key) => (key === "ui.all_countries" ? "All" : key);
    const options = radioBrowserCountrySelectorOptions(translate, "en");
    expect(options[0]).toEqual({ value: "all", label: "All" });
    expect(options.some((option) => option.value === "IL")).toBe(true);
  });

  it("formats country flags only for two-letter country codes", () => {
    expect(countryFlagEmoji("IL")).toBe(String.fromCodePoint(127397 + 73, 127397 + 76));
    expect(countryFlagEmoji("all")).toBe("");
    expect(countryFlagEmoji("1")).toBe("");
  });
});
