const Registry = new Map<string, unknown>();

const provide = (key: string, value: unknown): void => {
	Registry.set(key, value);
};

const inject = <T>(key: string): T | null => {
	return (Registry.get(key) as T) ?? null;
};

export { provide, inject };
