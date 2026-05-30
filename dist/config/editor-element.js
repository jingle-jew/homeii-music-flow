export function createHomeiiBaseMusicEditor(deps = {}) {
  const {
    HomeiiBaseMusicCard,
    ensureHaEditorComponents,
    homeiiIsRtlLanguage,
    homeiiDetectLanguage,
    HomeiiConfigValidators,
    HomeiiPlayersFoundation,
    HomeiiMobileSettingsFoundation,
    homeiiEditorI18n,
    homeiiEditorLabelFor,
    homeiiEditorHelperFor,
    HOMEII_CARD_VERSION,
    AMBIENT_LIGHT_PAIR_PLAYER_PREFIX,
    AMBIENT_LIGHT_PAIR_LIGHTS_PREFIX,
  } = deps;

return class HomeiiBaseMusicEditor extends HTMLElement {
  constructor() {
    super();
    this._config = HomeiiBaseMusicCard.getStubConfig();
    this._hass = null;
    this._editorRoot = null;
    this._editorForm = null;
    this._editorUsePathBtn = null;
    this._editorPathHint = null;
    this._editorAmbientLightDraft = { player: "", lights: [] };
    this._editorBound = false;
    this._editorLastConfigKey = "";
    this._editorLastSchemaKey = "";
  }

  connectedCallback() {
    this.style.display = "block";
    ensureHaEditorComponents();
    this._ensureEditorShell();
    this._render();
  }

  set hass(hass) {
    const previousLang = String(this._hass?.locale?.language || this._hass?.language || "");
    const previousPinnedOptionsKey = this._editorPinnedPlayerOptionsKey();
    this._hass = hass;
    this._ensureEditorShell();
    const nextLang = String(this._hass?.locale?.language || this._hass?.language || "");
    const nextPinnedOptionsKey = this._editorPinnedPlayerOptionsKey();
    if (previousLang !== nextLang || previousPinnedOptionsKey !== nextPinnedOptionsKey || !this._editorRoot || !this._editorForm) {
      this._render();
      return;
    }
    this._syncEditorLiveContext();
  }

  setConfig(config) {
    const nextConfig = {
      ...this._getCardCtor().getStubConfig(),
      ...config,
    };
    const validator = this._getConfigValidator?.();
    if (typeof validator === "function") {
      validator(nextConfig);
    }
    this._config = nextConfig;
    this._ensureEditorShell();
    this._render();
  }

  _getCardCtor() {
    return HomeiiBaseMusicCard;
  }

  _isHebrew() {
    return homeiiIsRtlLanguage(homeiiDetectLanguage({
      configLanguage: this._config?.language || "en",
      hass: this._hass,
    }));
  }

  _esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  _getConfigValidator() {
    return HomeiiConfigValidators.validateBaseCardEditorConfig;
  }

  _dispatchConfig() {
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    }));
  }

  _currentUiPath() {
    try {
      const pathname = window.location?.pathname || "/";
      const search = window.location?.search || "";
      const hash = window.location?.hash || "";
      return `${pathname}${search}${hash}` || "/";
    } catch (_) {
      return "/";
    }
  }

  _ensureEditorShell() {
    if (this._editorRoot) return;
    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = `
      <style>
        :host {
          display:block;
          direction:${this._isHebrew() ? "rtl" : "ltr"};
        }
        .editor-shell {
          display:grid;
          gap:14px;
          padding:16px;
          border-radius:20px;
          border:1px solid rgba(146,161,183,.18);
          background:rgba(18,24,34,.04);
          contain:layout style paint;
        }
        .editor-header {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          min-height:40px;
          padding:0 2px 2px;
        }
        .editor-title {
          min-width:0;
          font-size:16px;
          line-height:1.2;
          font-weight:800;
          color:var(--primary-text-color, #1f2633);
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }
        .editor-version {
          flex:0 0 auto;
          border-radius:999px;
          padding:5px 10px;
          font-size:12px;
          line-height:1;
          font-weight:800;
          color:var(--secondary-text-color, rgba(31,38,51,.68));
          background:rgba(146,161,183,.12);
          border:1px solid rgba(146,161,183,.18);
        }
        .editor-shell.tablet-stable {
          background:rgba(18,24,34,.08);
          border-color:rgba(146,161,183,.12);
        }
        ha-form {
          display:block;
        }
      </style>
      <div class="editor-shell">
        <div class="editor-header">
          <div class="editor-title">homeii-music-flow</div>
          <div class="editor-version">v${HOMEII_CARD_VERSION}</div>
        </div>
        <ha-form id="editorForm"></ha-form>
      </div>
    `;
    this._editorRoot = root;
    this._editorForm = root.querySelector("#editorForm");
    this._editorUsePathBtn = root.querySelector("#editorUseCurrentPath");
    this._editorPathHint = root.querySelector("#editorPathHint");
    this._refreshEditorShellClasses();
    if (!this._editorBound) {
      this._editorBound = true;
      this._editorUsePathBtn?.addEventListener("click", () => {
        const currentPath = this._currentUiPath();
        this._config = {
          ...this._getCardCtor().getStubConfig(),
          ...this._config,
          mobile_home_shortcut_path: currentPath,
        };
        this._render();
        this._dispatchConfig();
      });
      this._editorForm?.addEventListener("value-changed", (event) => {
        const nextValue = event.detail?.value;
        if (!nextValue || typeof nextValue !== "object") return;
        const nextConfigValue = this._normalizeEditorFormValue(nextValue);
        const previousSchemaKey = this._editorLastSchemaKey;
        this._config = {
          ...this._getCardCtor().getStubConfig(),
          ...this._config,
          ...nextConfigValue,
        };
        this._dispatchConfig();
        const nextSchemaKey = JSON.stringify(this._withDynamicEditorSchema(this._currentBaseEditorSchema()));
        if (previousSchemaKey !== nextSchemaKey) queueMicrotask(() => this._render());
      });
    }
  }

  _isTabletStabilityMode() {
    try {
      const ua = String(window.navigator?.userAgent || "");
      const width = Math.max(
        Number(window.innerWidth || 0),
        Number(this.getBoundingClientRect?.().width || 0),
        Number(this.offsetWidth || 0),
      );
      const touchPoints = Number(window.navigator?.maxTouchPoints || 0);
      return /Android/i.test(ua) && width >= 980 && touchPoints > 0;
    } catch (_) {
      return false;
    }
  }

  _refreshEditorShellClasses() {
    const shell = this._editorRoot?.querySelector(".editor-shell");
    if (!shell) return;
    shell.classList.toggle("tablet-stable", this._isTabletStabilityMode());
  }

  _syncEditorLiveContext() {
    this._ensureEditorShell();
    this.style.direction = this._isHebrew() ? "rtl" : "ltr";
    this._refreshEditorShellClasses();
    if (this._editorUsePathBtn) {
      this._editorUsePathBtn.textContent = homeiiEditorI18n("ui.use_current_view_for_home_button");
    }
    if (this._editorPathHint) {
      this._editorPathHint.textContent = `${homeiiEditorI18n("ui.current_path")}: ${this._currentUiPath()}`;
    }
    if (this._editorForm) {
      this._editorForm.hass = this._hass;
    }
  }

  _editorPinnedPlayerOptions() {
    const states = this._hass?.states || {};
    const entities = this._hass?.entities || {};
    const options = Object.values(states)
      .filter((entity) => entity?.entity_id?.startsWith("media_player."))
      .filter((entity) => {
        const registry = entities?.[entity.entity_id] || {};
        const registryText = [
          registry.platform,
          registry.integration,
          registry.device_class,
        ].filter(Boolean).join(" ").toLowerCase();
        return HomeiiPlayersFoundation.isMusicAssistantPlayer(entity, registry)
          || registryText.includes("music_assistant")
          || registryText.includes("music assistant");
      })
      .filter((entity) => !HomeiiPlayersFoundation.isLikelyBrowserPlayer(entity))
      .map((entity) => ({
        value: entity.entity_id,
        label: entity.attributes?.friendly_name || entity.entity_id,
      }))
      .sort((left, right) => String(left.label).localeCompare(String(right.label), undefined, { sensitivity: "base" }));
    return options;
  }

  _editorPinnedPlayerOptionsKey() {
    return JSON.stringify({
      players: this._editorPinnedPlayerOptions(),
      lights: this._editorColorLightOptions(),
      mappings: HomeiiMobileSettingsFoundation.normalizeStringArray(this._config?.ambient_light_player_map),
      draft: this._editorAmbientLightDraft,
      excludedPlayers: HomeiiMobileSettingsFoundation.normalizePinnedPlayerEntityList(this._config?.excluded_player_entities),
    });
  }

  _editorPlayerOrderOptions() {
    const excluded = new Set(HomeiiMobileSettingsFoundation.normalizePinnedPlayerEntityList(this._config?.excluded_player_entities));
    return this._editorPinnedPlayerOptions().filter((option) => !excluded.has(option.value));
  }

  _playerOrderEntitySelector({ entities = [] } = {}) {
    const selector = {
      entity: {
        multiple: false,
        filter: [{ integration: "music_assistant", domain: "media_player" }],
      },
    };
    if (entities.length) selector.entity.include_entities = entities.map((option) => option.value);
    return selector;
  }

  _editorColorLightOptions() {
    const states = this._hass?.states || {};
    return Object.values(states)
      .filter((entity) => entity?.entity_id?.startsWith("light."))
      .filter((entity) => HomeiiMobileSettingsFoundation.isColorCapableLightEntity(entity))
      .map((entity) => ({
        value: entity.entity_id,
        label: entity.attributes?.friendly_name || entity.entity_id,
      }))
      .sort((left, right) => String(left.label).localeCompare(String(right.label), undefined, { sensitivity: "base" }));
  }

  _ambientLightPairPlayerKey(index) {
    return `${AMBIENT_LIGHT_PAIR_PLAYER_PREFIX}${index}`;
  }

  _ambientLightPairLightsKey(index) {
    return `${AMBIENT_LIGHT_PAIR_LIGHTS_PREFIX}${index}`;
  }

  _ambientLightPairDisplayKey(type = "player", index = 0) {
    const pairIndex = Math.max(0, Number(index) || 0);
    const internalName = type === "lights"
      ? this._ambientLightPairLightsKey(pairIndex)
      : this._ambientLightPairPlayerKey(pairIndex);
    const label = this._editorDynamicLabel({ name: internalName });
    if (label) return label;
    const number = pairIndex + 1;
    return type === "lights" ? `Color lights ${number}` : `Music Assistant player ${number}`;
  }

  _ambientLightPairFieldInfo(source = "") {
    const candidates = [];
    const addCandidate = (value) => {
      if (value == null) return;
      if (Array.isArray(value)) {
        value.forEach(addCandidate);
        candidates.push(value.join("."));
        return;
      }
      if (typeof value === "object") {
        addCandidate(value.name);
        addCandidate(value.key);
        addCandidate(value.path);
        addCandidate(value.schema?.name);
        return;
      }
      candidates.push(String(value));
    };
    addCandidate(source);

    const matchPairField = (value, prefix, type) => {
      const offset = String(value || "").indexOf(prefix);
      if (offset < 0) return null;
      const match = String(value || "").slice(offset + prefix.length).match(/^\d+/);
      if (!match) return null;
      const index = Number(match[0]);
      return Number.isInteger(index) ? { type, index } : null;
    };

    for (const value of candidates) {
      const playerInfo = matchPairField(value, AMBIENT_LIGHT_PAIR_PLAYER_PREFIX, "player");
      if (playerInfo) return playerInfo;
      const lightsInfo = matchPairField(value, AMBIENT_LIGHT_PAIR_LIGHTS_PREFIX, "lights");
      if (lightsInfo) return lightsInfo;
      const displayValue = String(value || "").trim();
      const displayMatch = displayValue.match(/(\d+)\s*$/);
      if (displayMatch) {
        const index = Number(displayMatch[1]) - 1;
        if (Number.isInteger(index) && index >= 0) {
          const lower = displayValue.toLowerCase();
          if (lower.includes("player") || lower.includes("נגן")) return { type: "player", index };
          if (lower.includes("light") || lower.includes("licht") || lower.includes("תאור")) return { type: "lights", index };
        }
      }
    }
    return null;
  }

  _editorSchemaItem(item = {}) {
    if (typeof item === "string") return { name: item };
    if (Array.isArray(item)) return { name: item[item.length - 1] || item.join(".") };
    return item && typeof item === "object" ? item : {};
  }

  _ambientLightPlayerMapConfigFromGroups(groups = []) {
    return groups
      .map((group) => HomeiiMobileSettingsFoundation.formatAmbientLightPlayerMapEntry(group.player, group.lights))
      .filter(Boolean);
  }

  _ambientLightPairSelectorData(config = this._config) {
    const data = {};
    const groups = HomeiiMobileSettingsFoundation.parseAmbientLightPlayerMap(config?.ambient_light_player_map);
    groups.forEach((group, index) => {
      data[this._ambientLightPairDisplayKey("player", index)] = group.player;
      data[this._ambientLightPairDisplayKey("lights", index)] = group.lights;
    });
    const draftIndex = groups.length;
    data[this._ambientLightPairDisplayKey("player", draftIndex)] = this._editorAmbientLightDraft?.player || "";
    data[this._ambientLightPairDisplayKey("lights", draftIndex)] = this._editorAmbientLightDraft?.lights || [];
    return data;
  }

  _editorFormData(config = this._config) {
    return {
      ...config,
      ...this._ambientLightPairSelectorData(config),
    };
  }

  _normalizeEditorFormValue(value = {}) {
    const next = { ...value };
    this._normalizeEditorQuickActionsValue(next);
    this._normalizeEditorPlayerOrderValue(next);
    const pairIndices = new Set();
    Object.keys(next).forEach((key) => {
      const info = this._ambientLightPairFieldInfo(key);
      if (info) pairIndices.add(info.index);
    });
    if (!pairIndices.size) return next;

    const currentPairCount = HomeiiMobileSettingsFoundation.parseAmbientLightPlayerMap(this._config?.ambient_light_player_map).length;
    const groups = [];
    let draft = { player: "", lights: [] };
    Array.from(pairIndices).sort((left, right) => left - right).forEach((index) => {
      const playerKey = this._ambientLightPairPlayerKey(index);
      const lightsKey = this._ambientLightPairLightsKey(index);
      const playerDisplayKey = this._ambientLightPairDisplayKey("player", index);
      const lightsDisplayKey = this._ambientLightPairDisplayKey("lights", index);
      const player = String((next[playerDisplayKey] ?? next[playerKey]) || "").trim();
      const lights = HomeiiMobileSettingsFoundation.normalizeEntityList(next[lightsDisplayKey] ?? next[lightsKey]);
      delete next[playerDisplayKey];
      delete next[lightsDisplayKey];
      delete next[playerKey];
      delete next[lightsKey];
      if (player && lights.length) {
        groups.push({ player, lights });
      } else if (index >= currentPairCount && (player || lights.length)) {
        draft = { player, lights };
      }
    });
    this._editorAmbientLightDraft = draft;
    next.ambient_light_player_map = this._ambientLightPlayerMapConfigFromGroups(groups);
    return next;
  }

  _normalizeEditorQuickActionsValue(next = {}) {
    if (!Object.prototype.hasOwnProperty.call(next, "mobile_quick_actions")) return next;
    const selected = HomeiiMobileSettingsFoundation.normalizeMobileQuickActions(next.mobile_quick_actions, []);
    next.mobile_quick_actions = selected;
    const selectedSet = new Set(selected);
    for (let index = 1; index <= 10; index += 1) {
      const key = `mobile_quick_action_${index}`;
      if (!Object.prototype.hasOwnProperty.call(next, key)) continue;
      const value = String(next[key] || "").trim();
      if (value && !selectedSet.has(value)) next[key] = "";
    }
    return next;
  }

  _normalizeEditorPlayerOrderValue(next = {}) {
    const hasPlayerOrderFields = Object.keys(next).some((key) => /^player_order_entity_\d+$/.test(key));
    if (!hasPlayerOrderFields) return next;
    const rowCount = this._playerOrderSchema()?.schema?.length || 0;
    const ordered = [];
    Object.keys(next).forEach((key) => {
      const match = /^player_order_entity_(\d+)$/.exec(key);
      if (!match) return;
      const index = Number(match[1]) || 0;
      if (!rowCount || index > rowCount) {
        delete next[key];
        return;
      }
      const entityId = String(next[key] || "").trim();
      if (entityId && !ordered.includes(entityId)) ordered.push(entityId);
    });
    next.player_order_entities = ordered;
    return next;
  }

  _ambientLightEntitySelector({ multiple = false, entities = [], fallbackFilter = [] } = {}) {
    const selector = {
      entity: {
        multiple,
        filter: fallbackFilter,
      },
    };
    selector.entity.include_entities = entities.map((option) => option.value);
    return selector;
  }

  _playerOrderSchema() {
    const options = this._editorPlayerOrderOptions();
    const configuredOrder = HomeiiMobileSettingsFoundation.normalizePlayerOrderEntities(this._config || {});
    const rowCount = Math.max(options.length, Math.min(configuredOrder.length, options.length || configuredOrder.length));
    if (!rowCount) return null;
    return {
      type: "grid",
      name: "player_order_grid",
      flatten: true,
      column_min_width: "220px",
      schema: Array.from({ length: rowCount }, (_, index) => ({
        name: `player_order_entity_${index + 1}`,
        selector: this._playerOrderEntitySelector({ entities: options }),
      })),
    };
  }

  _ambientLightPlayerPairSchema() {
    const groups = HomeiiMobileSettingsFoundation.parseAmbientLightPlayerMap(this._config?.ambient_light_player_map);
    const pairCount = Math.max(1, groups.length + 1);
    const players = this._editorPinnedPlayerOptions();
    const lights = this._editorColorLightOptions();
    const schema = [];
    for (let index = 0; index < pairCount; index += 1) {
      const playerName = this._ambientLightPairDisplayKey("player", index);
      const lightsName = this._ambientLightPairDisplayKey("lights", index);
      schema.push({
        name: playerName,
        label: this._editorDynamicLabel({ name: playerName }),
        helper: this._editorDynamicHelper({ name: playerName }),
        selector: this._ambientLightEntitySelector({
          multiple: false,
          entities: players,
          fallbackFilter: [{ integration: "music_assistant", domain: "media_player" }],
        }),
      });
      schema.push({
        name: lightsName,
        label: this._editorDynamicLabel({ name: lightsName }),
        helper: this._editorDynamicHelper({ name: lightsName }),
        selector: this._ambientLightEntitySelector({
          multiple: true,
          entities: lights,
          fallbackFilter: [{ domain: "light" }],
        }),
      });
    }
    return {
      type: "grid",
      name: "ambient_light_player_pair_grid",
      flatten: true,
      column_min_width: "220px",
      schema,
    };
  }

  _editorDynamicLabel(item = {}) {
    const info = this._ambientLightPairFieldInfo(item);
    if (!info) {
      const name = this._editorSchemaItem(item)?.name || "";
      const match = /^player_order_entity_(\d+)$/.exec(String(name || ""));
      return match ? `${homeiiEditorI18n("ui.player_order")} ${match[1]}` : "";
    }
    const key = info.type === "player" ? "ui.player_light_pair_player" : "ui.player_light_pair_lights";
    return homeiiEditorI18n(key, { number: info.index + 1 });
  }

  _editorDynamicHelper(item = {}) {
    const info = this._ambientLightPairFieldInfo(item);
    if (!info) {
      const name = this._editorSchemaItem(item)?.name || "";
      return /^player_order_entity_\d+$/.test(String(name || "")) ? homeiiEditorI18n("ui.set_custom_player_order") : "";
    }
    const key = info.type === "player" ? "ui.player_light_pair_player_helper" : "ui.player_light_pair_lights_helper";
    return homeiiEditorI18n(key);
  }

  _currentBaseEditorSchema() {
    const formDef = this._getCardCtor().getConfigForm?.() || {};
    return Array.isArray(formDef) ? formDef : (Array.isArray(formDef.schema) ? formDef.schema : []);
  }

  _withDynamicEditorSchema(schema = []) {
    const pinnedOptions = this._editorPinnedPlayerOptions();
    const colorLightOptions = this._editorColorLightOptions();
    const cloneItem = (item) => {
      if (!item || typeof item !== "object") return item;
      if (item.name === "ambient_light_player_map") return this._ambientLightPlayerPairSchema();
      if (item.name === "player_order_grid") return this._playerOrderSchema();
      const next = { ...item };
      if (Array.isArray(item.schema)) next.schema = item.schema.map(cloneItem).filter(Boolean);
      if (item.name === "pinned_player_entities") {
        next.selector = {
          select: {
            multiple: true,
            mode: "dropdown",
            options: pinnedOptions,
          },
        };
      }
      if (item.name === "ambient_light_entities") {
        next.selector = this._ambientLightEntitySelector({
          multiple: true,
          entities: colorLightOptions,
          fallbackFilter: [{ domain: "light" }],
        });
      }
      return next;
    };
    return (Array.isArray(schema) ? schema : []).map(cloneItem).filter(Boolean);
  }

  _render() {
    this._ensureEditorShell();
    const cardCtor = this._getCardCtor();
    const config = {
      ...cardCtor.getStubConfig(),
      ...this._config,
    };
    const formDef = cardCtor.getConfigForm?.() || {};
    const baseSchema = this._currentBaseEditorSchema();
    const schema = this._withDynamicEditorSchema(baseSchema);
    const formData = this._editorFormData(config);
    const labels = formDef.labels || {};
    const helpers = formDef.helpers || {};
    const computeLabel = typeof formDef.computeLabel === "function"
      ? formDef.computeLabel
      : (item) => labels?.[item?.name];
    const computeHelper = typeof formDef.computeHelper === "function"
      ? formDef.computeHelper
      : (item) => helpers?.[item?.name];
    this._syncEditorLiveContext();
    if (this._editorForm) {
      const computeEditorLabel = (item) => {
        const schemaItem = this._editorSchemaItem(item);
        return this._editorDynamicLabel(item) || computeLabel(schemaItem) || homeiiEditorLabelFor(schemaItem, labels);
      };
      const computeEditorHelper = (item) => {
        const schemaItem = this._editorSchemaItem(item);
        return this._editorDynamicHelper(item) || computeHelper(schemaItem) || homeiiEditorHelperFor(schemaItem, helpers);
      };
      this._editorForm.computeLabel = computeEditorLabel;
      this._editorForm.computeHelper = computeEditorHelper;
      const schemaKey = JSON.stringify(schema);
      if (this._editorLastSchemaKey !== schemaKey) {
        this._editorForm.schema = schema;
        this._editorLastSchemaKey = schemaKey;
      }
      const configKey = JSON.stringify(formData);
      if (this._editorLastConfigKey !== configKey) {
        this._editorForm.data = formData;
        this._editorLastConfigKey = configKey;
      }
    }
  }
}
}
