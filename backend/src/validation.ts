import {
  STATION_TYPES,
  STATION_STATUSES,
  FILTER_TYPES,
  type Station,
  type StationInput,
  type ModuleInput,
  type FieldErrors,
} from "./types.js";

function isOneOf(list: readonly string[], value: unknown): boolean {
  return typeof value === "string" && list.includes(value);
}

function isNumberInRange(value: unknown, min: number, max: number): boolean {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

function isValidDate(value: unknown): boolean {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  if (Number.isNaN(Date.parse(value))) {
    return false;
  }
  return new Date(value).toISOString().slice(0, 10) === value;
}

export function validateStation(body: unknown, stations: Station[], selfId?: string) {
  const b = (body ?? {}) as Record<string, unknown>;
  const errors: FieldErrors = {};

  const code = typeof b.code === "string" ? b.code.trim() : "";
  const title = typeof b.title === "string" ? b.title.trim() : "";

  if (!code) {
    errors.code = "Шифр станції обов'язковий";
  } else if (stations.some((s) => s.id !== selfId && s.code.toLowerCase() === code.toLowerCase())) {
    errors.code = "Станція з таким шифром вже існує";
  }

  if (!title) {
    errors.title = "Назва не може бути порожньою";
  }

  if (!isOneOf(STATION_TYPES, b.type)) {
    errors.type = "Недопустимий тип станції";
  }

  if (!isNumberInRange(b.capacityLitersPerHour, 100, 50000)) {
    errors.capacityLitersPerHour = "Продуктивність має бути числом від 100 до 50000";
  }

  if (!isOneOf(STATION_STATUSES, b.status)) {
    errors.status = "Недопустимий статус";
  }

  if (!isValidDate(b.lastServiceDate)) {
    errors.lastServiceDate = "Дата має бути у форматі YYYY-MM-DD";
  }

  if (!isNumberInRange(b.targetPpm, 10, 1500)) {
    errors.targetPpm = "Мінералізація має бути числом від 10 до 1500";
  }

  if (b.notes !== undefined && b.notes !== null && typeof b.notes !== "string") {
    errors.notes = "Примітки мають бути рядком";
  }

  const value = {
    code,
    title,
    type: b.type,
    capacityLitersPerHour: b.capacityLitersPerHour,
    status: b.status,
    lastServiceDate: b.lastServiceDate,
    targetPpm: b.targetPpm,
    notes: typeof b.notes === "string" ? b.notes.trim() : "",
  } as StationInput;

  return { errors, value };
}

export function validateModule(body: unknown) {
  const b = (body ?? {}) as Record<string, unknown>;
  const errors: FieldErrors = {};

  const serialNumber = typeof b.serialNumber === "string" ? b.serialNumber.trim() : "";

  if (!serialNumber) {
    errors.serialNumber = "Серійний номер обов'язковий";
  }

  if (!isOneOf(FILTER_TYPES, b.filterType)) {
    errors.filterType = "Недопустимий тип фільтра";
  }

  if (!isNumberInRange(b.pressureDropBar, 0.1, 6)) {
    errors.pressureDropBar = "Перепад тиску має бути від 0.1 до 6.0 бар";
  }

  if (!isNumberInRange(b.resourceRemainingPercent, 0, 100)) {
    errors.resourceRemainingPercent = "Залишковий ресурс має бути від 0 до 100%";
  }

  const value = {
    serialNumber,
    filterType: b.filterType,
    pressureDropBar: b.pressureDropBar,
    resourceRemainingPercent: b.resourceRemainingPercent,
  } as ModuleInput;

  return { errors, value };
}
