import Entity from "../Entity";
import { isKeyPressed } from "../Input";
import type World from "../World";

class Player extends Entity {
	public velocityX: number = 0;
	public velocityZ: number = 0;
	public moveSpeed: number = 0.45;

	public velocityRotation: number = 0;
	public rotationSpeed: number = 0.85;

	public worldRef: World | null = null;

	constructor() {
		super(1.5, 0, 9.5, 0.5, 0.5);
	}

	public setup(): void {
		this.worldRef = this.game?.world ?? null;
	}

	public colliding(): boolean {
		return !!this.worldRef?.tileAt(this.x, this.z);
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

		this.velocityX *= 0.85;
		this.velocityZ *= 0.85;
		this.x += this.velocityX;
		while (this.colliding()) {
			this.x -= this.velocityX;
			this.velocityX = 0;
		}
		this.z += this.velocityZ;
		while (this.colliding()) {
			this.z -= this.velocityZ;
			this.velocityZ = 0;
		}
		this.velocityRotation *= 0.7;
		this.rotation += this.velocityRotation;
	}
}

export default Player;
