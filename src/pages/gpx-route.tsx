import { Fragment, useCallback } from "react";
import { useImmer } from "use-immer";
import {
	MapContainer,
	TileLayer,
	Polyline,
	Circle,
	CircleMarker,
	useMap,
} from "react-leaflet";
import { Box, Code, Heading, SimpleGrid, Stack, Text } from "@chakra-ui/react";

type RoutePoint = {
	lat: number;
	lon: number;
};

type OverlapPoint = RoutePoint & {
	radiusMeters: number;
	exits: Array<RoutePoint>;
};

const coordinateKey = (point: RoutePoint) =>
	`${point.lat.toFixed(6)}|${point.lon.toFixed(6)}`;

const epsilon = 0.000015;
const intersectionDefaultRadiusMeters = 15;

const equalPoints = (a: RoutePoint, b: RoutePoint) =>
	Math.abs(a.lat - b.lat) < epsilon && Math.abs(a.lon - b.lon) < epsilon;

const buildPoints = (text: string): RoutePoint[] => {
	const parser = new DOMParser();
	const doc = parser.parseFromString(text, "application/xml");
	const parseError = doc.querySelector("parsererror");
	if (parseError) {
		throw new Error("Invalid GPX XML");
	}

	const nodes = Array.from(
		doc.querySelectorAll("trkpt, rtept, wpt"),
	) as Element[];

	if (nodes.length === 0) {
		throw new Error("No GPX track, route, or waypoint points found.");
	}

	const points = nodes.map((node) => {
		const lat = Number(node.getAttribute("lat"));
		const lon = Number(node.getAttribute("lon"));
		if (Number.isNaN(lat) || Number.isNaN(lon)) {
			throw new Error("GPX point missing latitude or longitude.");
		}
		return { lat, lon };
	});

	return points.filter((point, index) =>
		index === 0 ? true : !equalPoints(point, points[index - 1]),
	);
};

const subtract = (a: RoutePoint, b: RoutePoint) => ({
	x: a.lon - b.lon,
	y: a.lat - b.lat,
});

const cross = (a: { x: number; y: number }, b: { x: number; y: number }) =>
	a.x * b.y - a.y * b.x;

const getSegmentIntersection = (
	a: RoutePoint,
	b: RoutePoint,
	c: RoutePoint,
	d: RoutePoint,
): RoutePoint | null => {
	const r = subtract(b, a);
	const s = subtract(d, c);
	const denom = cross(r, s);
	if (Math.abs(denom) < epsilon) {
		return null;
	}

	const diff = subtract(c, a);
	const t = cross(diff, s) / denom;
	const u = cross(diff, r) / denom;

	if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
		return {
			lat: a.lat + t * (b.lat - a.lat),
			lon: a.lon + t * (b.lon - a.lon),
		};
	}

	return null;
};

const findOverlaps = (points: RoutePoint[]) => {
	const intersections = new Map<string, OverlapPoint>();
	const dedupedPoints = points.filter((point, index) =>
		index === 0 ? true : !equalPoints(point, points[index - 1]),
	);

	for (let i = 0; i < dedupedPoints.length - 1; i += 1) {
		const a = dedupedPoints[i];
		const b = dedupedPoints[i + 1];
		if (equalPoints(a, b)) continue;

		for (let j = i + 2; j < dedupedPoints.length - 1; j += 1) {
			const c = dedupedPoints[j];
			const d = dedupedPoints[j + 1];
			if (equalPoints(c, d)) continue;

			const overlap = getSegmentIntersection(a, b, c, d);
			if (overlap) {
				intersections.set(coordinateKey(overlap), {
					...overlap,
					radiusMeters: intersectionDefaultRadiusMeters,
					exits: [],
				});
			}
		}
	}

	const duplicatePoints = dedupedPoints.reduce<OverlapPoint[]>(
		(acc, point, index) => {
			const firstIndex = dedupedPoints.findIndex((candidate) =>
				equalPoints(candidate, point),
			);
			if (firstIndex !== index && firstIndex !== index - 1) {
				const key = coordinateKey(point);
				if (!acc.some((existing) => coordinateKey(existing) === key)) {
					acc.push({
						...point,
						radiusMeters: intersectionDefaultRadiusMeters,
						exits: [],
					});
				}
			}
			return acc;
		},
		[],
	);

	duplicatePoints.forEach((point) => {
		intersections.set(coordinateKey(point), {
			...point,
			radiusMeters: intersectionDefaultRadiusMeters,
		});
	});

	return Array.from(intersections.values()).sort((a, b) =>
		a.lat === b.lat ? a.lon - b.lon : a.lat - b.lat,
	);
};

