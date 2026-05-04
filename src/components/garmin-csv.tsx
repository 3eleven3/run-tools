import { useCallback, useState } from "react";
import { Box, Heading, Text } from "@chakra-ui/react";
import { useAppState } from "./state";
import { Data } from "../classes/data";

const parseCsv = (csvText: string) => {
	// Basic RFC4180-ish parser. Handles quoted fields including escaped quotes.
	const rows: string[][] = [];
	let cur = "";
	let row: string[] = [];
	let inQuotes = false;
	for (let i = 0; i < csvText.length; i += 1) {
		const ch = csvText[i];

		if (inQuotes) {
			if (ch === '"') {
				const next = csvText[i + 1];
				if (next === '"') {
					// escaped quote
					cur += '"';
					i += 1;
				} else {
					inQuotes = false;
				}
			} else {
				cur += ch;
			}
		} else {
			if (ch === '"') {
				inQuotes = true;
			} else if (ch === ",") {
				row.push(cur);
				cur = "";
			} else if (ch === "\r") {
				// ignore
			} else if (ch === "\n") {
				row.push(cur);
				rows.push(row);
				row = [];
				cur = "";
			} else {
				cur += ch;
			}
		}
	}

	// push last value if any
	if (inQuotes) {
		// malformed CSV; return what we have
		row.push(cur);
		rows.push(row);
	} else if (cur !== "" || row.length > 0) {
		row.push(cur);
		rows.push(row);
	}

	if (rows.length === 0) return [];

	const headers = rows[0].map((h) => h.trim());
	return rows.slice(1).map((r) => {
		const obj: Record<string, string> = {};
		r.forEach((cell, idx) => {
			obj[headers[idx] ?? `column_${idx}`] = cell;
		});
		return obj;
	});
};

export const GarminCsvImporter = () => {
	const { setState, state } = useAppState();
	const [error, setError] = useState<string | null>(null);

	const handleFile = useCallback(
		(files: FileList | null) => {
			if (!files || files.length === 0) return;
			const file = files[0];
			const reader = new FileReader();
			reader.onload = () => {
				const text = String(reader.result ?? "");
				try {
					const parsed = parseCsv(text);
					setState((state) => {
						state.data = new Data(parsed);
					});
					setError(null);
				} catch (err) {
					setState((state) => {
						state.data = null;
					});
					setError(String(err));
				}
			};
			reader.onerror = () => {
				setError("Failed to read file");
				setState((state) => {
					state.data = null;
				});
			};
			reader.readAsText(file);
		},
		[setState],
	);

	if (state.data !== null) {
		return null;
	}

	return (
		<Box w="100%" maxW="640px" mx="auto" mt={10}>
			<Heading as="h2" size="lg" mb={4}>
				Garmin Activity CSV Import
			</Heading>
			<Text mb={4}>Upload a Garmin activity CSV export for analysis.</Text>

			<Box mb={4}>
				<Text fontWeight="bold" mb={2}>
					Choose a CSV file
				</Text>
				<input
					accept="text/csv,.csv"
					onChange={(e) => handleFile(e.target.files)}
					type="file"
					style={{
						borderRadius: 4,
						padding: "0.5rem 0.75rem",
						border: "1px solid",
						borderColor: "var(--chakra-colors-gray-200)",
						width: "100%",
					}}
				/>
			</Box>

			{error ? (
				<Text color="red.500" mb={4}>
					{error}
				</Text>
			) : null}
		</Box>
	);
};
