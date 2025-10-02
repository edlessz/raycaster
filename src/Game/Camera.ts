import type { DrawTask, TextureMap } from "../types";
import Entity from "./Entity";
import { RayCaster } from "./RayCaster";

class Camera extends Entity {
	public rayCount: number = 960;
	public fov: number = Math.PI / 2;
	public renderDistance = 20;

	private rayCaster = new RayCaster();
	public pov: Entity | null = null;

	public mapRef: Map<string, number> | null = null;
	public textureMapRef: TextureMap | null = null;

	constructor(x: number, z: number) {
		super(x, 0, z, 0, 0);
	}

	public render(g: CanvasRenderingContext2D): DrawTask[] {
		if (!this.mapRef || !this.textureMapRef) return [];

		const rays = this.rayCaster.castRays(
			{ x: this.x, z: this.z },
			this.rotation,
			this.fov,
			this.rayCount,
			this.renderDistance,
			this.mapRef,
		);

		return this.rayCaster.render(g, rays, this.textureMapRef);
	}

	public update(): void {
		if (!this.pov) return;

		this.x = this.pov.x;
		this.z = this.pov.z;
		this.rotation = this.pov.rotation;
	}
}

export default Camera;
