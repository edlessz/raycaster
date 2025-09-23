const keys: Partial<Record<string, boolean>> = {};
let initialized = false;

export function initializeInput(): void {
	if (initialized) return;
	initialized = true;

	window.addEventListener("keydown", (e) => {
		keys[e.key] = true;
	});
	window.addEventListener("keyup", (e) => {
		keys[e.key] = false;
	});
}

export function isKeyPressed(key: string): boolean {
	return !!keys[key];
}
