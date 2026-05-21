import type { JSX } from "react";

import Moderatemonday from "../pages/moderate-monday";
import Index from "../pages/index";
import Gpxroute from "../pages/gpx-route";
import Cumulativedistance from "../pages/cumulative-distance";
	
export const pages = ["moderate-monday", "index", "gpx-route", "cumulative-distance"] as const;

export type Page = typeof pages[number];

export const pageMap: Record<Page, JSX.Element> = {
	"moderate-monday": <Moderatemonday />,
	"index": <Index />,
	"gpx-route": <Gpxroute />,
	"cumulative-distance": <Cumulativedistance />,
};
