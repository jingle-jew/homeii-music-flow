import { describe, expect, it } from "vitest";

import {
  assertStringArrayIfDefined,
  validateBaseCardEditorConfig,
  validateMobileCardEditorConfig,
} from "../src/config/validators.js";

describe("config validators", () => {
  it("accepts a valid base editor config", () => {
    expect(() =>
      validateBaseCardEditorConfig({
        config_entry_id: "abc",
        ma_interface_target: "_self",
        height: 800,
        main_opacity: 0.9,
        popup_opacity: 0.75,
        cache_ttl: 1000,
        language: "he",
        theme_mode: "dark",
        rtl: true,
        performance_mode: true,
        show_ma_button: false,
        show_theme_toggle: true,
      })
    ).not.toThrow();
  });

  it("rejects invalid base config values", () => {
    expect(() =>
      validateBaseCardEditorConfig({
        performance_mode: "on",
      })
    ).toThrow("performance_mode must be a boolean");
  });

  it("accepts future language codes and rejects non-string language values", () => {
    expect(() =>
      validateBaseCardEditorConfig({
        language: "fr",
      })
    ).not.toThrow();

    expect(() =>
      validateBaseCardEditorConfig({
        language: 7,
      })
    ).toThrow("language must be a string");
  });

  it("accepts a valid mobile-only config", () => {
    expect(() =>
      validateMobileCardEditorConfig({
        language: "auto",
        theme_mode: "light",
        layout_mode: "tablet",
        settings_source: "card",
        night_mode: "auto",
        mobile_dynamic_theme_mode: "strong",
        mobile_background_motion_mode: "subtle",
        mobile_custom_text_tone: "dark",
        mobile_icon_scale: 1.1,
        mobile_volume_mode: "always",
        mobile_mic_mode: "smart",
        voice_assistant_enabled: true,
        voice_assistant_mode: "hybrid",
        voice_assistant_agent_id: "conversation.home_assistant",
        voice_assistant_speak_feedback: true,
        mobile_liked_mode: "local",
        mobile_swipe_mode: "browse",
        mobile_library_tabs: ["library", "queue"],
        mobile_main_bar_items: ["actions", "settings"],
        mobile_quick_actions: ["timer", "voice"],
        mobile_announcement_presets: ["hello"],
        mobile_compact_mode: true,
        mobile_show_up_next: false,
        ambient_light_enabled: true,
        ambient_light_entities: ["light.living_room", "light.tv"],
        ambient_light_player_map: ["media_player.kitchen = light.kitchen"],
        ambient_light_brightness: 35,
        ambient_light_transition: 3,
        ambient_light_cooldown: 8,
        screensaver_enabled: true,
        screensaver_controls_enabled: true,
        screensaver_clock_mode: "analog",
        screensaver_timeout_seconds: 90,
        screensaver_message: "Dinner is ready",
        screensaver_clock_size: 1.15,
        screensaver_clock_x: 80,
        screensaver_clock_y: 24,
        power_button_enabled: true,
        power_button_action: "script",
        power_button_entity: "script.movie_time",
        discovery_mode_enabled: true,
      })
    ).not.toThrow();
  });

  it("rejects invalid mobile control modes", () => {
    expect(() =>
      validateMobileCardEditorConfig({
        mobile_volume_mode: "slider-only",
      })
    ).toThrow("mobile_volume_mode must be one of: always, button");

    expect(() =>
      validateMobileCardEditorConfig({
        voice_assistant_mode: "always-listen",
      })
    ).toThrow("voice_assistant_mode must be one of: hybrid, music, assist");
  });

  it("rejects invalid smart-home config values", () => {
    expect(() =>
      validateMobileCardEditorConfig({
        screensaver_clock_mode: "binary",
      })
    ).toThrow("screensaver_clock_mode must be one of: digital, analog");

    expect(() =>
      validateMobileCardEditorConfig({
        power_button_action: "explode",
      })
    ).toThrow("power_button_action must be one of: stop_player, toggle, turn_on, turn_off, scene, script");

    expect(() =>
      validateMobileCardEditorConfig({
        ambient_light_entities: "light.living_room",
      })
    ).toThrow("ambient_light_entities must be an array of strings");

    expect(() =>
      validateMobileCardEditorConfig({
        ambient_light_player_map: "media_player.kitchen = light.kitchen",
      })
    ).toThrow("ambient_light_player_map must be an array of strings");

    expect(() =>
      validateMobileCardEditorConfig({
        screensaver_clock_size: "large",
      })
    ).toThrow("screensaver_clock_size must be a number");
  });

  it("rejects non-string array members", () => {
    expect(() => assertStringArrayIfDefined(["ok", 7], "mobile_library_tabs")).toThrow(
      "mobile_library_tabs must be an array of strings"
    );
  });
});
