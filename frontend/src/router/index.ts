import { createRouter, createWebHistory } from "vue-router";
import StationListView from "../views/StationListView.vue";
import StationCreateView from "../views/StationCreateView.vue";
import StationDetailView from "../views/StationDetailView.vue";
import NotFoundView from "../views/NotFoundView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "stations", component: StationListView, alias: "/stations" },
    { path: "/stations/new", name: "station-new", component: StationCreateView },
    { path: "/stations/:id", name: "station-detail", component: StationDetailView },
    { path: "/:pathMatch(.*)*", name: "not-found", component: NotFoundView },
  ],
});

export default router;
