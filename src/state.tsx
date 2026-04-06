import { createContext, useContext, useEffect } from "react";
import type { AppState, FCWithChildren } from "./types";
import { type Updater, useImmer } from "use-immer";
import { events } from "./events";
import { useMediaQuery } from "usehooks-ts";

const defaultState: AppState = {
	events,
	isMobile: false,
	data: null,
	page: "",
};

const AppContext = createContext<{
	state: AppState;
	setState: Updater<AppState>;
}>({
	state: defaultState,
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	setState: () => {},
});

export const AppProvider: FCWithChildren = (props) => {
	const [state, setState] = useImmer<AppState>(defaultState);

	const isMobile = useMediaQuery("(max-width: 768px)");

	useEffect(() => {
		setState((draft) => {
			draft.isMobile = isMobile;
		});
	}, [isMobile, setState]);

	// update the page to the query param on load
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const page = params.get("page") ?? "home";
		setState((draft) => {
			draft.page = page;
		});
	}, [setState]);

	return (
		<AppContext.Provider value={{ state, setState }}>
			{props.children}
		</AppContext.Provider>
	);
};

export const useAppState = () => useContext(AppContext);
