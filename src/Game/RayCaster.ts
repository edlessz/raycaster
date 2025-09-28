import type { Texture } from "./TextureManager";

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
	private fog: number = 10;

	public castRays(
		position: { x: number; y: number },
		direction: number,
		fov: number,
		rayCount: number,
		renderDistance: number,
		map: Map<string, number>,
	): Ray[] {
		return Array.from({ length: rayCount }, (_, i) => {
			const angle = direction - fov / 2 + i * (fov / rayCount);

			const rayDirX = Math.cos(angle);
			const rayDirY = Math.sin(angle);

			let mapX = Math.floor(position.x);
			let mapY = Math.floor(position.y);

			const deltaDistX = Math.abs(1 / rayDirX);
			const deltaDistY = Math.abs(1 / rayDirY);

			const stepX: number = rayDirX < 0 ? -1 : 1;
			let sideDistX: number =
				(rayDirX < 0 ? position.x - mapX : mapX + 1 - position.x) * deltaDistX;
			const stepY: number = rayDirY < 0 ? -1 : 1;
			let sideDistY: number =
				(rayDirY < 0 ? position.y - mapY : mapY + 1 - position.y) * deltaDistY;

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

				if (this.tileAt(mapX, mapY, map)) hit = true;
				steps++;
				if (steps > renderDistance) break;
			}

			const perpWallDist =
				side === "x"
					? (mapX - position.x + (1 - stepX) / 2) / rayDirX
					: (mapY - position.y + (1 - stepY) / 2) / rayDirY;

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
						? (position.y + perpWallDist * rayDirY) % 1
						: (position.x + perpWallDist * rayDirX) % 1,
				material: this.tileAt(mapX, mapY, map) ?? 0,
			};
		});
	}

	public render(
		g: CanvasRenderingContext2D,
		rays: Ray[],
		textureMap: TextureMap,
	): void {
		const { width, height } = g.canvas;
		const fov = Math.PI / 2;
		const projDist = width / 2 / Math.tan(fov / 2);

		g.resetTransform();
		g.globalAlpha = 1;
		g.imageSmoothingEnabled = false;

		// Draw Floor and Ceiling
		g.fillStyle = g.createLinearGradient(0, 0, 0, height);
		g.fillStyle.addColorStop(0, "#000");
		g.fillStyle.addColorStop(1, "#fff");
		g.fillRect(0, 0, width, height / 2);
		g.fillRect(0, height / 2 - 1, width, height / 2);

		g.lineWidth = Math.round(width / rays.length);

		rays.forEach((ray, i) => {
			if (!ray.face) return;

			const texture = textureMap.get(ray.material);
			if (!texture) return;
			const textureX = Math.floor(ray.percentage * texture.width);

			const wallHeight = projDist / (ray.correctedDistance ?? 0.0001);
			const x = Math.floor(i * g.lineWidth);

			const yTop = height / 2 - wallHeight / 2;

			g.globalAlpha = Math.min(1, this.fog / (ray.distance * ray.distance));
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
		});
	}

	private tileAt(
		x: number,
		y: number,
		map: Map<string, number>,
	): number | undefined {
		return map.get(`${Math.floor(x)},${Math.floor(y)}`);
	}
}
