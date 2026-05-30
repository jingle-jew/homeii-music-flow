import {
  mediaRefsEquivalent,
  normalizeFiniteNumber,
} from "../state/media-queue.js";

function queueItemIdentityAccessors(accessors = {}) {
  return {
    getQueueItemPlaybackId: accessors.getQueueItemPlaybackId || (() => ""),
    getQueueItemStableId: accessors.getQueueItemStableId || (() => ""),
    getQueueItemKey: accessors.getQueueItemKey || (() => ""),
    getQueueItemUri: accessors.getQueueItemUri || (() => ""),
  };
}

export function pendingQueuePlayState(state = {}, now = Date.now()) {
  const pendingUntil = Number(state?.mobileQueuePlayPendingUntil || 0);
  const pendingIndex = normalizeFiniteNumber(state?.mobileQueuePlayPendingIndex);
  return {
    hasPendingPlay: pendingUntil > Number(now || 0),
    pendingUntil,
    pendingKey: String(state?.mobileQueuePlayPendingKey || "").trim(),
    pendingUri: String(state?.mobileQueuePlayPendingUri || "").trim(),
    pendingIndex,
    pendingPlayerId: String(state?.mobileQueuePlayPendingPlayerId || "").trim(),
  };
}

export function hasPendingQueuePlay(state = {}, now = Date.now()) {
  return pendingQueuePlayState(state, now).hasPendingPlay;
}

export function buildPendingQueuePlayPatch({
  item = null,
  playIndex = null,
  selectedPlayerId = "",
  now = Date.now(),
  durationMs = 8500,
  accessors = {},
} = {}) {
  const normalizedIndex = normalizeFiniteNumber(playIndex);
  if (!item && !Number.isFinite(normalizedIndex)) return null;
  const {
    getQueueItemPlaybackId,
    getQueueItemStableId,
    getQueueItemKey,
    getQueueItemUri,
  } = queueItemIdentityAccessors(accessors);
  return {
    mobileQueuePlayPendingUntil: Number(now || Date.now()) + Math.max(1, Number(durationMs || 8500)),
    mobileQueuePlayPendingKey: item
      ? (getQueueItemPlaybackId(item) || getQueueItemStableId(item) || getQueueItemKey(item) || getQueueItemUri(item) || "")
      : "",
    mobileQueuePlayPendingIndex: Number.isFinite(normalizedIndex) ? normalizedIndex : null,
    mobileQueuePlayPendingUri: item ? (getQueueItemUri(item) || "") : "",
    mobileQueuePlayPendingPlayerId: String(selectedPlayerId || "").trim(),
  };
}

export function clearPendingQueuePlayPatch() {
  return {
    mobileQueuePlayPendingUntil: 0,
    mobileQueuePlayPendingKey: "",
    mobileQueuePlayPendingIndex: null,
    mobileQueuePlayPendingUri: "",
    mobileQueuePlayPendingPlayerId: "",
  };
}

export function queueItemMatchesPendingPlay(
  item = null,
  pendingState = {},
  accessors = {},
  compareMediaRefs = mediaRefsEquivalent,
) {
  if (!item) return false;
  const pending = Object.prototype.hasOwnProperty.call(pendingState || {}, "hasPendingPlay")
    ? pendingState
    : pendingQueuePlayState(pendingState);
  if (!pending?.hasPendingPlay) return false;
  const {
    getQueueItemPlaybackId,
    getQueueItemStableId,
    getQueueItemKey,
    getQueueItemUri,
  } = queueItemIdentityAccessors(accessors);
  const pendingKey = String(pending.pendingKey || "").trim();
  const pendingUri = String(pending.pendingUri || "").trim();
  const pendingIndex = normalizeFiniteNumber(pending.pendingIndex);
  const itemIds = [
    getQueueItemPlaybackId(item),
    getQueueItemStableId(item),
    getQueueItemKey(item),
    getQueueItemUri(item),
  ].map((value) => String(value || "").trim()).filter(Boolean);
  if (pendingKey && itemIds.includes(pendingKey)) return true;
  const itemUri = getQueueItemUri(item);
  if (
    pendingUri
    && itemUri
    && compareMediaRefs(itemUri, pendingUri, item?.media_item?.media_type || item?.media_type || "track")
  ) {
    return true;
  }
  return Number.isFinite(pendingIndex) && Number(item?.sort_index) === pendingIndex;
}

