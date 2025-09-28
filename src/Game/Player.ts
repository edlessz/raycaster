import type { Ray } from "../types";
import { isKeyPressed } from "./Input";
import { RayCaster } from "./RayCaster";

class Player {
	public x: number = 1;
	public y: number = 1;
	public velocityX: number = 0;
	public velocityY: number = 0;
	public moveSpeed: number = 0.45;

	public rotation: number = 0;
	public velocityRotation: number = 0;
	public rotationSpeed: number = 1;

	public rayCount: number = 3000;
	public fov: number = Math.PI / 2;
	public rays: Ray[] = [];
	public renderDistance = 20;

	private rayCaster = new RayCaster();

	constructor(x: number, y: number, rotation: number) {
		this.x = x;
		this.y = y;
		this.rotation = rotation;
	}

	public tileAt(
		x: number,
		y: number,
		map: Map<string, number>,
	): number | undefined {
		return map.get(`${Math.floor(x)},${Math.floor(y)}`);
	}
	public colliding(map: Map<string, number>): boolean {
		return !!this.tileAt(this.x, this.y, map);
	}
	public update(deltaTime: number, map: Map<string, number>): void {
		if (isKeyPressed("ArrowUp")) {
			this.velocityX += Math.cos(this.rotation) * deltaTime * this.moveSpeed;
			this.velocityY += Math.sin(this.rotation) * deltaTime * this.moveSpeed;
		}
		if (isKeyPressed("ArrowDown")) {
			this.velocityX -= Math.cos(this.rotation) * deltaTime * this.moveSpeed;
			this.velocityY -= Math.sin(this.rotation) * deltaTime * this.moveSpeed;
		}
		if (isKeyPressed("ArrowLeft")) {
			this.velocityRotation -= deltaTime * this.rotationSpeed;
		}
		if (isKeyPressed("ArrowRight")) {
			this.velocityRotation += deltaTime * this.rotationSpeed;
		}

		this.rays = this.rayCaster.castRays(
			{ x: this.x, y: this.y },
			this.rotation,
			this.fov,
			this.rayCount,
			this.renderDistance,
			map,
		);

		this.velocityX *= 0.85;
		this.velocityY *= 0.85;
		this.x += this.velocityX;
		while (this.colliding(map)) {
			this.x -= this.velocityX;
			this.velocityX = 0;
		}
		this.y += this.velocityY;
		while (this.colliding(map)) {
			this.y -= this.velocityY;
			this.velocityY = 0;
		}
		this.velocityRotation *= 0.7;
		this.rotation += this.velocityRotation;
	}

	public render(g: CanvasRenderingContext2D): void {
		g.fillStyle = "red";
		const size = 0.25;

		const transform = g.getTransform();

		g.strokeStyle = "blue";
		g.lineWidth = 2 / transform.a;
		g.beginPath();
		g.moveTo(this.x, this.y);
		g.lineTo(
			this.x + Math.cos(this.rotation),
			this.y + Math.sin(this.rotation),
		);
		g.stroke();

		for (const ray of this.rays) {
			g.beginPath();
			g.moveTo(this.x, this.y);
			g.lineTo(
				this.x + Math.cos(ray.angle) * ray.distance,
				this.y + Math.sin(ray.angle) * ray.distance,
			);
			g.stroke();
		}

		g.save();
		g.translate(this.x, this.y);
		g.rotate(this.rotation);
		g.fillRect(-size / 2, -size / 2, size, size);
		g.restore();
	}
}

export default Player;
