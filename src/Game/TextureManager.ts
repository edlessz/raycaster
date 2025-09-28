export function loadTexture(src: string): Promise<Texture> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => {
			const canvas = document.createElement("canvas");
			canvas.width = img.width;
			canvas.height = img.height;
			const ctx = canvas.getContext("2d");
			if (!ctx) {
				reject(new Error("Failed to get context"));
				return;
			}
			ctx.drawImage(img, 0, 0);
			const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
			resolve({
				width: canvas.width,
				height: canvas.height,
				data,
				img,
				src,
			});
		};
		img.src = src;
	});
}
export function loadTextures(sources: string[]): Promise<Texture[]> {
	return Promise.all(sources.map((src) => loadTexture(src)));
}

export interface Texture {
	width: number;
	height: number;
	data: ImageDataArray;
	img: HTMLImageElement;
	src: string;
}
