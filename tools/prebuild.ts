// create a type with all the available pages in the src/pages directory
// also create an array for validating
// also build an object that maps the page name to the JSX

import { glob } from "glob";
import { writeFileSync } from "node:fs";

const firstLetterToUpperCase = (str: string) =>
	str.charAt(0).toUpperCase() + str.slice(1);

const pages = glob.sync("src/pages/**/*.tsx").map((path) => {
	const name = path.replace("src/pages/", "").replace(".tsx", "");

	return {
		path,
		cleanPath: path.replace("src/", "").replace(".tsx", ""),
		name,
		importName: firstLetterToUpperCase(name.replace(/-/g, "")),
	};
});

const importString = pages
	.map((page) => `import ${page.importName} from "../${page.cleanPath}";`)
	.join("\n");

// write a type to src/__generated__/pages.ts
writeFileSync(
	"src/__generated__/pages.tsx",
	`import type { JSX } from "react";

${importString}
	
export const pages = [${pages.map((page) => `"${page.name}"`).join(", ")}] as const;

export type Page = typeof pages[number];

export const pageMap: Record<Page, JSX.Element> = {
	${pages.map((page) => `"${page.name}": <${page.importName} />,`).join("\n\t")}
};
`,
);
