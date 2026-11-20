<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
  <div class="card empty">
    <h1>404</h1>
    <p>Сторінку або станцію не знайдено.</p>
    <RouterLink to="/" class="btn">До реєстру станцій</RouterLink>
  </div>
</template>
