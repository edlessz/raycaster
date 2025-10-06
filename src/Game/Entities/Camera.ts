import Entity from "../Entity";
import type Game from "../Game";
import { inject } from "../Registry";
import Player from "./Player";

class Camera extends Entity {
	public rayCount: number = 960;
	public fov: number = Math.PI / 2;
	public renderDistance = 20;

	public pov: Entity | null = null;

	constructor(x: number, z: number) {
		super(x, 0, z, 0, 0);
	}

	public setup(): void {
		const game = inject<Game>("game");
		console.log(game?.getEntity(Player));
		const player = game?.getEntity(Player);
		if (player) this.pov = player;
	}

	public update(): void {
		if (!this.pov) return;

		this.x = this.pov.x;
		this.z = this.pov.z;
		this.rotation = this.pov.rotation;
	}
}

export default Camera;
