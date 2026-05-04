import { useEffect, useMemo } from "react";
import {
	Box,
	Button,
	ButtonGroup,
	Heading,
	Loader,
	Stack,
	Text,
} from "@chakra-ui/react";
import { useAppState } from "..//state";
import { CumulativeDistance } from "./cumulative-distance";
import { GPXRouteInspector } from "./gpx-route";
import { ModerateMondays } from "./moderate-monday";

const pageTitleMap: Record<string, string> = {
	home: "Run Tools",
	"cumulative-distance": "Cumulative Distance",
	"moderate-monday": "Moderate Mondays",
	"moderate-mondays": "Moderate Mondays",
	"gpx-route": "GPX Route Overlap Inspector",
};

const pageNavigation = [
	{ page: "home", label: "Home" },
	{ page: "cumulative-distance", label: "Cumulative Distance" },
	{ page: "moderate-mondays", label: "Moderate Mondays" },
	{ page: "gpx-route", label: "GPX Route Import" },
];

export const Home = () => {
	const { state, setState } = useAppState();

	const title = useMemo(
		() => pageTitleMap[state.page] ?? "Run Tools",
		[state.page],
	);

	useEffect(() => {
		document.title = title;
	}, [title]);

	const navigateTo = (page: string) => {
		setState((draft) => {
			draft.page = page;
		});
		const params = new URLSearchParams(window.location.search);
		params.set("page", page);
		window.history.replaceState(null, "", `?${params.toString()}`);
	};

	if (state.page === "") {
		return <Loader />;
	}

	return (
		<Stack gap={6} align="center" py={10}>
			<Heading as="h1" size="2xl">
				{title}
			</Heading>
			<Box w="100%" maxW="6xl">
				<ButtonGroup size="sm" isAttached flexWrap="wrap" gap={2}>
					{pageNavigation.map((item) => {
						const isActive =
							item.page === "moderate-mondays"
								? state.page === "moderate-mondays" ||
									state.page === "moderate-monday"
								: state.page === item.page;
						return (
							<Button
								key={item.page}
								onClick={() => navigateTo(item.page)}
								colorScheme={isActive ? "teal" : "gray"}
							>
								{item.label}
							</Button>
						);
					})}
				</ButtonGroup>
			</Box>
			<Box w="100%" maxW="6xl">
				{state.page === "home" && (
					<Stack spacing={4}>
						<Text fontSize="lg">
							Choose a tool to analyze run data or inspect a GPX route for
							self-overlaps.
						</Text>
						<Text>
							Use the GPX Route Import page to upload a GPX file and list
							overlapping coordinates from the route.
						</Text>
					</Stack>
				)}
				{state.page === "cumulative-distance" && <CumulativeDistance />}
				{(state.page === "moderate-mondays" ||
					state.page === "moderate-monday") && <ModerateMondays />}
				{state.page === "gpx-route" && <GPXRouteInspector />}
			</Box>
		</Stack>
	);
};
