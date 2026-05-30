import { describe, expect, it } from "vitest";

import {
  buildPendingQueuePlayPatch,
  clearPendingQueuePlayPatch,
  nowPlayingDisplaySource,
  pendingPlayerLockState,
  pendingQueuePlayState,
  queueItemMatchesPendingPlay,
} from "../src/core/media/now-playing.js";
import {
  getQueueItemKey,
  getQueueItemPlaybackId,
  getQueueItemStableId,
  getQueueItemUri,
  mediaRefsEquivalent,
} from "../src/core/state/media-queue.js";

const accessors = {
  getQueueItemPlaybackId,
  getQueueItemStableId,
  getQueueItemKey,
  getQueueItemUri,
};

function queueItem(id, sortIndex, image = "") {
  return {
    queue_item_id: id,
    sort_index: sortIndex,
    media_item: {
      uri: `spotify://track/${id}`,
      name: `Track ${id}`,
      media_type: "track",
      image,
      artists: [{ name: `Artist ${id}` }],
      album: { name: `Album ${id}` },
    },
  };
}

describe("media now-playing foundation", () => {
  it("builds and clears pending queue play state including the target player", () => {
    const item = queueItem("next", 4);
    const patch = buildPendingQueuePlayPatch({
      item,
      playIndex: 4,
      selectedPlayerId: "media_player.main",
      now: 1000,
      durationMs: 5000,
      accessors,
    });

    expect(patch).toMatchObject({
      mobileQueuePlayPendingUntil: 6000,
      mobileQueuePlayPendingKey: "next",
      mobileQueuePlayPendingIndex: 4,
      mobileQueuePlayPendingUri: "spotify://track/next",
      mobileQueuePlayPendingPlayerId: "media_player.main",
    });
    expect(pendingQueuePlayState(patch, 2000).hasPendingPlay).toBe(true);
    expect(clearPendingQueuePlayPatch()).toMatchObject({
      mobileQueuePlayPendingUntil: 0,
      mobileQueuePlayPendingPlayerId: "",
    });
  });

  it("matches pending items by stable key, uri, or sort index", () => {
    const item = queueItem("new", 7);
    const pending = pendingQueuePlayState({
      mobileQueuePlayPendingUntil: 9000,
      mobileQueuePlayPendingKey: "",
      mobileQueuePlayPendingUri: "spotify://track/new",
      mobileQueuePlayPendingIndex: null,
    }, 1000);

    expect(queueItemMatchesPendingPlay(item, pending, accessors, mediaRefsEquivalent)).toBe(true);
    expect(queueItemMatchesPendingPlay(queueItem("other", 7), {
      ...pending,
      pendingUri: "",
      pendingIndex: 7,
    }, accessors, mediaRefsEquivalent)).toBe(true);
  });

  it("uses one atomic queue source for title, artwork and uri during pending transitions", () => {
    const oldPlayer = {
      entity_id: "media_player.main",
      attributes: {
        media_content_id: "spotify://track/old",
        media_title: "Old Track",
        media_artist: "Old Artist",
        entity_picture: "https://ha.local/old.jpg",
      },
    };
    const nextItem = queueItem("new", 4, "https://ha.local/new.jpg");
    const state = {
      maQueueState: { current_item: nextItem },
      mobileQueuePlayPendingUntil: 9000,
      mobileQueuePlayPendingKey: "new",
      mobileQueuePlayPendingUri: "spotify://track/new",
      mobileQueuePlayPendingIndex: 4,
    };

    const source = nowPlayingDisplaySource({
      player: oldPlayer,
      currentQueueItem: nextItem,
      queueItems: [nextItem],
      state,
      pendingState: pendingQueuePlayState(state, 1000),
      fallbackTitle: "Nothing playing",
      accessors,
      compareMediaRefs: mediaRefsEquivalent,
      artworkUrlFn: (_player, item) => item?.media_item?.image || "",
    });

    expect(source.title).toBe("Track new");
    expect(source.artist).toBe("Artist new");
    expect(source.album).toBe("Album new");
    expect(source.art).toBe("https://ha.local/new.jpg");
    expect(source.uri).toBe("spotify://track/new");
    expect(source.art).not.toContain("old.jpg");
  });

  it("holds the pending target player while another player reports playing", () => {
    const lock = pendingPlayerLockState({
      selectedPlayer: "media_player.main",
      mobileQueuePlayPendingUntil: 9000,
      mobileQueuePlayPendingPlayerId: "media_player.main",
    }, [
      { entity_id: "media_player.main", state: "idle" },
      { entity_id: "media_player.other", state: "playing" },
    ], 1000);

    expect(lock.shouldHoldSelectedPlayer).toBe(true);
    expect(lock.lockedPlayerId).toBe("media_player.main");
  });
});
