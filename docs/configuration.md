# Configuration

HOMEii Music Flow can be configured from the Home Assistant visual editor, the in-card settings screen, or YAML.

## Configuration Sources

There are two kinds of configuration:

- **YAML / visual editor config:** saved in the Home Assistant dashboard.
- **In-card settings:** saved in browser storage for the current browser/device.

Use the visual editor for structural options such as Music Assistant URL, helper entities, card id, and default player. Use in-card settings for personal UI choices such as theme, layout, pinned players, quick actions, and phone behavior.

## Minimal YAML

```yaml
type: custom:homeii-music-flow
```

## Common YAML

```yaml
type: custom:homeii-music-flow
entity: media_player.living_room
language: auto
theme_mode: auto
phone_display_mode: auto
```

## Music Assistant Connection Modes

HOMEii Music Flow can work through two paths.

### Home Assistant Integration Path

This is the normal mode.

The browser talks to Home Assistant, and Home Assistant talks to Music Assistant through the Music Assistant integration.

This mode is enough for:

- playback controls
- player selection
- library browsing
- queue controls
- artwork through Home Assistant or Music Assistant paths
- most normal dashboard use

You can leave `ma_url` empty when you only need the Home Assistant integration path.

### Direct Music Assistant Path

This is optional.

Set `ma_url` and `ma_token` when the browser itself must talk directly to Music Assistant.

This is needed for:

- This device / Sendspin browser playback
- direct Music Assistant API checks
- direct realtime WebSocket checks
- some remote artwork paths depending on your setup

Example:

```yaml
type: custom:homeii-music-flow
ma_url: "https://music.example.com"
ma_token: "YOUR_MUSIC_ASSISTANT_TOKEN"
```

If Home Assistant is opened through HTTPS, the direct Music Assistant URL should also be HTTPS. Browsers block mixed HTTP/WebSocket access from an HTTPS dashboard.

## Sendspin / This Device

To use the current browser, phone, tablet, or wall panel as a Music Assistant player:

```yaml
type: custom:homeii-music-flow
ma_url: "https://music.example.com"
ma_token: "YOUR_MUSIC_ASSISTANT_TOKEN"
```

Then open the Players screen and choose **This device**.

Important notes:

- The URL must be reachable from the browser device.
- Remote users usually need an HTTPS Music Assistant URL.
- Mobile systems can pause browser audio when the app is backgrounded or the phone locks.
- Diagnostics can check browser support, computed Sendspin endpoint, and current local runtime state.

## Reusable Dashboards

HOMEii Music Flow 5.9.0 makes reusable dashboards easier with two related features:

- `card_id` separates local settings for different card instances.
- URL player overrides open the same dashboard directly to a specific player.

Use them when:

- one YAML/dashboard include is reused for many rooms
- one tablet should open directly to the kitchen player
- another dashboard should open directly to the bedroom player
- multiple HOMEii cards run in the same browser
- different users need different default players without duplicating the whole card configuration

## `card_id`

Use `card_id` when you run more than one HOMEii Music Flow card in the same browser and want separate local settings.

```yaml
type: custom:homeii-music-flow
card_id: kitchen-flow
entity: media_player.kitchen
```

Rules:

- `card_id` is optional.
- It can include letters, numbers, `_`, and `-`.
- Cards with the same `card_id` share in-card settings.
- Cards with different `card_id` values keep separate browser-local settings.

Adding `card_id` to an existing card may make it look like settings were reset once. The old browser settings still exist under the old global keys; the card now reads from the new card-scoped keys.

## Query-String Player Override

HOMEii Music Flow can read the selected player from the dashboard URL. This is useful for reusable dashboards and included YAML.

Supported examples:

```text
?player=kitchen_sonos
?homeii_player=kitchen_sonos
```

With `card_id`:

```text
?homeii_player_kitchen-flow=kitchen_sonos
```

The value can match a player entity id or common object-id style name, depending on the player exposed by Home Assistant.

## Open A Dashboard Directly To A Player

The simplest form is:

```text
?player=kitchen_sonos
```

Example:

```text
https://homeassistant.example.com/lovelace/music?player=kitchen_sonos
```

You can also use:

```text
?homeii_player=kitchen_sonos
```

If the dashboard contains more than one HOMEii Music Flow card, use a card-scoped parameter:

```yaml
type: custom:homeii-music-flow
card_id: kitchen-flow
```

```text
https://homeassistant.example.com/lovelace/music?homeii_player_kitchen-flow=kitchen_sonos
```

This tells only the card with `card_id: kitchen-flow` to use `kitchen_sonos`.

### Matching Rules

HOMEii Music Flow tries to match the URL value against available players.

Recommended values:

- full entity id: `media_player.kitchen_sonos`
- object id: `kitchen_sonos`
- a stable Music Assistant / Home Assistant player id when exposed

If the player is not found, the card falls back to its configured or last selected player.

### Practical Examples

Kitchen tablet:

```text
https://homeassistant.example.com/lovelace/music?player=kitchen_sonos
```

Bedroom tablet:

```text
https://homeassistant.example.com/lovelace/music?player=bedroom_speaker
```

Two cards on the same dashboard:

```text
https://homeassistant.example.com/lovelace/music?homeii_player_kitchen-flow=kitchen_sonos&homeii_player_bedroom-flow=bedroom_speaker
```

### Important Notes

- URL player overrides do not permanently rewrite the dashboard YAML.
- They only affect the browser session/card state.
- `card_id` is recommended when more than one HOMEii card can appear in the same browser.
- If the URL parameter points to a missing player, HOMEii Flow keeps using the normal selected player.

## Active Player Helper

HOMEii Music Flow can publish the currently selected player to an `input_text` helper.

Create a text helper in Home Assistant, then configure:

```yaml
type: custom:homeii-music-flow
active_player_helper_entity: input_text.homeii_flow_active_player
```

The helper stores values such as:

```text
media_player.kitchen
```

Use it in automations:

```yaml
alias: HOMEii Flow - Toggle active player
sequence:
  - service: media_player.media_play_pause
    target:
      entity_id: "{{ states('input_text.homeii_flow_active_player') }}"
```

## Recommended Defaults

For most users:

```yaml
type: custom:homeii-music-flow
language: auto
theme_mode: auto
phone_display_mode: auto
```

For wall tablets:

```yaml
type: custom:homeii-music-flow
language: auto
theme_mode: auto
phone_display_mode: full
```

For multiple cards in one browser:

```yaml
type: custom:homeii-music-flow
card_id: living-room-flow
entity: media_player.living_room
```
