import Phaser from "phaser";
import { DEFAULT_POINT_LIGHT_COLOUR } from "../../data/eo-lighting";
import {
  clamp01,
  getLightGroundRadius,
  GIZMO_ARROW_DOWN_TEXTURE_KEY,
  GIZMO_ARROW_H,
  GIZMO_ARROW_UP_TEXTURE_KEY,
  GIZMO_ARROW_W,
  GIZMO_PIN_SIZE,
  GIZMO_RING_SIZE,
  GIZMO_RING_TEXTURE_KEY,
  GIZMO_STEM_DASH,
  GIZMO_STEM_GAP,
  GIZMO_STEM_W,
  LIGHT_OVERLAY_INTENSITY_SCALE,
  LIGHT_RADIUS_PIXELS_PER_TILE,
  LIGHT_SOURCE_ISO_Y_RATIO,
  normalizePointLightZ,
  POINT_LIGHT_PREVIEW_GIZMO_TINT,
  SOURCE_GLOW_SIZE,
  SOURCE_GLOW_TEXTURE_KEY,
} from "./shared";

export const LightingGizmoMixin = {
  drawPointLightSourceGlows(renderTexture, drawOffsetX, drawOffsetY) {
    let sourceGlowFrame = this.getSourceGlowFrame();
    let whiteFrame = this.scene?.textures?.getFrame("__WHITE") ?? null;

    for (let light of this.getActivePointLights(true)) {
      let metrics = this.getLightVisualMetrics(light, drawOffsetX, drawOffsetY);
      if (!metrics || !sourceGlowFrame) {
        continue;
      }

      let groundDiameterX = metrics.groundRadius * 2;
      let groundDiameterY = groundDiameterX * LIGHT_SOURCE_ISO_Y_RATIO;
      this.drawAdditiveFrame(
        renderTexture,
        sourceGlowFrame,
        metrics.groundX - metrics.groundRadius,
        metrics.groundY - groundDiameterY * 0.5,
        clamp01(metrics.alpha * 0.7),
        metrics.colour,
        groundDiameterX,
        groundDiameterY,
      );

      if (Math.abs(metrics.z) <= 0.5) {
        continue;
      }

      this.drawAdditiveFrame(
        renderTexture,
        sourceGlowFrame,
        metrics.sourceX - metrics.glowRadius,
        metrics.sourceY - metrics.glowRadius,
        clamp01(metrics.alpha * 0.95),
        metrics.colour,
        metrics.glowRadius * 2,
        metrics.glowRadius * 2,
      );

      if (whiteFrame && light.sourceKind === "preview") {
        this.drawPointLightGizmos(renderTexture, metrics, whiteFrame);
      }
    }
  },

  getOrCreateGraphicsFrame(key, width, height, drawFn) {
    if (!this.scene?.textures) {
      return null;
    }

    if (!this.scene.textures.exists(key)) {
      let gfx = this.scene.make.graphics({ x: 0, y: 0, add: false });
      try {
        drawFn(gfx, width, height);
        gfx.generateTexture(key, width, height);
      } finally {
        gfx.destroy();
      }
    }

    return this.scene.textures.getFrame(key);
  },

  drawAdditiveFrame(
    renderTexture,
    frame,
    x,
    y,
    alpha,
    tint,
    drawWidth = null,
    drawHeight = null,
  ) {
    if (!frame) {
      return;
    }
    let frameW = Math.max(1, frame.cutWidth || 1);
    let frameH = Math.max(1, frame.cutHeight || 1);
    let scaleX = drawWidth == null ? 1.0 : drawWidth / frameW;
    let scaleY = drawHeight == null ? 1.0 : drawHeight / frameH;
    this.batchDrawFrame(
      renderTexture,
      frame,
      x,
      y,
      alpha,
      tint,
      Phaser.BlendModes.ADD,
      scaleX,
      scaleY,
    );
  },

  getSourceGlowFrame() {
    if (!this.scene?.textures) {
      return null;
    }

    if (!this.scene.textures.exists(SOURCE_GLOW_TEXTURE_KEY)) {
      let texture = this.scene.textures.createCanvas(
        SOURCE_GLOW_TEXTURE_KEY,
        SOURCE_GLOW_SIZE,
        SOURCE_GLOW_SIZE,
      );
      let ctx = texture.context;
      let cx = SOURCE_GLOW_SIZE * 0.5;
      let cy = SOURCE_GLOW_SIZE * 0.5;
      let gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, cx);
      ctx.clearRect(0, 0, SOURCE_GLOW_SIZE, SOURCE_GLOW_SIZE);
      gradient.addColorStop(0.0, "rgba(255,255,255,0.65)");
      gradient.addColorStop(0.2, "rgba(255,255,255,0.45)");
      gradient.addColorStop(0.45, "rgba(255,255,255,0.22)");
      gradient.addColorStop(0.7, "rgba(255,255,255,0.07)");
      gradient.addColorStop(1.0, "rgba(255,255,255,0.0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, SOURCE_GLOW_SIZE, SOURCE_GLOW_SIZE);
      texture.refresh();
    }

    return this.scene.textures.getFrame(SOURCE_GLOW_TEXTURE_KEY);
  },

  getGizmoRingFrame() {
    return this.getOrCreateGraphicsFrame(
      GIZMO_RING_TEXTURE_KEY,
      16,
      16,
      (gfx, width, height) => {
        gfx.clear();
        gfx.lineStyle(2.5, 0xffffff, 1.0);
        gfx.strokeCircle(width * 0.5, height * 0.5, 6);
        gfx.fillStyle(0xffffff, 1.0);
        gfx.fillCircle(width * 0.5, height * 0.5, 2);
      },
    );
  },

  getGizmoArrowFrame(up) {
    let key = up ? GIZMO_ARROW_UP_TEXTURE_KEY : GIZMO_ARROW_DOWN_TEXTURE_KEY;
    return this.getOrCreateGraphicsFrame(
      key,
      GIZMO_ARROW_W,
      GIZMO_ARROW_H,
      (gfx) => {
        gfx.clear();
        gfx.fillStyle(0xffffff, 1.0);
        if (up) {
          gfx.fillTriangle(
            GIZMO_ARROW_W / 2,
            0,
            0,
            GIZMO_ARROW_H,
            GIZMO_ARROW_W,
            GIZMO_ARROW_H,
          );
        } else {
          gfx.fillTriangle(
            GIZMO_ARROW_W / 2,
            GIZMO_ARROW_H,
            0,
            0,
            GIZMO_ARROW_W,
            0,
          );
        }
      },
    );
  },

  getLightVisualMetrics(light, drawOffsetX, drawOffsetY) {
    let intensity = clamp01(light?.intensity);
    if (intensity <= 0.01) {
      return null;
    }

    let z = normalizePointLightZ(light?.z);
    let radius = Math.max(1.0, Number(light?.radius) || 1.0);
    let radiusPx = radius * LIGHT_RADIUS_PIXELS_PER_TILE;
    let groundRadius = getLightGroundRadius(radiusPx, z);
    let glowRadius = Math.max(1, Math.min(24, groundRadius * 0.14));

    let groundX = light.x * 32 - light.y * 32 + 32 - drawOffsetX;
    let groundY = light.x * 16 + light.y * 16 + 16 - drawOffsetY;
    let sourceX = groundX;
    let sourceY = groundY - z * LIGHT_SOURCE_ISO_Y_RATIO;
    let colour = Number.isFinite(Number(light?.colour))
      ? Math.trunc(Number(light.colour)) & 0xffffff
      : DEFAULT_POINT_LIGHT_COLOUR;

    return {
      groundX,
      groundY,
      sourceX,
      sourceY,
      colour,
      z,
      alpha: clamp01(intensity * LIGHT_OVERLAY_INTENSITY_SCALE),
      groundRadius,
      glowRadius,
    };
  },

  drawPointLightGizmos(renderTexture, metrics, whiteFrame = null) {
    if (!whiteFrame) {
      whiteFrame = this.scene?.textures?.getFrame("__WHITE") ?? null;
      if (!whiteFrame) {
        return;
      }
    }

    let goingUp = metrics.z > 0;
    let tint = metrics.colour;
    let gizmoAlpha = clamp01(metrics.alpha * 0.9);

    let stemTop = Math.min(metrics.sourceY, metrics.groundY);
    let stemHeight = Math.abs(metrics.groundY - metrics.sourceY);
    let stemX = metrics.sourceX - GIZMO_STEM_W * 0.5;
    let dashY = 0;
    while (dashY < stemHeight) {
      let dashLen = Math.min(GIZMO_STEM_DASH, stemHeight - dashY);
      this.drawAdditiveFrame(
        renderTexture,
        whiteFrame,
        stemX,
        stemTop + dashY,
        gizmoAlpha * 0.65,
        tint,
        GIZMO_STEM_W,
        dashLen,
      );
      dashY += GIZMO_STEM_DASH + GIZMO_STEM_GAP;
    }

    let arrowFrame = this.getGizmoArrowFrame(goingUp);
    this.drawAdditiveFrame(
      renderTexture,
      arrowFrame,
      metrics.sourceX - GIZMO_ARROW_W * 0.5,
      goingUp ? metrics.sourceY - GIZMO_ARROW_H : metrics.sourceY,
      gizmoAlpha,
      tint,
      GIZMO_ARROW_W,
      GIZMO_ARROW_H,
    );

    let ringFrame = this.getGizmoRingFrame();
    this.drawAdditiveFrame(
      renderTexture,
      ringFrame,
      metrics.sourceX - GIZMO_RING_SIZE * 0.5,
      metrics.sourceY - GIZMO_RING_SIZE * 0.5,
      gizmoAlpha,
      tint,
      GIZMO_RING_SIZE,
      GIZMO_RING_SIZE,
    );

    this.drawAdditiveFrame(
      renderTexture,
      whiteFrame,
      metrics.groundX - GIZMO_PIN_SIZE * 0.5,
      metrics.groundY - GIZMO_PIN_SIZE * 0.5,
      gizmoAlpha * 0.7,
      tint,
      GIZMO_PIN_SIZE,
      GIZMO_PIN_SIZE,
    );
  },
};
