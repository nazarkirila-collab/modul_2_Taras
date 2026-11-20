import { api } from "./api";
import type {
  WaterStation,
  StationDetails,
  StationInput,
  FilterModule,
  ModuleInput,
} from "../types";

export async function getStations(params: Record<string, string>): Promise<WaterStation[]> {
  const response = await api.get<WaterStation[]>("/stations", { params });
  return response.data;
}

export async function getStation(id: string): Promise<StationDetails> {
  const response = await api.get<StationDetails>(`/stations/${id}`);
  return response.data;
}

export async function createStation(input: StationInput): Promise<WaterStation> {
  const response = await api.post<WaterStation>("/stations", input);
  return response.data;
}

export async function updateStation(id: string, input: StationInput): Promise<WaterStation> {
  const response = await api.put<WaterStation>(`/stations/${id}`, input);
  return response.data;
}

export async function deleteStation(id: string): Promise<void> {
  await api.delete(`/stations/${id}`);
}

export async function addModule(stationId: string, input: ModuleInput): Promise<FilterModule> {
  const response = await api.post<FilterModule>(`/stations/${stationId}/modules`, input);
  return response.data;
}

export async function deleteModule(moduleId: string): Promise<void> {
  await api.delete(`/modules/${moduleId}`);
}
