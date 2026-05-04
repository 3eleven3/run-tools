import { Container, Box } from "@chakra-ui/react";
import { ColorModeButton } from "./components/ui/color-mode";
import { getPage } from "./helpers/utils";
import { pageMap } from "./__generated__/pages";

export const App = () => {
	return (
		<Box
			minH="100vh"
			bg={{
				base: "linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 50%, #e0e7ff 100%)",
				_dark: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1e1b4b 100%)",
			}}
		>
			<ColorModeButton position="absolute" top={4} right={4} />
			<Container w="100%" py={{ base: 4, md: 10 }} px={{ base: 2, md: 4 }}>
				{pageMap[getPage()]}
			</Container>
		</Box>
	);
};
