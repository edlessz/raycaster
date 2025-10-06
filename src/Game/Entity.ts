class Entity {
	public x: number = 1;
	public y: number = 0;
	public z: number = 1;
	public rotation: number = 0;

	public width: number;
	public height: number;

	public space: "world" | "screen" = "world";

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

	public setup(): void {}
	public render(g: CanvasRenderingContext2D): void {
		void g;
	}
	public update(deltaTime: number): void {
		void deltaTime;
	}
}

export default Entity;
