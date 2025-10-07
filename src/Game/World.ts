class World {
	private data: Map<string, number> = new Map([]);

	public setMapData(data: Map<string, number>): void {
		this.data = data;
	}
	public getMapData(): Map<string, number> {
		return this.data;
	}
	public tileAt(x: number, y: number): number | null {
		return this.data.get(`${Math.floor(x)},${Math.floor(y)}`) ?? null;
	}
}

export default World;
