



# HOMEii Flow

https://github.com/user-attachments/assets/20a0289c-9f85-40f8-a72d-2516feb2686e



https://github.com/user-attachments/assets/2da93861-9d4a-48b8-a6aa-09b0a90fa1cb



https://github.com/user-attachments/assets/fc20486e-758f-4e42-b315-585026599a98



https://github.com/user-attachments/assets/a0076e6e-0352-40f8-ac37-35737e717a80



<p align="center">
  <img src="https://raw.githubusercontent.com/r11a/homeii-music-flow/main/HOMEii%20Flow%20Main.png" alt="HOMEii Flow main experience" width="100%">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/r11a/homeii-music-flow/main/docs/brand/homeii-flow-logo.svg" alt="HOMEii Flow logo" width="280">
</p>

<p align="center">
  <strong>A premium Music Assistant dashboard card for Home Assistant.</strong><br>
  Built for wall tablets, phones, RTL/Hebrew homes, multi-room listening, and a real music-first experience.
</p>

<p align="center">
  <a href="https://my.home-assistant.io/redirect/hacs_repository/?owner=r11a&repository=homeii-music-flow&category=plugin">
    <img alt="Add HOMEii Flow to HACS" src="https://my.home-assistant.io/badges/hacs_repository.svg">
  </a>
  <a href="https://www.hacs.xyz/docs/use/download/download/">
    <img alt="Install HACS" src="https://img.shields.io/badge/Install-HACS-41BDF5?logo=homeassistant&logoColor=white">
  </a>
  <a href="https://github.com/r11a/homeii-music-flow/archive/refs/tags/v5.8.1.zip">
    <img alt="Download HOMEii Flow 5.8.1 stable tag archive" src="https://img.shields.io/badge/Download-v5.8.1%20stable-111111?logo=github">
  </a>
</p>

<p align="center">
  <a href="https://github.com/r11a/homeii-music-flow"><img alt="stable version" src="https://img.shields.io/badge/stable-5.8.1-gold"></a>
  <a href="https://github.com/r11a/homeii-music-flow/releases/tag/v5.8.2-beta.7"><img alt="beta version" src="https://img.shields.io/badge/beta-5.8.2--beta.7-8A63D2"></a>
  <img alt="Home Assistant" src="https://img.shields.io/badge/Home%20Assistant-Dashboard-41BDF5">
  <img alt="Music Assistant" src="https://img.shields.io/badge/Music%20Assistant-required-7C5CFF">
  <img alt="Sendspin" src="https://img.shields.io/badge/Sendspin-browser%20player-18B6FF">
  <img alt="HACS" src="https://img.shields.io/badge/HACS-custom%20repository-41BDF5">
  <img alt="Built with Codex" src="https://img.shields.io/badge/built%20with-Codex-111111">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/r11a/homeii-music-flow/main/docs/media/homeii-flow-preview.gif" alt="HOMEii Flow preview" width="100%">
</p>

HOMEii Flow is a custom Home Assistant Dashboard card for Music Assistant. It turns music control into a polished listening surface: visual, fast, personal, and comfortable on both wall tablets and phones.

HOMEii Flow started from my own daily use of Home Assistant and Music Assistant. I wanted it to feel less like a technical dashboard widget and more like a real music app inside Home Assistant, so a lot of thought went into the flow, touch interactions, Hebrew/RTL comfort, wall-tablet behavior, mobile details, and the small moments that make choosing music feel natural at home.

## 5.8.2 Beta 7

HOMEii Flow 5.8.2 Beta 7 focuses on issue #28, Diagnostic v3, and a cleaner phone Queue Flow entry point.

- Lets the card keep working through the Home Assistant Music Assistant integration even when the MA config entry lookup reports `not_loaded` but HA still exposes `music_assistant` services.
- Uses generic HA `media_player` entities as compatibility fallback targets only when Music Assistant services exist.
- Improves diagnostics to Diagnostic v3 with integration signals, strict/fallback player markers, queue providers, library providers, browser-blocked Direct API classification, and the existing privacy redaction.
- Treats browser-blocked Direct API/CORS failures as optional when the HA integration path is available, instead of making the whole card look broken.
- Removes the phone Queue Flow button above the artwork and keeps Queue Flow available only as a Quick Action option.
- Removes the invalid `limit` parameter from the HA `music_assistant.get_queue` diagnostic path.
- Keeps the Beta 1 through Beta 6 artwork, Music Assistant compatibility, Danish localization, diagnostics, and performance fixes.

