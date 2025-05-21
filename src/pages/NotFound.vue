<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
  <div class="not-found">
    <div class="container">
      <h1 class="error-code">404</h1>
      <h2 class="error-title">Страница не найдена</h2>
      <p class="error-message">
        Кажется, вы пытаетесь найти страницу, которой не существует.
      </p>
      <RouterLink to="/" class="btn btn-primary">Вернуться на главную</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  padding: var(--space-16) 0;
  text-align: center;
}

.error-code {
  font-size: 8rem;
  font-weight: 800;
  color: var(--color-accent);
  margin-bottom: var(--space-4);
  line-height: 1;
}

.error-title {
  font-size: var(--fz-h2);
  margin-bottom: var(--space-4);
}

.error-message {
  font-size: var(--fz-body);
  color: var(--color-text-muted);
  margin-bottom: var(--space-8);
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}
</style>