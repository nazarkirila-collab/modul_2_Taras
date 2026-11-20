import { computed, ref } from "vue";
import { defineStore } from "pinia";
import type { WaterStation, StationDetails, StationInput, ModuleInput } from "../types";
import * as stationService from "../services/stationService";
import { getErrorMessage, isNotFound } from "../utils/errors";
import { LOW_RESOURCE_PERCENT } from "../constants";

export const useStationsStore = defineStore("stations", () => {
  const _stations = ref<WaterStation[]>([]);
  const _isListLoading = ref(false);
  const _listError = ref("");

  const _current = ref<StationDetails | null>(null);
  const _isDetailLoading = ref(false);
  const _detailError = ref("");
  const _notFound = ref(false);

  let listRequestId = 0;

  const stations = computed(() => _stations.value);
  const isListLoading = computed(() => _isListLoading.value);
  const listError = computed(() => _listError.value);

  const current = computed(() => _current.value);
  const isDetailLoading = computed(() => _isDetailLoading.value);
  const detailError = computed(() => _detailError.value);
  const notFound = computed(() => _notFound.value);

  const lowResourceModules = computed(() =>
    (_current.value?.modules ?? []).filter((m) => m.resourceRemainingPercent < LOW_RESOURCE_PERCENT)
  );

  async function fetchStations(params: Record<string, string>) {
    const id = ++listRequestId;
    _isListLoading.value = true;
    _listError.value = "";
    try {
      const data = await stationService.getStations(params);
      if (id === listRequestId) {
        _stations.value = data;
      }
    } catch (e) {
      if (id === listRequestId) {
        _stations.value = [];
        _listError.value = getErrorMessage(e);
      }
    } finally {
      if (id === listRequestId) {
        _isListLoading.value = false;
      }
    }
  }

  async function fetchStation(id: string) {
    _isDetailLoading.value = true;
    _detailError.value = "";
    _notFound.value = false;
    _current.value = null;
    try {
      _current.value = await stationService.getStation(id);
    } catch (e) {
      if (isNotFound(e)) {
        _notFound.value = true;
      } else {
        _detailError.value = getErrorMessage(e);
      }
    } finally {
      _isDetailLoading.value = false;
    }
  }

  async function refreshStation(id: string) {
    _current.value = await stationService.getStation(id);
  }

  async function createStation(input: StationInput): Promise<WaterStation> {
    return stationService.createStation(input);
  }

  async function updateStation(id: string, input: StationInput) {
    await stationService.updateStation(id, input);
    await refreshStation(id);
  }

  async function deleteStation(id: string) {
    await stationService.deleteStation(id);
    _current.value = null;
  }

  async function addModule(stationId: string, input: ModuleInput) {
    await stationService.addModule(stationId, input);
    await refreshStation(stationId);
  }

  async function removeModule(stationId: string, moduleId: string) {
    await stationService.deleteModule(moduleId);
    await refreshStation(stationId);
  }

  return {
    stations,
    isListLoading,
    listError,
    current,
    isDetailLoading,
    detailError,
    notFound,
    lowResourceModules,
    fetchStations,
    fetchStation,
    createStation,
    updateStation,
    deleteStation,
    addModule,
    removeModule,
  };
});
