import { Heading, VStack, Tabs } from "@chakra-ui/react";
import { useAppState } from "../components/state";

const Index = () => {
	const { state } = useAppState();

	return (
		<VStack gap={4} align="center" py={10}>
			<Heading as="h1" size="2xl">
				Run Tools
			</Heading>
			{/* <Box w="100%" maxW="6xl">
				<GarminCsvImporter />
			</Box>
			{state.data && (
				<Box w="100%" maxW="6xl">
					<Tabs.Root defaultValue="home" variant="outline">
						<Tabs.List>
							<Tabs.Trigger value="home">Home</Tabs.Trigger>
							<Tabs.Trigger value="cumulative-distance">
								Cumulative Distance
							</Tabs.Trigger>
							<Tabs.Trigger value="moderate-mondays">
								Moderate Mondays
							</Tabs.Trigger>
						</Tabs.List>
						<Box p={2}>
							<Tabs.Content value="home">
								Imported {state.data.activityCount} activities.
							</Tabs.Content>
							<Tabs.Content value="cumulative-distance">
								<CumulativeDistance />
							</Tabs.Content>
							<Tabs.Content value="moderate-mondays">
								<ModerateMondays />
							</Tabs.Content>
						</Box>
					</Tabs.Root>
				</Box>
			)} */}
		</VStack>
	);
};

export default Index;
