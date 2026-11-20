export const STATION_TYPES = ["ultrafiltration", "reverse_osmosis", "softener", "iron_removal"] as const;
export const STATION_STATUSES = ["operational", "maintenance_required", "emergency_stop"] as const;
export const FILTER_TYPES = ["sediment", "carbon_block", "membrane", "resin"] as const;

export type StationType = (typeof STATION_TYPES)[number];
export type StationStatus = (typeof STATION_STATUSES)[number];
export type FilterType = (typeof FILTER_TYPES)[number];

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

export interface Station extends StationInput {
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

export type FieldErrors = Record<string, string>;
