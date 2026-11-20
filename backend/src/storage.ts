import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { Station, FilterModule } from "./types.js";

const dataDir = join(process.cwd(), "data");
const stationsFile = join(dataDir, "stations.json");
const modulesFile = join(dataDir, "modules.json");

async function readJson<T>(file: string): Promise<T[]> {
  try {
    const text = await readFile(file, "utf-8");
    return JSON.parse(text) as T[];
  } catch {
    return [];
  }
}

async function writeJson(file: string, data: unknown): Promise<void> {
  await mkdir(dataDir, { recursive: true });
  await writeFile(file, JSON.stringify(data, null, 2), "utf-8");
}

export const readStations = () => readJson<Station>(stationsFile);
export const writeStations = (data: Station[]) => writeJson(stationsFile, data);
export const readModules = () => readJson<FilterModule>(modulesFile);
export const writeModules = (data: FilterModule[]) => writeJson(modulesFile, data);
