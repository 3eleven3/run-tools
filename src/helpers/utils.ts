import { type Page, pages } from "../__generated__/pages";

export const kmToMiles = (km: number) => {
	return km * 0.621371;
};

// get the path we're rendering from data-page param in the root element (or in dev from the actual path)
export const getPage = (): Page => {
	let unsafePage = "";

	if (
		(
			import.meta as unknown as {
				env: {
					DEV: boolean;
				};
			}
		).env.DEV
	) {
		const path = window.location.pathname;
		unsafePage = path === "/" ? "index" : path.slice(1);
	} else {
		unsafePage =
			document.querySelector("#root")?.getAttribute("data-page") ?? "index";
	}

	if (pages.includes(unsafePage as Page)) {
		return unsafePage as Page;
	}

	return "index";
};
