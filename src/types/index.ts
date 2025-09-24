export interface Ray {
	angle: number;
	distance: number;
	correctedDistance: number;
	face: "north" | "south" | "east" | "west" | null;
	percentage: number;
	material: number;
}

export interface Texture {
	width: number;
	height: number;
	data: ImageDataArray;
	img: HTMLImageElement;
	src: string;
}

export type TextureMap = Map<number, Texture>;
