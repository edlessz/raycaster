import Entity from "../Entity";
import type Camera from "./Camera";

class Jonas extends Entity {
	public target: Camera | null = null;

	constructor() {
		super(1.5, 0, 9.5, 0.5, 0.65);
	}

	public update(deltaTime: number): void {
		if (this.target) {
			const direction = Math.atan2(
				this.target.z - this.z,
				this.target.x - this.x,
			);
			const speed = 0.5 * deltaTime; // Adjust speed as necessary
			this.x += Math.cos(direction) * speed;
			this.z += Math.sin(direction) * speed;
		}
	}
	public render(g: CanvasRenderingContext2D): void {
		this.space = "world";
		g.fillStyle = "#1E90FF";
		g.fillRect(0, 0, 1, 1);
	}
}

export default Jonas;
