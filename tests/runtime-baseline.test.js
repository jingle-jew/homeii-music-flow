import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { extractCardVersion } from "../src/core/version-utils.js";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function readProjectFile(...segments) {
  return readFile(path.join(rootDir, ...segments), "utf8");
}

async function readPackageVersion() {
  const pkg = JSON.parse(await readProjectFile("package.json"));
  return String(pkg.version || "");
}

const originalGlobals = {
  CustomEvent: globalThis.CustomEvent,
  customElements: globalThis.customElements,
  document: globalThis.document,
  fetch: globalThis.fetch,
  HTMLElement: globalThis.HTMLElement,
  navigator: globalThis.navigator,
  window: globalThis.window,
};

function installBrowserStubs() {
  globalThis.window = { customCards: [] };
  globalThis.CustomEvent = class CustomEvent extends Event {
    constructor(type, options = {}) {
      super(type, options);
      this.detail = options.detail;
    }
  };
  globalThis.document = {
    createElement(tagName) {
      return { tagName: String(tagName || "").toUpperCase() };
    },
    querySelector() {
      return null;
    },
  };
  globalThis.HTMLElement = class {
    constructor() {
      this.style = {
        setProperty() {},
        removeProperty() {},
      };
      this.classList = createClassList();
      this.offsetWidth = 0;
    }

    attachShadow() {
      const formNode = {
        addEventListener() {},
      };
      const sponsorNode = {
        attributes: {},
        listeners: {},
        addEventListener(type, handler) {
          this.listeners[type] = handler;
        },
        dispatchEvent(event) {
          this.listeners[event.type]?.(event);
        },
        getAttribute(name) {
          return this.attributes[name];
        },
        setAttribute(name, value) {
          this.attributes[name] = String(value);
        },
      };
      const diagnosticsButtonNode = {
        attributes: {},
        disabled: false,
        listeners: {},
        textContent: "Diagnostics",
        addEventListener(type, handler) {
          this.listeners[type] = handler;
        },
        dispatchEvent(event) {
          this.listeners[event.type]?.(event);
        },
        setAttribute(name, value) {
          this.attributes[name] = String(value);
        },
      };
      const diagnosticsCloseNode = {
        attributes: {},
        listeners: {},
        addEventListener(type, handler) {
          this.listeners[type] = handler;
        },
        dispatchEvent(event) {
          this.listeners[event.type]?.(event);
        },
        setAttribute(name, value) {
          this.attributes[name] = String(value);
        },
      };
      const diagnosticsPanelNode = {
        hidden: true,
      };
      const diagnosticsSummaryNode = {
        textContent: "",
      };
      const diagnosticsListNode = {
        innerHTML: "",
      };
      const shellNode = {
        classList: {
          toggle() {},
        },
      };
      const root = {
        innerHTML: "",
        addEventListener() {},
        getElementById() { return null; },
        querySelector(selector) {
          if (selector === "#editorForm") return formNode;
          if (selector === ".editor-shell") return shellNode;
          if (selector === ".editor-sponsor") return sponsorNode;
          if (selector === ".editor-diagnostics") return diagnosticsButtonNode;
          if (selector === "#editorDiagnosticsClose") return diagnosticsCloseNode;
          if (selector === "#editorDiagnosticsPanel") return diagnosticsPanelNode;
          if (selector === "#editorDiagnosticsSummary") return diagnosticsSummaryNode;
          if (selector === "#editorDiagnosticsList") return diagnosticsListNode;
          return null;
        },
        querySelectorAll() { return []; },
      };
      this.shadowRoot = root;
      return root;
    }

    dispatchEvent(event) {
      this.__lastEvent = event;
      return true;
    }

    getBoundingClientRect() {
      return { width: 0, height: 0 };
    }
  };
  globalThis.customElements = {
    registry: new Map(),
    define(name, ctor) {
      this.registry.set(name, ctor);
    },
    get(name) {
      return this.registry.get(name);
    },
  };
}

function expectHomeiiRuntimeRegistered(packageVersion) {
  expect(globalThis.customElements.get("homeii-music-flow")).toBeTypeOf("function");
  expect(globalThis.customElements.get("homeii-music-mobile")).toBeTypeOf("function");
  expect(globalThis.customElements.get("homeii-music-flow-editor")).toBeTypeOf("function");
  expect(globalThis.customElements.get("homeii-music-mobile-editor")).toBeTypeOf("function");

  expect(globalThis.window.customCards).toEqual([
    expect.objectContaining({
      type: "homeii-music-flow",
      name: "HOMEii Flow",
      description: expect.stringContaining(`v${packageVersion}`),
    }),
  ]);
}

function createClassList() {
  const values = new Set();
  return {
    add(name) { values.add(name); },
    remove(name) { values.delete(name); },
    contains(name) { return values.has(name); },
    toggle(name, force) {
      const enabled = force === undefined ? !values.has(name) : !!force;
      if (enabled) values.add(name);
      else values.delete(name);
      return enabled;
    },
  };
}

