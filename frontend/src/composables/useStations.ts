import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useStationsStore } from "../stores/stations.store";

export function useStations() {
  const route = useRoute();
  const router = useRouter();

  const store = useStationsStore();
  const { stations, isListLoading: isLoading, listError: errorMessage } = storeToRefs(store);

  let timer: ReturnType<typeof setTimeout> | undefined;

  function read(key: string): string {
    const value = route.query[key];
    return typeof value === "string" ? value : "";
  }

  const filters = computed(() => ({
    search: read("search"),
    status: read("status"),
    type: read("type"),
    sortBy: read("sortBy"),
    order: read("order"),
  }));

  const searchText = ref(filters.value.search);
  const hasFilters = computed(() => Object.values(filters.value).some((v) => v !== ""));
  const isEmpty = computed(() => !isLoading.value && !errorMessage.value && stations.value.length === 0);

  function load() {
    const params: Record<string, string> = {};
    for (const [key, value] of Object.entries(filters.value)) {
      if (value) {
        params[key] = value;
      }
    }
    return store.fetchStations(params);
  }

  function updateFilter(key: string, value: string) {
    const query = { ...route.query };
    if (value) {
      query[key] = value;
    } else {
      delete query[key];
    }
    router.replace({ query });
  }

  function resetFilters() {
    clearTimeout(timer);
    searchText.value = "";
    router.replace({ query: {} });
  }

  watch(
    () => route.fullPath,
    () => {
      if (route.name === "stations") {
        load();
      }
    },
    { immediate: true }
  );

  watch(searchText, (value) => {
    clearTimeout(timer);
    timer = setTimeout(() => updateFilter("search", value.trim()), 300);
  });

  watch(
    () => filters.value.search,
    (value) => {
      if (value !== searchText.value.trim()) {
        searchText.value = value;
      }
    }
  );

  onBeforeUnmount(() => clearTimeout(timer));

  return {
    stations,
    isLoading,
    errorMessage,
    isEmpty,
    filters,
    searchText,
    hasFilters,
    updateFilter,
    resetFilters,
    reload: load,
  };
}
