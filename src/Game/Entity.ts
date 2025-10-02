import type { DrawTask } from "../types";
import type Camera from "./Camera";

class Entity {
	public x: number = 1;
	public y: number = 0;
	public z: number = 1;
	public rotation: number = 0;

	public width: number;
	public height: number;

	constructor(
		x: number,
		y: number,
		z: number,
		width?: number,
		height?: number,
	) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.width = width ?? 1;
		this.height = height ?? 0.5;
	}

	public internalRender(camera: Camera): DrawTask {
		const distance = Math.hypot(camera.x - this.x, camera.z - this.z);
		return {
			zIndex: distance,
			fn: (g: CanvasRenderingContext2D) => {
				g.globalAlpha = 1;
				g.fillStyle = "black";

				const angleToEntity = Math.atan2(this.z - camera.z, this.x - camera.x);
				let angleDiff = angleToEntity - camera.rotation;

				while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
				while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

				if (Math.abs(angleDiff) < camera.fov / 2) {
					const dx = this.x - camera.x;
					const dz = this.z - camera.z;
					const correctedDistance = Math.cos(angleDiff) * Math.hypot(dx, dz);

					const wallHeight = g.canvas.height / correctedDistance;
					const projectedWidth = this.width * wallHeight;
					const projectedHeight = this.height * wallHeight;

					const floorY = g.canvas.height / 2 + wallHeight / 2;
					const bottomY = floorY - this.y * wallHeight;

					const normalized = angleDiff / camera.fov + 0.5;
					this.render(
						g,
						normalized * g.canvas.width - projectedWidth / 2,
						bottomY - projectedHeight,
						projectedWidth,
						projectedHeight,
					);
				}
			},
		};
	}

	public setup(): void {}
	public render(
		g: CanvasRenderingContext2D,
		x: number,
		y: number,
		width: number,
		height: number,
	): void {
		void g;
		void x;
		void y;
		void width;
		void height;
	}
	public update(deltaTime: number): void {
		void deltaTime;
	}
}

export default Entity;
