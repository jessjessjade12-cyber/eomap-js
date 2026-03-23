export const DEFAULT_POINT_LIGHT_RADIUS = 5;
export const DEFAULT_POINT_LIGHT_INTENSITY = 1.0;
export const DEFAULT_POINT_LIGHT_COLOUR = 0xffffff;

// this defines the shape of a single light
export class PointLight {
  constructor(x, y, radius, intensity, colour) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.intensity = intensity;
    this.colour = colour;
  }
}

export class PointLightCollection {
  // using a map instead of an array here
  // because you can look up, add and remove a light
  // by id in constant time w/o scanning through a list
  constructor() {
    this.lights = new Map();
    this.nextID = 1;
  }

  add(x, y, radius, intensity, colour) {
    const id = this.nextID++;
    this.lights.set(id, new PointLight(x, y, radius, intensity, colour));
    return id;
  }

  remove(id) {
    this.lights.delete(id);
  }

  get(id) {
    return this.lights.get(id);
  }
}