const degreesToRadians = (degrees: number) => (degrees * Math.PI) / 180;

const distanceMeters = (a: RoutePoint, b: RoutePoint) => {
	const lat1 = degreesToRadians(a.lat);
	const lat2 = degreesToRadians(b.lat);
	const dLat = lat2 - lat1;
	const dLon = degreesToRadians(a.lon - b.lon);

	const sinLat = Math.sin(dLat / 2);
	const sinLon = Math.sin(dLon / 2);
	const haversine =
		sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;

	return 6371000 * 2 * Math.asin(Math.sqrt(haversine));
};

const adjustOverlapRadii = (points: OverlapPoint[]) => {
	if (points.length <= 1) return points;

	let adjusted = points.map((point) => ({
		...point,
		radiusMeters: point.radiusMeters ?? intersectionDefaultRadiusMeters,
	}));

	let iteration = 0;
	const maxIterations = 20;

	while (iteration < maxIterations) {
		const parent = adjusted.map((_, index) => index);
		const find = (index: number): number =>
			// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
			parent[index] === index ? index : (parent[index] = find(parent[index]));
		const union = (a: number, b: number) => {
			const rootA = find(a);
			const rootB = find(b);
			if (rootA !== rootB) parent[rootB] = rootA;
		};

		let merged = false;
		for (let i = 0; i < adjusted.length - 1; i += 1) {
			for (let j = i + 1; j < adjusted.length; j += 1) {
				const separation = distanceMeters(adjusted[i], adjusted[j]);
				const minRadius = Math.min(
					adjusted[i].radiusMeters,
					adjusted[j].radiusMeters,
				);
				if (separation <= minRadius) {
					union(i, j);
					merged = true;
				}
			}
		}

		if (merged) {
			const groups = adjusted.reduce<Map<number, OverlapPoint[]>>(
				(acc, point, index) => {
					const root = find(index);
					const group = acc.get(root) ?? [];
					group.push(point);
					acc.set(root, group);
					return acc;
				},
				new Map(),
			);

			adjusted = Array.from(groups.values()).map((group) => ({
				lat: group.reduce((sum, point) => sum + point.lat, 0) / group.length,
				lon: group.reduce((sum, point) => sum + point.lon, 0) / group.length,
				radiusMeters: Math.max(...group.map((point) => point.radiusMeters)),
				exits: [],
			}));
			iteration += 1;
			continue;
		}

		const radiiDelta = adjusted.map(() => 0);
		const overlapCount = adjusted.map(() => 0);
		let hasPartialOverlap = false;

		for (let i = 0; i < adjusted.length - 1; i += 1) {
			for (let j = i + 1; j < adjusted.length; j += 1) {
				const separation = distanceMeters(adjusted[i], adjusted[j]);
				const minRadius = Math.min(
					adjusted[i].radiusMeters,
					adjusted[j].radiusMeters,
				);
				const overlap =
					adjusted[i].radiusMeters + adjusted[j].radiusMeters - separation;
				if (overlap > 0 && separation > minRadius) {
					hasPartialOverlap = true;
					const shrink = overlap / 2;
					radiiDelta[i] += shrink;
					radiiDelta[j] += shrink;
					overlapCount[i] += 1;
					overlapCount[j] += 1;
				}
			}
		}

		if (!hasPartialOverlap) break;

		let anyChange = false;
		for (let index = 0; index < adjusted.length; index += 1) {
			if (overlapCount[index] === 0) continue;
			const shrink = radiiDelta[index] / overlapCount[index];
			const nextRadius = Math.max(0, adjusted[index].radiusMeters - shrink);
			if (Math.abs(nextRadius - adjusted[index].radiusMeters) > 1e-6) {
				adjusted[index].radiusMeters = nextRadius;
				anyChange = true;
			}
		}

		if (!anyChange) break;
		iteration += 1;
	}

	return adjusted;
};

