import { Box, Button, HStack, Text } from "@chakra-ui/react";
import { useAppState } from "../state";
import type { FC } from "react";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";

const tickInterval = 4;

export const CumulativeDistance: FC = () => {
	const { state, setState } = useAppState();
	const { data: chartData, years } = state.data
		?.filteredCumulativeMilesByYear ?? {
		years: [],
		data: [],
	};

	const allYears = state.data
		? Object.keys(state.data.activityYears).sort()
		: [];
	const activeYears = state.data?.filters.years ?? allYears;

	const toggleYear = (year: string) => {
		setState((draft) => {
			if (!draft.data) return;
			const all = Object.keys(draft.data.activityYears).sort();
			const current = draft.data.filters.years;
			if (!current) {
				// all currently selected; remove the clicked one
				draft.data.filters.years = all.filter((y) => y !== year);
				return;
			}
			const isSelected = current.includes(year);
			if (isSelected) {
				const next = current.filter((y) => y !== year);
				draft.data.filters.years = next.length === 0 ? null : next;
			} else {
				draft.data.filters.years = [...current, year].sort();
			}
		});
	};

	const resetFilters = () => {
		setState((draft) => {
			if (!draft.data) return;
			draft.data.filters.years = null;
		});
	};

	const yearColors = [
		"#f97316",
		"#22c55e",
		"#38bdf8",
		"#a855f7",
		"#fb7185",
		"#22c55e",
	];

	const latestWeek = chartData[chartData.length - 1];
	const averageCumulative =
		years.length > 0 && latestWeek
			? (() => {
					let sum = 0;
					let count = 0;
					years.forEach((year) => {
						const value = latestWeek[year];
						if (value !== null && value !== undefined) {
							const num = Number(value);
							if (!Number.isNaN(num)) {
								sum += num;
								count += 1;
							}
						}
					});
					return count > 0 ? sum / count : 0;
				})()
			: 0;

	return (
		<Box w="100%">
			<HStack gap={2} mb={4} w="100%" flexWrap="wrap">
				<Text color="white" fontSize="sm" fontWeight="bold">
					Years:
				</Text>
				{allYears.map((year, idx) => {
					const isActive = activeYears.includes(year);
					return (
						<Button
							key={year}
							size="xs"
							variant={isActive ? "solid" : "outline"}
							colorScheme={isActive ? "teal" : "gray"}
							onClick={() => toggleYear(year)}
						>
							{year}
						</Button>
					);
				})}
				<Button size="xs" onClick={resetFilters} ml="auto">
					Reset
				</Button>
			</HStack>
			<ResponsiveContainer width="100%" height={340}>
				<LineChart
					data={chartData}
					margin={{ top: 10, right: 24, left: 0, bottom: 10 }}
				>
					<CartesianGrid strokeDasharray="3 3" stroke="#fff" opacity={0.2} />
					<XAxis
						dataKey="week"
						tick={{ fill: "#fff", fontSize: 11 }}
						interval={tickInterval}
						tickFormatter={(v) => String(v)}
						axisLine={{ stroke: "#fff" }}
						tickLine={false}
					/>
					<YAxis
						tick={{ fill: "#fff", fontSize: 11 }}
						axisLine={false}
						tickLine={false}
						tickFormatter={(v) => `${v}mi`}
					/>
					<Tooltip
						content={({ active, payload, label }) => {
							if (active && payload && payload.length > 0) {
								const entry = payload[0];
								return (
									<Box p={2} borderRadius="md">
										<Box fontWeight="bold">Week: {label}</Box>
										<Box fontSize="sm">
											{entry.name}: {(Number(entry.value) || 0).toFixed(2)} mi
										</Box>
									</Box>
								);
							}
							return null;
						}}
					/>
					{years.map((year, idx) => (
						<Line
							key={year}
							type="monotone"
							dataKey={year}
							stroke={yearColors[idx % yearColors.length]}
							strokeWidth={2}
							dot={false}
							activeDot={{ r: 6, fill: "#fff", strokeWidth: 2 }}
						/>
					))}
				</LineChart>
			</ResponsiveContainer>
		</Box>
	);
};