Beta download: [v5.8.2-beta.7](https://github.com/r11a/homeii-music-flow/releases/tag/v5.8.2-beta.7)

Stable users can remain on 5.8.1. Beta users should hard refresh Home Assistant or use:

```text
/local/community/homeii-music-flow/homeii-music-flow.js?v=5.8.2-beta.7
```

## 5.8.1 Hotfix Release

HOMEii Flow 5.8.1 is a focused hotfix on top of 5.8.0 for Music Assistant compatibility and artwork regressions found after the 5.8.0 upgrade.

- Restores Music Assistant 2.8.x player compatibility when Home Assistant exposes MA players as normal `media_player` entities without newer MA markers.
- Keeps the Music Assistant requirement guard intact when the backend is genuinely unavailable.
- Lets `music_assistant.play_media` handle replace playback instead of clearing the queue manually first, reducing wrapper/artwork timing races on browser-player flows.
- Rejects invalid image-proxy IDs so older path/provider artwork URLs can still be used.
- Keeps visual-editor player selectors usable in older MA/Home Assistant combinations.
- Prevents the screensaver from opening while the card is being edited in the Home Assistant visual editor.

The full 5.8.0 release overview remains below because 5.8.1 includes all 5.8.0 features.

## 5.8.0 Release Overview

HOMEii Flow 5.8.0 is the next public release after 5.7.1, and it is one of the most important upgrades in the project so far. It keeps the polished music surface people already use, then rebuilds the foundation underneath it so the card is faster to evolve, easier to validate, and more reliable on real Home Assistant dashboards.

The visible upgrade is smoother control across phones, wall tablets, and Section dashboards. The technical upgrade is lower risk: the runtime is now split into focused modules, backed by broader regression tests, and packaged as a HACS-ready `dist/` release with Sendspin, localization, Embla, and the HOMEii brand assets included.

## Why It Stands Out

- **Sendspin browser player built in:** turn the current browser, phone, tablet, or wall panel into a Music Assistant playback target directly from the card, with a session that survives Dashboard page changes while the dashboard stays open.
- **Hotel Mode for shared spaces:** a locked-down premium interface keeps the player beautiful while hiding advanced actions that guests or family should not accidentally trigger.
- **Premium now-playing experience:** artwork-led layout, dynamic atmosphere, elegant controls, lyrics, and responsive visual polish.
- **Flexible dashboard fit:** use HOMEii Flow as a full music surface, compact card, edge-to-edge popup, floating compact window, or tiny two-row mobile widget.
- **FLOW and Flow Assistant:** guided discovery and optional voice-style music requests help start playback without living inside the full Music Assistant UI.
- **Studio / Control Room:** choose players, group rooms, control volumes, move playback, and manage multi-room listening.
- **Mobile-first workflow:** queue, search, library, FLOW, actions, timers, announcements, settings, and player switching are designed for touch.
- **Real Music Assistant library flow:** playlists, albums, artists, tracks, radio, favorites, recent listening, recommendations, tab search, and album/artist/playlist drill-in before playback.
- **Performance profiles for weak devices:** Full, High, Low, and Ultra Lite modes let older tablets, wall panels, and slow browsers keep the card usable by reducing expensive effects without removing core controls.
- **Smart-home aware listening:** optional Home Assistant light sync, screensaver display, and POWER actions let the card participate in the room without becoming mandatory setup.
- **International and RTL ready:** English, Danish, Hebrew/RTL, Spanish, French, Italian, Lithuanian, and Simplified Chinese are bundled, with a documented path for more community translations.
- **Release-ready package:** HACS-ready `dist/` output includes the card, Sendspin files, Embla swipe support, and the brand asset.

## What's New In 5.8.0

The detailed 5.8.0 changes are grouped below.

### Strongest User-Facing Upgrades

- **Phone layout modes:** choose Auto, Full, or Compact behavior instead of hoping the dashboard slot guesses correctly.
- **Compact edge-to-edge control:** compact expand can open as a full edge-to-edge surface or as a floating window that keeps Home Assistant navigation visible.
- **Stable now-playing transitions:** mobile queue playback keeps title, artist, album, URI, artwork, and selected player aligned while Music Assistant catches up.
- **Screensaver lyrics:** timed or plain lyrics can move into the screensaver beside the artwork, with a configurable `lyrics` screensaver button.
- **Library tab search:** search within the active library tab, keep drafts per tab, restore focus after rerenders, and filter playlists, artists, albums, tracks, radio, podcasts, liked items, and mixed search results.
- **Media detail views:** album, playlist, and artist detail pages gain better artwork, track loading, action buttons, and dynamic theming.
- **Flow Assistant matching:** Hebrew requests, Latin/English metadata, artist-only requests, playlist-by-artist requests, title-only matches, and fallback focused search are all handled more carefully.
- **Artwork pipeline:** decoded artwork caching, immediate image sources, image-proxy ID support, base64 local images, metadata image fallbacks, and visible queue artwork prefetching reduce flicker and wrong-cover moments.

### Architecture, Release Quality, And Tests

- Extracts the large runtime into focused modules for base card behavior, editor forms, editor elements, state defaults, derived state, mobile settings, players, queue, favorites, artwork, now-playing, media presentation, media history, responsive layout, palettes, RadioBrowser countries, and voice matching.
- Updates release tooling so `core`, `config`, localization, Sendspin, vendor assets, and the built runtime are synced into `dist/` with versioned cache-busting.
- Adds runtime baseline tests for package/source/dist version alignment, card/editor registration, editor shell config updates, and the bundled dist runtime.
- Adds or expands foundation tests for artwork, now-playing, media presentation, queue, players, favorites, palette, responsive layout, mobile settings, editor forms, RadioBrowser countries, config validation, and voice matching.

### Mobile, Compact, Tablet, And Dashboard Fit

- Adds `mobile_layout_mode` to the in-card settings and visual editor.
- Adds `mobile_compact_edge_to_edge` to the in-card settings and visual editor.
- Improves automatic compact recommendations for narrow or short cards.
- Improves compact mini-widget selection for very narrow cards and short slots.
- Improves reserved Section dashboard height for compact and mini-widget layouts.
- Improves forced full phone layout on short/tight screens by allowing the stage to scroll instead of cutting controls.
- Improves tablet auto-fit and dense UI decisions when Night mode or Up Next are active.
- Adds panel viewport fill detection and resize strategy helpers for better behavior during keyboard-like resizes and tablet stability mode.

### Lyrics, Screensaver, And Visual Atmosphere

- Adds `lyrics` as a valid screensaver control button.
- Allows the screensaver to open while lyrics are active.
- Moves an open lyrics modal into screensaver lyrics mode cleanly.
- Refreshes lyrics automatically when the current track changes.
- Keeps screensaver lyrics active while playback is active or freshly paused, then exits cleanly after inactivity.
- Improves dynamic theme synchronization, background artwork crossfades, palette normalization, and detail-page theming.
- Disables heavy dynamic theme and background motion behavior automatically in performance profiles where that work should stay off.

### Library, Radio, Favorites, And Discovery

- Adds per-tab library search and better mixed search result grouping.
- Adds deduping and stable item keys for library items.
- Adds visible tap/loading feedback for library entries, category rows, radio country entries, media detail heroes, layout buttons, search buttons, discovery items, and player focus controls.
- Adds improved album browse selection and track-row rendering inside detail pages.
- Improves RadioBrowser country labels, translated common countries, and flag helpers.
- Improves radio detection so ordinary tracks with "radio" in the title are not misclassified as radio streams.
- Improves current-media favorite matching, optimistic favorite cache behavior, and favorite removal argument resolution.

### Players, Queue, Announcements, And Helpers

- Improves preferred front-player selection with custom player order and stronger pending-player locking.
- Keeps browser players out of normal front-player fallback where they would create confusing selections.
- Improves Music Assistant player detection from state attributes and entity registry metadata.
- Deduplicates active-player helper updates so `active_player_helper_entity` is not written repeatedly with the same value.
- Adds `mobile_announcement_volume` as a configurable announcement volume boost and restores the previous volume afterward.
- Keeps TTS entity, TTS language, power button, auxiliary button, ambient light, quick action, and screensaver settings available in the editor.

### Existing 5.7.1 Foundations Kept

- Keeps Hotel Mode for guest-safe and family-safe dashboards.
- Keeps HTTPS Music Assistant external URL support for Nabu Casa and Companion App users.
- Keeps Sendspin / This Device browser-player support and Media Session screensaver improvements.
- Keeps Italian localization and the bundled English, Hebrew/RTL, Spanish, French, Italian, Lithuanian, and Simplified Chinese dictionaries.
- Keeps grouping feedback, front-player pinning, player priority, RadioBrowser visibility, and the 5.7.1 tablet/mobile polish.

## What's New In 5.7.0

Version 5.7.0 is the biggest HOMEii Flow release so far. It is built from a long community feedback cycle: bug reports, screenshots, edge cases, requests for better mobile behavior, and many small "this should feel nicer" moments. Thank you to everyone who asked, tested, pushed, and cared. I tried to answer almost every practical request and turn it into a better daily music experience.

- **Compact player rebuilt for real dashboards:** the compact card now fits Home Assistant Section dashboards much better, behaves correctly beside other cards, opens into a true full-screen popup, keeps clicks inside the player instead of leaking to the dashboard underneath, and includes better phone/tablet proportions.
- **New Mini player widget mode:** a smaller two-row compact layout gives mobile dashboards a real music widget: clear artwork, readable title/artist, previous/play/next, volume controls, active-player access, and a premium full-screen expand button without taking over the whole page.
- **Performance tuning is a release headline:** Full, High, Low, and Ultra Lite performance profiles make the card more practical on weak tablets and kiosk devices. Ultra Lite strips back blur, transparency, animation, background motion, and heavy visual effects while keeping the card fully usable.
- **Music Assistant safety first:** HOMEii Flow now refuses to fall back to unrelated Home Assistant media players. If Music Assistant is missing, inactive, or exposes no valid MA players, the card shows a clear setup message instead of filling the player list with wrong entities.
- **Better player management:** exclude players from the visual editor, sort players alphabetically or in a custom order, use an order list that matches the real player count, and rely on cleaner active-player selection surfaces on compact and full layouts.
- **Grouping and queue transfer hardened:** group join, disconnect, transfer queue, stop, and clear actions were tightened so the card uses safer player payloads and avoids many false success/error states, especially with newer Music Assistant beta behavior.
- **Quick Actions are now user-controlled:** reorder Quick Actions, choose which buttons appear, keep Home in the action row, add multiple auxiliary buttons with Home Assistant icons, and keep configured actions visible after playback starts without needing a page refresh.
- **Volume and media controls improved:** volume sliders update immediately, plus/minus volume buttons use a configurable 1-10 percent step, mute is better sized, shuffle uses glow styling without covering the icon, and repeat badges moved away from the icon center.
- **Screensaver upgraded:** choose which screensaver buttons appear, including Flow Assistant, previous/next, play/pause, power, mute, and like. The screensaver can use a full-page layout, dynamic artwork colors, softer idle animation, and performance-aware visuals.
- **Flow Assistant behaves better:** assistant windows can open above the screensaver without closing it, responses are time-limited, and empty overlay/menu cases were fixed so the right panel stays visible.
- **Discovery and FLOW feel fresher:** style selection now uses a much larger Spotify-like catalog of familiar genres and moods, recommendations rotate more naturally, Discover can show the active player, and compact recommendation layouts avoid collisions on smaller screens.
- **Library browsing is more flexible:** choose a default library view of Grid or List in settings, still switch manually per page, open playlist/album drill-ins in grid mode, and use more stable navigation without unexpected returns to the main screen.
- **Search, history, queue, and lyrics polished:** Quick Actions can open a dedicated search popup, history has a play-all action, queue rows include a like action with clearer feedback, and the lyrics panel now has a more polished dynamic background and readable layout.
- **Opened screens and Studio are larger and calmer:** Studio panels, player selectors, action menus, library pages, queue, and compact full-screen views now use more of the available display and avoid the cramped half-height feeling.
- **Responsive behavior is more honest:** the awkward tablet/phone middle widths now keep access to the important features through wrapping, menus, and full-screen surfaces. At very narrow sizes, compact modes are favored so the layout does not crush itself.
- **New languages:** Spanish, French, and Lithuanian are now bundled alongside English, Hebrew, and Simplified Chinese. Thank you to Daniel Eduardo Gonzalez (@danielxb-ar) for Spanish, Donatas / donatassmarterhome for Lithuanian, Julien Moreau Brousseau for French translation work, Jingle Jew for French wording corrections, and @gao19970120 for the earlier Simplified Chinese contribution.
- **Bug-fix rollup:** fixes include the library loading spinner loop, delayed media-control feedback, random library jumps back to the home page, missing Quick Actions after playback starts, French language selection falling back to English, compact popup stacking and click handling, mini player selector overlays, volume dropdown z-index, tablet icon sizing, manual height behavior, and the Home Assistant Section height regression reported after 5.6.1.

## What's New In 5.6.1

- **Chinese language option fixed in the visual editor:** the Simplified Chinese dictionary was included in 5.6.0, but the browser could keep an older cached `localization/index.js` module, so the visual-editor language dropdown still showed only the older options. 5.6.1 cache-busts the localization module imports so `简体中文 / Simplified Chinese` appears after updating.
- **No feature behavior changed from 5.6.0:** this is a focused release packaging/cache hotfix for the new localization layer.

## What's New In 5.6.0

- **Flow Assistant arrives as an experimental voice layer:** open it from the player, the empty-state music screen, or the screensaver, then ask for music in natural language. This is still experimental; feedback, failed examples, and language/device reports are especially helpful for improving it.
- **Library browsing is less accidental:** playlists and albums can open into their track list before playback, with a compact `Play` button when you want to start the full item immediately.
- **Touch feedback is clearer across the music surface:** library content, recommendations, the empty-state wand, and quick actions now respond with stronger visual feedback so taps feel immediate instead of uncertain.
- **Screensaver controls stay elegant:** the screensaver can show subtle voice, previous, and next controls when enabled, while keeping the clean idle look and avoiding accidental exits during Flow Assistant interaction.
- **Radio artwork is fixed in normal playback:** radio stations that expose dynamic `entity_picture` artwork now show that cover in the main player too, not only in the screensaver, with safer fallback branding when station art is missing.
- **Radio layout has been tightened:** radio playback no longer depends on broken station image URLs, and titles/artwork are arranged more cleanly across large tablet views.
- **Quick Actions adds `Clear all`:** a red-toned disconnect action can be enabled from the visual editor and uses a confirmation popup before disconnecting all active players.
- **Shuffle and repeat states are easier to read:** repeat-one, repeat-all, and shuffle now have clearer active styling so the current mode is not a guessing game.
- **Visual editor wording is cleaner:** Flow Assistant, icon sizing, quick actions, and related settings now use friendly labels instead of internal underscore-style names.
- **Simplified Chinese localization is now bundled:** thank you to [@gao19970120](https://github.com/gao19970120) for contributing the Chinese translation.

## What's New In 5.5.0

- **Commercial-grade responsive fit:** the card now measures its actual dashboard/container size, reacts to Home Assistant grid/sidebar/editor changes, and adapts by width, height, and aspect ratio instead of relying only on the browser viewport.
- **Better phone, tablet, kiosk, and desktop layouts:** artwork, metadata, progress, actions, transport controls, volume, footer buttons, Up Next, and Night mode now use tighter fit budgets to avoid content overlapping or escaping its container.
- **No fixed default height:** the old `850` default is no longer part of the stub config. The card prefers the space Home Assistant allocates to it, while the optional `height` setting remains available as a fallback/manual override.
- **Ambient light sync:** selected `light.*` entities can follow the current artwork color with brightness, transition, cooldown, and optional per-player mappings.
- **Artwork screensaver:** an optional idle display shows the current cover, digital or analog clock, date, track info, and a short local message. The idle timer now starts when the card page becomes visible.
- **POWER button:** player controls can show an optional POWER action for stopping the active player or calling a selected Home Assistant entity.
- **Discovery mode:** a fullscreen recommendation view adds cover orbs, provider-backed category selectors, fresh/random playlist discovery, albums, radio, and recent music.
- **Editor and language coverage:** the new settings are available in the visual editor, in-card settings, and English/Hebrew localization dictionaries.

## What's New In 5.4.1

- **Distribution hotfix:** republishes the 5.4.0 fixes without a custom release zip asset, so HACS can use the normal repository release/tag contents and the complete `dist/` package.
- **No runtime feature changes from 5.4.0:** this release is intentionally limited to packaging/versioning.
- **Cache refresh:** bumps the runtime/editor tags to 5.4.1 so browsers do not reuse the withdrawn 5.4.0 bundle.

## What's New In 5.4.0

- **Local Sendspin fixed:** `This device` loads from the packaged `sendspin-js/index.js` runtime again, fixing the missing bundle/core import errors seen after 5.3.0.
- **Player controls fixed:** volume percentages now update from player cards, mute drops to `0%`, and unmute restores the previous volume when available.
- **Default language changed:** new card configs now default to English instead of automatic language detection, while explicit YAML and saved UI choices still win.
- **Unified Players screen:** queue count, transfer queue, grouping, stop-all, and device playback now live in one cleaner Players hub with smaller action tabs and back navigation.
- **Queue is faster to manage:** rows are numbered, the header shows only icon plus count, and moving a track now uses an immediate position selector instead of repeated up/down taps.
- **Library covers fixed on tablet/mobile:** built-in Music Assistant playlist covers now use the same hydrated artwork loader as desktop, so MA built-in playlist artwork no longer disappears.
- **Search stays broad but feels faster:** direct Music Assistant search is preserved for provider results such as Spotify, with cached/library previews shown while the full search finishes.
- **Premium opened screens:** modals and mobile sheets now use subtle dynamic artwork blur, improved light-mode readability, cleaner logo placement, and refined media cards/buttons.
- **Quick Mix polish:** smoother transition into the selected mix and the source list is promoted into the recommendations drawer.
- **Studio is calmer:** noisy Studio toasts are suppressed, while non-Studio Quick Mix feedback remains centered.
- **Active Player Helper docs:** the README now explains how to publish the selected HOMEii Flow player into an `input_text` helper for automations and templates.

## What's New In 5.3.0

- **Studio scenes you can save:** save the current Studio target locally, including selected players, visible players, grouping intent, volume levels, and current media when a playable URI is available.
- **Clearer grouped-player awareness:** grouped players now get a compact group summary above the Studio wall and stronger group badges on the player tiles.
- **Faster Music Hub routing:** quick category buttons open playlists, artists, albums, tracks, and radio directly from Studio.
- **Safer Actions Hub:** adds a clear `Stop all` action that reuses the global stop flow for playback, queues, groups, and the local browser player.
- **Pro panel context:** the Pro panel now shows the current target player, protocol, Direct API readiness, realtime token status, Sendspin state, and a shortcut to the full Music Assistant interface.
- **Queue Cockpit polish:** the queue panel uses a more opaque, contained layout with clearer source/target lanes and safer scrolling.
- **Remote artwork reliability:** artwork URLs are normalized for local and remote Home Assistant sessions, with safer HA/proxy paths and cache-busting so desktop browsers update covers without a full page reload.
- **Better empty-art fallback:** missing covers now show a polished HOMEii-style artwork placeholder instead of the old oversized generic icon screen.
- **Friendly startup guardrails:** missing Music Assistant config/player discovery now shows a clear card notice instead of throwing a console-only error.
- **Active player helper:** optional `input_text` helper support lets HOMEii Flow publish the currently active player entity id for automations and templates.

## What's New In 5.2.0

- **Studio Focus Mode:** Studio now opens around a clear control target, primary playback controls, and four simple areas: Players, Music, Queue, and Actions.
- **Richer player wall:** live player tiles include selected-state feedback, queue count, status/protocol badges, volume, mute, play/pause, next, grouping awareness, and visible-player controls.
- **Music Hub:** Studio now exposes search, full library browsing, Smart Mix, recent listening, favorites, scenes, and visual result cards with `Play`, `Next`, `Add`, `Radio`, and `Like`.
- **Queue Cockpit:** inspect source/target queues, transfer a queue, clone without deleting the source, refresh, and clear queues.
- **Actions and Pro tools:** timers/schedules, Announcement Studio, This Device Sendspin controls, and diagnostics are available from contextual Studio panels.
- **Announcement Studio polish:** clearer target chip, compact compose area, volume boost, calmer send action, and stronger panel opacity.
- **Weak-device Performance Mode:** disables heavy blur, dynamic color extraction, motion, and expensive effects for Nest Hub and older tablets.
- **Bug fixes:** fixes Studio close-button overlap from compact/fullscreen mode, This Device not appearing as a Studio tile after connect, Performance Mode not toggling off from in-card settings, and queue inline action flicker.

## What's New In 5.1.6

- **In-card UI settings access fixed:** when settings are managed from the in-card UI, the `Settings` button now always stays in the main bar and cannot be disabled from the in-card selector.

## What's New In 5.1.5

- **Dashboard picker registry fix:** HOMEii Flow now mutates Home Assistant's existing `window.customCards` registry in place instead of replacing it, matching the way the HA picker imports and reads custom-card metadata.

## What's New In 5.1.4

- **Stronger Dashboard picker registration:** HOMEii Flow now refreshes its custom-card metadata after load and exposes picker config methods directly on the final card class for Home Assistant versions that do not reliably pick them up through inheritance.

## What's New In 5.1.3

- **Dashboard card picker support:** HOMEii Flow now registers with Home Assistant's visual card picker using the expected custom-card metadata, so it can be added from the UI after the dashboard resource is loaded.

## What's New In 5.1.2

- **HACS README refresh:** republished the README updates in a new release so Home Assistant/HACS can pull the fixed logo, screenshots, and Dashboard wording instead of the older cached `5.1.0` content.

## What's New In 5.1.1

- **HACS README assets fixed:** the logo, preview GIF, and screenshots now use absolute GitHub raw URLs so they render inside the HACS download screen.

## What's New In 5.1.0

- **FLOW replaces SIMPLE:** a polished guided wizard with a fresh start on every open, reset controls on every step, free-style mood search, and a visual results grid.
- **Queue actions inside the row:** queue items expand in place with clear `Play next`, `Play now`, move up/down, and remove actions instead of opening a modal.
- **Clear queue transfer entry:** the queue view now exposes a labeled transfer button with the queue count.
- **Better artwork browsing:** cover browsing keeps artwork fully visible and reacts immediately when a new item is selected.
- **History drawer reliability:** recent listening opens directly with the latest 10 items instead of waiting for a tab change.
- **Lyrics font controls:** lyrics now include `+`, `-`, and reset controls for font size.
- **Studio and modal polish:** more consistent brand/logo treatment and clearer action labels across opened panels.
- **Safer global stop:** `Stop all players` stops playback, clears queues, disconnects player groups, and disconnects the local `This device` player when present.
- **Updated defaults:** card height `850`, night mode off, next-song preview off, smart mic mode, visual-editor settings, dynamic theme auto, subtle background motion, icon+text footer, artwork swipe browsing, home shortcut off, and Music Assistant liked mode.

## Quick Install

### Add To HACS

Use the My Home Assistant button:

[![Open your Home Assistant instance and add this repository to HACS.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=r11a&repository=homeii-music-flow&category=plugin)

Or add it manually:

1. Open Home Assistant.
2. Open HACS.
3. Open `Custom repositories`.
4. Add:

```text
https://github.com/r11a/homeii-music-flow
```

5. Select category `Dashboard` in the UI. HACS internally calls this category `plugin`.
6. Download `HOMEii Flow`.
7. Add the card:

```yaml
type: custom:homeii-music-flow
```

If HACS does not add the resource automatically, add:

```text
/hacsfiles/homeii-music-flow/homeii-music-flow.js
```

### Manual Install

1. Create:

```text
/config/www/community/homeii-music-flow/
```

2. Copy the full contents of `dist/` into that folder.
3. Add this Dashboard resource:

```text
/local/community/homeii-music-flow/homeii-music-flow.js?v=5.8.1
```

4. Add the card:

```yaml
type: custom:homeii-music-flow
```

## Requirements

- Home Assistant with Dashboard custom cards enabled.
- Music Assistant installed, running, and connected to Home Assistant.
- At least one Music Assistant player exposed as a Home Assistant `media_player`.
- HACS for the easiest install path, or manual access to `/config/www/community/`.
- A modern browser for the dashboard: Chrome, Edge, Safari, or a modern Android/iOS browser.
- For the local Sendspin browser player: a direct Music Assistant URL and Music Assistant token configured in the card settings.
- For best Sendspin performance: the browser device and Music Assistant should be on the same local network.
- Sendspin URL security must match the dashboard: if Home Assistant is opened over `https://`, configure Music Assistant with an `https://` URL so HOMEii Flow can use `wss://`; browsers block `http://` / `ws://` Sendspin from an HTTPS dashboard.
- If Home Assistant is opened locally over `http://`, a local `http://` Music Assistant URL is usually fine and HOMEii Flow will use `ws://`.
- Mobile browsers can pause audio and WebSocket work when the app is backgrounded or the phone is locked. HOMEii Flow remembers the active "This device" intent during the current app/browser session and reconnects when the dashboard becomes active again.
- Optional: a configured `tts.*` entity for text-to-speech announcements.
- Optional but recommended: correct Home Assistant internal/external URLs, especially for phones, tablets, and remote access.

## First Startup Checklist

If the card loads but feels incomplete, check these first:

- Music Assistant is installed, running, and exposes at least one player as a Home Assistant `media_player`.
- The Dashboard resource points to `/hacsfiles/homeii-music-flow/homeii-music-flow.js` for HACS, or to the copied `/local/community/...` file for manual installs.
- If you use HOMEii Flow remotely, confirm Home Assistant external/internal URLs are correct. For Direct Music Assistant features, `ma_url` should be reachable from the browser you are using, not only from the local network.
- If artwork is missing only when away from home, prefer Home Assistant-accessible artwork paths or expose Music Assistant through a secure reachable URL. HOMEii Flow now avoids private-network artwork URLs when the browser is remote, but a local-only MA URL can still limit Direct API artwork.
- If no players are shown, check Music Assistant player exposure and remove overly strict pinned-player filters from the card settings.
- Optional automation helper: create an `input_text`, then set `active_player_helper_entity` so automations can read the current HOMEii Flow target.

## Active Player Helper

HOMEii Flow can optionally publish the currently selected/active player to a Home Assistant helper. This is useful when you want automations, scripts, templates, dashboard buttons, or voice flows to know which player HOMEii Flow is currently controlling.

The card does not create a Home Assistant entity by itself. Create an `input_text` helper once, then point HOMEii Flow to it. The card will keep that helper updated with the active player `entity_id`.

### Setup

1. In Home Assistant, open **Settings > Devices & services > Helpers**.
2. Select **Create Helper**.
3. Choose **Text**.
4. Name it, for example: `HOMEii Flow Active Player`.
5. Copy the created entity id, for example:

```yaml
input_text.homeii_flow_active_player
```

6. Add it to the HOMEii Flow card configuration:

```yaml
type: custom:homeii-music-flow
active_player_helper_entity: input_text.homeii_flow_active_player
```

You can also select the helper from the visual card editor in the connection/settings section.

### What The Helper Stores

When HOMEii Flow is controlling the living room player, the helper value becomes:

```text
media_player.living_room
```

When you switch HOMEii Flow to another player, the helper updates automatically:

```text
media_player.kitchen
```

### Example: Play/Pause The Current HOMEii Flow Player

```yaml
alias: HOMEii Flow - Toggle active player
sequence:
  - service: media_player.media_play_pause
    target:
      entity_id: "{{ states('input_text.homeii_flow_active_player') }}"
```

### Example: Set Volume On The Current HOMEii Flow Player

```yaml
alias: HOMEii Flow - Set active player volume
sequence:
  - service: media_player.volume_set
    target:
      entity_id: "{{ states('input_text.homeii_flow_active_player') }}"
    data:
      volume_level: 0.35
```

### Example: Use It In A Template

```yaml
{{ state_attr(states('input_text.homeii_flow_active_player'), 'friendly_name') }}
```

### Example: Only Run If HOMEii Flow Has A Player

```yaml
condition:
  - condition: template
    value_template: "{{ states('input_text.homeii_flow_active_player') | regex_match('^media_player\\.') }}"
```

## Sendspin Browser Player

HOMEii Flow includes a local browser player flow powered by Sendspin. In the card this appears as **This device**.

What it does:

- connects the current browser directly to Music Assistant through Sendspin
- registers the phone, tablet, PC browser, or wall panel as a playable Music Assistant target
- lets the device appear in the player list once Music Assistant publishes it back to Home Assistant
- keeps a HOMEii-specific player identity so the card does not accidentally pick a random browser player from another tab
- keeps the active local player alive at dashboard/tab level while moving between Dashboard pages in the same Home Assistant session
- removes the HOMEii local player immediately when **Disconnect this device** is used
- packages the required `sendspin-js` runtime in `dist/sendspin-js/`

What you need:

1. Music Assistant running and reachable from the device.
2. `ma_url` configured in the card settings.
3. `ma_token` configured in the card settings.
4. Press **Connect this device** from the player screen.
5. Select the new HOMEii browser player when it appears.

Notes:

- Sendspin is built into Music Assistant and the provider is enabled by default.
- Sendspin is still a technical preview in Music Assistant, so behavior can change over time.
- Local network playback is preferred. Remote playback depends on Music Assistant, browser, WebRTC, and network conditions.
- HTTPS matters: an HTTPS Home Assistant dashboard cannot open an insecure `ws://` Sendspin connection. Use an HTTPS Music Assistant URL, or open Home Assistant locally over HTTP when testing on the same network.
- Mobile lifecycle matters: iOS, Android, and WebView-based apps can suspend browser audio/WebSocket work when the app is backgrounded or the phone is locked. HOMEii Flow will reconnect the HOMEii Sendspin player when the dashboard becomes active again, but it cannot force the operating system to keep a locked/backgrounded browser alive forever.
- Dashboard navigation is handled inside HOMEii Flow: the local Sendspin audio element and connection intent are kept outside the card instance, so moving between dashboard pages should not require reconnecting.
- Use **Disconnect this device** in the player screen when you want HOMEii Flow to stop reconnecting the local browser player.
- Mobile browsers may require a user gesture before audio playback is allowed after a reconnect.

## Screenshots

### Main Experience

<p align="center">
  <img src="https://raw.githubusercontent.com/r11a/homeii-music-flow/main/docs/media/hero-main-light.png" alt="Main now playing layout" width="100%">
</p>

### Studio / Players / Queue

| Studio | Players | Queue |
| --- | --- | --- |
| <img src="https://raw.githubusercontent.com/r11a/homeii-music-flow/main/docs/media/studio.png" alt="Studio player grid" width="100%"> | <img src="https://raw.githubusercontent.com/r11a/homeii-music-flow/main/docs/media/players.png" alt="Player selection and grouping" width="100%"> | <img src="https://raw.githubusercontent.com/r11a/homeii-music-flow/main/docs/media/queue.png" alt="Queue panel" width="100%"> |

### Library / Actions / Settings

| Library | Actions | Settings |
| --- | --- | --- |
| <img src="https://raw.githubusercontent.com/r11a/homeii-music-flow/main/docs/media/library.png" alt="Music Assistant library browser" width="100%"> | <img src="https://raw.githubusercontent.com/r11a/homeii-music-flow/main/docs/media/actions.png" alt="Actions and schedules menu" width="100%"> | <img src="https://raw.githubusercontent.com/r11a/homeii-music-flow/main/docs/media/settings.png" alt="Settings panel" width="100%"> |

### Lyrics / Announcements / Tablet

| Lyrics | Announcements | Tablet |
| --- | --- | --- |
| <img src="https://raw.githubusercontent.com/r11a/homeii-music-flow/main/docs/media/lyrics.png" alt="Lyrics screen" width="100%"> | <img src="https://raw.githubusercontent.com/r11a/homeii-music-flow/main/docs/media/announcement.png" alt="Announcement screen" width="100%"> | <img src="https://raw.githubusercontent.com/r11a/homeii-music-flow/main/docs/media/tablet.png" alt="Tablet layout" width="100%"> |

### Mobile Details

| Mobile 1 | Mobile 2 | Mobile 3 |
| --- | --- | --- |
| <img src="https://raw.githubusercontent.com/r11a/homeii-music-flow/main/docs/media/mobile-1.jpg" alt="Mobile screenshot 1" width="100%"> | <img src="https://raw.githubusercontent.com/r11a/homeii-music-flow/main/docs/media/mobile-2.jpg" alt="Mobile screenshot 2" width="100%"> | <img src="https://raw.githubusercontent.com/r11a/homeii-music-flow/main/docs/media/mobile-3.jpg" alt="Mobile screenshot 3" width="100%"> |

| Mobile 4 | Mobile 5 | Mobile 6 |
| --- | --- | --- |
| <img src="https://raw.githubusercontent.com/r11a/homeii-music-flow/main/docs/media/mobile-4.jpg" alt="Mobile screenshot 4" width="100%"> | <img src="https://raw.githubusercontent.com/r11a/homeii-music-flow/main/docs/media/mobile-5.jpg" alt="Mobile screenshot 5" width="100%"> | <img src="https://raw.githubusercontent.com/r11a/homeii-music-flow/main/docs/media/mobile-6.jpg" alt="Mobile screenshot 6" width="100%"> |

| History | Mobile 7 |
| --- | --- |
| <img src="https://raw.githubusercontent.com/r11a/homeii-music-flow/main/docs/media/history-light.png" alt="History and recommendations drawer" width="100%"> | <img src="https://raw.githubusercontent.com/r11a/homeii-music-flow/main/docs/media/mobile-7.jpg" alt="Mobile screenshot 7" width="100%"> |

## Feature Highlights

### Listening Experience

- Premium artwork-first now-playing screen
- Dynamic background and color atmosphere from current artwork
- Full player, compact player, mobile player, tablet layout, and desktop layout
- Album art, title, artist, album, source, progress, volume, and queue context
- Clean neutral fallback when no artwork is available
- Light, dark, and auto theme behavior

### Sendspin / This Device

- Local browser player connection from inside the card
- HOMEii-specific Sendspin player identity
- Direct authenticated Sendspin WebSocket bridge
- Reconnect on dashboard return, app focus, `pageshow`, and network-online events
- Dashboard-level local session so the browser player is not tied to one Dashboard card instance
- Grace period when leaving the dashboard page before stopping the local player
- Manual disconnect action to stop automatic reconnect for this browser session
- Device discovery after connection
- "This device" and "Browser players" player flows
- Local sync delay storage
- Packaged `sendspin-js` runtime for HACS/manual installs

### FLOW Guided Wizard

- Step-by-step music wizard for non-technical users
- Clean restart every time FLOW is opened from the actions menu
- Reset button on every step
- Player and multi-player selection
- Choose by mood or from existing library content
- Mood presets: calm, energetic, morning, night, kids, Israeli, and free style
- Existing content modes: playlist, artist, artist radio, and library radio
- Free-style text search for custom moods or situations
- Visual result grid with large rounded cards, artwork, media type, and clear selection state
- Playback confirmation overlay before returning to the main player

### Studio / Control Room

- Player grid for room control
- Select primary player
- Multi-player selection
- Speaker grouping and ungrouping
- Per-room volume sliders
- Move/transfer playback foundations
- Search and play library media from Studio
- Labeled action dock for search, queue transfer, grouping, and ungrouping
- Stable tablet panel layout and scroll handling

### Queue

- Queue panel and full queue view
- Current item and up-next display
- Queue search
- Inline expandable queue-row actions
- Play now, play next, add to queue, remove, and move actions where supported
- Clear transfer-queue label and queue-count button
- Artwork and duration display
- Empty queue and loading states

### Library

- Music Assistant playlists, albums, artists, tracks, radio, and podcasts
- Library search
- Play all, shuffle all, play now, add to queue
- Favorite/liked handling
- Radio Browser support with country/filter/search foundations
- Clean grid and list views for touch

### Lyrics

- Wide lyrics screen
- Centered, immersive lyric presentation
- Synced lyrics offset controls
- Lyrics font size controls with `+`, `-`, and reset
- Lyrics cache and unavailable states
- Mobile/tablet layout fixes for long song and artist names

### Timers, Schedules, And Night Mode

- Sleep timer countdown
- Quick timer buttons
- Scheduled start actions
- Choose player, days, time, volume, and playlist
- Random pleasant morning fallback when no playlist is selected
- Night mode off / auto / on
- Night mode time window and day selection
- Mobile timer display above the active player button

### History And Recommendations

- Recent listening drawer
- Last 10 recent items shown immediately when opening history
- Recommendations tab
- Playlist recommendations
- Queue/recent-based suggestion foundations
- Quick play from history or recommendation chips

### Announcements

- Announcement page
- Target player selection
- Text-to-speech announcements
- Preset announcement buttons
- Voice dictation when the browser supports it
- Automatic Hebrew/English language detection

### Mobile UX

- One-handed control layout
- Active player button
- Mobile main bar customization
- Compact volume controls
- Artwork swipe/browse support through Embla
- Immediate artwork selection feedback while browsing covers
- Mobile settings saved locally
- Touch-sized controls and RTL-safe layout

### Settings And Editor

- Built-in Home Assistant visual editor support
- In-card settings panels
- Language, theme, layout, color, motion, footer, volume, mic, swipe, liked, night mode, and shortcut settings
- Announcement preset and TTS entity settings
- Current defaults: auto-fit card height, night mode `off`, up-next `off`, mic `smart`, settings source `visual editor`, dynamic theme `auto`, background motion `subtle`, footer `icon+text`, font scale `1`, artwork swipe `browse`, home shortcut `off`, liked mode `Music Assistant`
- Config validation and tested state helpers

## Full Feature Map

<details>
<summary>Open the complete feature map</summary>

### Now Playing

- Artwork-first now-playing presentation
- Blurred artwork background and ambient treatment
- Track title, artist, album, and source metadata
- Source/provider badge display
- Neutral missing-artwork fallback
- Idle, unavailable, loading, paused, and playing states
- Long title and long artist handling
- Hebrew/RTL-safe metadata alignment
- Main layout for tablet and desktop
- Mobile layout for narrow screens
- Immersive full player view
- Compact dashboard mode
- Up-next visibility support
- Recent playback foundations

### Playback Controls

- Play / pause
- Previous track
- Next track
- Shuffle toggle
- Repeat toggle
- Repeat-one icon/state support
- Progress bar
- Seek interaction
- Live progress refresh
- Transport controls in regular and immersive layouts
- Touch-friendly control sizing
- Visual active states

### Volume

- Volume slider
- Mute / unmute
- Soft mute handling
- Last volume memory by player
- Large player volume controls
- Control-room volume controls
- Volume presets
- Mobile volume mode: always visible or button-triggered
- Per-player volume display
- Slider fill and thumb styling for light/dark modes

### Queue

- Embedded queue panel
- Full queue view
- Compact queue cards
- Mini queue list
- Active queue item highlighting
- Previous/past queue styling
- Up-next state resolution
- Queue search
- Queue and library combined search flow
- Clear search and back-to-queue behavior
- Queue item artwork
- Queue item duration
- Queue item context actions
- Inline row expansion for touch-safe actions
- Text actions for play next and play now
- Wider centered move up/down action buttons
- Red translucent remove action
- Play now
- Shuffle play
- Play next
- Add to queue
- Remove from queue
- Move up/down where supported
- Queue transfer label and count in the queue header
- Queue transfer between players foundations
- Empty queue state
- Queue action feedback

### Music Assistant Library

- Library home view
- Playlists
- Artists
- Albums
- Tracks
- Radio
- Podcasts
- Favorite radio
- Recently played
- Recently added
- Discover/random album sections
- Library caching
- Grid collection rendering
- Track list rendering
- Track grid/list toggle
- Play all
- Shuffle all
- Add library item to queue
- Play library item now
- Search across library categories
- No-results state
- Loading and error states

### Radio Browser

- Radio Browser country list support
- Country filter support
- Top-voted station discovery
- Station search
- Radio metadata normalization
- Radio identity detection
- Radio playback detection
- Radio artwork/favicon support where available

### Favorites And Likes

- Music Assistant favorite detection
- Local liked-state mode
- Optimistic favorite updates
- Favorite cache entries
- Current-media favorite matching
- Queue-based favorite state resolution
- Favorite remove-argument resolution
- Favorite radio support
- Liked library tab support

### Players And Multi-Room

- Player picker
- Selected player summary
- Active players view
- Browser player detection
- This-device Sendspin flow
- Waiting-for-device-player state
- Other players section
- Pinned player support
- Multiple pinned players
- Player grouping
- Group speakers modal
- Apply group
- Ungroup
- Group membership detection
- Static group handling foundations
- Derived group stats
- Stop all players with stop, queue clear, group disconnect, and local Sendspin disconnect
- Player transfer target selection
- Player state indicators
- Player artwork/track preview

### Announcements

- Announcement screen
- Target player selection
- Announcement text input
- Up to three presets
- Preset fill buttons
- TTS entity configuration
- Automatic TTS entity fallback detection
- Text-to-speech announcements
- Music Assistant announcement playback fallback
- Hebrew/English announcement language detection
- Voice dictation when supported
- Success/failure feedback

### Sleep Timer, Scheduling, And Night Mode

- Sleep timer menu
- +15 / +30 / +60 minute actions
- Clear/cancel timer
- Timer countdown label
- Timer footer/chip display
- Timer persistence in local storage
- Scheduled start by hour
- Scheduled start by selected days
- Scheduled start player selection
- Scheduled start volume
- Scheduled start playlist selection
- Mobile-safe schedule controls for narrow iPhone layouts
- Random pleasant morning fallback
- Night mode: off / auto / on
- Night mode start/end times
- Night mode day selection
- Overnight window handling
- Night-mode-triggered timer state
- Helper tests for foundations

### Actions

- Dedicated actions menu
- FLOW guided wizard
- Scheduling shortcut
- Sleep timer shortcut
- Announcements shortcut
- Queue/player action shortcuts
- Home shortcut option
- Studio shortcut option
- Fast mobile access to high-use controls

### FLOW Guided Wizard

- Guided three-step flow: players, music, play
- Clean state on every open from the actions menu
- Reset action on every step
- All players and individual player selection
- Mood-based search
- Existing content search
- Free-style mood query
- Playlist, artist, artist radio, and library radio flows
- Visual results grid
- Large rounded result cards with artwork and media type
- Active result highlighting
- Play confirmation overlay
- Automatic return to the main player after starting playback

### Search

- Global search input
- Search clear button
- Debounced search timers
- Search across radio, podcasts, albums, artists, tracks, and playlists
- Queue search
- Library search
- Side search summary
- No-results messaging
- Mobile/tablet search adaptation

### Theme And Visual System

- Auto / light / dark theme modes
- Theme toggle
- Custom color support
- Dynamic theme from current artwork
- Dynamic theme modes: off / auto / strong
- Dynamic palette cache
- Background motion modes: off / subtle / strong / extreme
- Light theme refinements
- Dark theme refinements
- Accent color resolution
- Palette tuning helpers
- Background glow and artwork aura
- High-contrast text handling
- Custom text tone: light/dark

### Mobile, Tablet, And Desktop UX

- Mobile-first shell
- Mobile compact mode
- Expandable compact behavior
- Mobile up-next toggle
- Mobile footer modes: icon / text / both
- Optional footer search
- Mobile main bar customization
- Mobile library tab customization
- Mobile font scale
- Mobile swipe mode
- Mobile mic mode
- Mobile volume mode
- Mobile home shortcut
- Mobile studio shortcut
- Tablet layout mode
- Auto layout mode
- Height-aware layout adaptation
- Desktop wide layout
- Responsive grid behavior
- Tablet sheet sizing for library, search, queue, actions, players, group players, and settings

### Language And RTL

- English labels
- Hebrew labels
- Auto language mode
- Manual language toggle
- RTL layout support
- RTL-safe controls
- Hebrew-friendly settings labels
- Hebrew announcement flow
- Editor locale helpers

### Adding A Language

- Start from `src/localization/en.js` and translate values only.
- Register the new file in `src/localization/index.js`.
- Add the language to `LANGUAGE_OPTIONS`.
- Add the language code to `RTL_LANGUAGE_CODES` only for right-to-left languages.
- Run `npm test`, `npm run build`, and `node scripts/release.mjs`.
- Use `TRANSLATING.md` for the full string glossary and `HOW_TO_ADD_A_LANGUAGE.md` for the step-by-step release checklist.

### Reliability And Release Foundation

- Structured `src/core` foundation helpers
- Config validators
- State defaults and derived state helpers
- Mobile settings normalization
- Responsive layout helpers
- Palette and dynamic theme helpers
- Night mode and sleep timer helpers
- Media queue identity and matching helpers
- Favorites and optimistic favorite-state helpers
- Player, pinned-player, and grouping helpers
- Media presentation helpers
- History and source-badge helpers
- Vitest coverage for high-risk logic
- ESLint configuration
- Vite build flow
- Release sync script
- HACS validation workflow
- QA matrix for viewport/theme/interaction checks

</details>

## Basic Configuration

```yaml
type: custom:homeii-music-flow
language: auto
rtl: true
theme_mode: auto
show_theme_toggle: true
# Optional: create this helper in Home Assistant first.
active_player_helper_entity: input_text.homeii_flow_active_player
```

### Sendspin / This Device Configuration

```yaml
type: custom:homeii-music-flow
ma_url: "http://YOUR_MUSIC_ASSISTANT_HOST:8095"
ma_token: "YOUR_MUSIC_ASSISTANT_TOKEN"
```

Use the visual editor or in-card settings whenever possible.

## Project Structure

```text
dist/homeii-music-flow.js             HACS/manual runtime
dist/sendspin-js/                     packaged local Sendspin browser player files
dist/vendor/embla-carousel.umd.js     packaged swipe support
dist/homeii-flow-logo.svg             packaged brand asset
src/homeii-music-flow.js              source snapshot for the card
src/sendspin-js/                      source copy of Sendspin browser player files
vendor/embla-carousel.umd.js          source copy of Embla used by the release package
src/core/                             extracted foundation helpers
src/config/                           config validators
tests/                                regression coverage
scripts/release.mjs                   release sync tooling
RELEASE_NOTES_5.8.2-beta.7.md         detailed GitHub release notes for the current beta
RELEASE_NOTES_5.8.2-beta.6.md         previous beta release notes
RELEASE_NOTES_5.8.2-beta.5.md         previous beta release notes
RELEASE_NOTES_5.8.2-beta.4.md         previous beta release notes
RELEASE_NOTES_5.8.2-beta.3.md         previous beta release notes
RELEASE_NOTES_5.8.2-beta.2.md         previous beta release notes
RELEASE_NOTES_5.8.2-beta.1.md         previous beta release notes
RELEASE_NOTES_5.8.1.md                previous stable hotfix release notes
RELEASE_NOTES_5.8.0.md                previous major release notes
RELEASE_NOTES_5.7.1.md                previous public release notes
docs/brand/                           logo and brand assets
docs/media/                           GitHub/HACS README screenshots and GIF
docs/qa-matrix.md                     viewport/theme/interaction release gate
```

HACS plugin repositories must expose the dashboard JavaScript in `dist/` or the repository root. HOMEii Flow keeps the full installable runtime in `dist/` because the local Sendspin player, Embla, and logo asset are required at runtime.

## Development

```text
npm install
npm run build
npm run lint
npm test
```

Current packaged version: `5.8.2-beta.7`

## Release Readiness

Before publishing a release:

- Run `npm run build`.
- Run `npm run lint`.
- Run `npm test`.
- Confirm `dist/homeii-music-flow.js` exists.
- Confirm `dist/sendspin-js/` exists.
- Confirm `dist/vendor/embla-carousel.umd.js` exists.
- Confirm `dist/homeii-flow-logo.svg` exists.
- Confirm the README renders all screenshots.
- Create a GitHub release, not only a tag.
- Install through HACS as a custom repository and verify the resource path.
- Test phone, tablet, and desktop layouts.
- Test Sendspin "This device" connection on at least one browser device.

## Support

HOMEii Flow is free and built as an independent community project. If it improves your Home Assistant music dashboard and you want to support continued polish, fixes, documentation, and new features, sponsorship is appreciated.

No pressure: stars, feedback, screenshots, bug reports, and thoughtful feature ideas also help a lot.

<p align="center">
  <a href="https://github.com/sponsors/r11a">
    <img alt="Sponsor HOMEii Flow" src="https://img.shields.io/badge/Sponsor-HOMEii%20Flow-EA4AAA?logo=githubsponsors&logoColor=white">
  </a>
</p>

## Credits

HOMEii Flow is an independent community project and is not an official Music Assistant or Home Assistant project.

Credit and thanks:

- [Music Assistant](https://www.music-assistant.io/) for the music server, Home Assistant integration, library model, player control, announcements, and Sendspin support that make this card possible.
- [Sendspin](https://www.music-assistant.io/player-support/sendspin/) and the Open Home Foundation for the browser/local playback protocol used by the "This device" player flow.
- [Home Assistant](https://www.home-assistant.io/) for the dashboard platform.
- [HACS](https://www.hacs.xyz/) for the custom repository distribution path.
- [Embla Carousel](https://www.embla-carousel.com/) for the packaged swipe foundation.
- Daniel Eduardo Gonzalez ([@danielxb-ar](https://github.com/danielxb-ar)) for the Spanish translation.
- Donatas / donatassmarterhome for the Lithuanian translation.
- Julien Moreau B. / [jingle-jew](https://github.com/jingle-jew) for the French translation, French wording corrections, PR #34, PR #35, PR #36, Sendspin / Media Session improvements, and 5.7.x testing feedback.
- [@Dieghito72](https://github.com/Dieghito72) for the Italian translation contribution.
- [@gao19970120](https://github.com/gao19970120) for the Simplified Chinese translation contribution.
- [@TheBamse](https://github.com/TheBamse) for the Danish translation contribution and performance-focused PRs.
- Codex for helping turn a non-programmer's product and UX vision into a working release-ready card.

## Documentation

- [Local deployment guide](./LOCAL_DEPLOYMENT.md)
- [Publishing checklist](./PUBLISHING.md)
- [5.8.2 Beta 7 release notes](./RELEASE_NOTES_5.8.2-beta.7.md)
- [5.8.2 Beta 6 release notes](./RELEASE_NOTES_5.8.2-beta.6.md)
- [5.8.2 Beta 5 release notes](./RELEASE_NOTES_5.8.2-beta.5.md)
- [5.8.2 Beta 4 release notes](./RELEASE_NOTES_5.8.2-beta.4.md)
- [5.8.2 Beta 3 release notes](./RELEASE_NOTES_5.8.2-beta.3.md)
- [5.8.2 Beta 2 release notes](./RELEASE_NOTES_5.8.2-beta.2.md)
- [5.8.2 Beta 1 release notes](./RELEASE_NOTES_5.8.2-beta.1.md)
- [5.8.1 release notes](./RELEASE_NOTES_5.8.1.md)
- [5.8.0 release notes](./RELEASE_NOTES_5.8.0.md)
- [5.7.1 release notes](./RELEASE_NOTES_5.7.1.md)
- [QA matrix](./docs/qa-matrix.md)
- [Repo assets checklist](./docs/repo-assets-checklist.md)
- [Changelog](./CHANGELOG.md)
