import type { JSX } from "react";

import Vermonttrip from "../pages/vermont-trip";
import Moderatemonday from "../pages/moderate-monday";
import Index from "../pages/index";
import Gpxroute from "../pages/gpx-route";
import Cumulativedistance from "../pages/cumulative-distance";
	
export const pages = ["vermont-trip", "moderate-monday", "index", "gpx-route", "cumulative-distance"] as const;

export type Page = typeof pages[number];

export const pageMap: Record<Page, JSX.Element> = {
	"vermont-trip": <Vermonttrip />,
	"moderate-monday": <Moderatemonday />,
	"index": <Index />,
	"gpx-route": <Gpxroute />,
	"cumulative-distance": <Cumulativedistance />,
};
