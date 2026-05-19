import { describe, expect, it } from "vitest";

import {
  detectLanguage,
  isRtlLanguage,
  translate,
  translateText,
} from "../src/localization/index.js";

describe("localization", () => {
  it("translates by key with English fallback", () => {
    expect(translate("he", "ui.home")).toBe("בית");
    expect(translate("zh-CN", "ui.home")).toBe("首页");
    expect(translate("fr", "ui.home")).toBe("Home");
    expect(translate("he", "missing.key", {}, "Fallback")).toBe("Fallback");
  });

  it("translates legacy English text through the catalog", () => {
    expect(translateText("he", "Now Playing")).toBe("מתנגן עכשיו");
    expect(translateText("zh-CN", "Now Playing")).toBe("正在播放");
    expect(translateText("en", "Now Playing")).toBe("Now Playing");
    expect(translateText("he", "Not in catalog", {}, "Not in catalog")).toBe("Not in catalog");
  });

  it("detects configured languages and falls back to English", () => {
    expect(detectLanguage({ configLanguage: "he" })).toBe("he");
    expect(detectLanguage({ configLanguage: "zh-CN" })).toBe("zh");
    expect(detectLanguage({ configLanguage: "fr" })).toBe("en");
    expect(detectLanguage({ configLanguage: "auto", hass: { locale: { language: "he-IL" } } })).toBe("he");
  });

  it("marks Hebrew as RTL", () => {
    expect(isRtlLanguage("he")).toBe(true);
    expect(isRtlLanguage("en")).toBe(false);
    expect(isRtlLanguage("fr")).toBe(false);
  });
});
