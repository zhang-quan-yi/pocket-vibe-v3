import "./styles.css";
import { createPocketVibeApp } from "./app/create-pocket-vibe-app";

const appRoot = document.querySelector<HTMLDivElement>("#app");

if (!appRoot) {
  throw new Error("App root not found.");
}

createPocketVibeApp(appRoot);