const formatPoint = (point: RoutePoint) =>
	`${point.lat.toFixed(6)}, ${point.lon.toFixed(6)}`;

const serializeIntersections = (points: OverlapPoint[]) => {
	return points
		.map((point) => {
			const record = [
				point.lat.toFixed(6),
				point.lon.toFixed(6),
				point.radiusMeters.toFixed(1),
				String(point.exits.length),
				...point.exits.flatMap((exit) => [
					exit.lat.toFixed(6),
					exit.lon.toFixed(6),
				]),
			];
			return record.join(" ");
		})
		.join("\n");
};

const downloadText = (text: string, filename: string) => {
	const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	anchor.click();
	URL.revokeObjectURL(url);
};

const toLatLng = (point: RoutePoint) => [point.lat, point.lon] as const;

const toLocalCoords = (point: RoutePoint, origin: RoutePoint) => {
	const originLatRad = degreesToRadians(origin.lat);
	return {
		x:
			degreesToRadians(point.lon - origin.lon) *
			6371000 *
			Math.cos(originLatRad),
		y: degreesToRadians(point.lat - origin.lat) * 6371000,
	};
};

const localToLatLng = (
	local: { x: number; y: number },
	origin: RoutePoint,
) => ({
	lat: origin.lat + (local.y / 6371000) * (180 / Math.PI),
	lon:
		origin.lon +
		(local.x / (6371000 * Math.cos(degreesToRadians(origin.lat)))) *
			(180 / Math.PI),
});

const segmentCircleExit = (
	from: RoutePoint,
	to: RoutePoint,
	center: RoutePoint,
	radiusMeters: number,
): RoutePoint | null => {
	const fromLocal = toLocalCoords(from, center);
	const toLocal = toLocalCoords(to, center);
	const dx = toLocal.x - fromLocal.x;
	const dy = toLocal.y - fromLocal.y;
	const a = dx * dx + dy * dy;
	if (a < epsilon) return null;

	const b = 2 * (fromLocal.x * dx + fromLocal.y * dy);
	const c =
		fromLocal.x * fromLocal.x +
		fromLocal.y * fromLocal.y -
		radiusMeters * radiusMeters;
	const discriminant = b * b - 4 * a * c;
	if (discriminant < 0) return null;

	const sqrtDisc = Math.sqrt(discriminant);
	const t1 = (-b - sqrtDisc) / (2 * a);
	const t2 = (-b + sqrtDisc) / (2 * a);
	const candidates = [t1, t2].filter((t) => t >= 0 && t <= 1);
	if (candidates.length === 0) return null;

	const t = Math.max(...candidates);
	const exitLocal = {
		x: fromLocal.x + dx * t,
		y: fromLocal.y + dy * t,
	};
	return localToLatLng(exitLocal, center);
};

const recordRouteExits = (
	points: RoutePoint[],
	overlaps: OverlapPoint[],
): OverlapPoint[] => {
	if (points.length === 0 || overlaps.length === 0) return overlaps;

	const visited = overlaps.map((overlap) => ({
		...overlap,
		exits: [],
	}));

	const inside = visited.map(
		(overlap) => distanceMeters(points[0], overlap) <= overlap.radiusMeters,
	);

	for (let index = 1; index < points.length; index += 1) {
		const previousPoint = points[index - 1];
		const currentPoint = points[index];

		visited.forEach((overlap, overlapIndex) => {
			const wasInside = inside[overlapIndex];
			const isInside =
				distanceMeters(currentPoint, overlap) <= overlap.radiusMeters;
			if (wasInside && !isInside) {
				const exitPoint =
					segmentCircleExit(
						previousPoint,
						currentPoint,
						overlap,
						overlap.radiusMeters,
					) ?? currentPoint;
				visited[overlapIndex].exits.push(exitPoint);
			}
			inside[overlapIndex] = isInside;
		});
	}

	return visited;
};

