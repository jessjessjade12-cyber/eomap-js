import { LightingGizmoMixin } from "./gizmo";
import { LightingOverlayMixin } from "./overlay";
import { LightingStateMixin } from "./state";

export const LightingMixin = {
  ...LightingStateMixin,
  ...LightingOverlayMixin,
  ...LightingGizmoMixin,
};
