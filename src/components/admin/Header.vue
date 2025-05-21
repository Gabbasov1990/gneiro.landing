<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAdminStore } from '@/store/admin';
import { useThemeStore } from '@/store/theme';
import { prefersReducedMotion } from '@/lib/utils';
import Avatar from 'primevue/avatar';
import Menu from 'primevue/menu';

const route = useRoute();
const adminStore = useAdminStore();
const themeStore = useThemeStore();
const isReducedMotion = prefersReducedMotion();

// Get date and time
const currentDate = new Date().toLocaleDateString('ru-RU', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

// Page title based on route
const pageTitle = computed(() => {
  const routePath = route.path;
  
  if (routePath.includes('/admin/posts')) {
    return 'Управление статьями';
  } else if (routePath.includes('/admin/cases')) {
    return 'Управление кейсами';
  } else if (routePath.includes('/admin/media')) {
    return 'Управление медиа';
  } else if (routePath.includes('/admin/api-keys')) {
    return 'API ключи';
  } else {
    return 'Админ-панель';
  }
});

// User profile menu
const userMenu = ref();
const userMenuItems = ref([
  {
    label: 'Профиль',
    icon: 'pi pi-user',
    command: () => {}
  },
  {
    label: themeStore.theme === 'dark' ? 'Светлая тема' : 'Тёмная тема',
    icon: themeStore.theme === 'dark' ? 'pi pi-sun' : 'pi pi-moon',
    command: () => {
      themeStore.toggleTheme();
    }
  },
  {
    separator: true
  },
  {
    label: 'Выйти',
    icon: 'pi pi-sign-out',
    command: async () => {
      await adminStore.logout();
      window.location.href = '/admin/login';
    }
  }
]);

// Get user's initials
const userInitials = computed(() => {
  if (!adminStore.currentUser?.full_name) {
    return 'U';
  }
  
  return adminStore.currentUser.full_name
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase();
});

// Toggle user menu
const toggleUserMenu = (event: Event) => {
  userMenu.value.toggle(event);
};

// Debug info to console
onMounted(() => {
  console.log('Header component mounted');
  console.log('Current user in header:', adminStore.currentUser);
});
</script>

<template>
  <header class="admin-header">
    <div class="header-content">
      <!-- Title and date -->
      <div class="header-left">
        <h1 class="page-title">{{ pageTitle }}</h1>
        <div class="current-date">{{ currentDate }}</div>
      </div>
      
      <!-- User profile menu -->
      <div class="header-right">
        <div class="user-profile" @click="toggleUserMenu" tabindex="0" role="button" aria-haspopup="true">
          <Avatar v-if="adminStore.currentUser?.avatar_url" :image="adminStore.currentUser.avatar_url" shape="circle" />
          <Avatar v-else :label="userInitials" shape="circle" class="user-avatar" />
          <span class="user-name">{{ adminStore.currentUser?.full_name || adminStore.currentUser?.email }}</span>
          <i class="pi pi-angle-down"></i>
        </div>
        
        <Menu ref="userMenu" id="user-menu" :model="userMenuItems" :popup="true" />
      </div>
    </div>
  </header>
</template>

<style scoped>
.admin-header {
  background-color: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  padding: 16px 24px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.header-left {
  display: flex;
  flex-direction: column;
}

.page-title {
  font-size: 1.75rem;
  margin: 0;
  font-weight: 600;
  color: var(--color-text);
}

.current-date {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.user-profile:hover {
  background-color: var(--color-surface);
}

.user-profile:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.user-avatar {
  background-color: var(--color-accent) !important;
  color: white !important;
}

.user-name {
  font-weight: 500;
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 767px) {
  .admin-header {
    padding: 16px;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .user-name {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .user-profile {
    transition: none;
  }
}
</style>