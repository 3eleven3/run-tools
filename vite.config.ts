import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	// required for github pages
	base: "/run-tools/",
	server: {
		host: "0.0.0.0",
		port: 5000,
		allowedHosts: true,
	},
	build: {
		outDir: "docs",
	},
});