const FitBounds = ({ bounds }: { bounds: readonly RoutePoint[][] }) => {
	const map = useMap();
	map.fitBounds(bounds as any, {
		padding: [24, 24],
	});
	return null;
};

const RouteMap = ({
	points,
	overlaps,
}: {
	points: RoutePoint[];
	overlaps: OverlapPoint[];
}) => {
	if (points.length === 0) {
		return null;
	}

	const routePositions = points.map(toLatLng);
	const bounds: [number, number][] = [
		[
			Math.min(...points.map((point) => point.lat)),
			Math.min(...points.map((point) => point.lon)),
		],
		[
			Math.max(...points.map((point) => point.lat)),
			Math.max(...points.map((point) => point.lon)),
		],
	];

	return (
		<Box p={4} bg="gray.50" borderRadius="md">
			<Text fontWeight="semibold" mb={3}>
				Route map
			</Text>
			<Box
				h="420px"
				borderRadius="md"
				overflow="hidden"
				border="1px solid"
				borderColor="gray.200"
			>
				<MapContainer
					style={{ width: "100%", height: "100%" }}
					bounds={bounds as any}
					scrollWheelZoom
				>
					<TileLayer
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					/>
					<FitBounds bounds={bounds} />
					<Polyline
						pathOptions={{ color: "#22c55e", weight: 4 }}
						positions={routePositions}
					/>
					{/* <CircleMarker
						center={routePositions[0]}
						pathOptions={{ color: "#2563eb", fillColor: "#2563eb" }}
						radius={6}
					/> */}
					{/* <CircleMarker
						center={routePositions[routePositions.length - 1]}
						pathOptions={{ color: "#f97316", fillColor: "#f97316" }}
						radius={6}
					/> */}
					{overlaps.map((point) => (
						<Fragment key={`overlap-group-${coordinateKey(point)}`}>
							<Circle
								key={`overlap-radius-${coordinateKey(point)}`}
								center={toLatLng(point)}
								pathOptions={{
									color: "#dc2626",
									fillColor: "#fca5a5",
									fillOpacity: 0.25,
									weight: 1,
								}}
								radius={point.radiusMeters}
							/>
							<CircleMarker
								key={`overlap-${coordinateKey(point)}`}
								center={toLatLng(point)}
								pathOptions={{ color: "#2563eb", fillColor: "#2563eb" }}
								radius={1}
							/>
							{point.exits.map((exit, index) => (
								<CircleMarker
									key={`exit-${coordinateKey(point)}-${index}`}
									center={toLatLng(exit)}
									pathOptions={{ color: "#7c3aed", fillColor: "#a78bfa" }}
									radius={1}
								/>
							))}
						</Fragment>
					))}
				</MapContainer>
			</Box>
			<Box mt={3} display="flex" flexWrap="wrap" gap={3} fontSize="sm">
				<Box>
					<Text as="span" fontWeight="bold">
						Start
					</Text>
					: blue
				</Box>
				<Box>
					<Text as="span" fontWeight="bold">
						End
					</Text>
					: orange
				</Box>
				<Box>
					<Text as="span" fontWeight="bold">
						Route
					</Text>
					: green line
				</Box>
				<Box>
					<Text as="span" fontWeight="bold">
						Intersections
					</Text>
					: red dots with variable radius circles (default 15m)
				</Box>
			</Box>
		</Box>
	);
};

type GPXRouteState = {
	routeName: string | null;
	routePoints: RoutePoint[];
	overlapPoints: OverlapPoint[];
	error: string | null;
};

const defaultGPXRouteState: GPXRouteState = {
	routeName: null,
	routePoints: [],
	overlapPoints: [],
	error: null,
};

