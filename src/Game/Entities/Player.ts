import Entity from "../Entity";
import { isKeyPressed } from "../Input";

class Player extends Entity {
	public velocityX: number = 0;
	public velocityZ: number = 0;
	public moveSpeed: number = 0.45;

	public velocityRotation: number = 0;
	public rotationSpeed: number = 0.85;

	public mapRef: Map<string, number> | null = null;

	constructor() {
		super(1.5, 0, 9.5, 0.5, 0.5);
	}

	public tileAt(
		x: number,
		y: number,
		map: Map<string, number>,
	): number | undefined {
		return map.get(`${Math.floor(x)},${Math.floor(y)}`);
	}
	public colliding(map: Map<string, number>): boolean {
		return !!this.tileAt(this.x, this.z, map);
	}
	public update(deltaTime: number): void {
		if (isKeyPressed("w")) {
			this.velocityX += Math.cos(this.rotation) * deltaTime * this.moveSpeed;
			this.velocityZ += Math.sin(this.rotation) * deltaTime * this.moveSpeed;
		}
		if (isKeyPressed("s")) {
			this.velocityX -= Math.cos(this.rotation) * deltaTime * this.moveSpeed;
			this.velocityZ -= Math.sin(this.rotation) * deltaTime * this.moveSpeed;
		}
		if (isKeyPressed("a")) {
			this.velocityX += Math.sin(this.rotation) * deltaTime * this.moveSpeed;
			this.velocityZ -= Math.cos(this.rotation) * deltaTime * this.moveSpeed;
		}
		if (isKeyPressed("d")) {
			this.velocityX -= Math.sin(this.rotation) * deltaTime * this.moveSpeed;
			this.velocityZ += Math.cos(this.rotation) * deltaTime * this.moveSpeed;
		}

		const map = this.mapRef;

		this.velocityX *= 0.85;
		this.velocityZ *= 0.85;
		this.x += this.velocityX;
		while (map && this.colliding(map)) {
			this.x -= this.velocityX;
			this.velocityX = 0;
		}
		this.z += this.velocityZ;
		while (map && this.colliding(map)) {
			this.z -= this.velocityZ;
			this.velocityZ = 0;
		}
		this.velocityRotation *= 0.7;
		this.rotation += this.velocityRotation;
	}
}

export default Player;
