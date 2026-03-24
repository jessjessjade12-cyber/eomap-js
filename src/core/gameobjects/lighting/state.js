import {
  DEFAULT_LIGHTING_OVERLAY_AMBIENT,
  createNextLightOverlayTextureKey,
  LIGHT_OVERLAY_SCOPE_LAYER,
  normalizeLightingOverlayAmbient,
  normalizePreviewLight,
  previewLightsEqual,
} from "./shared";

export const LightingStateMixin = {
  setPointLightPreview(previewLight) {
    let normalized = normalizePreviewLight(previewLight);
    if (previewLightsEqual(this.pointLightPreview, normalized)) {
      return;
    }
    this.pointLightPreview = normalized;
    this.invalidateCachedFrame();
  },

  clearPointLightPreview() {
    this.setPointLightPreview(null);
  },

  getActivePointLights(includePreview = false) {
    let lights = [];
    if (this.emf?.pointLights?.lights instanceof Map) {
      for (let [, light] of this.emf.pointLights.lights) {
        lights.push({ ...light, sourceKind: "placed" });
      }
    }

    if (
      includePreview &&
      this.selectedLayer === LIGHT_OVERLAY_SCOPE_LAYER &&
      this.pointLightPreview
    ) {
      lights.push({ ...this.pointLightPreview, sourceKind: "preview" });
    }

    return lights;
  },

  getLightingOverlayAmbientSettings() {
    if (!this._lightingOverlayAmbientSettings) {
      this._lightingOverlayAmbientSettings = {
        ...DEFAULT_LIGHTING_OVERLAY_AMBIENT,
      };
    }
    return this._lightingOverlayAmbientSettings;
  },

  setLightingOverlayAmbientSettings(settings) {
    let normalized = normalizeLightingOverlayAmbient(settings);
    let current = this.getLightingOverlayAmbientSettings();
    if (
      current.enabled === normalized.enabled &&
      current.onlyWhileEditingLightingLayer ===
        normalized.onlyWhileEditingLightingLayer &&
      current.r === normalized.r &&
      current.g === normalized.g &&
      current.b === normalized.b &&
      current.alpha === normalized.alpha
    ) {
      return;
    }
    this._lightingOverlayAmbientSettings = normalized;
    this.invalidateCachedFrame();
  },

  destroyLightingState() {
    if (this._lightOverlayTextureKey && this.scene?.textures) {
      this.scene.textures.remove(this._lightOverlayTextureKey);
    }
    this._lightOverlayTextureKey = null;
    this._lightOverlayWidth = 0;
    this._lightOverlayHeight = 0;
    this.pointLightPreview = null;
    this._lightingOverlayAmbientSettings = null;
  },

  getLightOverlayFrame(width, height) {
    if (!this.scene?.textures) {
      return null;
    }

    let w = Math.max(1, Math.ceil(width));
    let h = Math.max(1, Math.ceil(height));

    if (!this._lightOverlayTextureKey) {
      this._lightOverlayTextureKey = createNextLightOverlayTextureKey();
    }

    if (
      !this.scene.textures.exists(this._lightOverlayTextureKey) ||
      this._lightOverlayWidth !== w ||
      this._lightOverlayHeight !== h
    ) {
      if (this.scene.textures.exists(this._lightOverlayTextureKey)) {
        this.scene.textures.remove(this._lightOverlayTextureKey);
      }
      this.scene.textures.createCanvas(this._lightOverlayTextureKey, w, h);
      this._lightOverlayWidth = w;
      this._lightOverlayHeight = h;
    }

    return this.scene.textures.getFrame(this._lightOverlayTextureKey);
  },
};
