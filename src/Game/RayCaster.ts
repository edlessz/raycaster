import type { DrawTask } from "../types";
import type { Texture } from "./TextureManager";
import type World from "./World";

export type TextureMap = Map<number, Texture>;

export interface Ray {
	angle: number;
	distance: number;
	correctedDistance: number;
	face: "north" | "south" | "east" | "west" | null;
	percentage: number;
	material: number;
}

export class RayCaster {
	public textureMap: TextureMap = new Map();
	public fog: number = 10;

	constructor(fog: number = 10, textureMap?: TextureMap) {
		this.fog = fog;
		if (textureMap) this.textureMap = textureMap;
	}

	public castRays(
		position: { x: number; z: number },
		direction: number,
		fov: number,
		rayCount: number,
		renderDistance: number,
		worldRef: World,
	): Ray[] {
		return Array.from({ length: rayCount }, (_, i) => {
			const angle = direction - fov / 2 + i * (fov / rayCount);

			const rayDirX = Math.cos(angle);
			const rayDirY = Math.sin(angle);

			let mapX = Math.floor(position.x);
			let mapY = Math.floor(position.z);

			const deltaDistX = Math.abs(1 / rayDirX);
			const deltaDistY = Math.abs(1 / rayDirY);

			const stepX: number = rayDirX < 0 ? -1 : 1;
			let sideDistX: number =
				(rayDirX < 0 ? position.x - mapX : mapX + 1 - position.x) * deltaDistX;
			const stepY: number = rayDirY < 0 ? -1 : 1;
			let sideDistY: number =
				(rayDirY < 0 ? position.z - mapY : mapY + 1 - position.z) * deltaDistY;

			let hit = false;
			let side: "x" | "y" = "x";
			let steps = 0;

			while (!hit) {
				if (sideDistX < sideDistY) {
					sideDistX += deltaDistX;
					mapX += stepX;
					side = "x";
				} else {
					sideDistY += deltaDistY;
					mapY += stepY;
					side = "y";
				}

				if (worldRef.tileAt(mapX, mapY)) hit = true;
				steps++;
				if (steps > renderDistance) break;
			}

			const perpWallDist =
				side === "x"
					? (mapX - position.x + (1 - stepX) / 2) / rayDirX
					: (mapY - position.z + (1 - stepY) / 2) / rayDirY;

			return {
				angle,
				distance: perpWallDist,
				correctedDistance: perpWallDist * Math.cos(angle - direction), // Fix fish-eye effect
				face:
					side === "x"
						? stepX === 1
							? "east"
							: "west"
						: stepY === 1
							? "south"
							: "north",
				percentage:
					side === "x"
						? (position.z + perpWallDist * rayDirY) % 1
						: (position.x + perpWallDist * rayDirX) % 1,
				material: worldRef.tileAt(mapX, mapY) ?? 0,
			};
		});
	}

	public render(g: CanvasRenderingContext2D, rays: Ray[]): DrawTask[] {
		const { width, height } = g.canvas;
		const fov = Math.PI / 2;
		const projDist = width / 2 / Math.tan(fov / 2);

		g.globalAlpha = 1;
		g.imageSmoothingEnabled = false;

		// Draw Floor and Ceiling
		g.fillStyle = g.createLinearGradient(0, 0, 0, height);
		g.fillStyle.addColorStop(0, "#000");
		g.fillStyle.addColorStop(1, "#fff");
		g.fillRect(0, 0, width, height / 2);
		g.fillRect(0, height / 2 - 1, width, height / 2);

		g.lineWidth = Math.round(width / rays.length);

		return rays
			.map<DrawTask | null>((ray, i) => {
				if (!ray.face) return null;

				const texture = this.textureMap.get(ray.material);
				if (!texture) return null;
				const textureX = Math.floor(ray.percentage * texture.width);

				const wallHeight = projDist / (ray.correctedDistance ?? 0.0001);
				const x = Math.floor(i * g.lineWidth);

				const yTop = height / 2 - wallHeight / 2;

				return {
					zIndex: ray.distance,
					fn: (g: CanvasRenderingContext2D) => {
						g.resetTransform();
						g.globalAlpha = 1;
						g.drawImage(
							texture.img,
							textureX,
							0,
							1,
							texture.height,
							x,
							yTop,
							g.lineWidth,
							wallHeight,
						);
						g.globalAlpha = Math.min(
							1,
							this.fog / (ray.distance * ray.distance),
						);
					},
				};
			})
			.filter((task): task is DrawTask => task !== null);
	}
}
