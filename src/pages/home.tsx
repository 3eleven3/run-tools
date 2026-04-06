import { useEffect, useMemo } from "react";
import { Loader } from "@chakra-ui/react";
import { useAppState } from "..//state";
import { CumulativeDistance } from "./cumulative-distance";
import { ModerateMondays } from "./moderate-monday";

const pageTitleMap: Record<string, string> = {
	home: "Run Tools",
	"cumulative-distance": "Cumulative Distance",
	"moderate-monday": "Moderate Mondays",
	"moderate-mondays": "Moderate Mondays",
};

export const Home = () => {
	const { state } = useAppState();

	const title = useMemo(
		() => pageTitleMap[state.page] ?? "Run Tools",
		[state.page],
	);

	useEffect(() => {
		document.title = title;
	}, [title]);

	if (state.page === "") {
		return <Loader />;
	}

	if (state.page === "home") {
		return <>hi</>;
	}

	if (state.page === "cumulative-distance") {
		return <CumulativeDistance />;
	}

	if (state.page === "moderate-monday" || state.page === "moderate-mondays") {
		return <ModerateMondays />;
	}

	return null;
};
