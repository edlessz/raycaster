import type { Ray } from "../types";
import { isKeyPressed } from "./Input";

class Player {
	public x: number = 1;
	public y: number = 1;
	public direction: number = 0;
	public moveSpeed: number = 2;
	public rotationSpeed: number = 1.5;

	public rayCount: number = 3000;
	public fov: number = Math.PI / 2;
	public rays: Ray[] = [];
	public renderDistance = 20;

	constructor(x: number, y: number, direction: number) {
		this.x = x;
		this.y = y;
		this.direction = direction;
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
			this.x += Math.cos(this.direction) * deltaTime * this.moveSpeed;
			if (this.colliding(map))
				this.x -= Math.cos(this.direction) * deltaTime * this.moveSpeed;
			this.y += Math.sin(this.direction) * deltaTime * this.moveSpeed;
			if (this.colliding(map))
				this.y -= Math.sin(this.direction) * deltaTime * this.moveSpeed;
		}
		if (isKeyPressed("ArrowDown")) {
			this.x -= Math.cos(this.direction) * deltaTime * this.moveSpeed;
			if (this.colliding(map))
				this.x += Math.cos(this.direction) * deltaTime * this.moveSpeed;
			this.y -= Math.sin(this.direction) * deltaTime * this.moveSpeed;
			if (this.colliding(map))
				this.y += Math.sin(this.direction) * deltaTime * this.moveSpeed;
		}
		if (isKeyPressed("ArrowLeft")) {
			this.direction -= deltaTime * this.rotationSpeed;
		}
		if (isKeyPressed("ArrowRight")) {
			this.direction += deltaTime * this.rotationSpeed;
		}

		this.rays = this.castRays(map);
	}

	public castRays(map: Map<string, number>): Ray[] {
		const rays: Ray[] = [];
		let angle = this.direction - this.fov / 2;
		const angleStep = this.fov / this.rayCount;
		for (let i = 0; i < this.rayCount; i++) {
			const scanner = { ...this };
			scanner.direction = angle;

			const rayDirX = Math.cos(scanner.direction);
			const rayDirY = Math.sin(scanner.direction);

			let mapX = Math.floor(scanner.x);
			let mapY = Math.floor(scanner.y);

			const deltaDistX = Math.abs(1 / rayDirX);
			const deltaDistY = Math.abs(1 / rayDirY);

			let stepX: number;
			let stepY: number;
			let sideDistX: number;
			let sideDistY: number;
			if (rayDirX < 0) {
				stepX = -1;
				sideDistX = (scanner.x - mapX) * deltaDistX;
			} else {
				stepX = 1;
				sideDistX = (mapX + 1.0 - scanner.x) * deltaDistX;
			}
			if (rayDirY < 0) {
				stepY = -1;
				sideDistY = (scanner.y - mapY) * deltaDistY;
			} else {
				stepY = 1;
				sideDistY = (mapY + 1.0 - scanner.y) * deltaDistY;
			}

			let hit = false;
			let side: 0 | 1 = 0; // 0 for X, 1 for Y
			let steps = 0;
			while (!hit) {
				if (sideDistX < sideDistY) {
					sideDistX += deltaDistX;
					mapX += stepX;
					side = 0;
				} else {
					sideDistY += deltaDistY;
					mapY += stepY;
					side = 1;
				}
				if (this.tileAt(mapX, mapY, map)) hit = true;
				steps++;
				if (steps > this.renderDistance) break; // Prevent infinite loop
			}

			let perpWallDist = 0;
			if (side === 0) {
				perpWallDist = (mapX - scanner.x + (1 - stepX) / 2) / rayDirX;
			} else {
				perpWallDist = (mapY - scanner.y + (1 - stepY) / 2) / rayDirY;
			}

			rays.push({
				angle,
				distance: perpWallDist,
				correctedDistance: perpWallDist * Math.cos(angle - this.direction), // Fix fish-eye effect
				face:
					side === 0
						? stepX === 1
							? "east"
							: "west"
						: stepY === 1
							? "south"
							: "north",
				percentage:
					side === 0
						? (scanner.y + perpWallDist * rayDirY) % 1
						: (scanner.x + perpWallDist * rayDirX) % 1,
				material: this.tileAt(mapX, mapY, map) ?? 0,
			});
			angle += angleStep;
		}
		return rays;
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
			this.x + Math.cos(this.direction),
			this.y + Math.sin(this.direction),
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
		g.rotate(this.direction);
		g.fillRect(-size / 2, -size / 2, size, size);
		g.restore();
	}
}

export default Player;
