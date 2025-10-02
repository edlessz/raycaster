class World {
	private data: Map<string, number> = new Map([]);

	public setMapData(data: Map<string, number>): void {
		this.data = data;
	}
	public getMapData(): Map<string, number> {
		return this.data;
	}
}

export default World;
