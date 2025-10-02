import world0 from "../data/world0.json";
import Camera from "./Camera";
import Jonas from "./Entities/Jonas";
import Player from "./Entities/Player";
import type Entity from "./Entity";
import { initializeInput } from "./Input";
import type { TextureMap } from "./RayCaster";
import { loadTextures, type Texture } from "./TextureManager";
import World from "./World";

class Game {
	private viewport: HTMLCanvasElement | null = null;
	private context: CanvasRenderingContext2D | null = null;

	private resizeObserver = new ResizeObserver(this.handleResize.bind(this));

	private textureMap: TextureMap = new Map<number, Texture>();
	private world = new World();
	private camera = new Camera(1.5, 9.5);
	private player = new Player();
	private entities: Entity[] = [this.player, new Jonas()];

	constructor() {
		initializeInput();
		loadTextures(["brick.png", "nik.png", "michael.png"]).then((texs) => {
			texs.forEach((tex, i) => {
				this.textureMap.set(i + 1, tex);
			});
		});

		this.world.setMapData(new Map(Object.entries(world0)));
		this.camera.pov = this.player;
		this.camera.mapRef = this.world.getMapData();
		this.camera.textureMapRef = this.textureMap;
		this.player.mapRef = this.world.getMapData();
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

	public setViewport(canvas: HTMLCanvasElement | null): void {
		if (this.viewport) {
			// Unhook
			this.resizeObserver.unobserve(this.viewport);
		}
		this.viewport = canvas;
		this.context = canvas?.getContext("2d") ?? null;
		if (canvas) {
			// Hook
			this.resizeObserver.observe(canvas);
		}
	}

	public getContext(): CanvasRenderingContext2D | null {
		return this.context;
	}

	private lastTime: number = 0;
	public start(): void {
		this.lastTime = performance.now();
		requestAnimationFrame(this.gameLoop.bind(this));

		this.camera.setup();
		this.entities.forEach((e) => {
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
		this.entities.forEach((e) => {
			e.update(deltaTime);
		});
		this.camera.update();
	}
	private render(g: CanvasRenderingContext2D): void {
		if (!this.viewport) return;

		g.resetTransform();
		g.clearRect(0, 0, this.viewport.width, this.viewport.height);

		const tasks = [
			...this.camera.render(g),
			...this.entities.map((e) => e.internalRender(this.camera)),
		];

		tasks
			.sort((a, b) => b.zIndex - a.zIndex)
			.forEach((task) => {
				task.fn(g);
			});

		g.resetTransform();
		g.fillStyle = "black";
		g.fillText(
			`FPS: ${(1000 / (performance.now() - this.lastTime)).toFixed(2)}`,
			10,
			20,
		);
	}
}

export default Game;
