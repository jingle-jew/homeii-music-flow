# Diagnostics

Diagnostics helps users and maintainers understand whether HOMEii Music Flow, Home Assistant, Music Assistant, the browser, and optional direct features are working together correctly.

## Where To Open Diagnostics

Diagnostics is available from:

- the in-card Settings screen
- the Home Assistant visual editor

For support issues, prefer running Diagnostics from the card itself after selecting the player that has the problem.

## What Diagnostics Shows

Diagnostics v3 includes:

- HOMEii Music Flow version
- diagnostics version
- browser and platform
- viewport size, DPR, touch points, and language
- privacy-safe Home Assistant URL details
- privacy-safe Music Assistant URL details
- Home Assistant frontend availability
- Music Assistant services
- Music Assistant config entry state
- integration signal
- strict Music Assistant player count
- generic Home Assistant media player fallback count
- selected player markers
- Direct Music Assistant API result
- Direct Music Assistant WebSocket state
- Sendspin browser support
- Sendspin endpoint readiness
- queue identity
- queue provider availability
- queue snapshot result
- queue artwork sample
- library provider availability
- library coverage
- library artwork sample

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
- whether Home Assistant can fetch queue data
- whether direct queue data is available
- whether queue artwork can be inferred

If the selected player is a generic Home Assistant fallback player and does not expose an active Music Assistant queue, the card may still control playback, but queue details can be limited.

## Library Diagnostics

Library checks show:

- whether Home Assistant library services are available
- whether direct library access is available
- whether playlists, artists, albums, tracks, and radio return items
- whether artwork is found for sample items

If library coverage is zero, check Music Assistant integration state, selected config entry, and whether the Music Assistant library is actually populated.

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

