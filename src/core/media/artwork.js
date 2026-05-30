export function queueItemArtworkCacheKey(item = null, accessors = {}) {
  const getQueueItemPlaybackId = accessors.getQueueItemPlaybackId || (() => "");
  const getQueueItemStableId = accessors.getQueueItemStableId || (() => "");
  const getQueueItemKey = accessors.getQueueItemKey || (() => "");
  const getQueueItemUri = accessors.getQueueItemUri || (() => "");
  return [
    getQueueItemPlaybackId(item),
    getQueueItemStableId(item),
    getQueueItemKey(item),
    getQueueItemUri(item),
    item?.media_item?.name,
    item?.media_item?.album?.name,
    item?.streamdetails?.stream_metadata?.image_url,
    item?.media_image,
    item?.media_image_url,
    item?.image,
    item?.image_url,
    item?.media_item?.image,
    item?.media_item?.image_url,
    item?.media_item?.album?.image,
    item?.media_item?.album?.image_url,
  ].map((value) => String(value || "").trim()).filter(Boolean).join("|");
}

export function queueArtworkPrefetchIndexes(items = [], options = {}) {
  const queueItems = Array.isArray(items) ? items.filter(Boolean) : [];
  if (!queueItems.length) return [];
  const currentIndex = Number(options.currentIndex);
  let centerIndex = Number.isFinite(currentIndex)
    ? queueItems.findIndex((item) => Number(item?.sort_index) === currentIndex)
    : -1;
  const isCurrentItemFn = typeof options.isCurrentItemFn === "function" ? options.isCurrentItemFn : null;
  if (centerIndex < 0 && isCurrentItemFn) centerIndex = queueItems.findIndex((item) => isCurrentItemFn(item));
  if (centerIndex < 0) centerIndex = 0;
  const before = Math.max(0, Math.round(Number(options.before ?? 2)));
  const after = Math.max(0, Math.round(Number(options.after ?? 14)));
  const visibleStartIndex = Math.max(0, Math.round(Number(options.visibleStartIndex || 0)));
  const visibleCount = Math.max(0, Math.round(Number(options.visibleCount || 0)));
  const indexes = [];
  const seenIndexes = new Set();
  const addIndex = (index) => {
    if (index < 0 || index >= queueItems.length || seenIndexes.has(index)) return;
    seenIndexes.add(index);
    indexes.push(index);
  };
  addIndex(centerIndex);
  const maxDistance = Math.max(before, after);
  for (let distance = 1; distance <= maxDistance; distance += 1) {
    if (distance <= after) addIndex(centerIndex + distance);
    if (distance <= before) addIndex(centerIndex - distance);
  }
  for (let index = visibleStartIndex; index < Math.min(queueItems.length, visibleStartIndex + visibleCount); index += 1) {
    addIndex(index);
  }
  return indexes;
}

export function queueArtworkPrefetchUrls(items = [], options = {}, artworkUrlFn = () => "") {
  const queueItems = Array.isArray(items) ? items.filter(Boolean) : [];
  const indexes = queueArtworkPrefetchIndexes(queueItems, options);
  const centerIndex = indexes[0] ?? 0;
  const urls = [];
  indexes.forEach((index) => {
    const item = queueItems[index];
    const distance = Math.abs(index - centerIndex);
    const thumb = artworkUrlFn(item, 160);
    if (thumb) urls.push(thumb);
    if (distance <= 3) {
      const large = artworkUrlFn(item, 420);
      if (large) urls.push(large);
    }
  });
  return urls.filter((url, index, list) => url && list.indexOf(url) === index);
}
