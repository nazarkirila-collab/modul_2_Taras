import { computed, reactive, ref, watch } from "vue";
import type { StationInput, FieldErrors } from "../types";
import { validateStation } from "../utils/validation";

function emptyStation(): StationInput {
  return {
    code: "",
    title: "",
    type: "ultrafiltration",
    capacityLitersPerHour: 1000,
    status: "operational",
    lastServiceDate: new Date().toISOString().slice(0, 10),
    targetPpm: 100,
    notes: "",
  };
}

export function useStationForm() {
  const form = reactive<StationInput>(emptyStation());
  const snapshot = ref(JSON.stringify(form));
  const submitted = ref(false);
  const serverErrors = ref<FieldErrors>({});

  const isDirty = computed(() => JSON.stringify(form) !== snapshot.value);
  const clientErrors = computed(() => validateStation(form));
  const isValid = computed(() => Object.keys(clientErrors.value).length === 0);

  const errors = computed<FieldErrors>(() => {
    if (isDirty.value || submitted.value) {
      return { ...clientErrors.value, ...serverErrors.value };
    }
    return { ...serverErrors.value };
  });

  watch(form, () => {
    serverErrors.value = {};
  });

  function setForm(data: StationInput) {
    Object.assign(form, data);
    snapshot.value = JSON.stringify(form);
    submitted.value = false;
    serverErrors.value = {};
  }

  function markSaved() {
    snapshot.value = JSON.stringify(form);
  }

  function setServerErrors(value: FieldErrors) {
    serverErrors.value = value;
  }

  function toInput(): StationInput {
    return { ...form, code: form.code.trim(), title: form.title.trim(), notes: form.notes.trim() };
  }

  return { form, errors, isDirty, isValid, submitted, setForm, markSaved, setServerErrors, toInput };
}
