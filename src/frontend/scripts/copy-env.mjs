import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const source = resolve("env.json");
const destination = resolve("dist", "env.json");

mkdirSync(dirname(destination), { recursive: true });
copyFileSync(source, destination);
