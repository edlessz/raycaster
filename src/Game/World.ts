class World {
	private data: Map<string, number> = new Map([]);

	public render(g: CanvasRenderingContext2D): void {
		for (const [position, id] of this.data.entries()) {
			const [x, y] = position.split(",").map(Number);

			g.fillStyle = id === 1 ? "lightgray" : "darkgray";
			g.fillRect(x, y, 1, 1);
		}
	}

	public setMapData(data: Map<string, number>): void {
		this.data = data;
	}
	public getMapData(): Map<string, number> {
		return this.data;
	}
}

export default World;
