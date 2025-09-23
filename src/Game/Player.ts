import { isKeyPressed } from "./Input";

class Player {
	public x: number = 1;
	public y: number = 1;
	public direction: number = 0;
	public moveSpeed: number = 2;
	public rotationSpeed: number = 1.5;

	constructor(x: number, y: number, direction: number) {
		this.x = x;
		this.y = y;
		this.direction = direction;
	}

	public colliding(map: Map<string, number>): boolean {
		return map.has(`${Math.floor(this.x)},${Math.floor(this.y)}`);
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

		g.save();
		g.translate(this.x, this.y);
		g.rotate(this.direction);
		g.fillRect(-size / 2, -size / 2, size, size);
		g.restore();
	}
}

export default Player;
