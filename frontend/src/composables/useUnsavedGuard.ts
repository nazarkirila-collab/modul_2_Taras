import { onBeforeUnmount, onMounted } from "vue";
import { onBeforeRouteLeave } from "vue-router";

export function useUnsavedGuard(isDirty: () => boolean) {
  onBeforeRouteLeave(() => {
    if (isDirty()) {
      return window.confirm("Є незбережені зміни. Дійсно покинути сторінку?");
    }
  });

  function onBeforeUnload(event: BeforeUnloadEvent) {
    if (isDirty()) {
      event.preventDefault();
    }
  }

  onMounted(() => window.addEventListener("beforeunload", onBeforeUnload));
  onBeforeUnmount(() => window.removeEventListener("beforeunload", onBeforeUnload));
}
