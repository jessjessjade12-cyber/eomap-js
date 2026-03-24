import { DEFAULT_POINT_LIGHT_Z } from "../../data/eo-lighting";

export const LIGHT_OVERLAY_TEXTURE_PREFIX = "__EOMAP_LIGHT_OVERLAY";
export const LIGHT_RADIUS_PIXELS_PER_TILE = 32;
export const LIGHT_SOURCE_ISO_Y_RATIO = 0.5;
export const LIGHT_OVERLAY_SCOPE_LAYER = 10;
export const LIGHT_OVERLAY_OCCLUDER_PADDING = 96;
export const OCCLUSION_SHADOW_ALPHA = 0.55;
export const LIGHT_OVERLAY_INTENSITY_SCALE = 1.2;
export const DEFAULT_LIGHTING_OVERLAY_AMBIENT = Object.freeze({
  enabled: true,
  onlyWhileEditingLightingLayer: true,
  r: 24,
  g: 7,
  b: 3,
  alpha: 0.58,
});

export const GIZMO_RING_SIZE = 10;
export const GIZMO_ARROW_W = 8;
export const GIZMO_ARROW_H = 6;
export const GIZMO_STEM_W = 2;
export const GIZMO_STEM_DASH = 5;
export const GIZMO_STEM_GAP = 4;
export const GIZMO_PIN_SIZE = 4;

export const SOURCE_GLOW_SIZE = 128;
export const POINT_LIGHT_PREVIEW_GIZMO_TINT = 0xffd86a;

export const SOURCE_GLOW_TEXTURE_KEY = "__EOMAP_SOURCE_GLOW";
export const GIZMO_RING_TEXTURE_KEY = "__EOMAP_GIZMO_RING";
export const GIZMO_ARROW_UP_TEXTURE_KEY = "__EOMAP_GIZMO_ARROW_UP";
export const GIZMO_ARROW_DOWN_TEXTURE_KEY = "__EOMAP_GIZMO_ARROW_DOWN";

let nextLightOverlayTextureID = 1;

export function createNextLightOverlayTextureKey() {
  return `${LIGHT_OVERLAY_TEXTURE_PREFIX}_${nextLightOverlayTextureID++}`;
}

export function clamp01(value) {
  return Math.max(0.0, Math.min(1.0, Number(value) || 0));
}

function clampChannel(value, fallback) {
  let number = Number(value);
  if (!Number.isFinite(number)) {
    return fallback;
  }
  return Math.max(0, Math.min(255, Math.round(number)));
}

export function normalizeLightingOverlayAmbient(value) {
  let source =
    value && typeof value === "object"
      ? { ...DEFAULT_LIGHTING_OVERLAY_AMBIENT, ...value }
      : DEFAULT_LIGHTING_OVERLAY_AMBIENT;
  return {
    enabled: source.enabled !== false,
    onlyWhileEditingLightingLayer:
      source.onlyWhileEditingLightingLayer !== false,
    r: clampChannel(source.r, DEFAULT_LIGHTING_OVERLAY_AMBIENT.r),
    g: clampChannel(source.g, DEFAULT_LIGHTING_OVERLAY_AMBIENT.g),
    b: clampChannel(source.b, DEFAULT_LIGHTING_OVERLAY_AMBIENT.b),
    alpha: clamp01(source.alpha),
  };
}

export function getLightGroundRadius(radius, z = 0) {
  let r = Math.max(1.0, Number(radius) || 1.0);
  let screenZ = Math.abs(Number(z) || 0) * LIGHT_SOURCE_ISO_Y_RATIO;
  if (screenZ <= 0) {
    return r;
  }
  return Math.max(r * 0.15, Math.sqrt(Math.max(0, r * r - screenZ * screenZ)));
}

export function normalizePointLightZ(value, fallback = DEFAULT_POINT_LIGHT_Z) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

export function normalizePreviewLight(preview) {
  if (
    !preview ||
    !Number.isFinite(Number(preview.x)) ||
    !Number.isFinite(Number(preview.y))
  ) {
    return null;
  }

  return {
    x: Math.trunc(Number(preview.x)),
    y: Math.trunc(Number(preview.y)),
    z: Number.isFinite(Number(preview.z))
      ? Number(preview.z)
      : DEFAULT_POINT_LIGHT_Z,
    radius: Math.max(1, Number(preview.radius) || 5),
    intensity: clamp01(preview.intensity ?? 1.0),
    colour: Number.isFinite(Number(preview.colour))
      ? Math.trunc(Number(preview.colour)) & 0xffffff
      : POINT_LIGHT_PREVIEW_GIZMO_TINT,
  };
}

export function previewLightsEqual(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.x === b.x &&
    a.y === b.y &&
    a.z === b.z &&
    a.radius === b.radius &&
    a.intensity === b.intensity &&
    a.colour === b.colour
  );
}
