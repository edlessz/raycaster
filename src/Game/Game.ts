import world0 from "../data/world1.json";
import { initializeInput } from "./Input";
import Player from "./Player";
import { RayCaster, type TextureMap } from "./RayCaster";
import { loadTextures, type Texture } from "./TextureManager";
import World from "./World";

class Game {
	private viewport: HTMLCanvasElement | null = null;
	private context: CanvasRenderingContext2D | null = null;

	private resizeObserver = new ResizeObserver(this.handleResize.bind(this));

	private textureMap: TextureMap = new Map<number, Texture>();
	private world = new World();
	private player = new Player(1.5, 9.5, 0);
	private rayCaster = new RayCaster();

	private drawOverheadEnabled = false;
	private drawRaysEnabled = true;

	constructor() {
		initializeInput();
		loadTextures(["brick.png", "nik.png", "michael.png"]).then((texs) => {
			texs.forEach((tex, i) => {
				this.textureMap.set(i + 1, tex);
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
		this.player.update(deltaTime, this.world.getMapData());
	}
	private render(g: CanvasRenderingContext2D): void {
		if (!this.viewport) return;

		g.resetTransform();
		g.clearRect(0, 0, this.viewport.width, this.viewport.height);

		if (this.drawOverheadEnabled) {
			const ppu = 64;
			g.scale(ppu, ppu);

			this.world.render(g);
			this.player.render(g);
		}

		if (this.drawRaysEnabled)
			this.rayCaster.render(g, this.player.rays, this.textureMap);

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