export function resolvePendingQueueItem({
  state = {},
  pendingState = null,
  currentQueueItem = null,
  stack = null,
  queueItems = [],
  accessors = {},
  compareMediaRefs = mediaRefsEquivalent,
} = {}) {
  const pending = pendingState || pendingQueuePlayState(state);
  if (!pending?.hasPendingPlay) return null;
  const candidates = [
    state?.maQueueState?.current_item,
    currentQueueItem,
    stack?.current,
    ...(Array.isArray(queueItems) ? queueItems : []),
  ].filter(Boolean);
  return candidates.find((item) =>
    queueItemMatchesPendingPlay(item, pending, accessors, compareMediaRefs)
  ) || state?.maQueueState?.current_item || currentQueueItem || stack?.current || null;
}

export function nowPlayingDisplaySource({
  player = null,
  currentQueueItem = null,
  stack = null,
  queueItems = [],
  state = {},
  pendingState = null,
  fallbackTitle = "",
  accessors = {},
  compareMediaRefs = mediaRefsEquivalent,
  artworkUrlFn = null,
  size = 420,
} = {}) {
  const pending = pendingState || pendingQueuePlayState(state);
  const hasPendingPlay = !!pending?.hasPendingPlay;
  const queueItem = hasPendingPlay
    ? (resolvePendingQueueItem({
      state,
      pendingState: pending,
      currentQueueItem,
      stack,
      queueItems,
      accessors,
      compareMediaRefs,
    }) || currentQueueItem)
    : currentQueueItem;
  const media = queueItem?.media_item || {};
  const queueArtists = Array.isArray(media?.artists)
    ? media.artists.map((artist) => artist?.name).filter(Boolean).join(", ")
    : "";
  const queueTitle = media?.name || queueItem?.media_title || queueItem?.name || "";
  const queueArtist = queueItem?.media_artist || queueItem?.artist_str || queueArtists || queueItem?.artist || "";
  const queueAlbum = media?.album?.name || queueItem?.media_album_name || queueItem?.album || "";
  const preferQueueText = hasPendingPlay || !player?.attributes?.media_title;
  const title = preferQueueText
    ? (queueTitle || player?.attributes?.media_title || fallbackTitle)
    : (player?.attributes?.media_title || queueTitle || fallbackTitle);
  const artist = preferQueueText
    ? (queueArtist || player?.attributes?.media_artist || "")
    : (player?.attributes?.media_artist || queueArtist || "");
  const album = preferQueueText
    ? (queueAlbum || player?.attributes?.media_album_name || "")
    : (player?.attributes?.media_album_name || queueAlbum || "");
  const mediaType = String(
    preferQueueText
      ? (media?.media_type || queueItem?.media_type || player?.attributes?.media_content_type || player?.attributes?.media_channel || "")
      : (player?.attributes?.media_content_type || player?.attributes?.media_channel || media?.media_type || queueItem?.media_type || "")
  ).toLowerCase();
  return {
    hasPendingPlay,
    queueItem,
    media,
    title,
    artist,
    album,
    mediaType,
    art: typeof artworkUrlFn === "function" ? artworkUrlFn(player, queueItem, { pending: hasPendingPlay, size }) : "",
    uri: String(queueItem ? (queueItemIdentityAccessors(accessors).getQueueItemUri(queueItem) || "") : "").trim(),
  };
}

export function pendingPlayerLockState(state = {}, players = [], now = Date.now()) {
  const pending = pendingQueuePlayState(state, now);
  const entityIds = new Set((Array.isArray(players) ? players : [])
    .map((player) => String(player?.entity_id || "").trim())
    .filter(Boolean));
  const selectedPlayerId = String(state?.selectedPlayer || "").trim();
  const selectedPlayerExists = !!selectedPlayerId && entityIds.has(selectedPlayerId);
  const pendingPlayerExists = !!pending.pendingPlayerId && entityIds.has(pending.pendingPlayerId);
  return {
    ...pending,
    lockedPlayerId: pending.hasPendingPlay && pendingPlayerExists ? pending.pendingPlayerId : "",
    shouldHoldSelectedPlayer: pending.hasPendingPlay && (pendingPlayerExists || selectedPlayerExists),
  };
}
