import type { StationType, StationStatus, FilterType } from "./types";

export const typeLabels: Record<StationType, string> = {
  ultrafiltration: "Ультрафільтрація",
  reverse_osmosis: "Зворотний осмос",
  softener: "Пом'якшення",
  iron_removal: "Видалення заліза",
};

export const statusLabels: Record<StationStatus, string> = {
  operational: "Працює",
  maintenance_required: "Потрібне обслуговування",
  emergency_stop: "Аварійна зупинка",
};

export const filterLabels: Record<FilterType, string> = {
  sediment: "Механічний",
  carbon_block: "Вугільний блок",
  membrane: "Мембрана",
  resin: "Смола",
};

export const LOW_RESOURCE_PERCENT = 15;
