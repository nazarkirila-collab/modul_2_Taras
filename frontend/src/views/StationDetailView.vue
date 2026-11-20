<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import StationForm from "../components/StationForm.vue";
import NotFoundView from "./NotFoundView.vue";
import { useStation } from "../composables/useStation";
import { useStationForm } from "../composables/useStationForm";
import { useUnsavedGuard } from "../composables/useUnsavedGuard";
import { typeLabels, statusLabels, filterLabels } from "../constants";
import type { ModuleInput, FieldErrors } from "../types";
import { validateModule } from "../utils/validation";
import { getErrorMessage, getFieldErrors } from "../utils/errors";

const route = useRoute();
const router = useRouter();

const { station, isLoading, errorMessage, notFound, lowResourceModules, load, save, remove, addModule, removeModule } =
  useStation();
const { form, errors, isDirty, isValid, submitted, setForm, markSaved, setServerErrors, toInput } = useStationForm();

const isEditing = ref(false);
const saving = ref(false);
const actionError = ref("");

const moduleForm = reactive<ModuleInput>({
  serialNumber: "",
  filterType: "sediment",
  pressureDropBar: 1,
  resourceRemainingPercent: 100,
});
const moduleSubmitted = ref(false);
const moduleErrors = computed<FieldErrors>(() => (moduleSubmitted.value ? validateModule(moduleForm) : {}));

useUnsavedGuard(() => isEditing.value && isDirty.value);

watch(
  () => route.params.id,
  (id) => {
    if (typeof id === "string") {
      isEditing.value = false;
      load(id);
    }
  },
  { immediate: true }
);

function startEdit() {
  if (!station.value) {
    return;
  }
  const { code, title, type, capacityLitersPerHour, status, lastServiceDate, targetPpm, notes } = station.value;
  setForm({ code, title, type, capacityLitersPerHour, status, lastServiceDate, targetPpm, notes: notes ?? "" });
  actionError.value = "";
  isEditing.value = true;
}

function cancelEdit() {
  if (isDirty.value && !window.confirm("Є незбережені зміни. Скасувати редагування?")) {
    return;
  }
  isEditing.value = false;
}

async function onSave() {
  if (!station.value) {
    return;
  }
  submitted.value = true;
  actionError.value = "";
  if (!isValid.value) {
    return;
  }

  saving.value = true;
  try {
    await save(station.value.id, toInput());
    markSaved();
    isEditing.value = false;
  } catch (e) {
    setServerErrors(getFieldErrors(e));
    actionError.value = getErrorMessage(e);
  } finally {
    saving.value = false;
  }
}

async function onDelete() {
  if (!station.value || !window.confirm("Видалити станцію разом з усіма модулями?")) {
    return;
  }
  actionError.value = "";
  try {
    await remove(station.value.id);
    isEditing.value = false;
    await router.push("/");
  } catch (e) {
    actionError.value = getErrorMessage(e);
  }
}

async function onAddModule() {
  if (!station.value) {
    return;
  }
  moduleSubmitted.value = true;
  actionError.value = "";
  if (Object.keys(validateModule(moduleForm)).length > 0) {
    return;
  }
  try {
    await addModule(station.value.id, { ...moduleForm, serialNumber: moduleForm.serialNumber.trim() });
    moduleForm.serialNumber = "";
    moduleForm.filterType = "sediment";
    moduleForm.pressureDropBar = 1;
    moduleForm.resourceRemainingPercent = 100;
    moduleSubmitted.value = false;
  } catch (e) {
    const fieldErrors = getFieldErrors(e);
    actionError.value = Object.values(fieldErrors).join(". ") || getErrorMessage(e);
  }
}

async function onRemoveModule(moduleId: string) {
  if (!station.value || !window.confirm("Списати цей модуль?")) {
    return;
  }
  actionError.value = "";
  try {
    await removeModule(station.value.id, moduleId);
  } catch (e) {
    actionError.value = getErrorMessage(e);
  }
}
</script>

