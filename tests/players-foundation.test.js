import { describe, expect, it } from "vitest";

import {
  announcementEligiblePlayers,
  entityMatchTokens,
  favoriteButtonDeviceId,
  favoriteButtonEntityForPlayer,
  getBrowserPlayers,
  getThisDevicePlayer,
  groupAverageVolume,
  groupedPlayerIds,
  isLikelyBrowserPlayer,
  isMusicAssistantPlayer,
  isStaticGroupPlayer,
  mobileNavigableActivePlayers,
  playerByEntityId,
  playerGroupCount,
  playerGroupMemberIds,
  playerGroupMemberNames,
  resolvePreferredFrontPlayerEntity,
  resolvePinnedPlayerEntities,
} from "../src/core/state/players.js";

describe("players foundation", () => {
  const livingRoom = {
    entity_id: "media_player.living_room",
    state: "playing",
    attributes: {
      friendly_name: "Living Room",
      volume_level: 0.4,
    },
  };
  const kitchen = {
    entity_id: "media_player.kitchen",
    state: "paused",
    attributes: {
      friendly_name: "Kitchen",
      volume_level: 0.8,
    },
  };
  const browserPlayer = {
    entity_id: "media_player.browser_tablet",
    state: "idle",
    attributes: {
      friendly_name: "This Device Browser",
      mass_player_type: "browser",
    },
  };
  const groupedLivingRoom = {
    entity_id: "media_player.living_room",
    attributes: {
      friendly_name: "Living Room",
      group_members: ["media_player.kitchen"],
      volume_level: 0.4,
    },
  };
  const staticGroup = {
    entity_id: "media_player.everywhere",
    attributes: {
      friendly_name: "Everywhere",
      is_group: true,
      group_members: ["media_player.everywhere", "media_player.living_room", "media_player.kitchen"],
      volume_level: 0.6,
    },
  };

  it("normalizes tokens and detects browser players", () => {
    expect(entityMatchTokens("media_player.living-room.main")).toEqual(["living", "room", "main"]);
    expect(isLikelyBrowserPlayer(browserPlayer)).toBe(true);
    expect(isLikelyBrowserPlayer(livingRoom)).toBe(false);
    expect(getBrowserPlayers([livingRoom, browserPlayer])).toEqual([browserPlayer]);
  });

  it("detects Music Assistant players from HA state attributes", () => {
    expect(isMusicAssistantPlayer({
      entity_id: "media_player.ma_living_room",
      attributes: { app_id: "music_assistant" },
    })).toBe(true);
    expect(isMusicAssistantPlayer({
      entity_id: "media_player.ma_kitchen",
      attributes: { mass_player_type: "player" },
    })).toBe(true);
    expect(isMusicAssistantPlayer({
      entity_id: "media_player.ma_bedroom",
      attributes: { friendly_name: "Bedroom" },
    }, {
      platform: "music_assistant",
    })).toBe(true);
    expect(isMusicAssistantPlayer(browserPlayer)).toBe(true);
    expect(isMusicAssistantPlayer(livingRoom)).toBe(false);
    expect(isMusicAssistantPlayer({
      entity_id: "light.fake_media",
      attributes: { app_id: "music_assistant" },
    })).toBe(false);
  });

  it("resolves this-device and pinned players safely", () => {
    expect(getThisDevicePlayer([livingRoom, kitchen], "media_player.kitchen")).toEqual(kitchen);
    expect(resolvePinnedPlayerEntities(["media_player.kitchen", "media_player.missing"], [livingRoom, kitchen])).toEqual(["media_player.kitchen"]);
  });

  it("resolves the front player with pin, playing, configured, and fallback hierarchy", () => {
    expect(resolvePreferredFrontPlayerEntity([livingRoom, kitchen], {
      frontPinnedEntityId: "media_player.kitchen",
      pinnedEntityIds: ["media_player.living_room"],
    })).toBe("media_player.kitchen");
    expect(resolvePreferredFrontPlayerEntity([livingRoom, kitchen], {
      frontPinnedEntityId: "media_player.living_room",
      manualFrontEntityId: "media_player.kitchen",
      manualFrontUntil: 2000,
      now: 1000,
    })).toBe("media_player.kitchen");
    expect(resolvePreferredFrontPlayerEntity([livingRoom, kitchen], {
      pinnedEntityIds: ["media_player.kitchen"],
    })).toBe("media_player.living_room");
    expect(resolvePreferredFrontPlayerEntity([livingRoom, kitchen], {
      manualFrontEntityId: "media_player.kitchen",
      manualFrontUntil: 2000,
      now: 1000,
    })).toBe("media_player.kitchen");
    expect(resolvePreferredFrontPlayerEntity([livingRoom, kitchen], {
      manualFrontEntityId: "media_player.kitchen",
      manualFrontUntil: 1000,
      now: 2000,
    })).toBe("media_player.living_room");
    expect(resolvePreferredFrontPlayerEntity([livingRoom, { ...kitchen, state: "playing" }], {
      manualFrontEntityId: "media_player.kitchen",
      manualFrontUntil: 1000,
      now: 2000,
    })).toBe("media_player.kitchen");
    expect(resolvePreferredFrontPlayerEntity([kitchen], {
      pinnedEntityIds: ["media_player.kitchen"],
    })).toBe("media_player.kitchen");
    expect(resolvePreferredFrontPlayerEntity([browserPlayer, kitchen], {
      frontPinnedEntityId: "media_player.browser_tablet",
      currentEntityId: "media_player.browser_tablet",
    })).toBe("media_player.kitchen");
    expect(resolvePreferredFrontPlayerEntity([
      { ...livingRoom, entity_id: "media_player.office" },
      { ...livingRoom, entity_id: "media_player.bedroom" },
    ], {
      orderedEntityIds: ["media_player.bedroom", "media_player.office"],
    })).toBe("media_player.bedroom");
    expect(resolvePreferredFrontPlayerEntity([
      { ...kitchen, entity_id: "media_player.office", state: "idle", attributes: { friendly_name: "Office" } },
      { ...kitchen, entity_id: "media_player.bedroom", state: "idle", attributes: { friendly_name: "Bedroom" } },
    ], {
      orderedEntityIds: ["media_player.bedroom", "media_player.office"],
    })).toBe("media_player.bedroom");
  });

  it("finds players and favorite button entities from entity registries", () => {
    expect(playerByEntityId("media_player.kitchen", [livingRoom], { "media_player.kitchen": kitchen })).toEqual(kitchen);
    expect(favoriteButtonEntityForPlayer({
      player: kitchen,
      hassStates: {
        "button.kitchen_favorite_current_song": {
          entity_id: "button.kitchen_favorite_current_song",
          attributes: { friendly_name: "Kitchen Favorite Current Song" },
        },
        "button.living_room_favorite_current_song": {
          entity_id: "button.living_room_favorite_current_song",
          attributes: { friendly_name: "Living Room Favorite Current Song" },
        },
      },
    })).toBe("button.kitchen_favorite_current_song");
    expect(favoriteButtonDeviceId("button.kitchen_favorite_current_song", {
      "button.kitchen_favorite_current_song": { device_id: "device-123" },
    })).toBe("device-123");
  });

  it("handles group membership, static groups, and derived group stats", () => {
    expect(playerGroupMemberIds(groupedLivingRoom)).toEqual(["media_player.living_room", "media_player.kitchen"]);
    expect(playerGroupCount(groupedLivingRoom)).toBe(2);
    expect(playerGroupMemberNames(groupedLivingRoom, [livingRoom, kitchen])).toEqual(["Living Room", "Kitchen"]);
    expect(groupAverageVolume(groupedLivingRoom, [livingRoom, kitchen])).toBe(60);
    expect(isStaticGroupPlayer(staticGroup)).toBe(true);
  });

  it("finds grouped ids while excluding browser and static group players", () => {
    expect(groupedPlayerIds([groupedLivingRoom, kitchen, browserPlayer, staticGroup])).toEqual(["media_player.kitchen"]);
  });

  it("builds eligible and navigable player lists", () => {
    expect(announcementEligiblePlayers([livingRoom, browserPlayer])).toEqual([livingRoom]);
    expect(mobileNavigableActivePlayers(
      [livingRoom, kitchen, browserPlayer],
      [],
      (player) => player?.state === "playing" || player?.state === "paused",
    )).toEqual([livingRoom, kitchen]);
    expect(mobileNavigableActivePlayers(
      [livingRoom, kitchen, browserPlayer],
      ["media_player.kitchen", "media_player.browser_tablet"],
      () => false,
    )).toEqual([kitchen, browserPlayer]);
  });
});
