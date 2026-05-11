import { useEffect, type FC } from "react";
import {
	Badge,
	Box,
	Button,
	HStack,
	VStack,
	Text,
	Link,
	Card,
	Table,
} from "@chakra-ui/react";
import { useColorModeValue } from "../components/ui/color-mode";
import {
	LuFastForward,
	LuGuitar,
	LuPizza,
	LuPlay,
	LuShip,
} from "react-icons/lu";

const TableRow: FC<{
	room: string;
	occupants: string[];
}> = (props) => {
	return (
		<Table.Row>
			<Table.Cell verticalAlign="top">
				<b>{props.room}</b>
			</Table.Cell>
			<Table.Cell>
				<VStack alignItems="start">
					{props.occupants.map((occupant) => (
						<Text key={occupant}>{occupant}</Text>
					))}
				</VStack>
			</Table.Cell>
		</Table.Row>
	);
};

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
	useEffect(() => {
		document.title = "Vermont Trip Information";
	}, []);

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
					colorPalette="yellow"
					size="xl"
					variant="surface"
					as="a"
					// @ts-expect-error - we're using it as a link
					href="#room-assignments"
				>
					Room assignments
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
			<Box
				borderColor={useColorModeValue("gray.400", "gray.600")}
				borderWidth={1}
				borderStyle="solid"
				width="80%"
			/>
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
					<Link
						target="_blank"
						href="https://forms.gle/Nw89AfRCaJYaoDdz5"
						fontSize="1rem"
						color={useColorModeValue("blue.600", "blue.300")}
					>
						Breakfast sharing sign-up
					</Link>
				</Card.Body>
			</Card.Root>
			<Box
				borderColor={useColorModeValue("gray.400", "gray.600")}
				borderWidth={1}
				borderStyle="solid"
				width="80%"
			/>
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
						description: "Group hike - 4 hours",
					},
					{
						time: "9 AM",
						icon: <LuFastForward />,
						description: (
							<HStack>
								Trail run - 7.5mi or 15mi
								<Link
									target="_blank"
									href="https://connect.garmin.com/modern/course/458050331"
									fontSize="1rem"
									color={useColorModeValue("blue.600", "blue.300")}
								>
									@ Chittenden Reservoir
								</Link>
							</HStack>
						),
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
						description: (
							<HStack>
								Group road run - 4.7 mi
								<Link
									target="_blank"
									href="https://connect.garmin.com/modern/course/459849807"
									fontSize="1rem"
									color={useColorModeValue("blue.600", "blue.300")}
								>
									@ Pittsford
								</Link>
							</HStack>
						),
					},
					{
						time: "",
						icon: null,
						description: <Text fontSize="1rem">or</Text>,
					},
					{
						time: "8 AM",
						icon: <LuFastForward />,
						description: (
							<HStack>
								Group road run - 6.4 mi
								<Link
									target="_blank"
									href="https://connect.garmin.com/modern/course/459849831"
									fontSize="1rem"
									color={useColorModeValue("blue.600", "blue.300")}
								>
									@ Pittsford
								</Link>
							</HStack>
						),
					},
					{
						time: "",
						icon: null,
						description: <Text fontSize="1rem">or</Text>,
					},
					{
						time: "8 AM",
						icon: <LuFastForward />,
						description: (
							<HStack>
								Group road run - 8.1 mi
								<Link
									target="_blank"
									href="https://connect.garmin.com/modern/course/459849843"
									fontSize="1rem"
									color={useColorModeValue("blue.600", "blue.300")}
								>
									@ Pittsford
								</Link>
							</HStack>
						),
					},
					{
						time: "12 PM",
						icon: <LuShip />,
						description: "Check-out time",
					},
				]}
			/>
			<Box
				borderColor={useColorModeValue("gray.400", "gray.600")}
				borderWidth={1}
				borderStyle="solid"
				width="80%"
			/>
			<Box id="room-assignments">
				<Text fontSize="1.5rem" marginBlockEnd={4} textAlign="center">
					<b>Room assignments</b>
				</Text>
				<Table.Root
					size={"lg"}
					striped
					borderWidth={1}
					borderColor={useColorModeValue("gray.400", "gray.700")}
					minWidth="400px"
				>
					<Table.Body>
						<TableRow room="Room 20" occupants={["Lucy", "Hadley"]} />
						<TableRow room="Room 21" occupants={["Kelly", "Peter"]} />
						<TableRow room="Room 22" occupants={["Jen Murray", "Roman"]} />
						<TableRow room="Room 23" occupants={["Allison"]} />
						<TableRow room="Room 23a" occupants={["Clara"]} />
						<TableRow room="Room 25" occupants={["Rebecca R"]} />
						<TableRow room="Room 26" occupants={["Steve"]} />
						<TableRow room="Room 27" occupants={["Alexandra", "Husband"]} />
						<TableRow room="Room 30" occupants={["Jane"]} />
						<TableRow
							room="Room 31"
							occupants={["Mae", "Gina", "Pat", "Lori"]}
						/>
						<TableRow room="Room 32" occupants={["Trish V"]} />
						<TableRow room="Room 33" occupants={["Cam", "Emma", "Bernard"]} />
						<TableRow
							room="Dorm"
							occupants={["Jennifer Bliss", "Husband", "Child", "Child"]}
						/>
					</Table.Body>
				</Table.Root>
			</Box>
			<Box
				borderColor={useColorModeValue("gray.400", "gray.600")}
				borderWidth={1}
				borderStyle="solid"
				width="80%"
			/>
		</VStack>
	);
};

export default VermontTrip;
