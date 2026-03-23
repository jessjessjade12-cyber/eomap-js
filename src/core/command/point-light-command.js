import { Command } from "./command";

// base class - defines the contract:
// basically - every command must have an execute and an undo
// enforces the shape
export class PlaceLightCommand extends Command {
  constructor(pointLights, x, y, radius, intensity, colour) {
    super();
    this.pointLights = pointLights;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.intensity = intensity;
    this.colour = colour;
    this.id = null;
  }

  execute() {
    this.id = this.pointLights.add(
      this.x,
      this.y,
      this.radius,
      this.intensity,
      this.colour,
    );
  }

  undo() {
    this.pointLights.remove(this.id);
  }
}