const GPXRouteInspector = () => {
	const [state, setState] = useImmer<GPXRouteState>(defaultGPXRouteState);
	const { routeName, routePoints, overlapPoints, error } = state;

	const handleFile = useCallback(
		(files: FileList | null) => {
			if (!files || files.length === 0) return;

			const file = files[0];
			const reader = new FileReader();
			reader.onload = () => {
				const text = String(reader.result ?? "");
				try {
					const points = buildPoints(text);
					const overlaps = findOverlaps(points);
					const adjustedOverlaps = adjustOverlapRadii(overlaps);
					const visitedOverlaps = recordRouteExits(points, adjustedOverlaps);

					setState((draft) => {
						draft.routeName = file.name;
						draft.routePoints = points;
						draft.overlapPoints = visitedOverlaps;
						draft.error = null;
					});

					if (visitedOverlaps.length > 0) {
						try {
							const payloadText = serializeIntersections(visitedOverlaps);
							downloadText(
								payloadText,
								`${file.name.replace(/\.[^.]+$/, "")}-intersections.txt`,
							);
						} catch (error) {
							console.error(error);
						}
					}
				} catch (err) {
					setState((draft) => {
						draft.routeName = null;
						draft.routePoints = [];
						draft.overlapPoints = [];
						draft.error = err instanceof Error ? err.message : String(err);
					});
				}
			};

			reader.onerror = () => {
				setState((draft) => {
					draft.error = "Failed to read GPX file.";
					draft.routePoints = [];
					draft.overlapPoints = [];
					draft.routeName = null;
				});
			};

			reader.readAsText(file);
		},
		[setState],
	);

	return (
		<Stack gap={6} w="100%">
			<Box>
				<Heading as="h2" size="xl" mb={3}>
					GPX Route Overlap Inspector
				</Heading>
				<Text mb={4} maxW="4xl">
					Upload a GPX track or route file. The inspector parses route points
					and detects self-overlaps by identifying repeated coordinates and
					intersection points.
				</Text>
			</Box>

			<Box>
				<Text fontWeight="semibold" mb={2}>
					Select a GPX file
				</Text>
				<input
					accept=".gpx,application/gpx+xml,text/xml"
					onChange={(event) => {
						handleFile(event.target.files);
						event.currentTarget.value = "";
					}}
					type="file"
					style={{
						borderRadius: 6,
						padding: "0.75rem 1rem",
						border: "1px solid var(--chakra-colors-gray-200)",
						width: "100%",
					}}
				/>
			</Box>

			{error ? (
				<Box
					p={4}
					bg="red.50"
					borderRadius="md"
					border="1px solid"
					borderColor="red.200"
				>
					<Text color="red.700" fontWeight="bold">
						{error}
					</Text>
				</Box>
			) : null}

			{routePoints.length > 0 ? (
				<Box p={4} bg="gray.50" borderRadius="md">
					<SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
						<Box>
							<Text fontWeight="bold">File</Text>
							<Text>{routeName}</Text>
						</Box>
						<Box>
							<Text fontWeight="bold">Route points</Text>
							<Text>{routePoints.length}</Text>
						</Box>
						<Box>
							<Text fontWeight="bold">Overlaps detected</Text>
							<Text>{overlapPoints.length}</Text>
						</Box>
					</SimpleGrid>
				</Box>
			) : null}

			{routePoints.length > 0 ? (
				<RouteMap points={routePoints} overlaps={overlapPoints} />
			) : null}

			{routePoints.length > 0 ? (
				<Box>
					{overlapPoints.length > 0 ? (
						<>
							<Box
								mt={4}
								p={4}
								bg="blue.50"
								borderRadius="md"
								border="1px solid"
								borderColor="blue.200"
							>
								<Text fontWeight="semibold">
									GPX file processed automatically: overlap radii adjusted,
									exits recorded, and intersections exported.
								</Text>
							</Box>
							<Box>
								<Text mb={3} fontWeight="semibold">
									Overlap coordinates
								</Text>
								<Box display="grid" gap={2}>
									{overlapPoints.map((point) => (
										<Box key={coordinateKey(point)}>
											<Code>
												{formatPoint(point)} (r {point.radiusMeters.toFixed(1)}
												m)
											</Code>
											{point.exits.length > 0 ? (
												<Text fontSize="xs" color="gray.600" mt={1}>
													Exits: {point.exits.length}
												</Text>
											) : null}
										</Box>
									))}
								</Box>
							</Box>
						</>
					) : (
						<Text>No overlaps found in this route.</Text>
					)}
				</Box>
			) : null}
		</Stack>
	);
};

export default GPXRouteInspector;