describe("runtime baseline", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    installBrowserStubs();
  });

  afterEach(() => {
    vi.useRealTimers();
    globalThis.customElements = originalGlobals.customElements;
    globalThis.CustomEvent = originalGlobals.CustomEvent;
    globalThis.document = originalGlobals.document;
    globalThis.fetch = originalGlobals.fetch;
    globalThis.HTMLElement = originalGlobals.HTMLElement;
    Object.defineProperty(globalThis, "navigator", {
      value: originalGlobals.navigator,
      configurable: true,
      writable: true,
    });
    globalThis.window = originalGlobals.window;
  });

  it("keeps package, source, and dist runtime versions aligned", async () => {
    const packageVersion = await readPackageVersion();
    const sourceVersion = extractCardVersion(await readProjectFile("src", "homeii-music-flow.js"));
    const distVersion = extractCardVersion(await readProjectFile("dist", "homeii-music-flow.js"));

    expect(sourceVersion).toBe(packageVersion);
    expect(distVersion).toBe(packageVersion);
  });

  it("keeps versioned editor tags aligned with the runtime version", async () => {
    const packageVersion = await readPackageVersion();
    const expectedSuffix = packageVersion.replace(/\D/g, "");
    const sourceText = await readProjectFile("src", "homeii-music-flow.js");
    const distText = await readProjectFile("dist", "homeii-music-flow.js");

    expect(sourceText).toContain(`homeii-music-flow-browser-editor-v${expectedSuffix}`);
    expect(sourceText).toContain(`homeii-music-flow-editor-v${expectedSuffix}`);
    expect(distText).toContain(`homeii-music-flow-browser-editor-v${expectedSuffix}`);
    expect(distText).toContain(`homeii-music-flow-editor-v${expectedSuffix}`);
  });

  it("registers the card, mobile card, editors, and dashboard picker metadata", async () => {
    const packageVersion = await readPackageVersion();

    await import("../src/homeii-music-flow.js?runtime-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    expectHomeiiRuntimeRegistered(packageVersion);
  });

  it("suppresses phone edge-to-edge while the card is rendered in the visual editor", async () => {
    await import("../src/homeii-music-flow.js?runtime-mobile-edge-editor-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card._state.mobileLayoutMode = "edge_to_edge";

    expect(card._mobileEdgeToEdgeEnabled()).toBe(true);

    card.classList.add("mobile-edge-to-edge-open");
    card.editMode = true;

    expect(card._mobileEdgeToEdgeEnabled()).toBe(false);
    expect(card.classList.contains("mobile-edge-to-edge-open")).toBe(false);

    card.editMode = false;
    const renderBuild = card._build.bind(card);
    card._build = vi.fn();
    card._init = vi.fn();
    card._closeMobileMenu = vi.fn();
    card._closeMobileQueueActionMenu = vi.fn();
    card._closeMobileVolumePresets = vi.fn();
    card._closeSmartVoiceConfirm = vi.fn();
    card._closeControlRoom = vi.fn();
    card._persistMobileAppearance = vi.fn();
    card._state.mobileLayoutMode = "edge_to_edge";

    card._exitMobileEdgeToEdge();

    expect(card._state.mobileLayoutMode).toBe("full");
    expect(card._state.mobileEdgeReturnAvailable).toBe(true);

    card._config = { ...(card._config || {}), settings_source: "visual", mobile_layout_mode: "edge_to_edge" };
    card._applyConfiguredMobileSettings();
    expect(card._state.mobileLayoutMode).toBe("full");
    expect(card._state.mobileEdgeReturnAvailable).toBe(true);

    card._layoutModeConfig = vi.fn(() => "mobile");
    card._getAllocatedCardHeight = vi.fn(() => 760);
    card._getViewportHeight = vi.fn(() => 900);
    renderBuild();
    expect(card.shadowRoot.innerHTML).toContain('id="mobileEdgeEnterBtn"');
    expect(card.shadowRoot.innerHTML).toContain("mobile-edge-return");

    card._state.menuOpen = true;
    renderBuild();
    expect(card.shadowRoot.innerHTML).not.toContain('id="mobileEdgeEnterBtn"');

    card._state.menuOpen = false;
    card._state.mobileLayoutMode = "edge_to_edge";
    card._state.mobileEdgeReturnAvailable = false;
    renderBuild();
    expect(card.shadowRoot.innerHTML).toContain('id="mobileEdgeExitBtn"');

    card._state.menuOpen = true;
    renderBuild();
    expect(card.shadowRoot.innerHTML).not.toContain('id="mobileEdgeExitBtn"');

    card._state.menuOpen = false;
    card._build = vi.fn();
    card._enterMobileEdgeToEdge();

    expect(card._state.mobileLayoutMode).toBe("edge_to_edge");
    expect(card._state.mobileEdgeReturnAvailable).toBe(false);
  });

  it("treats the phone actions page as a fullscreen menu", async () => {
    await import("../src/homeii-music-flow.js?runtime-actions-fullscreen-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();

    expect(card._isPhoneActionFullscreenMenuPage("main")).toBe(true);
    expect(card._isPhoneActionFullscreenMenuPage("players")).toBe(true);
  });

  it("instantiates the visual editor shell and accepts config updates", async () => {
    await import("../src/homeii-music-flow.js?runtime-editor-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const EditorCtor = globalThis.customElements.get("homeii-music-flow-editor");
    const editor = new EditorCtor();
    editor.connectedCallback();
    editor.setConfig({
      type: "custom:homeii-music-flow",
      mobile_quick_actions: ["voice", "search"],
    });

    expect(editor._editorForm).toBeTruthy();
    expect(editor.shadowRoot.innerHTML).toContain('class="editor-sponsor"');
    expect(editor.shadowRoot.innerHTML).toContain('class="editor-diagnostics"');
    expect(editor.shadowRoot.innerHTML).toContain('id="editorDiagnosticsPanel"');
    expect(editor.shadowRoot.innerHTML).toContain('href="https://github.com/sponsors/r11a"');
    expect(editor.shadowRoot.innerHTML).toContain('rel="noopener noreferrer"');
    globalThis.window.confirm = vi.fn(() => false);
    const preventDefault = vi.fn();
    editor._editorSponsorLink.dispatchEvent({ type: "click", preventDefault });
    expect(globalThis.window.confirm).toHaveBeenCalledWith("Open the GitHub Sponsors page?");
    expect(preventDefault).toHaveBeenCalled();
    expect(Array.isArray(editor._editorForm.schema)).toBe(true);
    expect(editor._editorForm.data.mobile_quick_actions).toEqual(["voice", "search"]);
  });

  it("keeps generic Home Assistant media players out of visual editor player settings", async () => {
    await import("../src/homeii-music-flow.js?runtime-editor-ma-player-options-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const EditorCtor = globalThis.customElements.get("homeii-music-flow-editor");
    const editor = new EditorCtor();
    editor.connectedCallback();
    editor.setConfig({
      type: "custom:homeii-music-flow",
      pinned_player_entities: ["media_player.legacy_configured"],
    });
    editor.hass = {
      services: {
        music_assistant: {
          play_media: {},
        },
      },
      states: {
        "media_player.office": {
          entity_id: "media_player.office",
          state: "idle",
          attributes: {
            friendly_name: "Office",
            app_id: "music_assistant",
            mass_player_type: "player",
          },
        },
        "media_player.alexa": {
          entity_id: "media_player.alexa",
          state: "idle",
          attributes: { friendly_name: "Alexa" },
        },
        "media_player.legacy_configured": {
          entity_id: "media_player.legacy_configured",
          state: "idle",
          attributes: { friendly_name: "Legacy configured" },
        },
      },
      entities: {
        "media_player.office": { platform: "music_assistant" },
        "media_player.alexa": { platform: "alexa_media" },
      },
    };

    const values = editor._editorPinnedPlayerOptions().map((option) => option.value);

    expect(values).toContain("media_player.office");
    expect(values).toContain("media_player.legacy_configured");
    expect(values).not.toContain("media_player.alexa");
  });

  it("builds a visual editor diagnostics v3 report with visible status rows", async () => {
    await import("../src/homeii-music-flow.js?runtime-editor-diagnostics-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const EditorCtor = globalThis.customElements.get("homeii-music-flow-editor");
    const editor = new EditorCtor();
    editor.connectedCallback();
    editor.setConfig({
      type: "custom:homeii-music-flow",
      ma_url: "",
    });
    editor.hass = {
      services: {
        music_assistant: {
          play_media: {},
          get_library: {},
        },
      },
      states: {
        "media_player.office": {
          entity_id: "media_player.office",
          state: "playing",
          attributes: {
            app_id: "music_assistant",
            friendly_name: "Office",
            mass_player_type: "player",
          },
        },
      },
      entities: {},
      connection: {
        sendMessagePromise: vi.fn(async () => [
          { entry_id: "ma-entry", domain: "music_assistant", state: "loaded" },
        ]),
      },
    };

    const report = await editor._runEditorDiagnostics();

    expect(report).toContain("HOMEii Music Flow Editor Diagnostics");
    expect(report).toContain("Diagnostics: v3");
    expect(report).toContain("Integration mode");
    expect(report).toContain("Sendspin endpoint");
    expect(report).toContain("Integration signal");
    expect(editor._editorDiagnosticsItems.length).toBeGreaterThan(0);
    expect(editor._editorDiagnosticsPanel.hidden).toBe(false);
    expect(editor._editorDiagnosticsList.innerHTML).toContain("editor-diagnostic-row");
    expect(editor._editorDiagnosticsList.innerHTML).toContain("status-ok");
    expect(editor._editorDiagnosticsList.innerHTML).toContain("status-info");
  });

  it("redacts external diagnostic URLs and closes the visual editor diagnostics panel", async () => {
    await import("../src/homeii-music-flow.js?runtime-editor-diagnostics-privacy-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    globalThis.window.location = {
      href: "https://abc123.ui.nabu.casa/lovelace/music",
      origin: "https://abc123.ui.nabu.casa",
      protocol: "https:",
      hostname: "abc123.ui.nabu.casa",
    };
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      writable: true,
      value: {
      userAgent: "Mozilla/5.0 Edg/148.0.0.0",
      platform: "Win32",
      language: "en-US",
      maxTouchPoints: 10,
      },
    });

    const EditorCtor = globalThis.customElements.get("homeii-music-flow-editor");
    const editor = new EditorCtor();
    editor.connectedCallback();
    editor.setConfig({
      type: "custom:homeii-music-flow",
      ma_url: "https://mass.546866031.xyz",
      ma_token: "secret-token",
    });
    editor.hass = {
      services: {
        music_assistant: {
          play_media: {},
          get_library: {},
        },
      },
      states: {},
      entities: {},
      connection: {
        sendMessagePromise: vi.fn(async () => [
          { entry_id: "ma-entry", domain: "music_assistant", state: "loaded" },
        ]),
      },
    };
    globalThis.fetch = vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    });

    const report = await editor._runEditorDiagnostics();

    expect(report).not.toContain("abc123.ui.nabu.casa");
    expect(report).not.toContain("mass.546866031.xyz");
    expect(report).not.toContain("secret-token");
    expect(report).toContain("https://<redacted-nabu-casa>");
    expect(report).toContain("https://<external-host>");
    expect(report).toContain("host_type=external-host");
    expect(editor._editorDiagnosticsList.innerHTML).not.toContain("mass.546866031.xyz");
    expect(editor._editorDiagnosticsPanel.hidden).toBe(false);

    editor._editorDiagnosticsCloseBtn.dispatchEvent({ type: "click" });
    expect(editor._editorDiagnosticsPanel.hidden).toBe(true);
  });

  it("reports queue artwork samples without leaking artwork hostnames", async () => {
    await import("../src/homeii-music-flow.js?runtime-queue-diagnostics-privacy-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    globalThis.window.location = {
      href: "https://abc123.ui.nabu.casa/lovelace/music",
      origin: "https://abc123.ui.nabu.casa",
      protocol: "https:",
      hostname: "abc123.ui.nabu.casa",
    };

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card._maUrl = "https://mass.546866031.xyz";
    card._hass = {
      states: {},
      services: {
        music_assistant: {
          get_queue: {},
        },
      },
    };
    card._hasMassQueueService = vi.fn(() => false);
    card._hasDirectMAConnection = vi.fn(() => false);
    card._fetchMusicAssistantQueueSnapshot = vi.fn(async () => ({
      state: {
        current_index: 0,
        items: 1,
      },
      items: [
        card._normalizeQueueItem({
          queue_item_id: "queue-1",
          media_item: {
            name: "Queue Track",
            metadata: {
              images: [{ path: "spotify/cover.jpg", provider: "spotify" }],
            },
          },
        }, 0),
      ],
    }));

    const items = [];
    await card._diagnosticQueueRows((status, title, detail = "", value = "") => {
      items.push(card._diagnosticItem(status, title, detail, value));
    }, {
      entity_id: "media_player.office",
      attributes: {
        active_queue: "ma_queue",
      },
    });

    const queueArtwork = items.find((item) => item.title === "Queue artwork sample");
    expect(queueArtwork?.status).toBe("ok");
    expect(queueArtwork?.value).toContain("https://<external-host>");
    expect(queueArtwork?.value).not.toContain("mass.546866031.xyz");
  });

  it("resolves Music Assistant 2.9 queue artwork payloads", async () => {
    await import("../src/homeii-music-flow.js?runtime-queue-art-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card._maUrl = "https://ma.local";

    const normalized = card._normalizeQueueItem({
      queue_item_id: "queue-1",
      media_item: {
        uri: "spotify://track/1",
        name: "Track A",
        metadata: {
          images: [{ path: "spotify/cover.jpg", provider: "spotify" }],
        },
      },
    }, 0);

    expect(card._queueItemImageUrl(normalized, 120)).toBe(
      "https://ma.local/imageproxy?path=spotify%2Fcover.jpg&provider=spotify&size=160",
    );
  });

  it("does not treat relative Music Assistant imageproxy paths as Home Assistant artwork in integration-only mode", async () => {
    await import("../src/homeii-music-flow.js?runtime-integration-only-art-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card._maUrl = "";
    card._maExternalUrl = "";

    expect(card._artUrl({ image: "/imageproxy?path=spotify%2Fcover.jpg" })).toBe("");
    expect(card._artUrl({ image: "imageproxy?path=spotify%2Fcover.jpg" })).toBe("");
    expect(card._artUrl({ image: "/api/media_player_proxy/media_player.office?token=abc" })).toContain("/api/media_player_proxy/media_player.office");
  });

  it("loads selected-player queue snapshots through Home Assistant before direct Music Assistant", async () => {
    await import("../src/homeii-music-flow.js?runtime-queue-ha-first-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const player = {
      entity_id: "media_player.main",
      state: "playing",
      attributes: {
        active_queue: "queue-main",
        media_content_id: "spotify://track/1",
        media_title: "Track A",
        media_artist: "Artist A",
      },
    };
    const queueItem = {
      queue_item_id: "queue-1",
      sort_index: 0,
      media_item: {
        uri: "spotify://track/1",
        name: "Track A",
        media_type: "track",
        artists: [{ name: "Artist A" }],
      },
    };
    card._state.selectedPlayer = player.entity_id;
    card._state.players = [player];
    card._hasDirectMAConnection = vi.fn(() => true);
    card._callDirectMaCommand = vi.fn(async () => ({ items: [] }));
    card._fetchMassQueueItemsSnapshot = vi.fn(async () => null);
    card._prefetchQueueArtworkWindow = vi.fn();
    card._callService = vi.fn(async (service, payload, options) => {
      expect(service).toBe("get_queue");
      expect(payload).toMatchObject({ entity_id: player.entity_id });
      expect(payload).not.toHaveProperty("limit");
      expect(payload).not.toHaveProperty("queue_id");
      expect(options).toEqual({ includeConfigEntryId: false });
      return {
        queue_state: { queue_id: "queue-main", current_index: 0, items: 1, current_item: queueItem },
        items: [queueItem],
      };
    });

    await card._ensureQueueSnapshot(true);

    expect(card._callService).toHaveBeenCalledTimes(1);
    expect(card._callDirectMaCommand).not.toHaveBeenCalled();
    expect(card._fetchMassQueueItemsSnapshot).not.toHaveBeenCalled();
    expect(card._state.maQueueState.queue_id).toBe("queue-main");
    expect(card._state.queueItems).toHaveLength(1);
    expect(card._state.queueItems[0].media_item.name).toBe("Track A");
  });

  it("uses a scoped Home Assistant queue lookup when the unscoped queue snapshot is partial", async () => {
    await import("../src/homeii-music-flow.js?runtime-queue-ha-scoped-partial-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const player = {
      entity_id: "media_player.main",
      state: "playing",
      attributes: {
        active_queue: "queue-main",
        media_content_id: "spotify://track/1",
        media_title: "Track A",
      },
    };
    const makeItem = (index) => ({
      queue_item_id: `queue-${index}`,
      sort_index: index,
      media_item: {
        uri: `spotify://track/${index}`,
        name: `Track ${index}`,
        media_type: "track",
      },
    });
    const fullItems = Array.from({ length: 4 }, (_, index) => makeItem(index));
    card._callService = vi.fn(async (service, payload, options) => {
      expect(service).toBe("get_queue");
      expect(options).toEqual({ includeConfigEntryId: false });
      if (payload.queue_id) {
        return {
          queue_state: { queue_id: "queue-main", current_index: 0, items: 4 },
          items: fullItems,
        };
      }
      return {
        queue_state: { queue_id: "queue-main", current_index: 0, items: 4 },
        items: fullItems.slice(0, 1),
      };
    });

    const snapshot = await card._fetchMusicAssistantQueueSnapshot(player);

    expect(card._callService).toHaveBeenCalledTimes(2);
    expect(card._callService).toHaveBeenNthCalledWith(1, "get_queue", { entity_id: player.entity_id }, { includeConfigEntryId: false });
    expect(card._callService).toHaveBeenNthCalledWith(2, "get_queue", { entity_id: player.entity_id, queue_id: "queue-main" }, { includeConfigEntryId: false });
    expect(snapshot.items).toHaveLength(4);
  });

  it("keeps the unscoped Home Assistant queue snapshot when scoped queue_id is rejected", async () => {
    await import("../src/homeii-music-flow.js?runtime-queue-ha-scoped-rejected-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const player = {
      entity_id: "media_player.main",
      state: "playing",
      attributes: {
        active_queue: "queue-main",
        media_content_id: "spotify://track/1",
        media_title: "Track A",
      },
    };
    const queueItem = {
      queue_item_id: "queue-1",
      sort_index: 0,
      media_item: {
        uri: "spotify://track/1",
        name: "Track A",
        media_type: "track",
      },
    };
    card._callService = vi.fn(async (service, payload) => {
      if (payload.queue_id) throw new Error("extra keys not allowed @ data['queue_id']");
      return {
        queue_state: { queue_id: "queue-main", current_index: 0, items: 12 },
        items: [queueItem],
      };
    });

    const snapshot = await card._fetchMusicAssistantQueueSnapshot(player);

    expect(card._callService).toHaveBeenCalledTimes(2);
    expect(snapshot.items).toHaveLength(1);
    expect(snapshot.items[0].media_item.name).toBe("Track A");
  });

  it("uses direct Music Assistant queue snapshots only after Home Assistant queue lookups fail", async () => {
    await import("../src/homeii-music-flow.js?runtime-queue-direct-fallback-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const player = {
      entity_id: "media_player.main",
      state: "playing",
      attributes: {
        active_queue: "queue-main",
        media_content_id: "spotify://track/2",
        media_title: "Track B",
      },
    };
    card._state.selectedPlayer = player.entity_id;
    card._state.players = [player];
    card._hasDirectMAConnection = vi.fn(() => true);
    card._callService = vi.fn(async () => { throw new Error("HA queue unavailable"); });
    card._fetchMassQueueItemsSnapshot = vi.fn(async () => null);
    card._prefetchQueueArtworkWindow = vi.fn();
    card._callDirectMaCommand = vi.fn(async (command) => {
      if (command === "player_queues/get") return { queue_id: "queue-main", current_index: 1, items: 2 };
      if (command === "player_queues/items") {
        return {
          items: [{
            queue_item_id: "queue-2",
            sort_index: 1,
            media_item: { uri: "spotify://track/2", name: "Track B", media_type: "track" },
          }],
        };
      }
      return null;
    });

    await card._ensureQueueSnapshot(true);

    expect(card._callService).toHaveBeenCalledTimes(1);
    expect(card._fetchMassQueueItemsSnapshot).toHaveBeenCalledTimes(1);
    expect(card._callDirectMaCommand).toHaveBeenCalledWith("player_queues/get", { queue_id: "queue-main" });
    expect(card._callDirectMaCommand).toHaveBeenCalledWith("player_queues/items", { queue_id: "queue-main", limit: 50, offset: 0 });
    expect(card._state.queueItems).toHaveLength(1);
    expect(card._state.queueItems[0].media_item.name).toBe("Track B");
  });

  it("does not use a not_loaded Music Assistant config entry for service calls", async () => {
    await import("../src/homeii-music-flow.js?runtime-ma-not-loaded-config-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card._hass = {
      connection: {
        sendMessagePromise: vi.fn(async () => [
          { entry_id: "ma-entry", domain: "music_assistant", state: "not_loaded" },
        ]),
      },
    };

    await expect(card._ensureConfigEntryId(true)).resolves.toBe("");
    expect(card._resolvedConfigEntryId).toBe("ma-entry");
    expect(card._resolvedConfigEntryState).toBe("not_loaded");
    expect(card._hasUsableMusicAssistantConfigEntry()).toBe(false);
  });

  it("passes discovered config_entry_id to Home Assistant Music Assistant services even when the entry lookup is not_loaded", async () => {
    await import("../src/homeii-music-flow.js?runtime-ma-service-signal-fallback-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const sendMessagePromise = vi.fn(async (message) => {
      if (message.type === "config_entries/get") {
        return [{ entry_id: "ma-entry", domain: "music_assistant", state: "not_loaded" }];
      }
      return { items: [] };
    });
    card._hass = {
      services: {
        music_assistant: {
          get_library: {},
        },
      },
      connection: { sendMessagePromise },
    };

    await expect(card._callService("get_library", { media_type: "album" })).resolves.toEqual({ items: [] });

    expect(sendMessagePromise).toHaveBeenCalledWith(expect.objectContaining({
      type: "call_service",
      domain: "music_assistant",
      service: "get_library",
      service_data: { config_entry_id: "ma-entry", media_type: "album" },
    }));
    expect(card._resolvedConfigEntryId).toBe("ma-entry");
    expect(card._resolvedConfigEntryState).toBe("not_loaded");
    expect(card._state.musicAssistantIssueMessage).toBe("");
  });

  it("uses generic HA media_player fallback when Music Assistant services exist but player markers are missing", async () => {
    await import("../src/homeii-music-flow.js?runtime-ma-generic-player-fallback-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const player = {
      entity_id: "media_player.master_bath",
      state: "playing",
      attributes: {
        friendly_name: "Master Bath",
        media_title: "Introduction",
      },
    };
    card._hass = {
      services: {
        music_assistant: {
          get_library: {},
          play_media: {},
        },
      },
      states: {
        [player.entity_id]: player,
      },
      entities: {
        [player.entity_id]: { platform: "alexa_media" },
      },
    };

    card._loadPlayers();
    card._selectPlayer(player.entity_id, true);

    expect(card._state.players.map((entity) => entity.entity_id)).toContain(player.entity_id);
    expect(card._playerByEntityId(player.entity_id)).toBe(player);
    expect(card._state.selectedPlayer).toBe(player.entity_id);
    expect(card._state.musicAssistantIssueMessage).toBe("");
    expect(card._diagnosticIsStrictMusicAssistantPlayer(player, card._hass.entities)).toBe(false);
    expect(card._diagnosticPlayerMarkerSummary(player, card._hass.entities)).toContain("registry_platform=alexa_media");
  });

  it("selects a player from the dashboard query string", async () => {
    await import("../src/homeii-music-flow.js?runtime-query-string-player-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const previousLocation = globalThis.window.location;
    globalThis.window.location = {
      href: "http://home.local/lovelace/music?player=kitchen_sonos",
      search: "?player=kitchen_sonos",
      hash: "",
      origin: "http://home.local",
      hostname: "home.local",
      protocol: "http:",
    };
    try {
      const CardCtor = globalThis.customElements.get("homeii-music-flow");
      const card = new CardCtor();
      const kitchen = {
        entity_id: "media_player.kitchen_sonos",
        state: "idle",
        attributes: { friendly_name: "Kitchen Sonos", app_id: "music_assistant", mass_player_type: "player" },
      };
      const office = {
        entity_id: "media_player.office",
        state: "playing",
        attributes: { friendly_name: "Office", app_id: "music_assistant", mass_player_type: "player" },
      };
      card._hass = {
        services: { music_assistant: { play_media: {} } },
        states: {
          [office.entity_id]: office,
          [kitchen.entity_id]: kitchen,
        },
        entities: {},
      };

      card._loadPlayers();

      expect(card._state.selectedPlayer).toBe(kitchen.entity_id);
    } finally {
      globalThis.window.location = previousLocation;
    }
  });

  it("reports browser-blocked Direct API as optional when the HA Music Assistant integration is available", async () => {
    await import("../src/homeii-music-flow.js?runtime-direct-ma-cors-integration-fallback-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card.setConfig({
      type: "custom:homeii-music-flow",
      ma_url: "http://192.168.2.61:8095",
    });
    card._hass = {
      services: {
        music_assistant: {
          get_library: {},
        },
      },
    };

    const originalFetch = globalThis.fetch;
    const fetchMock = vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    });
    globalThis.fetch = fetchMock;
    try {
      await expect(card._callDirectMaCommand("players/all")).rejects.toThrow(/blocked by the browser/i);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(card._state.musicAssistantIssueMessage).toBe("");
      await expect(card._callDirectMaCommand("players/all")).rejects.toThrow(/blocked by the browser/i);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("loads library items through direct Music Assistant when the HA entry is not loaded", async () => {
    await import("../src/homeii-music-flow.js?runtime-library-direct-entry-fallback-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card._hasDirectMAConnection = vi.fn(() => true);
    card._callService = vi.fn(async () => {
      throw new Error("Music Assistant entry not_loaded");
    });
    card._callDirectMaCommand = vi.fn(async () => ({
      items: [{
        item_id: "playlist-1",
        provider: "library",
        media_type: "playlist",
        name: "Morning Flow",
      }],
    }));

    const items = await card._fetchLibrary("playlist", "sort_name", 50, false);

    expect(card._callService).toHaveBeenCalledWith("get_library", {
      media_type: "playlist",
      order_by: "sort_name",
      limit: 50,
    });
    expect(card._callDirectMaCommand).toHaveBeenCalledWith("music/playlists/library_items", {
      limit: 50,
      offset: 0,
      order_by: "sort_name",
    });
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      media_type: "playlist",
      name: "Morning Flow",
    });
    expect(card._state.musicAssistantIssueMessage).toBe("");
  });

  it("does not treat the Home Assistant Music Assistant ingress URL as a direct MA API URL", async () => {
    await import("../src/homeii-music-flow.js?runtime-direct-ma-ingress-guard-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card.classList = createClassList();
    card.setConfig({
      type: "custom:homeii-music-flow",
      ma_url: "http://homeassistant.local:8123/d5369777_music_assistant",
    });

    expect(card._isLikelyHomeAssistantIngressMaUrl(card._maBrowserUrl())).toBe(true);
    expect(card._hasDirectMAConnection()).toBe(false);
    await expect(card._callDirectMaCommand("players/all")).rejects.toThrow(/ingress/i);
  });

  it("backs off direct Music Assistant API retries after an invalid ma_url returns 405", async () => {
    await import("../src/homeii-music-flow.js?runtime-direct-ma-405-backoff-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card.classList = createClassList();
    card.setConfig({
      type: "custom:homeii-music-flow",
      ma_url: "http://192.168.2.61:8095",
    });

    const originalFetch = globalThis.fetch;
    const fetchMock = vi.fn(async () => ({
      ok: false,
      status: 405,
      text: async () => "Method Not Allowed",
    }));
    globalThis.fetch = fetchMock;
    try {
      await expect(card._callDirectMaCommand("players/all")).rejects.toThrow(/direct api/i);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(card._hasDirectMAConnection()).toBe(false);
      await expect(card._callDirectMaCommand("players/all")).rejects.toThrow(/direct api/i);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("falls back to direct Music Assistant playback when HA reports the MA entry is not loaded", async () => {
    await import("../src/homeii-music-flow.js?runtime-play-direct-entry-fallback-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const player = {
      entity_id: "media_player.ceiling",
      state: "playing",
      attributes: {
        friendly_name: "Ceiling",
        active_queue: "queue-ceiling",
      },
    };
    card._state.players = [player];
    card._hasDirectMAConnection = vi.fn(() => true);
    card._callHaServiceRaw = vi.fn(async () => {
      throw new Error("Music Assistant entry not_loaded");
    });
    card._callDirectMaCommand = vi.fn(async () => ({}));
    card._toastMediaQueued = vi.fn();

    const ok = await card._playMediaOnPlayer(player.entity_id, "library://playlist/1", "playlist", "play", {
      label: "Morning Flow",
    });

    expect(ok).toBe(true);
    expect(card._callDirectMaCommand).toHaveBeenCalledWith("player_queues/play_media", {
      queue_id: "queue-ceiling",
      media: "library://playlist/1",
      option: "replace",
      radio_mode: false,
    });
    expect(card._toastMediaQueued).toHaveBeenCalledWith("Morning Flow", "Ceiling");
  });

  it("keeps pending queue artwork and title atomic while the player still reports the previous track", async () => {
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    await import("../src/homeii-music-flow.js?runtime-pending-display-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const player = {
      entity_id: "media_player.main",
      state: "idle",
      attributes: {
        active_queue: "queue-main",
        media_content_id: "spotify://track/old",
        media_title: "Old Track",
        media_artist: "Old Artist",
        entity_picture: "https://ha.local/old.jpg",
      },
    };
    const nextItem = {
      queue_item_id: "queue-item-new",
      sort_index: 4,
      media_item: {
        uri: "spotify://track/new",
        name: "New Track",
        media_type: "track",
        image: "https://ha.local/new.jpg",
        artists: [{ name: "New Artist" }],
        album: { name: "New Album" },
      },
    };
    card._state.selectedPlayer = player.entity_id;
    card._state.players = [player];
    card._state.queueItems = [nextItem];
    card._state.maQueueState = { current_index: 4, current_item: nextItem };
    card._state.mobileQueuePlayPendingUntil = Date.now() + 8500;
    card._state.mobileQueuePlayPendingKey = card._getQueueItemPlaybackId(nextItem) || card._getQueueItemStableId(nextItem) || card._getQueueItemKey(nextItem);
    card._state.mobileQueuePlayPendingUri = card._getQueueItemUri(nextItem);
    card._state.mobileQueuePlayPendingIndex = 4;

    const source = card._mobileNowPlayingDisplaySource(card._getSelectedPlayer(), nextItem, { current: nextItem });
    const caughtUpPlayer = {
      ...player,
      state: "playing",
      attributes: {
        ...player.attributes,
        media_content_id: "spotify://track/new",
        media_title: "New Track",
        media_artist: "New Artist",
        entity_picture: "https://ha.local/new.jpg",
      },
    };
    const stableSource = card._mobileNowPlayingDisplaySource(caughtUpPlayer, nextItem, { current: nextItem });

    expect(source.title).toBe("New Track");
    expect(source.artist).toBe("New Artist");
    expect(source.album).toBe("New Album");
    expect(source.art).toContain("new.jpg");
    expect(source.art).not.toContain("old.jpg");
    expect(stableSource.art).toBe(source.art);
  });

  it("prefers Home Assistant player artwork for current now playing outside pending transitions", async () => {
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    await import("../src/homeii-music-flow.js?runtime-current-player-art-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card._maUrl = "http://192.168.1.20:8095";
    const player = {
      entity_id: "media_player.main",
      state: "playing",
      attributes: {
        active_queue: "queue-main",
        media_content_id: "spotify://track/current",
        media_title: "Current Track",
        media_artist: "Current Artist",
        entity_picture: "https://ha.local/api/media_player_proxy/media_player.main?token=abc",
      },
    };
    const currentItem = {
      queue_item_id: "queue-item-current",
      sort_index: 2,
      media_item: {
        uri: "spotify://track/current",
        name: "Current Track",
        media_type: "track",
        image: { path: "spotify/current.jpg", provider: "spotify" },
        artists: [{ name: "Current Artist" }],
      },
    };
    card._state.selectedPlayer = player.entity_id;
    card._state.players = [player];
    card._state.queueItems = [currentItem];
    card._state.maQueueState = { current_index: 2, current_item: currentItem };

    const source = card._mobileNowPlayingDisplaySource(player, currentItem, { current: currentItem });
    expect(source.art).toContain("/api/media_player_proxy/media_player.main");
    expect(source.art).not.toContain("/imageproxy");

    card._state.mobileQueuePlayPendingUntil = Date.now() + 8500;
    card._state.mobileQueuePlayPendingKey = card._getQueueItemPlaybackId(currentItem) || card._getQueueItemStableId(currentItem) || card._getQueueItemKey(currentItem);
    card._state.mobileQueuePlayPendingUri = card._getQueueItemUri(currentItem);
    card._state.mobileQueuePlayPendingIndex = 2;

    const pendingSource = card._mobileNowPlayingDisplaySource(player, currentItem, { current: currentItem });
    expect(pendingSource.art).toContain("/imageproxy");
  });

  it("uses player artwork in the mobile stack when queue artwork is unavailable", async () => {
    await import("../src/homeii-music-flow.js?runtime-mobile-stack-player-art-fallback");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const player = {
      entity_id: "media_player.music_assistant_edge_on_windows",
      state: "playing",
      attributes: {
        app_id: "music_assistant",
        source: "Music Assistant Queue",
        mass_player_type: "player",
        active_queue: "ma_9en0v94t93",
        media_content_id: "library://track/1874",
        media_title: "Introduction",
        media_artist: "B.B. King",
        media_album_name: "Kansas City 1972",
        entity_picture: "/api/media_player_proxy/media_player.music_assistant_edge_on_windows?token=abc&cache=5e5e1249decbcfcf",
      },
    };
    card._state.selectedPlayer = player.entity_id;
    card._state.players = [player];
    card._state.queueItems = [];
    card._state.maQueueState = { current_index: null, current_item: null };

    const art = card._mobileStackItemArtwork(null, "center");
    expect(art).toContain("/api/media_player_proxy/media_player.music_assistant_edge_on_windows");

    const html = card._mobileArtworkStackHtml();
    expect(html).toContain("<img");
    expect(html).toContain("Introduction");
    expect(html).not.toContain("art-stack-card center placeholder");
    expect(html).not.toContain("queue-flow-picker");
  });

  it("renders the opt-in vertical queue flow inside the queue menu without changing the main artwork stack", async () => {
    await import("../src/homeii-music-flow.js?runtime-mobile-vertical-queue-flow");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const queueItems = Array.from({ length: 5 }, (_, index) => ({
      queue_item_id: `queue-${index}`,
      sort_index: index,
      media_item: {
        uri: `spotify://track/${index}`,
        name: `Track ${index}`,
        media_type: "track",
        image: `https://ha.local/art-${index}.jpg`,
      },
    }));
    const player = {
      entity_id: "media_player.main",
      state: "playing",
      attributes: {
        media_content_id: "spotify://track/2",
        media_title: "Track 2",
        media_artist: "Artist 2",
      },
    };
    card._config = { ...(card._config || {}), settings_source: "visual", mobile_queue_flow: false };
    card._state.mobileQueueFlow = false;
    card._state.mobileQuickActions = ["queue", "queue_flow"];
    card._state.mobileQueueFlowQuickOpen = true;
    card._state.selectedPlayer = player.entity_id;
    card._state.players = [player];
    card._state.queueItems = queueItems;
    card._state.maQueueState = { current_index: 2, current_item: queueItems[2] };

    const artworkHtml = card._mobileArtworkStackHtml();
    const queueHtml = card._queueMenuHtml();

    expect(card._mobileQueueFlowEnabled()).toBe(true);
    expect(artworkHtml).not.toContain("queue-flow-picker");
    expect(artworkHtml.match(/art-stack-slide/g)).toHaveLength(3);
    expect(queueHtml).toContain("queue-flow-picker");
    expect(queueHtml).not.toContain("queue-list");
    expect(queueHtml).toContain("queue-flow-art");
    expect(queueHtml).not.toContain("queue-flow-copy");
    expect(queueHtml).toContain("queue-flow-caption");
    expect(queueHtml.match(/data-queue-flow-item/g)).toHaveLength(5);
    expect(queueHtml).toContain("queue-flow-item active centered");
    expect(queueHtml).toContain("Track 2");
    expect(queueHtml).toContain("Artist 2");
    expect(queueHtml).not.toContain("Track 0");
    expect(queueHtml).not.toContain("Track 4");
    expect(card._mobileVisibleQuickActions(["queue", "queue_flow"])).toContain("queue_flow");

    card._state.queueItems = [];
    card._state.maQueueState = { current_index: 2, current_item: null };
    const fallbackQueueHtml = card._queueMenuHtml();
    expect(fallbackQueueHtml).toContain("queue-flow-static");
    expect(fallbackQueueHtml).toContain("Track 2");

    card._state.queueItems = queueItems;
    card._state.maQueueState = { current_index: 2, current_item: queueItems[2] };
    card._build();
    expect(card.shadowRoot.innerHTML).not.toContain('id="mobileQueueFlowTopBtn"');
    card._state.mobileQueueFlow = false;
    card._config.mobile_queue_flow = false;
    card._state.mobileQueueFlow = true;
    card._config.mobile_queue_flow = true;

    const largeQueueItems = Array.from({ length: 120 }, (_, index) => ({
      queue_item_id: `large-${index}`,
      sort_index: index,
      media_item: {
        uri: `spotify://large/${index}`,
        name: `Large Track ${index}`,
        media_type: "track",
        image: `https://ha.local/large-${index}.jpg`,
      },
    }));
    card._state.queueItems = largeQueueItems;
    card._state.maQueueState = { current_index: 80, current_item: largeQueueItems[80] };
    const largeQueueHtml = card._queueMenuHtml();
    expect(largeQueueHtml.match(/data-queue-flow-item/g)).toHaveLength(72);
    expect(largeQueueHtml).toContain('data-queue-flow-total="120"');

    const playSpy = vi.fn().mockResolvedValue(true);
    const closeSpy = vi.fn();
    card._playQueueItem = playSpy;
    card._closeMobileMenu = closeSpy;
    card._showLibraryInteractionFeedback = vi.fn();
    await card._handleMobileMenuClick({
      target: {
        closest: (selector) => selector === "[data-queue-flow-item]" ? {
          dataset: {
            queueItemId: "queue-4",
            uri: "spotify://track/4",
            type: "track",
            sortIndex: "4",
          },
        } : null,
      },
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    });
    expect(playSpy).toHaveBeenCalledWith("queue-4", "spotify://track/4", "track", "4");
    expect(closeSpy).toHaveBeenCalled();

    card._state.mobileQueueFlowQuickOpen = false;
    expect(card._queueMenuHtml()).not.toContain("queue-flow-picker");
    expect(card._mobileVisibleQuickActions(["queue", "queue_flow"])).toContain("queue_flow");
    card._state.mobileQueueFlow = false;
    card._config.mobile_queue_flow = false;
    card._state.mobileQuickActions = ["queue"];
    expect(card._mobileVisibleQuickActions(["queue", "queue_flow"])).not.toContain("queue_flow");
  });

  it("renders library pages and artist albums with the queue-flow style browser", async () => {
    await import("../src/homeii-music-flow.js?runtime-library-flow-browser");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const albums = [
      {
        uri: "library://album/1",
        media_type: "album",
        name: "Album One",
        artist: "Artist One",
        year: 1999,
        image: "https://ha.local/album-one.jpg",
      },
      {
        uri: "library://album/2",
        media_type: "album",
        name: "Album Two",
        artist: "Artist Two",
      },
    ];

    card._state.menuPage = "library_albums";
    card._state.mobileLibraryFlowPage = "library_albums";
    const toolbarHtml = card._mediaLayoutToolbarHtml();
    const libraryFlowHtml = card._libraryFlowPickerHtml(albums, "album");

    expect(toolbarHtml).toContain('data-library-flow-toggle="library_albums"');
    expect(toolbarHtml).toContain("Library wheel");
    expect(libraryFlowHtml).toContain("queue-flow-picker");
    expect(libraryFlowHtml).toContain("data-library-flow-item");
    expect(libraryFlowHtml).toContain('data-media-open="library://album/1"');
    expect(libraryFlowHtml).toContain('data-flow-caption-title="Album One"');
    expect(libraryFlowHtml).not.toContain("data-queue-flow-item");

    card._state.mobileLibraryDetail = {
      media_type: "artist",
      name: "Artist One",
      albums,
      playlists: [],
    };
    const artistHtml = card._libraryArtistDetailHtml({
      media_type: "artist",
      name: "Artist One",
      albums,
      playlists: [],
    });
    const artistAlbumFlowHtml = card._artistAlbumFlowMenuHtml();
    expect(artistHtml).toContain("data-artist-album-flow-open");
    expect(artistHtml).toContain("Album wheel");
    expect(artistHtml).not.toContain("artist-album-flow-page");
    expect(artistHtml).not.toContain("queue-flow-picker");
    expect(artistAlbumFlowHtml).toContain("artist-album-flow-page");
    expect(artistAlbumFlowHtml).toContain("library-flow-full-stage");
    expect(artistAlbumFlowHtml).toContain("queue-flow-picker");
    expect(artistAlbumFlowHtml).not.toContain("library-flow-panel");
    expect(artistAlbumFlowHtml).toContain('data-flow-caption-title="Album One"');
    expect(artistAlbumFlowHtml).toContain('data-flow-caption-artist="1999"');

    const radioFlowHtml = card._libraryFlowPickerHtml([
      {
        uri: "radio://station/1",
        media_type: "radio",
        name: "Station One",
      },
    ], "radio", { className: "library-radio-flow", captionMode: "radio_station" });
    expect(radioFlowHtml).toContain("queue-flow-picker");
    expect(radioFlowHtml).toContain('data-flow-caption-title="Station One"');
    expect(radioFlowHtml).toContain('data-flow-caption-artist=""');
  });

  it("toggles library flow and opens artist album flow from mobile menu buttons", async () => {
    await import("../src/homeii-music-flow.js?runtime-library-flow-toggle");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card._state.menuPage = "library_albums";
    card._renderMobileMenu = vi.fn();
    card._pushMobileMenu = vi.fn();
    card._showLibraryInteractionFeedback = vi.fn();

    const eventForSelector = (selector, element) => ({
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      target: {
        closest: vi.fn((candidate) => (candidate === selector ? element : null)),
      },
    });

    await card._handleMobileMenuClick(eventForSelector("[data-library-flow-toggle]", {
      dataset: { libraryFlowToggle: "library_albums" },
    }));
    expect(card._state.mobileLibraryFlowPage).toBe("library_albums");
    expect(card._renderMobileMenu).toHaveBeenCalledTimes(1);

    await card._handleMobileMenuClick(eventForSelector("[data-artist-album-flow-open]", {
      dataset: { artistAlbumFlowOpen: "1" },
    }));
    expect(card._pushMobileMenu).toHaveBeenCalledWith("artist_album_flow");
    expect(card._renderMobileMenu).toHaveBeenCalledTimes(1);
  });

  it("renders the opt-in vertical cover flow on the main artwork without changing the queue menu flag", async () => {
    await import("../src/homeii-music-flow.js?runtime-mobile-cover-flow");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const queueItems = Array.from({ length: 5 }, (_, index) => ({
      queue_item_id: `cover-${index}`,
      sort_index: index,
      media_item: {
        uri: `spotify://cover/${index}`,
        name: `Cover Track ${index}`,
        media_type: "track",
        image: `https://ha.local/cover-${index}.jpg`,
      },
    }));
    const player = {
      entity_id: "media_player.main",
      state: "playing",
      attributes: {
        media_content_id: "spotify://cover/2",
        media_title: "Cover Track 2",
        media_artist: "Artist 2",
      },
    };
    card._config = { ...(card._config || {}), settings_source: "visual", mobile_cover_flow: true, mobile_queue_flow: false };
    card._state.mobileCoverFlow = true;
    card._state.mobileQueueFlow = false;
    card._state.selectedPlayer = player.entity_id;
    card._state.players = [player];
    card._state.queueItems = queueItems;
    card._state.maQueueState = { current_index: 2, current_item: queueItems[2] };

    const artworkHtml = card._mobileArtworkStackHtml();
    const queueHtml = card._queueMenuHtml();

    expect(card._mobileCoverFlowEnabled()).toBe(true);
    expect(artworkHtml).toContain("cover-flow-viewport");
    expect(artworkHtml.match(/cover-flow-slide/g)).toHaveLength(5);
    expect(artworkHtml).toContain('data-cover-flow-offset="-2"');
    expect(artworkHtml).toContain('data-cover-flow-offset="2"');
    expect(artworkHtml).toContain("Cover Track 2");
    expect(artworkHtml).not.toContain("queue-flow-picker");
    expect(queueHtml).not.toContain("queue-flow-picker");
    expect(card._mobileBrowsePreviewActive({ offset: 1 })).toBe(true);

    const playSpy = vi.fn().mockResolvedValue(true);
    card._playQueueItem = playSpy;
    await card._handleMobileArtTap({
      target: {
        closest: (selector) => selector === ".art-stack-slide" ? {
          dataset: {
            artPosition: "next",
            coverFlowOffset: "1",
            queueItemId: "cover-3",
            uri: "spotify://cover/3",
            type: "track",
            sortIndex: "3",
          },
        } : null,
      },
    });
    expect(playSpy).toHaveBeenCalled();
    expect(playSpy.mock.calls[0][1]).toBe("spotify://cover/3");
  });

  it("renders pending artwork with an immediate image src before decode completes", async () => {
    await import("../src/homeii-music-flow.js?runtime-immediate-art-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const html = card._decodedArtworkImgHtml("https://ha.local/art.jpg", "Artwork", { current: true });

    expect(html).toContain('src="https://ha.local/art.jpg"');
    expect(html).toContain('data-homeii-art-ready="0"');
    expect(html).toContain('fetchpriority="high"');
  });

  it("prefetches the visible queue window and nearby full-size artwork", async () => {
    await import("../src/homeii-music-flow.js?runtime-art-prefetch-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const queueItems = Array.from({ length: 8 }, (_, index) => ({
      queue_item_id: `queue-${index}`,
      sort_index: index,
      media_item: {
        uri: `spotify://track/${index}`,
        name: `Track ${index}`,
        image: `https://ha.local/art-${index}.jpg`,
      },
    }));
    card._state.queueItems = queueItems;
    card._state.maQueueState = { current_index: 3, current_item: queueItems[3] };

    const urls = card._queueArtworkPrefetchUrls(queueItems, { before: 1, after: 2, visibleCount: 2 });

    expect(urls.some((url) => url.includes("art-3.jpg"))).toBe(true);
    expect(urls.some((url) => url.includes("art-0.jpg"))).toBe(true);
    expect(urls.some((url) => url.includes("art-5.jpg"))).toBe(true);
    expect(urls.some((url) => url.includes("art-7.jpg"))).toBe(false);
  });

  it("resolves visible queue rows for scroll-aware artwork prefetch", async () => {
    await import("../src/homeii-music-flow.js?runtime-visible-queue-prefetch-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card._state.menuPage = "queue";
    const body = {
      getBoundingClientRect: () => ({ top: 0, bottom: 300 }),
      querySelectorAll: () => [
        { dataset: { queuePosition: "4" }, getBoundingClientRect: () => ({ top: -240, bottom: -180 }) },
        { dataset: { queuePosition: "10" }, getBoundingClientRect: () => ({ top: 20, bottom: 110 }) },
        { dataset: { queuePosition: "11" }, getBoundingClientRect: () => ({ top: 130, bottom: 220 }) },
        { dataset: { queuePosition: "16" }, getBoundingClientRect: () => ({ top: 520, bottom: 610 }) },
      ],
    };

    expect(card._queueVisibleArtworkWindowFromMenuBody(body)).toMatchObject({
      visibleStartIndex: 9,
    });
  });

  it("does not switch to another playing player during a pending queue transition", async () => {
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    await import("../src/homeii-music-flow.js?runtime-player-lock-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const mainPlayer = {
      entity_id: "media_player.main",
      state: "idle",
      attributes: { friendly_name: "Main", active_queue: "queue-main", mass_player_id: "main" },
    };
    const otherPlayer = {
      entity_id: "media_player.other",
      state: "playing",
      attributes: { friendly_name: "Other", active_queue: "queue-other", mass_player_id: "other", media_title: "Other Track" },
    };
    card._hass = {
      states: {
        [mainPlayer.entity_id]: mainPlayer,
        [otherPlayer.entity_id]: otherPlayer,
      },
      entities: {},
    };
    card._state.selectedPlayer = mainPlayer.entity_id;
    card._state.mobileQueuePlayPendingUntil = Date.now() + 8500;

    card._loadPlayers();

    expect(card._state.selectedPlayer).toBe(mainPlayer.entity_id);
  });

  it("stores the pending queue transition target player for stronger player locking", async () => {
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    await import("../src/homeii-music-flow.js?runtime-pending-player-id-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const item = {
      queue_item_id: "queue-item-new",
      sort_index: 4,
      media_item: { uri: "spotify://track/new", name: "New Track" },
    };
    card._state.selectedPlayer = "media_player.main";

    card._markMobileQueuePlayPending(item, 4);

    expect(card._state.mobileQueuePlayPendingPlayerId).toBe("media_player.main");
  });

  it("lets the screensaver enter while lyrics are open", async () => {
    await import("../src/homeii-music-flow.js?runtime-lyrics-screensaver-block-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card._state.lyricsOpen = true;

    expect(card._screensaverBlocked()).toBe(false);
  });

  it("suppresses the screensaver while the card is open in the visual editor", async () => {
    await import("../src/homeii-music-flow.js?runtime-editor-screensaver-block-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card.classList = createClassList();
    card.shadowRoot = {
      querySelector: () => ({ classList: createClassList() }),
    };
    card.$ = () => null;
    card.offsetWidth = 900;
    card.getBoundingClientRect = () => ({ width: 900, height: 700 });
    card._state.screensaverEnabled = true;

    expect(card._screensaverEnabled()).toBe(true);

    card.editMode = true;

    expect(card._screensaverEnabled()).toBe(true);
    expect(card._screensaverBlocked()).toBe(true);
    card._showScreensaver({ force: true });
    expect(card._state.screensaverOpen).toBe(false);
  });

  it("moves an open lyrics modal into screensaver lyrics without leaving the modal behind", async () => {
    await import("../src/homeii-music-flow.js?runtime-lyrics-screensaver-close-modal-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const overlay = {
      classList: createClassList(),
      dataset: {},
      setAttribute(name, value) {
        this[name] = value;
      },
    };
    const lyricsBackdrop = {
      classList: createClassList(),
      innerHTML: "modal",
      onclick: () => {},
    };
    const cardEl = { classList: createClassList() };
    lyricsBackdrop.classList.add("open");
    card.classList = createClassList();
    card.shadowRoot = {
      querySelector: (selector) => (selector === ".card" ? cardEl : null),
    };
    card.$ = (id) => ({
      screensaverBackdrop: overlay,
      lyricsBackdrop,
    }[id] || null);
    card._screensaverEnabled = () => true;
    card._screensaverBlocked = () => false;
    card._ensureQueueSnapshot = async () => {};
    card._syncScreensaverUi = () => {};
    card._syncLyricsForCurrentTrack = () => {};
    card._state.lyricsOpen = true;
    card._state.lyricsText = "Current lyric";

    card._showScreensaver();

    expect(card._state.screensaverOpen).toBe(true);
    expect(card._state.lyricsOpen).toBe(false);
    expect(card._state.screensaverLyricsOpen).toBe(true);
    expect(card._state.lyricsText).toBe("Current lyric");
    expect(lyricsBackdrop.classList.contains("open")).toBe(false);
    expect(lyricsBackdrop.innerHTML).toBe("");
  });

  it("opens tablet lyrics directly in screensaver mode without keeping the modal open", async () => {
    await import("../src/homeii-music-flow.js?runtime-tablet-lyrics-direct-screensaver-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const overlay = {
      classList: createClassList(),
      dataset: {},
      setAttribute(name, value) {
        this[name] = value;
      },
    };
    const lyricsBackdrop = {
      classList: createClassList(),
      innerHTML: "modal",
      onclick: () => {},
    };
    const cardEl = { classList: createClassList() };
    card.classList = createClassList();
    card.shadowRoot = {
      querySelector: (selector) => (selector === ".card" ? cardEl : null),
    };
    card.$ = (id) => ({
      screensaverBackdrop: overlay,
      lyricsBackdrop,
    }[id] || null);
    card._layoutModeConfig = () => "tablet";
    card._getSelectedPlayer = () => ({ entity_id: "media_player.main", state: "playing", attributes: {} });
    card._ensureQueueSnapshot = async () => {};
    card._syncScreensaverUi = vi.fn();
    card._syncLyricsForCurrentTrack = vi.fn();
    card._screensaverSuppressUntil = Date.now() + 60000;
    card._state.lyricsOpen = true;

    expect(card._openTabletLyricsScreensaver()).toBe(true);

    expect(card._state.screensaverOpen).toBe(true);
    expect(card._state.lyricsOpen).toBe(false);
    expect(card._state.screensaverLyricsOpen).toBe(true);
    expect(lyricsBackdrop.classList.contains("open")).toBe(false);
    expect(card._syncLyricsForCurrentTrack).toHaveBeenCalled();
  });

  it("refreshes lyrics when the current track changes without user interaction", async () => {
    await import("../src/homeii-music-flow.js?runtime-lyrics-track-refresh-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    let renders = 0;
    card._state.lyricsOpen = true;
    card._state.lyricsTrackKey = "old";
    card._currentLyricsTrackKey = () => "new";
    card._renderLyricsModalForCurrentTrack = async () => {
      renders += 1;
      card._state.lyricsTrackKey = "new";
    };

    card._syncLyricsForCurrentTrack();
    await card._lyricsRefreshPromise;

    expect(renders).toBe(1);
    expect(card._state.lyricsTrackKey).toBe("new");
  });

  it("shows lyrics beside artwork in screensaver only while playback is active or freshly paused", async () => {
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    await import("../src/homeii-music-flow.js?runtime-lyrics-screensaver-mode-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const overlay = { classList: createClassList(), dataset: {} };
    const host = { dataset: {}, innerHTML: "" };
    card.$ = (id) => ({ screensaverBackdrop: overlay, screensaverLyrics: host }[id] || null);
    card._state.screensaverOpen = true;
    card._state.lyricsOpen = true;
    card._state.lyricsLines = [
      { time: 0, text: "Before" },
      { time: 10, text: "Current line" },
      { time: 20, text: "Next line" },
    ];
    card._getCurrentPosition = () => 11;

    card._syncScreensaverLyricsUi({ state: "playing", attributes: {} });
    expect(overlay.classList.contains("lyrics-mode")).toBe(true);
    expect(host.innerHTML).toContain("Current line");

    card._syncScreensaverLyricsUi({ state: "paused", attributes: {} });
    vi.advanceTimersByTime(31000);
    card._syncScreensaverLyricsUi({ state: "paused", attributes: {} });

    expect(overlay.classList.contains("lyrics-mode")).toBe(false);
    expect(host.innerHTML).toBe("");
  });

  it("renders an optional screensaver lyrics control button", async () => {
    await import("../src/homeii-music-flow.js?runtime-screensaver-lyrics-button-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const html = card._screensaverControlButtonHtml("lyrics");

    expect(html).toContain('id="screensaverLyricsBtn"');
    expect(html).toContain('data-screensaver-control="lyrics"');
  });

  it("keeps the built dist runtime bundled and registerable", async () => {
    const packageVersion = await readPackageVersion();
    const distText = await readProjectFile("dist", "homeii-music-flow.js");

    expect(distText).not.toContain('from "./core/');
    expect(distText).not.toContain('from "./localization/index.js');
    expect(distText).toContain("./sendspin-js/index.js");
    expect(distText).not.toContain("data:text/javascript");

    await import("../dist/homeii-music-flow.js?runtime-dist-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    expectHomeiiRuntimeRegistered(packageVersion);
  });
});
