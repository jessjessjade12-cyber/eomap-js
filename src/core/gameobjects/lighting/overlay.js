import {
  clamp01,
  getLightGroundRadius,
  LIGHT_OVERLAY_OCCLUDER_PADDING,
  LIGHT_OVERLAY_SCOPE_LAYER,
  LIGHT_RADIUS_PIXELS_PER_TILE,
  OCCLUSION_SHADOW_ALPHA,
  normalizePointLightZ,
} from "./shared";

export const LightingOverlayMixin = {
  collectOcclusionCasters(worldLeft, worldTop, worldRight, worldBottom) {
    let casters = [];
    let paddedLeft = worldLeft - LIGHT_OVERLAY_OCCLUDER_PADDING;
    let paddedTop = worldTop - LIGHT_OVERLAY_OCCLUDER_PADDING;
    let paddedRight = worldRight + LIGHT_OVERLAY_OCCLUDER_PADDING;
    let paddedBottom = worldBottom + LIGHT_OVERLAY_OCCLUDER_PADDING;

    for (let tileGraphic of this.renderList) {
      if (!this.isOcclusionCasterLayer(tileGraphic.layer)) {
        continue;
      }

      let width = Math.max(1, tileGraphic.width || 1);
      let height = Math.max(1, tileGraphic.height || 1);
      let left = tileGraphic.x;
      let top = tileGraphic.y;
      let right = left + width;
      let bottom = top + height;

      if (
        right < paddedLeft ||
        left > paddedRight ||
        bottom < paddedTop ||
        top > paddedBottom
      ) {
        continue;
      }

      // Anchor near the object's feet for more stable shadows on isometric sprites.
      let centerX = (left + right) * 0.5;
      let centerY = bottom - Math.min(12, height * 0.25);
      let occluderSize = Math.max(
        10,
        Math.min(24, Math.min(width, height) * 0.35),
      );

      let casterTile = this.getTilePosFromWorldPos({ x: centerX, y: centerY });
      casters.push({
        x: centerX,
        y: centerY,
        size: occluderSize,
        tileX: casterTile.x,
        tileY: casterTile.y,
      });
    }

    return casters;
  },

  drawPointLightOverlay(
    renderTexture,
    drawOffsetX,
    drawOffsetY,
    worldLeft,
    worldTop,
    drawWidth,
    drawHeight,
  ) {
    if (this.getActivePointLights(true).length === 0) {
      return;
    }

    let frame = this.getLightOverlayFrame(drawWidth, drawHeight);
    if (!frame) {
      return;
    }

    let texture = this.scene.textures.get(this._lightOverlayTextureKey);
    let ctx = texture?.context;
    if (!ctx) {
      return;
    }

    let width = this._lightOverlayWidth;
    let height = this._lightOverlayHeight;
    let worldRight = worldLeft + width;
    let worldBottom = worldTop + height;
    let ambient = this.getLightingOverlayAmbientSettings();
    let ambientActive =
      ambient.enabled &&
      (!ambient.onlyWhileEditingLightingLayer ||
        this.selectedLayer === LIGHT_OVERLAY_SCOPE_LAYER);

    if (!ambientActive || ambient.alpha <= 0) {
      return;
    }

    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = `rgba(${ambient.r}, ${ambient.g}, ${ambient.b}, ${ambient.alpha})`;
    ctx.fillRect(0, 0, width, height);

    let casters = this.collectOcclusionCasters(
      worldLeft,
      worldTop,
      worldRight,
      worldBottom,
    );

    for (let light of this.getActivePointLights(true)) {
      let intensity = clamp01(light?.intensity);
      if (intensity <= 0.01) {
        continue;
      }

      let radiusPx =
        Math.max(1.0, Number(light?.radius) || 1.0) *
        LIGHT_RADIUS_PIXELS_PER_TILE;
      let z = normalizePointLightZ(light?.z);
      let groundRadiusPx = getLightGroundRadius(radiusPx, z);
      let lightBaseWorldX = light.x * 32 - light.y * 32 + 32;
      let lightBaseWorldY = light.x * 16 + light.y * 16 + 16;
      let lightTileX = Math.round(Number(light.x) || 0);
      let lightTileY = Math.round(Number(light.y) || 0);
      let groundCanvasX = lightBaseWorldX - worldLeft;
      let groundCanvasY = lightBaseWorldY - worldTop;

      ctx.globalCompositeOperation = "destination-out";
      let gradient = ctx.createRadialGradient(
        groundCanvasX,
        groundCanvasY,
        0,
        groundCanvasX,
        groundCanvasY,
        groundRadiusPx,
      );
      gradient.addColorStop(0.0, `rgba(0, 0, 0, ${clamp01(intensity * 0.95)})`);
      gradient.addColorStop(0.5, `rgba(0, 0, 0, ${clamp01(intensity * 0.55)})`);
      gradient.addColorStop(1.0, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(groundCanvasX, groundCanvasY, groundRadiusPx, 0, Math.PI * 2);
      ctx.fill();

      // Occlusion pass (walls + objects only). Additional occluders are deferred.
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = `rgba(0, 0, 0, ${clamp01(intensity * OCCLUSION_SHADOW_ALPHA)})`;
      for (let caster of casters) {
        if (caster.tileX === lightTileX && caster.tileY === lightTileY) {
          continue;
        }
        // Shadow direction is derived from the lamp base tile, not raised source screen position.
        let dx = caster.x - lightBaseWorldX;
        let dy = caster.y - lightBaseWorldY;
        let distance = Math.hypot(dx, dy);
        if (distance <= 1 || distance >= groundRadiusPx) {
          continue;
        }

        let shadowLength = Math.max(12, (groundRadiusPx - distance) * 0.85);
        let dirX = dx / distance;
        let dirY = dy / distance;
        let perpX = -dirY;
        let perpY = dirX;
        let half = caster.size * 0.5;

        let nearLeftX = caster.x + perpX * half - worldLeft;
        let nearLeftY = caster.y + perpY * half - worldTop;
        let nearRightX = caster.x - perpX * half - worldLeft;
        let nearRightY = caster.y - perpY * half - worldTop;
        let farRightX = nearRightX + dirX * shadowLength;
        let farRightY = nearRightY + dirY * shadowLength;
        let farLeftX = nearLeftX + dirX * shadowLength;
        let farLeftY = nearLeftY + dirY * shadowLength;

        ctx.beginPath();
        ctx.moveTo(nearLeftX, nearLeftY);
        ctx.lineTo(nearRightX, nearRightY);
        ctx.lineTo(farRightX, farRightY);
        ctx.lineTo(farLeftX, farLeftY);
        ctx.closePath();
        ctx.fill();
      }
    }

    texture.refresh();
    this.batchDrawFrame(
      renderTexture,
      frame,
      worldLeft - drawOffsetX,
      worldTop - drawOffsetY,
      1.0,
    );
  },
};
