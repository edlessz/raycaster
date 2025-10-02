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
		if (isKeyPressed("ArrowUp")) {
			this.velocityX += Math.cos(this.rotation) * deltaTime * this.moveSpeed;
			this.velocityZ += Math.sin(this.rotation) * deltaTime * this.moveSpeed;
		}
		if (isKeyPressed("ArrowDown")) {
			this.velocityX -= Math.cos(this.rotation) * deltaTime * this.moveSpeed;
			this.velocityZ -= Math.sin(this.rotation) * deltaTime * this.moveSpeed;
		}
		if (isKeyPressed("ArrowLeft")) {
			this.velocityRotation -= deltaTime * this.rotationSpeed;
		}
		if (isKeyPressed("ArrowRight")) {
			this.velocityRotation += deltaTime * this.rotationSpeed;
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

	public render(
		g: CanvasRenderingContext2D,
		x: number,
		y: number,
		width: number,
		height: number,
	): void {
		g.fillStyle = "green";
		g.fillRect(x, y, width, height);
	}
}

export default Player;
