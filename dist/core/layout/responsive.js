const TABLET_BREAKPOINT = 980;

function normalizeLayoutMode(value) {
  const normalized = String(value || "auto").trim().toLowerCase();
  return normalized === "mobile" || normalized === "tablet" ? normalized : "auto";
}

export function resolveLayoutMode(layoutMode, {
  rectWidth = 0,
  hostWidth = 0,
  viewportWidth = 0,
} = {}, tabletBreakpoint = TABLET_BREAKPOINT) {
  const normalized = normalizeLayoutMode(layoutMode);
  if (normalized === "mobile" || normalized === "tablet") return normalized;
  const cardWidth = Math.max(
    Number(rectWidth || 0),
    Number(hostWidth || 0),
  );
  const width = cardWidth > 0 ? cardWidth : Number(viewportWidth || 0);
  return width >= tabletBreakpoint ? "tablet" : "mobile";
}

export function defaultMobileMediaLayout(layoutMode) {
  return layoutMode === "tablet" ? "grid" : "list";
}

export function panelViewportFillEnabled({
  viewportHeight = 0,
  hostTop = 0,
  parentHeights = [],
} = {}) {
  const viewport = Number(viewportHeight || 0);
  const top = Number(hostTop || 0);
  if (!Number.isFinite(viewport) || viewport <= 240) return false;
  if (!Number.isFinite(top) || Math.abs(top) > 8) return false;
  const heights = (Array.isArray(parentHeights) ? parentHeights : [parentHeights])
    .map((value) => Number(value || 0))
    .filter((value) => Number.isFinite(value) && value > 240);
  return heights.some((height) => Math.abs(height - viewport) <= 8);
}

export function autoCompactRecommended({
  width = 0,
  height = 0,
} = {}) {
  const measuredWidth = Number(width || 0);
  const measuredHeight = Number(height || 0);
  if (!Number.isFinite(measuredWidth) || measuredWidth <= 0) return false;
  if (measuredWidth <= 340) return true;
  if (!Number.isFinite(measuredHeight) || measuredHeight <= 0) return false;
  if (measuredWidth <= 560 && measuredHeight < 620) return true;
  return measuredWidth <= 660 && measuredHeight < 520;
}

export function resolveLayoutProfile({
  width = 0,
  height = 0,
  layoutMode = "mobile",
} = {}) {
  const measuredWidth = Math.max(0, Number(width || 0));
  const measuredHeight = Math.max(0, Number(height || 0));
  const size = measuredWidth < 380
    ? "xs"
    : measuredWidth < 520
      ? "sm"
      : measuredWidth < 760
        ? "md"
        : measuredWidth < 1100
          ? "lg"
          : "xl";
  const heightSize = measuredHeight > 0 && measuredHeight < 620
    ? "short"
    : measuredHeight >= 900
      ? "tall"
      : "normal";
  const aspect = measuredHeight > 0 && measuredWidth / measuredHeight >= 1.08
    ? "wide"
    : measuredWidth > 0 && measuredHeight / measuredWidth >= 1.18
      ? "portrait"
      : "balanced";
  const tight = measuredHeight > 0 && measuredHeight < 560;
  const compact = size === "xs" || heightSize === "short";
  const roomy = size === "xl" && heightSize === "tall";
  return {
    width: measuredWidth,
    height: measuredHeight,
    layoutMode,
    size,
    heightSize,
    aspect,
    tight,
    compact,
    roomy,
    classes: [
      `size-${size}`,
      `height-${heightSize}`,
      `aspect-${aspect}`,
      tight ? "height-tight" : "",
      compact ? "profile-compact" : "profile-comfort",
      roomy ? "profile-roomy" : "",
    ].filter(Boolean),
  };
}

export function tabletAutoFitEnabled(layoutMode) {
  return layoutMode === "tablet";
}

export function tabletAutoFitDense(layoutMode, {
  showNightRow = false,
  showUpNext = false,
} = {}) {
  return tabletAutoFitEnabled(layoutMode) && !!(showNightRow || showUpNext);
}

export function resolveTabletAutoFitFlags(layoutMode, {
  showNightRow = false,
  showUpNext = false,
} = {}) {
  const autoFit = tabletAutoFitEnabled(layoutMode);
  return {
    autoFit,
    showNight: autoFit && !!showNightRow,
    showUpNext: autoFit && !!showUpNext,
    dense: autoFit && !!(showNightRow || showUpNext),
  };
}

export function tabletStabilityModeEnabled({
  layoutMode = "mobile",
  userAgent = "",
  width = 0,
  touchPoints = 0,
} = {}, tabletBreakpoint = TABLET_BREAKPOINT) {
  return layoutMode === "tablet"
    && /Android/i.test(String(userAgent || ""))
    && Number(width || 0) >= tabletBreakpoint
    && Number(touchPoints || 0) > 0;
}

export function detectKeyboardLikeResize({
  editingText = false,
  widthDelta = 0,
  heightDelta = 0,
} = {}) {
  return !!editingText && (
    (Number(widthDelta || 0) < 120 && Number(heightDelta || 0) > 18)
    || (Number(widthDelta || 0) < 8 && Number(heightDelta || 0) > 0)
  );
}

export function resolveResizeStrategy({
  previousWidth = 0,
  currentWidth = 0,
  previousHeight = 0,
  currentHeight = 0,
  editingText = false,
  tabletStabilityMode = false,
} = {}, tabletBreakpoint = TABLET_BREAKPOINT) {
  const widthDelta = Math.abs(Number(currentWidth || 0) - Number(previousWidth || 0));
  const heightDelta = Math.abs(Number(currentHeight || 0) - Number(previousHeight || 0));
  const keyboardLikeResize = detectKeyboardLikeResize({
    editingText,
    widthDelta,
    heightDelta,
  });
  const previousTablet = Number(previousWidth || 0) >= tabletBreakpoint;
  const currentTablet = Number(currentWidth || 0) >= tabletBreakpoint;
  const widthThreshold = tabletStabilityMode ? 140 : 48;
  const heightThreshold = tabletStabilityMode ? 180 : 48;
  const softSync = !keyboardLikeResize
    && previousTablet === currentTablet
    && widthDelta < widthThreshold
    && heightDelta < heightThreshold;

  return {
    widthDelta,
    heightDelta,
    keyboardLikeResize,
    previousTablet,
    currentTablet,
    widthThreshold,
    heightThreshold,
    softSync,
  };
}
