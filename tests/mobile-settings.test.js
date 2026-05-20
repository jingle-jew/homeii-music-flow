import { describe, expect, it } from "vitest";

import {
  clampPercent,
  clampMobileIconScale,
  clampMobileFontScale,
  clampSeconds,
  formatAmbientLightPlayerMapEntry,
  isColorCapableLightEntity,
  normalizeEntityList,
  normalizeHomeShortcutPath,
  normalizeMobileFooterMode,
  normalizeMobileLibraryTabs,
  normalizeMobileMainBarItems,
  normalizeMobileMicMode,
  normalizeMobileQuickActions,
  normalizeMobileVolumeMode,
  normalizePinnedPlayerEntities,
  normalizePowerButtonAction,
  normalizeScreensaverClockMode,
  normalizeVoiceAssistantMode,
  normalizeVisualMobileState,
  parseAmbientLightPlayerMap,
} from "../src/core/state/mobile-settings.js";

describe("mobile settings foundation", () => {
  it("normalizes the visual mobile state payload", () => {
    const state = normalizeVisualMobileState({
      language: "he",
      theme_mode: "light",
      performance_mode: true,
      mobile_dynamic_theme_mode: "STRONG",
      mobile_background_motion_mode: "wild",
      mobile_custom_text_tone: "dark",
      mobile_font_scale: 8,
      mobile_icon_scale: 2,
      night_mode: "ON",
      night_mode_auto_start: "23:15",
      night_mode_auto_end: "05:45",
      night_mode_days: [1, 3, 5],
      mobile_compact_mode: true,
      mobile_show_up_next: false,
      mobile_footer_search_enabled: true,
      mobile_studio_shortcut: false,
      mobile_footer_mode: "text",
      mobile_home_shortcut: true,
      mobile_home_shortcut_path: "lovelace/media",
      mobile_volume_mode: "always",
      mobile_mic_mode: "SMART",
      voice_assistant_enabled: true,
      voice_assistant_mode: "ASSIST",
      voice_assistant_agent_id: " conversation.home_assistant ",
      voice_assistant_speak_feedback: true,
      mobile_liked_mode: "local",
      mobile_swipe_mode: "browse",
      mobile_radio_browser_country: "il",
      mobile_library_tabs: ["library_albums"],
      mobile_main_bar_items: ["theme", "settings"],
      mobile_quick_actions: ["voice", "timer", "disconnect_all", "voice"],
      mobile_announcement_presets: ["One", "Two", "Three", "Four"],
      announcement_tts_entity: "tts.living_room",
      announcement_tts_language: "en-GB",
      pinned_player_entities: ["media_player.kitchen", " media_player.kitchen ", "media_player.office"],
      ambient_light_enabled: true,
      ambient_light_entities: ["light.living_room", " light.living_room ", "light.tv"],
      ambient_light_player_map: ["media_player.kitchen = light.kitchen", " media_player.office: light.office "],
      ambient_light_brightness: 150,
      ambient_light_transition: -4,
      ambient_light_cooldown: "soon",
      screensaver_enabled: true,
      screensaver_controls_enabled: true,
      screensaver_clock_mode: "ANALOG",
      screensaver_timeout_seconds: 4,
      screensaver_message: "Enjoy the music",
      screensaver_clock_size: 3,
      screensaver_clock_x: 120,
      screensaver_clock_y: -10,
      power_button_enabled: true,
      power_button_action: "SCENE",
      power_button_entity: " scene.movie_time ",
      discovery_mode_enabled: false,
    }, {
      normalizeClockTime: (value, fallback) => String(value || fallback),
      normalizeNightModeDays: (value) => Array.isArray(value) ? value : [],
      defaultLibraryTabs: ["library_search", "library_playlists"],
      defaultMainBarItems: ["actions", "players", "library", "settings"],
      defaultQuickActions: ["timer", "like", "lyrics"],
      defaultAnnouncementPresets: ["Default A", "Default B", "Default C"],
    });

    expect(state.lang).toBe("he");
    expect(state.cardTheme).toBe("light");
    expect(state.performanceMode).toBe(true);
    expect(state.mobileDynamicThemeMode).toBe("strong");
    expect(state.mobileBackgroundMotionMode).toBe("subtle");
    expect(state.mobileCustomTextTone).toBe("dark");
    expect(state.mobileFontScale).toBe(1.5);
    expect(state.mobileIconScale).toBe(1.25);
    expect(state.mobileNightMode).toBe("on");
    expect(state.mobileNightModeStart).toBe("23:15");
    expect(state.mobileNightModeEnd).toBe("05:45");
    expect(state.mobileNightModeDays).toEqual([1, 3, 5]);
    expect(state.mobileCompactMode).toBe(true);
    expect(state.mobileShowUpNext).toBe(false);
    expect(state.mobileFooterSearchEnabled).toBe(true);
    expect(state.mobileStudioShortcutEnabled).toBe(false);
    expect(state.mobileFooterMode).toBe("text");
    expect(state.mobileHomeShortcutEnabled).toBe(true);
    expect(state.mobileHomeShortcutPath).toBe("lovelace/media");
    expect(state.mobileVolumeMode).toBe("always");
    expect(state.mobileMicMode).toBe("smart");
    expect(state.voiceAssistantEnabled).toBe(true);
    expect(state.voiceAssistantMode).toBe("assist");
    expect(state.voiceAssistantAgentId).toBe("conversation.home_assistant");
    expect(state.voiceAssistantSpeakFeedback).toBe(true);
    expect(state.mobileLikedMode).toBe("local");
    expect(state.mobileSwipeMode).toBe("browse");
    expect(state.mobileRadioBrowserCountry).toBe("il");
    expect(state.mobileLibraryTabs).toEqual(["library_albums"]);
    expect(state.mobileMainBarItems).toEqual(["theme", "settings"]);
    expect(state.mobileQuickActions).toEqual(["voice", "timer", "disconnect_all"]);
    expect(state.mobileAnnouncementPresets).toEqual(["One", "Two", "Three"]);
    expect(state.mobileAnnouncementTtsEntity).toBe("tts.living_room");
    expect(state.mobileAnnouncementTtsLanguage).toBe("en-GB");
    expect(state.pinnedPlayerEntities).toEqual(["media_player.kitchen", "media_player.office"]);
    expect(state.ambientLightEnabled).toBe(true);
    expect(state.ambientLightEntities).toEqual(["light.living_room", "light.tv"]);
    expect(state.ambientLightPlayerMap).toEqual(["media_player.kitchen = light.kitchen", "media_player.office: light.office"]);
    expect(state.ambientLightBrightness).toBe(100);
    expect(state.ambientLightTransition).toBe(0);
    expect(state.ambientLightCooldown).toBe(8);
    expect(state.screensaverEnabled).toBe(true);
    expect(state.screensaverControlsEnabled).toBe(true);
    expect(state.screensaverClockMode).toBe("analog");
    expect(state.screensaverTimeoutSeconds).toBe(15);
    expect(state.screensaverMessage).toBe("Enjoy the music");
    expect(state.screensaverClockSize).toBe(1.45);
    expect(state.screensaverClockX).toBe(92);
    expect(state.screensaverClockY).toBe(8);
    expect(state.powerButtonEnabled).toBe(true);
    expect(state.powerButtonAction).toBe("scene");
    expect(state.powerButtonEntity).toBe("scene.movie_time");
    expect(state.discoveryModeEnabled).toBe(false);
  });

  it("normalizes main bar and library tab selections", () => {
    expect(normalizeVisualMobileState({}).lang).toBe("en");

    expect(normalizeMobileMainBarItems(["settings", "players", "theme"], {
      usesVisualSettings: true,
      hidePlayers: true,
      fallbackItems: ["actions", "players", "library", "settings"],
    })).toEqual(["theme"]);

    expect(normalizeMobileMainBarItems(["actions"], {
      usesVisualSettings: false,
      hidePlayers: false,
      fallbackItems: ["actions"],
    })).toEqual(["actions", "settings"]);

    expect(normalizeMobileMainBarItems([], {
      usesVisualSettings: false,
      hidePlayers: true,
      fallbackItems: ["actions", "players", "library", "settings"],
    })).toEqual(["actions", "library", "settings"]);

    expect(normalizeMobileLibraryTabs(["library_albums", "library_search", "invalid"], [
      "library_search",
      "library_playlists",
    ])).toEqual(["library_search", "library_albums"]);

    expect(normalizeMobileQuickActions(["voice", "bad", "timer", "disconnect_all", "voice"], ["timer"])).toEqual(["voice", "timer", "disconnect_all"]);
  });

  it("stabilizes home shortcut, footer, mic, and volume modes", () => {
    expect(normalizeHomeShortcutPath("lovelace/media", { leadingSlash: true })).toBe("/lovelace/media");
    expect(normalizeHomeShortcutPath(" /dashboard ", { leadingSlash: true })).toBe("/dashboard");
    expect(normalizeMobileFooterMode("invalid")).toBe("both");
    expect(normalizeMobileMicMode("OFF")).toBe("off");
    expect(normalizeVoiceAssistantMode("music")).toBe("music");
    expect(normalizeVoiceAssistantMode("bad")).toBe("hybrid");
    expect(normalizeMobileVolumeMode("invalid")).toBe("button");
    expect(clampMobileFontScale(0.2)).toBe(0.5);
    expect(clampMobileIconScale(0.2)).toBe(0.8);
  });

  it("normalizes pinned player inputs from single and multi-entity config", () => {
    expect(normalizePinnedPlayerEntities({
      pinned_player_entity: " media_player.office ",
    })).toEqual(["media_player.office"]);

    expect(normalizePinnedPlayerEntities({
      pinned_player_entities: ["media_player.office", "", "media_player.office", "media_player.kitchen"],
    })).toEqual(["media_player.office", "media_player.kitchen"]);
  });

  it("normalizes smart-home controls", () => {
    expect(normalizeEntityList(" light.a, light.b  light.a ")).toEqual(["light.a", "light.b"]);
    expect(clampPercent(0, 35, { min: 1, max: 100 })).toBe(1);
    expect(clampSeconds(999, 3, { min: 0, max: 120 })).toBe(120);
    expect(normalizeScreensaverClockMode("clock")).toBe("digital");
    expect(normalizePowerButtonAction("scene")).toBe("scene");
    expect(normalizePowerButtonAction("bad")).toBe("stop_player");
  });

  it("parses player to light mappings with multiple lights", () => {
    expect(parseAmbientLightPlayerMap([
      "media_player.kitchen = light.kitchen, light.counter",
      "media_player.kitchen = light.table",
      "bad = light.ignored",
    ])).toEqual([
      { player: "media_player.kitchen", lights: ["light.kitchen", "light.counter", "light.table"] },
    ]);
    expect(formatAmbientLightPlayerMapEntry("media_player.kitchen", ["light.kitchen", " light.counter "]))
      .toBe("media_player.kitchen = light.kitchen, light.counter");
  });

  it("detects color capable light entities", () => {
    expect(isColorCapableLightEntity({
      entity_id: "light.rgb_strip",
      attributes: { supported_color_modes: ["brightness", "rgb"] },
    })).toBe(true);
    expect(isColorCapableLightEntity({
      entity_id: "light.legacy_color",
      attributes: { supported_features: 16 },
    })).toBe(true);
    expect(isColorCapableLightEntity({
      entity_id: "light.dimmer",
      attributes: { supported_color_modes: ["brightness"] },
    })).toBe(false);
  });
});
