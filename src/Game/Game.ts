import world0 from "../data/world0.json";
import type { DrawTask } from "../types";
import Camera from "./Entities/Camera";
import Jonas from "./Entities/Jonas";
import Player from "./Entities/Player";
import type Entity from "./Entity";
import { initializeInput } from "./Input";
import { RayCaster } from "./RayCaster";
import { loadTextures } from "./TextureManager";
import World from "./World";

class Game {
	private viewport: HTMLCanvasElement | null = null;
	private context: CanvasRenderingContext2D | null = null;
	private resizeObserver = new ResizeObserver(this.handleResize.bind(this));

	public world = new World();
	private rayCaster = new RayCaster();

	private camera = new Camera(1.5, 9.5);
	private player = new Player();
	private entities: Entity[] = [this.camera, this.player, new Jonas()];

	constructor() {
		initializeInput();
		loadTextures(["brick.png", "nik.png", "michael.png"]).then((texs) => {
			texs.forEach((tex, i) => {
				this.rayCaster.textureMap.set(i + 1, tex);
			});
		});

		this.world.setMapData(new Map(Object.entries(world0)));
	}

	private handleResize(entries: ResizeObserverEntry[]): void {
		for (const entry of entries) {
			const target = entry.target as HTMLCanvasElement;

			const width = target.clientWidth;
			const height = target.clientHeight;
			const dpr = window.devicePixelRatio || 1;

			target.width = width * dpr;
			target.height = height * dpr;
		}

		if (!this.context) return;
		this.render(this.context);
	}

	public getEntity<T extends Entity>(type: new () => T): T | null {
		for (const e of this.entities) {
			if (e instanceof type) return e as T;
		}
		return null;
	}
	public getEntityByTag(tag: string): Entity | null {
		return this.entities.find((e) => e.tag === tag) ?? null;
	}
	public getEntitiesByTag(tag: string): Entity[] {
		return this.entities.filter((e) => e.tag === tag);
	}

	public rotateCamera = (mouseEvent: MouseEvent): void => {
		const amt = (mouseEvent.movementX * this.player.rotationSpeed) / 250;
		this.player.rotation += amt;
	};

	public setViewport(canvas: HTMLCanvasElement | null): void {
		if (this.viewport) {
			// Unhook
			this.resizeObserver.unobserve(this.viewport);
			this.viewport.removeEventListener("mousemove", this.rotateCamera);
		}
		this.viewport = canvas;
		this.context = canvas?.getContext("2d") ?? null;
		if (canvas) {
			// Hook
			this.resizeObserver.observe(canvas);
			canvas.addEventListener("mousemove", this.rotateCamera);
			canvas.addEventListener("click", () => {
				canvas.requestPointerLock();
			});
		}
	}

	private lastTime: number = 0;
	public start(): void {
		this.lastTime = performance.now();
		requestAnimationFrame(this.gameLoop.bind(this));

		this.camera.setup();
		this.entities.forEach((e) => {
			e.game = this;
			e.setup();
		});
	}

	private gameLoop(now: number): void {
		const deltaTime = (now - this.lastTime) / 1000;
		this.lastTime = now;

		if (!this.context || !this.viewport) {
			requestAnimationFrame(this.gameLoop.bind(this));
			return;
		}

		this.update(deltaTime);
		this.render(this.context);

		requestAnimationFrame(this.gameLoop.bind(this));
	}

	private update(deltaTime: number): void {
		this.camera.update();
		this.entities.forEach((e) => {
			e.game = this;
			e.update(deltaTime);
		});
	}
	private render(g: CanvasRenderingContext2D): void {
		if (!this.viewport) return;

		g.resetTransform();
		g.clearRect(0, 0, this.viewport.width, this.viewport.height);

		const rays = this.rayCaster.castRays(
			{ x: this.camera.x, z: this.camera.z },
			this.camera.rotation,
			this.camera.fov,
			this.camera.rayCount,
			this.camera.renderDistance,
			this.world,
		);

		const tasks: DrawTask[] = [
			...this.rayCaster.render(g, rays),
			...this.entities.map((e) => this.calculateEntityDrawTask(e)),
		];

		tasks
			.sort((a, b) => b.zIndex - a.zIndex)
			.forEach((task) => {
				task.fn(g);
			});

		g.resetTransform();
		g.fillStyle = "black";
		g.filter = "invert(1)";
		g.font = "16px monospace";
		g.fillText(
			`FPS: ${(1000 / (performance.now() - this.lastTime)).toFixed(2)}`,
			10,
			20,
		);
		g.filter = "none";
	}

	private calculateEntityDrawTask(e: Entity): DrawTask {
		if (e.space === "screen")
			return {
				zIndex: e.z,
				fn: (g: CanvasRenderingContext2D) => {
					g.resetTransform();
					e.render(g);
				},
			};

		return {
			zIndex: Math.hypot(this.camera.x - e.x, this.camera.z - e.z),
			fn: (g: CanvasRenderingContext2D) => {
				g.globalAlpha = 1;

				const angleToEntity = Math.atan2(
					e.z - this.camera.z,
					e.x - this.camera.x,
				);
				let angleDiff = angleToEntity - this.camera.rotation;

				while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
				while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

				if (Math.abs(angleDiff) < this.camera.fov / 2) {
					const dx = e.x - this.camera.x;
					const dz = e.z - this.camera.z;
					const correctedDistance = Math.cos(angleDiff) * Math.hypot(dx, dz);

					const wallHeight = g.canvas.height / correctedDistance;
					const projectedWidth = e.width * wallHeight;
					const projectedHeight = e.height * wallHeight;

					const screenX =
						g.canvas.width / 2 +
						Math.tan(angleDiff) *
							(g.canvas.width / 2 / Math.tan(this.camera.fov / 2)) -
						projectedWidth / 2;
					const screenY = g.canvas.height / 2 - projectedHeight;

					g.resetTransform();
					g.translate(screenX + projectedWidth / 2, screenY + projectedHeight);
					g.scale(projectedWidth, projectedHeight);
					g.translate(-0.5, 0);
					e.render(g);
				}
			},
		};
	}
}

export default Game;
