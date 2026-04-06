import { useMemo } from "react";
import { useImmer } from "use-immer";
import {
	Badge,
	Box,
	Button,
	Heading,
	HStack,
	Input,
	SimpleGrid,
	Stack,
	Text,
	VStack,
	Wrap,
	WrapItem,
} from "@chakra-ui/react";
import { useColorModeValue } from "../components/ui/color-mode";

type RouteItem = {
	id: string;
	name: string;
	distance: number;
	elevation: number;
	gpxUrl: string;
	tags: string[];
};

type ModerateMondayState = {
	activeRoutes: RouteItem[];
	winner?: RouteItem;
	search: string;
	selectedTags: string[];
	distanceFilter: string;
	elevationFilter: string;
};

const routes: RouteItem[] = [
	{
		id: "route-1",
		name: "Maple Loop",
		distance: 6.8,
		elevation: 380,
		gpxUrl: "https://example.com/gpx/maple-loop.gpx",
		tags: ["hills", "wooded", "loop"],
	},
	{
		id: "route-2",
		name: "Riverfront Roll",
		distance: 5.4,
		elevation: 120,
		gpxUrl: "https://example.com/gpx/riverfront-roll.gpx",
		tags: ["flat", "scenic", "easy"],
	},
	{
		id: "route-3",
		name: "Hill Crusher",
		distance: 8.3,
		elevation: 540,
		gpxUrl: "https://example.com/gpx/hill-crusher.gpx",
		tags: ["hills", "challenging", "out-and-back"],
	},
	{
		id: "route-4",
		name: "Parkside Peaks",
		distance: 7.2,
		elevation: 320,
		gpxUrl: "https://example.com/gpx/parkside-peaks.gpx",
		tags: ["hills", "park", "trail"],
	},
	{
		id: "route-5",
		name: "City Sprint",
		distance: 4.6,
		elevation: 80,
		gpxUrl: "https://example.com/gpx/city-sprint.gpx",
		tags: ["flat", "fast", "urban"],
	},
	{
		id: "route-6",
		name: "Lakeside Cruise",
		distance: 9.1,
		elevation: 210,
		gpxUrl: "https://example.com/gpx/lakeside-cruise.gpx",
		tags: ["flat", "scenic", "long"],
	},
];

const defaultState: ModerateMondayState = {
	activeRoutes: routes,
	search: "",
	selectedTags: [],
	distanceFilter: "any",
	elevationFilter: "any",
};

const getDistanceCategory = (distance: number) => {
	if (distance < 5) return "short";
	if (distance < 8) return "medium";
	return "long";
};

const getElevationCategory = (elevation: number) => {
	if (elevation < 200) return "low";
	if (elevation < 400) return "moderate";
	return "high";
};

