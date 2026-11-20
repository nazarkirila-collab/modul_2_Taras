<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useStations } from "../composables/useStations";
import { statusLabels, typeLabels } from "../constants";

const {
  stations,
  isLoading,
  errorMessage,
  isEmpty,
  filters,
  searchText,
  hasFilters,
  updateFilter,
  resetFilters,
  reload,
} = useStations();

function onSelect(key: string, event: Event) {
  updateFilter(key, (event.target as HTMLSelectElement).value);
}
</script>

<template>
  <div class="page-title">
    <h1>Реєстр станцій</h1>
    <RouterLink to="/stations/new" class="btn">Нова станція</RouterLink>
  </div>

  <div class="toolbar">
    <input v-model="searchText" type="text" placeholder="Пошук за назвою або шифром" />

    <select :value="filters.status" @change="onSelect('status', $event)">
      <option value="">Усі статуси</option>
      <option v-for="(label, value) in statusLabels" :key="value" :value="value">{{ label }}</option>
    </select>

    <select :value="filters.type" @change="onSelect('type', $event)">
      <option value="">Усі типи</option>
      <option v-for="(label, value) in typeLabels" :key="value" :value="value">{{ label }}</option>
    </select>

    <select :value="filters.sortBy" @change="onSelect('sortBy', $event)">
      <option value="">Без сортування</option>
      <option value="code">За шифром</option>
      <option value="capacityLitersPerHour">За продуктивністю</option>
      <option value="lastServiceDate">За датою обслуговування</option>
    </select>

    <select :value="filters.order" @change="onSelect('order', $event)">
      <option value="">За зростанням</option>
      <option value="desc">За спаданням</option>
    </select>

    <button v-if="hasFilters" class="btn-light" type="button" @click="resetFilters">Скинути</button>
  </div>

  <div v-if="errorMessage" class="error-box">
    {{ errorMessage }}
    <button type="button" class="btn-light" @click="reload">Спробувати ще раз</button>
  </div>

  <div v-if="isLoading" class="loading">Завантаження...</div>

  <div v-else-if="isEmpty" class="card empty">
    <span v-if="hasFilters">За вашим запитом станцій не знайдено.</span>
    <span v-else>Станцій поки немає. Додайте першу.</span>
  </div>

  <table v-else-if="stations.length > 0">
    <thead>
      <tr>
        <th>Шифр</th>
        <th>Назва</th>
        <th>Тип</th>
        <th>Продуктивність, л/год</th>
        <th>Статус</th>
        <th>Останнє обслуговування</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="station in stations" :key="station.id">
        <td>
          <RouterLink :to="{ name: 'station-detail', params: { id: station.id } }">{{ station.code }}</RouterLink>
        </td>
        <td>{{ station.title }}</td>
        <td>{{ typeLabels[station.type] }}</td>
        <td>{{ station.capacityLitersPerHour }}</td>
        <td>
          <span class="badge" :class="'status-' + station.status">{{ statusLabels[station.status] }}</span>
        </td>
        <td>{{ station.lastServiceDate }}</td>
      </tr>
    </tbody>
  </table>
</template>