<template>
  <NotFoundView v-if="notFound" />

  <div v-else-if="isLoading" class="loading">Завантаження...</div>

  <div v-else-if="errorMessage" class="error-box">
    {{ errorMessage }}
    <RouterLink to="/">До реєстру</RouterLink>
  </div>

  <template v-else-if="station">
    <div class="page-title">
      <h1>{{ station.code }} - {{ station.title }}</h1>
      <RouterLink to="/" class="btn btn-light">До реєстру</RouterLink>
    </div>

    <div v-if="actionError" class="error-box">{{ actionError }}</div>

    <div v-if="lowResourceModules.length > 0" class="warning">
      Увага: низький залишковий ресурс (менше 15%) у модулів:
      <span v-for="(m, index) in lowResourceModules" :key="m.id">
        {{ m.serialNumber }} ({{ m.resourceRemainingPercent }}%)<span v-if="index < lowResourceModules.length - 1">, </span>
      </span>
    </div>

    <div class="card">
      <h2>Паспорт станції</h2>

      <StationForm
        v-if="isEditing"
        v-model="form"
        :errors="errors"
        :saving="saving"
        submit-label="Зберегти"
        @submit="onSave"
      >
        <button type="button" class="btn-light" @click="cancelEdit">Скасувати</button>
      </StationForm>

      <template v-else>
        <dl class="passport">
          <dt>Тип станції</dt>
          <dd>{{ typeLabels[station.type] }}</dd>
          <dt>Статус</dt>
          <dd>
            <span class="badge" :class="'status-' + station.status">{{ statusLabels[station.status] }}</span>
          </dd>
          <dt>Продуктивність</dt>
          <dd>{{ station.capacityLitersPerHour }} л/год</dd>
          <dt>Цільова мінералізація</dt>
          <dd>{{ station.targetPpm }} ppm</dd>
          <dt>Останнє обслуговування</dt>
          <dd>{{ station.lastServiceDate }}</dd>
          <dt>Примітки</dt>
          <dd>{{ station.notes || "-" }}</dd>
        </dl>
        <div class="actions">
          <button type="button" @click="startEdit">Редагувати</button>
          <button type="button" class="btn-danger" @click="onDelete">Видалити станцію</button>
        </div>
      </template>
    </div>

    <div class="card">
      <h2>Фільтраційні модулі</h2>

      <p v-if="station.modules.length === 0" class="empty">Модулів поки немає.</p>

      <table v-else>
        <thead>
          <tr>
            <th>Серійний номер</th>
            <th>Тип</th>
            <th>Перепад тиску, бар</th>
            <th>Залишковий ресурс</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in station.modules" :key="m.id">
            <td>{{ m.serialNumber }}</td>
            <td>{{ filterLabels[m.filterType] }}</td>
            <td>{{ m.pressureDropBar }}</td>
            <td>{{ m.resourceRemainingPercent }}%</td>
            <td>
              <button type="button" class="btn-danger" @click="onRemoveModule(m.id)">Списати</button>
            </td>
          </tr>
        </tbody>
      </table>

      <form class="module-form" @submit.prevent="onAddModule">
        <div class="field">
          <input v-model="moduleForm.serialNumber" type="text" placeholder="Серійний номер" />
          <div v-if="moduleErrors.serialNumber" class="field-error">{{ moduleErrors.serialNumber }}</div>
        </div>
        <div class="field">
          <select v-model="moduleForm.filterType">
            <option v-for="(label, value) in filterLabels" :key="value" :value="value">{{ label }}</option>
          </select>
        </div>
        <div class="field">
          <input v-model.number="moduleForm.pressureDropBar" type="number" step="0.1" placeholder="Тиск, бар" />
          <div v-if="moduleErrors.pressureDropBar" class="field-error">{{ moduleErrors.pressureDropBar }}</div>
        </div>
        <div class="field">
          <input v-model.number="moduleForm.resourceRemainingPercent" type="number" placeholder="Ресурс, %" />
          <div v-if="moduleErrors.resourceRemainingPercent" class="field-error">
            {{ moduleErrors.resourceRemainingPercent }}
          </div>
        </div>
        <button type="submit">Додати модуль</button>
      </form>
    </div>
  </template>
</template>
