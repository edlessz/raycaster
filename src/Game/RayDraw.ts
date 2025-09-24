import type { Ray, TextureMap } from "../types";

export function drawRays(
	g: CanvasRenderingContext2D,
	rays: Ray[],
	textureMap: TextureMap,
): void {
	const { width, height } = g.canvas;
	const fov = Math.PI / 2;
	const projDist = width / 2 / Math.tan(fov / 2);

	g.resetTransform();
	g.imageSmoothingEnabled = false;
	g.lineWidth = width / rays.length;

	rays.forEach((ray, index) => {
		if (!ray.face) return;

		const texture = textureMap.get(ray.material);
		if (!texture) return;
		const textureX = Math.floor(ray.percentage * texture.width);

		const wallHeight = projDist / (ray.correctedDistance ?? 0.0001);
		const x = index * g.lineWidth;

		const yTop = height / 2 - wallHeight / 2;

		g.globalAlpha = Math.max(0, 1 - ray.distance / 10);

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

	g.globalAlpha = 1;
}
