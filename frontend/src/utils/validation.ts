import type { StationInput, ModuleInput, FieldErrors } from "../types";

function inRange(value: unknown, min: number, max: number): boolean {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value))) {
    return false;
  }
  return new Date(value).toISOString().slice(0, 10) === value;
}

export function validateStation(form: StationInput): FieldErrors {
  const errors: FieldErrors = {};

  if (!form.code.trim()) {
    errors.code = "Вкажіть шифр станції";
  }
  if (!form.title.trim()) {
    errors.title = "Вкажіть назву";
  }
  if (!inRange(form.capacityLitersPerHour, 100, 50000)) {
    errors.capacityLitersPerHour = "Число від 100 до 50000";
  }
  if (!isValidDate(form.lastServiceDate)) {
    errors.lastServiceDate = "Вкажіть коректну дату";
  }
  if (!inRange(form.targetPpm, 10, 1500)) {
    errors.targetPpm = "Число від 10 до 1500";
  }

  return errors;
}

export function validateModule(form: ModuleInput): FieldErrors {
  const errors: FieldErrors = {};

  if (!form.serialNumber.trim()) {
    errors.serialNumber = "Вкажіть серійний номер";
  }
  if (!inRange(form.pressureDropBar, 0.1, 6)) {
    errors.pressureDropBar = "Від 0.1 до 6.0 бар";
  }
  if (!inRange(form.resourceRemainingPercent, 0, 100)) {
    errors.resourceRemainingPercent = "Від 0 до 100%";
  }

  return errors;
}
