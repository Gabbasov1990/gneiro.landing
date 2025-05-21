<script setup lang="ts">
import { onMounted } from 'vue';
import { useAdminStore } from '@/store/admin';
import Sidebar from '@/components/admin/Sidebar.vue';
import Header from '@/components/admin/Header.vue';
import Toast from '@/components/admin/Toast.vue';
import { prefersReducedMotion } from '@/lib/utils';

const adminStore = useAdminStore();
const isReducedMotion = prefersReducedMotion();

// Fetch current user when component mounts
onMounted(async () => {
  await adminStore.fetchCurrentUser();
});
</script>

<template>
  <div class="admin-dashboard">
    <Toast />
    
    <!-- Sidebar -->
    <Sidebar />
    
    <!-- Main content area -->
    <main class="main-content">
      <!-- Header -->
      <Header />
      
      <!-- Content -->
      <div class="content-wrapper">
        <router-view v-slot="{ Component }">
          <transition 
            name="fade" 
            :duration="isReducedMotion ? 0 : 150"
            mode="out-in"
          >
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<style scoped>
.admin-dashboard {
  display: flex;
  min-height: 100vh;
  background-color: var(--color-bg);
}

.main-content {
  flex: 1;
  margin-left: 260px;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease;
}

.content-wrapper {
  padding: 1.5rem;
  flex: 1;
}

/* Fade transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@media (max-width: 991px) {
  .main-content {
    margin-left: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .main-content {
    transition: none;
  }
  
  .fade-enter-active, .fade-leave-active {
    transition: none;
  }
}
</style>