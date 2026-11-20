<script setup lang="ts">
import type { StationInput, FieldErrors } from "../types";
import { typeLabels, statusLabels } from "../constants";

const form = defineModel<StationInput>({ required: true });

defineProps<{
  errors: FieldErrors;
  saving: boolean;
  submitLabel: string;
}>();

const emit = defineEmits<{
  (e: "submit"): void;
}>();
</script>

<template>
  <form @submit.prevent="emit('submit')">
    <div class="form-grid">
      <div class="field">
        <label for="code">Шифр станції</label>
        <input id="code" v-model="form.code" type="text" placeholder="WS-KYIV-04" />
        <div v-if="errors.code" class="field-error">{{ errors.code }}</div>
      </div>

      <div class="field">
        <label for="title">Назва</label>
        <input id="title" v-model="form.title" type="text" />
        <div v-if="errors.title" class="field-error">{{ errors.title }}</div>
      </div>

      <div class="field">
        <label for="type">Тип станції</label>
        <select id="type" v-model="form.type">
          <option v-for="(label, value) in typeLabels" :key="value" :value="value">{{ label }}</option>
        </select>
        <div v-if="errors.type" class="field-error">{{ errors.type }}</div>
      </div>

      <div class="field">
        <label for="status">Статус</label>
        <select id="status" v-model="form.status">
          <option v-for="(label, value) in statusLabels" :key="value" :value="value">{{ label }}</option>
        </select>
        <div v-if="errors.status" class="field-error">{{ errors.status }}</div>
      </div>

      <div class="field">
        <label for="capacity">Продуктивність, л/год</label>
        <input id="capacity" v-model.number="form.capacityLitersPerHour" type="number" />
        <div v-if="errors.capacityLitersPerHour" class="field-error">{{ errors.capacityLitersPerHour }}</div>
      </div>

      <div class="field">
        <label for="ppm">Цільова мінералізація, ppm</label>
        <input id="ppm" v-model.number="form.targetPpm" type="number" />
        <div v-if="errors.targetPpm" class="field-error">{{ errors.targetPpm }}</div>
      </div>

      <div class="field">
        <label for="date">Дата останнього обслуговування</label>
        <input id="date" v-model="form.lastServiceDate" type="date" />
        <div v-if="errors.lastServiceDate" class="field-error">{{ errors.lastServiceDate }}</div>
      </div>

      <div class="field field-full">
        <label for="notes">Примітки</label>
        <textarea id="notes" v-model="form.notes"></textarea>
        <div v-if="errors.notes" class="field-error">{{ errors.notes }}</div>
      </div>
    </div>

    <div class="actions">
      <button type="submit" :disabled="saving">{{ submitLabel }}</button>
      <slot />
    </div>
  </form>
</template>
