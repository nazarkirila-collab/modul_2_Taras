export type StationType = "ultrafiltration" | "reverse_osmosis" | "softener" | "iron_removal";
export type StationStatus = "operational" | "maintenance_required" | "emergency_stop";
export type FilterType = "sediment" | "carbon_block" | "membrane" | "resin";

export interface StationInput {
  code: string;
  title: string;
  type: StationType;
  capacityLitersPerHour: number;
  status: StationStatus;
  lastServiceDate: string;
  targetPpm: number;
  notes: string;
}

export interface WaterStation extends StationInput {
  id: string;
}

export interface ModuleInput {
  serialNumber: string;
  filterType: FilterType;
  pressureDropBar: number;
  resourceRemainingPercent: number;
}

export interface FilterModule extends ModuleInput {
  id: string;
  stationId: string;
}

export interface StationDetails extends WaterStation {
  modules: FilterModule[];
}

export type FieldErrors = Record<string, string>;
