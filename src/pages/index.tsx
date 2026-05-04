import { Heading, VStack } from "@chakra-ui/react";
import { useEffect } from "react";

const Index = () => {
	useEffect(() => {
		document.title = "Run Tools";
	}, []);

	return (
		<VStack gap={4} align="center" py={10}>
			<Heading as="h1" size="2xl">
				Run Tools
			</Heading>
		</VStack>
	);
};

export default Index;
