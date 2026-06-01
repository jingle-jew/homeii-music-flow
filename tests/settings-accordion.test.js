import { beforeEach, describe, expect, it } from "vitest";

const STORAGE_KEY = "homeii_music_flow_settings_accordion_open";

// Method bodies mirror src/homeii-music-flow.js:28220 / :28229 — keep in sync.
function _settingsAccordionOpenSet() {
  try {
    const raw = globalThis.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function _persistSettingsAccordionOpen(set) {
  try {
    globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch {
    /* ignore */
  }
}

function createCardStub() {
  return {
    _settingsAccordionOpenSet,
    _persistSettingsAccordionOpen,
  };
}

function createLocalStorageStub() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => { store.set(key, String(value)); },
    removeItem: (key) => { store.delete(key); },
    clear: () => { store.clear(); },
  };
}

describe("settings accordion open-set persistence", () => {
  beforeEach(() => {
    globalThis.localStorage = createLocalStorageStub();
  });

  it("returns empty Set when localStorage is empty", () => {
    const card = createCardStub();
    const result = card._settingsAccordionOpenSet();
    expect(result).toBeInstanceOf(Set);
    expect(result.size).toBe(0);
  });

  it("hydrates a Set from a JSON array in localStorage", () => {
    globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(["display", "players_library"]));
    const card = createCardStub();
    const result = card._settingsAccordionOpenSet();
    expect(result.has("display")).toBe(true);
    expect(result.has("players_library")).toBe(true);
    expect(result.has("voice_assistant")).toBe(false);
  });

  it("persists the set as a JSON array under the expected key", () => {
    const card = createCardStub();
    card._persistSettingsAccordionOpen(new Set(["voice_assistant"]));
    expect(globalThis.localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(["voice_assistant"]));
  });

  it("returns an empty Set without throwing when localStorage holds malformed JSON", () => {
    globalThis.localStorage.setItem(STORAGE_KEY, "not json");
    const card = createCardStub();
    let result;
    expect(() => { result = card._settingsAccordionOpenSet(); }).not.toThrow();
    expect(result).toBeInstanceOf(Set);
    expect(result.size).toBe(0);
  });
});
