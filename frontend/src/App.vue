<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <header class="header">
    <div class="container header-inner">
      <span class="logo">Диспетчеризація водоочищення</span>
      <nav>
        <RouterLink to="/">Реєстр станцій</RouterLink>
        <RouterLink to="/stations/new">Нова станція</RouterLink>
      </nav>
    </div>
  </header>
  <main class="container">
    <RouterView />
  </main>
</template>
