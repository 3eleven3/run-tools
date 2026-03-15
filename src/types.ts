import type { FC, PropsWithChildren } from "react";
import type { Event } from "./events";
import type { Data } from "./classes/data";

export type AppState = {
	isMobile: boolean;
	readonly events: Event[];
	data: Data | null;
};

// biome-ignore lint/complexity/noBannedTypes: React stuff
export type FCWithChildren<P = {}> = FC<PropsWithChildren<P>>;
