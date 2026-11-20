import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";
import { readStations, writeStations, readModules, writeModules } from "./storage.js";
import { validateStation, validateModule } from "./validation.js";
import type { Station, FilterModule } from "./types.js";

const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(cors());
app.use(express.json());

type Handler = (req: Request, res: Response) => Promise<void>;
const wrap = (fn: Handler) => (req: Request, res: Response, next: NextFunction) => {
  fn(req, res).catch(next);
};

function sendValidationError(res: Response, errors: Record<string, string>) {
  res.status(400).json({ error: "Помилка валідації", errors });
}

function sendNotFound(res: Response, message: string) {
  res.status(404).json({ error: message });
}

app.get(
  "/api/stations",
  wrap(async (req, res) => {
    let stations = await readStations();

    const search = typeof req.query.search === "string" ? req.query.search.trim().toLowerCase() : "";
    const status = typeof req.query.status === "string" ? req.query.status : "";
    const type = typeof req.query.type === "string" ? req.query.type : "";
    const sortBy = req.query.sortBy;
    const dir = req.query.order === "desc" ? -1 : 1;

    if (search) {
      stations = stations.filter(
        (s) => s.title.toLowerCase().includes(search) || s.code.toLowerCase().includes(search)
      );
    }
    if (status) {
      stations = stations.filter((s) => s.status === status);
    }
    if (type) {
      stations = stations.filter((s) => s.type === type);
    }

    if (sortBy === "capacityLitersPerHour" || sortBy === "lastServiceDate" || sortBy === "code") {
      stations.sort((a, b) => {
        const x = a[sortBy];
        const y = b[sortBy];
        if (typeof x === "number" && typeof y === "number") {
          return (x - y) * dir;
        }
        return String(x).localeCompare(String(y)) * dir;
      });
    }

    res.json(stations);
  })
);

app.get(
  "/api/stations/:id",
  wrap(async (req, res) => {
    const stations = await readStations();
    const station = stations.find((s) => s.id === req.params.id);
    if (!station) {
      sendNotFound(res, "Станцію не знайдено");
      return;
    }
    const modules = (await readModules()).filter((m) => m.stationId === station.id);
    res.json({ ...station, modules });
  })
);

app.post(
  "/api/stations",
  wrap(async (req, res) => {
    const stations = await readStations();
    const { errors, value } = validateStation(req.body, stations);
    if (Object.keys(errors).length > 0) {
      sendValidationError(res, errors);
      return;
    }
    const station: Station = { id: randomUUID(), ...value };
    stations.push(station);
    await writeStations(stations);
    res.status(201).json(station);
  })
);

app.put(
  "/api/stations/:id",
  wrap(async (req, res) => {
    const stations = await readStations();
    const index = stations.findIndex((s) => s.id === req.params.id);
    if (index === -1) {
      sendNotFound(res, "Станцію не знайдено");
      return;
    }
    const merged = { ...stations[index], ...req.body };
    const { errors, value } = validateStation(merged, stations, stations[index].id);
    if (Object.keys(errors).length > 0) {
      sendValidationError(res, errors);
      return;
    }
    const updated: Station = { ...value, id: stations[index].id };
    stations[index] = updated;
    await writeStations(stations);
    res.json(updated);
  })
);

app.delete(
  "/api/stations/:id",
  wrap(async (req, res) => {
    const stations = await readStations();
    if (!stations.some((s) => s.id === req.params.id)) {
      sendNotFound(res, "Станцію не знайдено");
      return;
    }
    await writeStations(stations.filter((s) => s.id !== req.params.id));
    const modules = await readModules();
    await writeModules(modules.filter((m) => m.stationId !== req.params.id));
    res.status(204).end();
  })
);

app.post(
  "/api/stations/:id/modules",
  wrap(async (req, res) => {
    const stations = await readStations();
    if (!stations.some((s) => s.id === req.params.id)) {
      sendNotFound(res, "Станцію не знайдено");
      return;
    }
    const { errors, value } = validateModule(req.body);
    if (Object.keys(errors).length > 0) {
      sendValidationError(res, errors);
      return;
    }
    const modules = await readModules();
    const newModule: FilterModule = { id: randomUUID(), stationId: req.params.id, ...value };
    modules.push(newModule);
    await writeModules(modules);
    res.status(201).json(newModule);
  })
);

app.delete(
  "/api/modules/:moduleId",
  wrap(async (req, res) => {
    const modules = await readModules();
    if (!modules.some((m) => m.id === req.params.moduleId)) {
      sendNotFound(res, "Модуль не знайдено");
      return;
    }
    await writeModules(modules.filter((m) => m.id !== req.params.moduleId));
    res.status(204).end();
  })
);

app.use("/api", (_req, res) => {
  sendNotFound(res, "Маршрут не знайдено");
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const status = (err as { status?: number }).status;
  if (status === 400) {
    res.status(400).json({ error: "Некоректний JSON у тілі запиту" });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Внутрішня помилка сервера" });
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
