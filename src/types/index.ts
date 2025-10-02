export type { Ray, TextureMap } from "../Game/RayCaster";

export interface DrawTask {
	fn: (g: CanvasRenderingContext2D) => void;
	zIndex: number;
}
