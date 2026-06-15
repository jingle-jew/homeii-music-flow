import { describe, expect, it } from "vitest";

import { createBaseBrowserState } from "../src/core/state/defaults.js";

describe("state defaults", () => {
  it("creates the expected browser state skeleton", () => {
    const state = createBaseBrowserState();

    expect(state.view).toBe("home");
    expect(state.queueItems).toEqual([]);
    expect(state.players).toEqual([]);
    expect(state.lang).toBe("en");
    expect(state.cardTheme).toBe("auto");
    expect(state.queueMutationPendingUntil).toBe(0);
    expect(state.mobileQueuePlayPendingUntil).toBe(0);
    expect(state.mobileQueuePlayPendingPlayerId).toBe("");
    expect(state.lyricsOpen).toBe(false);
    expect(state.screensaverLyricsOpen).toBe(false);
    expect(state.lyricsTrackKey).toBe("");
    expect(state.lyricsText).toBe("");
    expect(state.lyricsLoading).toBe(false);
    expect(state.quickMixRecommendationItems).toEqual([]);
    expect(state.controlRoomOpen).toBe(false);
    expect(state.controlRoomRenderSignature).toBe("");
    expect(state.engineStatus).toBe("unknown");
    expect(state.engineAvailable).toBe(false);
    expect(state.engineVersion).toBe("");
    expect(state.engineCapabilities).toEqual({});
    expect(state.engineContext).toBeNull();
    expect(state.engineInstanceId).toBe("");
    expect(state.engineProfileId).toBe("");
    expect(state.engineLastChecked).toBe(0);
    expect(state.engineLastError).toBe("");
    expect(state.activePlayerHelperLastValue).toBeUndefined();
  });

  it("returns a fresh object on every call", () => {
    const first = createBaseBrowserState();
    const second = createBaseBrowserState();

    first.players.push("media_player.office");

    expect(second.players).toEqual([]);
    expect(first).not.toBe(second);
  });
});
