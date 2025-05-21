<script setup lang="ts">
import { onMounted } from 'vue';
import { useAdminStore } from '@/store/admin';
import MediaManager from '@/components/admin/MediaManager.vue';
import Card from 'primevue/card';

const adminStore = useAdminStore();

onMounted(async () => {
  await adminStore.fetchMediaFiles();
});
</script>

<template>
  <div class="media-page">
    <Card>
      <template #title>
        <h2 class="media-title">Управление медиа файлами</h2>
      </template>
      <template #content>
        <p class="media-description">
          Загружайте, управляйте и используйте медиа файлы в статьях и кейсах. Поддерживаются изображения, PDF и документы.
        </p>
        
        <MediaManager />
      </template>
    </Card>
  </div>
</template>

<style scoped>
.media-page {
  margin-bottom: 2rem;
}

.media-title {
  font-size: 1.5rem;
  margin: 0;
  font-weight: 600;
}

.media-description {
  color: var(--color-text-muted);
  margin-bottom: 1.5rem;
}
</style>