export const ModerateMondays = () => {
	const [state, setState] = useImmer<ModerateMondayState>(defaultState);

	const tags = useMemo(
		() => Array.from(new Set(routes.flatMap((route) => route.tags))).sort(),
		[],
	);

	const filteredRoutes = useMemo(() => {
		return state.activeRoutes.filter((route) => {
			const matchSearch = [route.name, route.gpxUrl, route.tags.join(" ")]
				.join(" ")
				.toLowerCase()
				.includes(state.search.toLowerCase());

			const matchTags =
				state.selectedTags.length === 0 ||
				state.selectedTags.every((tag) => route.tags.includes(tag));

			const distanceCategory = getDistanceCategory(route.distance);
			const matchDistance =
				state.distanceFilter === "any" ||
				state.distanceFilter === distanceCategory;

			const elevationCategory = getElevationCategory(route.elevation);
			const matchElevation =
				state.elevationFilter === "any" ||
				state.elevationFilter === elevationCategory;

			return matchSearch && matchTags && matchDistance && matchElevation;
		});
	}, [
		state.activeRoutes,
		state.search,
		state.selectedTags,
		state.distanceFilter,
		state.elevationFilter,
	]);

	const resetRoutes = () => {
		setState(defaultState);
	};

	const pickRandomRoute = () => {
		if (filteredRoutes.length === 0) return;

		const winner =
			filteredRoutes[Math.floor(Math.random() * filteredRoutes.length)];

		setState((draft) => {
			draft.winner = winner;
		});
	};

	const selectedTagSet = useMemo(
		() => new Set(state.selectedTags),
		[state.selectedTags],
	);
	const cardBg = useColorModeValue("white", "gray.800");
	const borderColor = useColorModeValue("gray.200", "gray.700");
	const filterBg = useColorModeValue("gray.50", "gray.900");
	const inputBg = useColorModeValue("white", "gray.700");
	const infoText = useColorModeValue("gray.600", "gray.300");

	return (
		<VStack gap={6} align="stretch">
			<Box>
				<Heading size="xl" mb={2}>
					Moderate Mondays
				</Heading>
				<Text color={infoText}>
					Pick a random moderate route and show the winner overlay instantly.
				</Text>
			</Box>
			<Stack
				direction={{ base: "column", md: "row" }}
				gap={3}
				align="center"
				wrap="wrap"
			>
				<Input
					placeholder="Search name, GPX, or tags"
					value={state.search}
					onChange={(event) =>
						setState((draft) => {
							draft.search = event.target.value;
						})
					}
					maxW={{ base: "100%", md: "360px" }}
					bg={inputBg}
					borderColor={borderColor}
					shadow="sm"
				/>
				<Button
					colorScheme="teal"
					onClick={pickRandomRoute}
					disabled={filteredRoutes.length <= 1}
				>
					Start random pick
				</Button>
				<Button onClick={resetRoutes} variant="outline">
					Reset all routes
				</Button>
			</Stack>
			<Box>
				<Box
					borderWidth={1}
					borderColor={borderColor}
					rounded="3xl"
					bg={filterBg}
					p={5}
					shadow="sm"
					transition="all 0.35s ease"
				>
					<Stack gap={4}>
						<Box>
							<Text fontSize="sm" fontWeight="bold" mb={2}>
								Distance
							</Text>
							<HStack wrap="wrap" gap={2}>
								{[
									{ label: "Any", value: "any" },
									{ label: "Short (<5 mi)", value: "short" },
									{ label: "Medium (5-8 mi)", value: "medium" },
									{ label: "Long (8+ mi)", value: "long" },
								].map((option) => (
									<Button
										key={option.value}
										size="sm"
										variant={
											state.distanceFilter === option.value
												? "solid"
												: "outline"
										}
										colorScheme={
											state.distanceFilter === option.value ? "cyan" : "gray"
										}
										onClick={() =>
											setState((draft) => {
												draft.distanceFilter = option.value;
											})
										}
									>
										{option.label}
									</Button>
								))}
							</HStack>
						</Box>

						<Box>
							<Text fontSize="sm" fontWeight="bold" mb={2}>
								Elevation
							</Text>
							<HStack wrap="wrap" gap={2}>
								{[
									{ label: "Any", value: "any" },
									{ label: "Low (<200 ft)", value: "low" },
									{ label: "Moderate (200-400 ft)", value: "moderate" },
									{ label: "High (400+ ft)", value: "high" },
								].map((option) => (
									<Button
										key={option.value}
										size="sm"
										variant={
											state.elevationFilter === option.value
												? "solid"
												: "outline"
										}
										colorScheme={
											state.elevationFilter === option.value ? "cyan" : "gray"
										}
										onClick={() =>
											setState((draft) => {
												draft.elevationFilter = option.value;
											})
										}
									>
										{option.label}
									</Button>
								))}
							</HStack>
						</Box>
						<Box>
							<Text fontSize="sm" fontWeight="bold" mb={2}>
								Tags
							</Text>
							<Wrap>
								{tags.map((tag) => (
									<WrapItem key={tag}>
										<Badge
											size="md"
											variant={selectedTagSet.has(tag) ? "solid" : "subtle"}
											colorScheme={selectedTagSet.has(tag) ? "teal" : "gray"}
											cursor="pointer"
											onClick={() => {
												setState((draft) => {
													if (draft.selectedTags.includes(tag)) {
														draft.selectedTags = draft.selectedTags.filter(
															(value) => value !== tag,
														);
													} else {
														draft.selectedTags.push(tag);
													}
												});
											}}
										>
											{tag}
										</Badge>
									</WrapItem>
								))}
							</Wrap>
						</Box>
					</Stack>
				</Box>
			</Box>

			<Box>
				<SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={4}>
					{filteredRoutes.map((route) => (
						<Box
							key={route.id}
							borderWidth={1}
							borderRadius="2xl"
							borderColor={borderColor}
							bg={cardBg}
							p={5}
							shadow="sm"
							transition="transform 0.2s, box-shadow 0.2s, border-color 0.2s"
							_hover={{ transform: "translateY(-4px)", boxShadow: "2xl" }}
						>
							<HStack justify="space-between" mb={3}>
								<Heading size="md">{route.name}</Heading>
							</HStack>
							<Text mb={2} fontWeight="bold">
								{route.distance.toFixed(1)} mi · {route.elevation} ft elev
							</Text>
							<Text fontSize="sm" mb={3} color="gray.500">
								{route.tags.join(" · ")}
							</Text>
							{state.activeRoutes.length === 1 && (
								<Button
									as="a"
									onClick={() => {
										window.open(route.gpxUrl, "_blank");
									}}
									rel="noreferrer"
									size="sm"
									colorScheme="blue"
									width="full"
								>
									Open GPX
								</Button>
							)}
						</Box>
					))}
				</SimpleGrid>
			</Box>
			{state.winner ? (
				<Box
					position="fixed"
					inset={0}
					bg="rgba(0, 0, 0, 0.75)"
					zIndex={1000}
					display="flex"
					alignItems="center"
					justifyContent="center"
					px={4}
					py={6}
				>
					<Box
						className="winner-modal-card"
						maxW="560px"
						w="full"
						bg={cardBg}
						borderRadius="3xl"
						p={{ base: 6, md: 10 }}
						shadow="2xl"
						borderWidth={1}
						borderColor={borderColor}
					>
						<Stack gap={5} align="center">
							<Badge colorScheme="green" px={3} py={1} fontSize="0.8rem">
								Winner
							</Badge>
							<Heading size={{ base: "xl", md: "2xl" }} textAlign="center">
								{state.winner.name}
							</Heading>
							<Text fontSize={{ base: "md", md: "lg" }} fontWeight="semibold">
								{state.winner.distance.toFixed(1)} mi · {state.winner.elevation}{" "}
								ft elev
							</Text>
							<Text fontSize="sm" color="gray.500" textAlign="center">
								{state.winner.tags.join(" · ")}
							</Text>
							<Button
								as="a"
								onClick={() => {
									window.open(state.winner.gpxUrl, "_blank");
								}}
								rel="noreferrer"
								size="lg"
								colorScheme="blue"
								width="full"
							>
								Open GPX
							</Button>
						</Stack>
					</Box>
				</Box>
			) : null}
		</VStack>
	);
};
