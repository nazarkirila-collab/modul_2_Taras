<script setup lang="ts">
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import StationForm from "../components/StationForm.vue";
import { useStationForm } from "../composables/useStationForm";
import { useStation } from "../composables/useStation";
import { useUnsavedGuard } from "../composables/useUnsavedGuard";
import { getErrorMessage, getFieldErrors } from "../utils/errors";

const router = useRouter();
const { form, errors, isDirty, isValid, submitted, markSaved, setServerErrors, toInput } = useStationForm();
const { create } = useStation();

const saving = ref(false);
const generalError = ref("");

useUnsavedGuard(() => isDirty.value);

async function onSubmit() {
  submitted.value = true;
  generalError.value = "";
  if (!isValid.value) {
    return;
  }

  saving.value = true;
  try {
    const created = await create(toInput());
    markSaved();
    await router.push({ name: "station-detail", params: { id: created.id } });
  } catch (e) {
    setServerErrors(getFieldErrors(e));
    generalError.value = getErrorMessage(e);
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <h1>Нова станція</h1>
  <div class="card">
    <div v-if="generalError" class="error-box">{{ generalError }}</div>
    <StationForm v-model="form" :errors="errors" :saving="saving" submit-label="Створити" @submit="onSubmit">
      <RouterLink to="/" class="btn btn-light">Скасувати</RouterLink>
    </StationForm>
  </div>
</template>
