import { storeToRefs } from "pinia";
import { useStationsStore } from "../stores/stations.store";

export function useStation() {
  const store = useStationsStore();
  const { current, isDetailLoading, detailError, notFound, lowResourceModules } = storeToRefs(store);

  return {
    station: current,
    isLoading: isDetailLoading,
    errorMessage: detailError,
    notFound,
    lowResourceModules,
    load: store.fetchStation,
    create: store.createStation,
    save: store.updateStation,
    remove: store.deleteStation,
    addModule: store.addModule,
    removeModule: store.removeModule,
  };
}
