import { useEffect, useMemo, useState } from "react";
import { Box, Heading, Tabs, VStack, Text, Loader } from "@chakra-ui/react";
import { GarminCsvImporter } from "../components/garmin-csv";
import { useAppState } from "..//state";
import { CumulativeDistance } from "./cumulative-distance";
import { ModerateMondays } from "./moderate-monday";

export const Home = () => {
	const { state } = useAppState();

	if (state.page === "") {
		return <Loader />;
	}

	if (state.page === "home") {
		return <>hi</>;
	}

	if (state.page === "cumulative-distance") {
		return <CumulativeDistance />;
	}

	if (state.page === "moderate-monday") {
		return <ModerateMondays />;
	}
};
