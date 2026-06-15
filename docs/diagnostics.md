# Diagnostics

Diagnostics helps users and maintainers understand whether HOMEii Music Flow, Home Assistant, Music Assistant, the browser, and optional direct features are working together correctly.

## Where To Open Diagnostics

Diagnostics is available from:

- the in-card Settings screen
- the Home Assistant visual editor

For support issues, prefer running Diagnostics from the card itself after selecting the player that has the problem.

## What Diagnostics Shows

Diagnostics v6 includes:

- HOMEii Music Flow version
- diagnostics version
- browser and platform
- viewport size, DPR, touch points, and language
- privacy-safe Home Assistant URL details
- privacy-safe Music Assistant URL details
- Home Assistant frontend availability
- Music Assistant services
- optional HOMEii Flow Engine bridge status
- Music Assistant config entry state
- integration signal
- strict Music Assistant player count
- generic Home Assistant media player fallback count
- selected player markers
- selected player source
- current group state and group service path
- Direct Music Assistant API result
- Direct Music Assistant WebSocket state
- Sendspin browser support
- Sendspin endpoint readiness
- queue identity
- queue provider availability
- queue UI state
- queue snapshot result
- queue artwork sample
- queue artwork browser load result
- library provider availability
- library coverage
- library artwork sample
- library artwork browser load result
- authenticated artwork fetch fallback result
- rendered artwork DOM health

External and private hostnames are redacted by default in visible and copied output.

## Status Levels

Diagnostics uses four status levels.

| Status | Meaning |
| --- | --- |
| OK | The check looks healthy |
| FAIL | This check is blocking or clearly broken |
| WARN | The feature may still work, but something needs attention |
| INFO | Context only, not a problem by itself |

## Integration Signal

The most important checks are:

- Music Assistant services
- Music Assistant config entry
- Music Assistant players
- selected player markers
- queue providers
- library providers

If Music Assistant services are exposed, HOMEii Music Flow can often use the Home Assistant integration path even when direct browser access is unavailable.

## HOMEii Flow Engine

The HOMEii Flow Engine check reports the optional backend integration bridge.

Possible outcomes:

- **OK:** the Engine integration answered the card and reported its version/capabilities.
- **INFO:** the Engine is disabled or not installed, and the card is using the normal frontend-only compatibility path.
- **FAIL:** `homeii_engine_mode` is set to `required`, but the Engine did not answer.

This check does not replace Music Assistant diagnostics. It adds backend visibility for Engine-backed features such as player state, schedules, timers, statistics, policies, playback proxying, queue transfer, grouping orchestration, Sendspin state, and smarter recommendations.

## Direct API And CORS

Direct Music Assistant API can fail even when Music Assistant is working.

Common reasons:

- browser CORS/preflight restrictions
- Home Assistant is opened on HTTPS but Music Assistant is only HTTP
- Music Assistant URL is local-only while the browser is remote
- reverse proxy blocks API requests

This does not always block core playback. It mainly affects optional direct browser access and some artwork/Sendspin paths.

## Queue Diagnostics

Queue checks show:

- whether the selected player exposes a queue identity
- which queue providers are available
- whether the rendered Queue UI has items
- whether Home Assistant can fetch queue data
- whether direct queue data is available
- whether queue artwork can be inferred
- whether the current browser can actually load the sampled artwork

If the selected player is a generic Home Assistant fallback player and does not expose an active Music Assistant queue, the card may still control playback, but queue details can be limited.

If queue APIs return items but the rendered Queue UI is empty, Diagnostics reports that mismatch directly. That is the strongest signal for a card-side queue rendering/state issue.

## Library Diagnostics

Library checks show:

- whether Home Assistant library services are available
- whether direct library access is available
- whether playlists, artists, albums, tracks, and radio return items
- whether artwork is found for sample items

If library coverage is zero, check Music Assistant integration state, selected config entry, and whether the Music Assistant library is actually populated.

If artwork URLs are inferred but the browser cannot load them, Diagnostics reports the browser load result separately. This helps distinguish "Music Assistant did not provide artwork" from "the browser cannot display artwork from this access path."

## Group Diagnostics

Group checks show:

- whether the selected player is currently grouped
- which player appears to be the group owner/master
- current group members where Home Assistant exposes them
- which Home Assistant services are available for join/unjoin
- whether group actions are expected to use `media_player.join`, `media_player.unjoin`, or a fallback path

If a group action reports success but nothing changes, share Diagnostics together with the exact selected player and the speakers you tried to add or remove.

## Sendspin Diagnostics

Sendspin checks show:

- browser WebSocket support
- AudioContext support
- audio element support
- local runtime state
- computed WebSocket endpoint
- access mode

Sendspin requires direct Music Assistant browser access. The normal Home Assistant integration path is not enough for the browser to become a player.

## What To Share In An Issue

When opening an issue, include:

- HOMEii Music Flow version
- Home Assistant version
- Music Assistant version
- browser or Companion app
- phone/tablet/desktop
- the Diagnostics report
- screenshot of the broken screen
- what player was selected
- whether it happens locally, remotely, or both

Do not manually paste private hostnames if Diagnostics redacted them.
