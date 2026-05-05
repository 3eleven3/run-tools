import type { FC } from "react";
import {
	Badge,
	Box,
	Button,
	HStack,
	VStack,
	Text,
	Link,
	Card,
	Heading,
} from "@chakra-ui/react";
import { useColorModeValue } from "../components/ui/color-mode";
import {
	LuFastForward,
	LuGuitar,
	LuPizza,
	LuPlay,
	LuShip,
} from "react-icons/lu";

const Day: FC<{
	title: string;
	events: Array<{
		time: string | undefined;
		icon: React.ReactNode | undefined;
		description: string | undefined | React.ReactNode;
	}>;
}> = (props) => {
	return (
		<Box>
			<Text
				style={{
					textAlign: "center",
					fontSize: "1.3rem",
					padding: "0.25em",
					borderRadius: "4px",
				}}
				backgroundColor={useColorModeValue("white", "gray.800")}
				outline={`2px solid ${useColorModeValue("black", "white")}`}
			>
				{props.title}
			</Text>
			<table
				style={{
					borderCollapse: "separate",
					borderSpacing: "1em",
					fontSize: "1.2rem",
				}}
			>
				<tbody>
					{props.events.map((event, index) => (
						<tr key={`${event.time}-${index}`}>
							<td>
								{event.time && (
									<Badge size="lg" colorPalette="purple">
										{event.time}
									</Badge>
								)}
							</td>
							<td>{event.icon}</td>
							<td>
								<Text>{event.description}</Text>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</Box>
	);
};

const VermontTrip: FC = () => {
	return (
		<VStack gap={8}>
			<Box fontSize={"4xl"} fontWeight={"bold"} fontFamily={"heading"}>
				Vermont Trip Information
			</Box>
			<HStack gap={8} wrap="wrap" justify="center">
				<Button
					colorPalette="green"
					variant="surface"
					size="xl"
					as="a"
					// @ts-expect-error - we're using it as a link
					href="https://maps.app.goo.gl/LMSGJK3euZ2EBFX39"
					target="_blank"
				>
					Directions
				</Button>
				<Button
					colorPalette="red"
					size="xl"
					variant="surface"
					as="a"
					// @ts-expect-error - we're using it as a link
					href="tel:845-768-2312"
				>
					Questions?
				</Button>
			</HStack>
			<Card.Root size="sm" maxWidth={"600px"}>
				<Card.Body color="fg.muted">
					Remember to check the group chat for any last minute updates or
					changes to the schedule.
					<br />
					<br />
					The schedule is just the organized activities that we've planned.
					You're welcome to deviate or make your own plans as you see fit. The
					house has a shared kitchen if you want to make your own meals, and
					there are plenty of great restaurants in the area.
					<br />
					<br />
					For breakfast, feel free to bring something to share like coffee cake,
					muffins, bagels, beverages, quiche, etc or make your own in the shared
					kitchen. We'll organize coffee but please bring cream/sugar if you
					need it.
				</Card.Body>
			</Card.Root>
			<Day
				title="Thursday - May 14th"
				events={[
					{
						time: "4 PM",
						icon: <LuShip />,
						description: "Thursday check-in",
					},
				]}
			/>
			<Day
				title="Friday - May 15th"
				events={[
					{
						time: "Anytime",
						icon: <LuShip />,
						description: "Friday check-in",
					},
					{
						time: "6 PM",
						icon: <LuFastForward />,
						description: "Group run - 5 miles - Route TBD",
					},
					{
						time: "",
						icon: null,
						description: <Text fontSize="1rem">or</Text>,
					},
					{
						time: "",
						icon: <LuPlay />,
						description: "Group walk - 3 miles - Route TBD",
					},
					{
						time: "7 PM",
						icon: <LuPizza />,
						description: (
							<HStack>
								Potluck Dinner + Grilling
								<Link
									target="_blank"
									href="https://forms.gle/YwihMgQRhuehukCa7"
									fontSize="1rem"
									color={useColorModeValue("blue.600", "blue.300")}
								>
									Sign up to bring something
								</Link>
							</HStack>
						),
					},
				]}
			/>
			<Day
				title="Saturday - May 16th"
				events={[
					{
						time: "8 AM",
						icon: <LuPlay />,
						description: "Group hike - ??? miles - Route TBD",
					},
					{
						time: "9 AM",
						icon: <LuFastForward />,
						description: "Trail run - ??? miles - Route TBD",
					},
					{
						time: "4 PM",
						icon: <LuGuitar />,
						description: (
							<HStack>
								Live music
								<Link
									target="_blank"
									href="https://maps.app.goo.gl/BpZ3Xn3rUFcnLsk27"
									fontSize="1rem"
									color={useColorModeValue("blue.600", "blue.300")}
								>
									@ Red Clover Ale
								</Link>
							</HStack>
						),
					},
				]}
			/>
			<Day
				title="Sunday - May 17th"
				events={[
					{
						time: "8 AM",
						icon: <LuFastForward />,
						description: "Group road run - 6 miles - Route TBD",
					},
				]}
			/>
		</VStack>
	);
};

export default VermontTrip;
