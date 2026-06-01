import { describe, expect, it, vi } from "vitest";

// Method body mirrors src/homeii-music-flow.js:26155 — keep in sync.
function _refreshAfterSettingsChange(categories = {}) {
  if (categories.unknown) {
    this._reopenSettingsMenuPreservingScroll({ rebuild: true, init: true });
    return;
  }
  const body = this.$("mobileMenuBody");
  const scrollTop = Math.max(0, Number(body?.scrollTop ?? this._state.mobileSettingsScrollTop ?? 0) || 0);
  this._state.mobileSettingsScrollTop = scrollTop;
  if (categories.playerListChanged) {
    this._loadPlayers();
  }
  if (categories.pinnedChanged) {
    if (typeof this._refreshFrontPinnedPlayer === "function") this._refreshFrontPinnedPlayer();
  }
  void categories.mainBarChanged;
  void categories.quickActionsChanged;
  void categories.libraryTabsChanged;
  this._openMobileMenu("settings", { scrollTop });
  this._restoreMobileMenuScroll(scrollTop, "settings");
}

function createCardStub() {
  return {
    _state: { mobileSettingsScrollTop: 0 },
    $: vi.fn(() => ({ scrollTop: 0 })),
    _build: vi.fn(),
    _init: vi.fn(),
    _loadPlayers: vi.fn(),
    _refreshFrontPinnedPlayer: vi.fn(),
    _openMobileMenu: vi.fn(),
    _restoreMobileMenuScroll: vi.fn(),
    _reopenSettingsMenuPreservingScroll: vi.fn(),
    _refreshAfterSettingsChange,
  };
}

describe("_refreshAfterSettingsChange", () => {
  it("does NOT call _build() when quickActionsChanged is true", () => {
    const card = createCardStub();
    card._refreshAfterSettingsChange({ quickActionsChanged: true });
    expect(card._build).not.toHaveBeenCalled();
  });

  it("does NOT call _init() when playerListChanged is true", () => {
    const card = createCardStub();
    card._refreshAfterSettingsChange({ playerListChanged: true });
    expect(card._init).not.toHaveBeenCalled();
  });

  it("calls _loadPlayers() once when playerListChanged is true", () => {
    const card = createCardStub();
    card._refreshAfterSettingsChange({ playerListChanged: true });
    expect(card._loadPlayers).toHaveBeenCalledTimes(1);
  });

  it("does NOT call _loadPlayers() when only quickActionsChanged is true", () => {
    const card = createCardStub();
    card._refreshAfterSettingsChange({ quickActionsChanged: true });
    expect(card._loadPlayers).not.toHaveBeenCalled();
  });

  it("falls back to _reopenSettingsMenuPreservingScroll when unknown is true", () => {
    const card = createCardStub();
    card._refreshAfterSettingsChange({ unknown: true });
    expect(card._reopenSettingsMenuPreservingScroll).toHaveBeenCalledTimes(1);
    expect(card._reopenSettingsMenuPreservingScroll).toHaveBeenCalledWith({ rebuild: true, init: true });
    expect(card._openMobileMenu).not.toHaveBeenCalled();
  });

  it("calls _openMobileMenu('settings', expect.any(Object)) for any non-unknown category", () => {
    for (const category of [
      "playerListChanged",
      "pinnedChanged",
      "mainBarChanged",
      "quickActionsChanged",
      "libraryTabsChanged",
    ]) {
      const card = createCardStub();
      card._refreshAfterSettingsChange({ [category]: true });
      expect(card._openMobileMenu).toHaveBeenCalledWith("settings", expect.any(Object));
    }
  });
});
