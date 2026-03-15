import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { Provider } from "./components/ui/provider";
import { AppProvider } from "./state";

// biome-ignore lint/style/noNonNullAssertion: it's fine here
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Provider>
			<AppProvider>
				<App />
			</AppProvider>
		</Provider>
	</StrictMode>,
);
