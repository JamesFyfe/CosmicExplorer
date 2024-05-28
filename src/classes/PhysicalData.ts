export default class PhysicalData {
  mass: number;
  radius: number;
  color: string;
  textureName: string;
  rotationPeriod: number; // in hours
  startingRotation: number; // in degrees
  axisTilt: number; // in degrees
  lightIntensity?: number;
  normalMapName?: string;

  constructor(
    mass: number,
    radius: number,
    color: string,
    textureName: string,
    rotationPeriod: number,
    startingRotation: number,
    axisTilt: number,
    lightIntensity?: number,
    normalMapName?: string,
  ) {
    this.mass = mass;
    this.radius = radius;
    this.color = color;
    this.textureName = textureName;
    this.rotationPeriod = rotationPeriod;
    this.startingRotation = startingRotation;
    this.axisTilt = axisTilt * Math.PI / 180;
    if(lightIntensity) {
      this.lightIntensity = lightIntensity;
    }
    if(normalMapName) {
      this.normalMapName = normalMapName;
    }
  }
}
