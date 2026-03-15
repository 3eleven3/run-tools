import { Box } from "@chakra-ui/react";
import { useAppState } from "../state";
import type { FC } from "react";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ReferenceLine,
	ResponsiveContainer,
} from "recharts";

const tickInterval = 4;

export const CumulativeDistance: FC = () => {
	const { state } = useAppState();
	const { data: chartData, years } = state.data
		?.filteredCumulativeMilesByYear ?? {
		years: [],
		data: [],
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
		<ResponsiveContainer width="100%" height={340}>
			<LineChart
				data={chartData}
				margin={{ top: 10, right: 24, left: 0, bottom: 10 }}
			>
				<CartesianGrid strokeDasharray="3 3" stroke="#fff" />
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
							return (
								<Box p={2} borderRadius="md">
									<Box fontWeight="bold">Week: {label}</Box>
									{payload.map((entry) => (
										<Box key={entry.name} fontSize="sm">
											{entry.name}: {(Number(entry.value) || 0).toFixed(2)} mi
										</Box>
									))}
								</Box>
							);
						}
						return null;
					}}
				/>
				<ReferenceLine
					y={averageCumulative}
					stroke="#f97316"
					strokeDasharray="4 4"
					strokeOpacity={0.5}
				/>
				{years.map((year, idx) => (
					<Line
						key={year}
						type="monotone"
						dataKey={year}
						stroke={yearColors[idx % yearColors.length]}
						strokeWidth={2}
						dot={{ r: 3, strokeWidth: 0 }}
						activeDot={{ r: 6, fill: "#fff", strokeWidth: 2 }}
					/>
				))}
			</LineChart>
		</ResponsiveContainer>
	);
};
