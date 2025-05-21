<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAdminStore } from '@/store/admin';
import { prefersReducedMotion } from '@/lib/utils';

const router = useRouter();
const route = useRoute();
const adminStore = useAdminStore();
const isReducedMotion = prefersReducedMotion();

// Logo URLs
const lightLogoUrl = 'https://gthmjsohqhfslrxiszeq.supabase.co/storage/v1/object/sign/img/logo%20gneiro.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzExYjA1NGNlLWJkODYtNDU3My04Nzc5LTU4OTg2NjYwNjgzMSJ9.eyJ1cmwiOiJpbWcvbG9nbyBnbmVpcm8uc3ZnIiwiaWF0IjoxNzQ3NjUxOTY0LCJleHAiOjE3NzkxODc5NjR9.wOJagsO2La8JnVXztOv8wLfIOkHT_4yXZze170DVURg';

// Menu items
const menuItems = [
  { 
    label: 'Статьи', 
    icon: 'pi pi-file-edit', 
    to: '/admin/posts',
    description: 'Управление статьями блога' 
  },
  { 
    label: 'Кейсы', 
    icon: 'pi pi-briefcase', 
    to: '/admin/cases',
    description: 'Управление кейсами' 
  },
  { 
    label: 'Медиа', 
    icon: 'pi pi-images', 
    to: '/admin/media',
    description: 'Управление медиа файлами' 
  },
  { 
    label: 'API Ключи', 
    icon: 'pi pi-key', 
    to: '/admin/api-keys',
    description: 'Управление API ключами' 
  }
];

// State
const collapsed = ref(false);
const mobileVisible = ref(false);

// Computed properties
const activePath = computed(() => route.path);

// Toggle sidebar collapse
const toggleCollapse = () => {
  collapsed.value = !collapsed.value;
};

// Toggle mobile sidebar
const toggleMobileSidebar = () => {
  mobileVisible.value = !mobileVisible.value;
};

// Close mobile sidebar
const closeMobileSidebar = () => {
  if (mobileVisible.value) {
    mobileVisible.value = false;
  }
};

// Logout
const handleLogout = async () => {
  await adminStore.logout();
  router.push('/admin/login');
};

// Navigate to website
const goToWebsite = () => {
  window.open('/', '_blank');
};
</script>

<template>
  <div 
    class="sidebar" 
    :class="{ 
      'collapsed': collapsed, 
      'mobile-visible': mobileVisible 
    }"
  >
    <!-- Sidebar header -->
    <div class="sidebar-header">
      <a href="/admin" class="logo-link">
        <img :src="lightLogoUrl" alt="Gneiro" class="logo-image" />
        <span v-if="!collapsed" class="logo-text">Админ</span>
      </a>
      
      <button 
        class="collapse-toggle" 
        @click="toggleCollapse"
        :aria-label="collapsed ? 'Развернуть меню' : 'Свернуть меню'"
      >
        <i :class="collapsed ? 'pi pi-angle-right' : 'pi pi-angle-left'"></i>
      </button>
      
      <button 
        class="mobile-close" 
        @click="closeMobileSidebar"
        aria-label="Закрыть меню"
      >
        <i class="pi pi-times"></i>
      </button>
    </div>
    
    <!-- Main navigation -->
    <nav class="sidebar-nav">
      <ul class="nav-list">
        <li v-for="(item, index) in menuItems" :key="index" class="nav-item">
          <router-link 
            :to="item.to" 
            class="nav-link"
            :class="{ 'active': activePath === item.to }"
            @click="closeMobileSidebar"
            v-tooltip.right="{ value: collapsed ? item.label : null, disabled: isReducedMotion }"
          >
            <i :class="item.icon" class="nav-icon" aria-hidden="true"></i>
            <span v-if="!collapsed" class="nav-label">{{ item.label }}</span>
          </router-link>
        </li>
      </ul>
    </nav>
    
    <!-- Bottom actions -->
    <div class="sidebar-footer">
      <button 
        class="footer-btn website-btn"
        @click="goToWebsite" 
        v-tooltip.right="{ value: collapsed ? 'Перейти на сайт' : null, disabled: isReducedMotion }"
      >
        <i class="pi pi-globe" aria-hidden="true"></i>
        <span v-if="!collapsed" class="btn-label">Перейти на сайт</span>
      </button>
      
      <button 
        class="footer-btn logout-btn"
        @click="handleLogout"
        v-tooltip.right="{ value: collapsed ? 'Выйти' : null, disabled: isReducedMotion }"
      >
        <i class="pi pi-sign-out" aria-hidden="true"></i>
        <span v-if="!collapsed" class="btn-label">Выйти</span>
      </button>
    </div>
  </div>
  
  <!-- Mobile overlay -->
  <div 
    v-if="mobileVisible" 
    class="sidebar-overlay"
    @click="closeMobileSidebar"
    aria-hidden="true"
  ></div>
  
  <!-- Mobile menu button -->
  <button 
    class="mobile-menu-btn"
    @click="toggleMobileSidebar"
    :aria-label="mobileVisible ? 'Закрыть меню' : 'Открыть меню'"
    :aria-expanded="mobileVisible"
  >
    <i class="pi pi-bars"></i>
  </button>
</template>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 260px;
  background-color: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  z-index: 40;
  transition: all 0.3s ease;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar.collapsed {
  width: 64px;
}

/* Sidebar header */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  width: 100%;
  overflow: hidden;
}

.logo-image {
  height: 30px;
  width: auto;
}

.logo-text {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.collapse-toggle {
  background-color: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.collapse-toggle:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--color-text);
}

.collapse-toggle:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.mobile-close {
  display: none;
  background-color: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

/* Sidebar navigation */
.sidebar-nav {
  flex: 1;
  padding: 16px 8px;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin-bottom: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  text-decoration: none;
  color: var(--color-text-muted);
  transition: all 0.2s ease;
  overflow: hidden;
  white-space: nowrap;
}

.nav-link:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--color-text);
}

.nav-link.active {
  background-color: var(--color-accent);
  color: #fff;
}

.nav-icon {
  font-size: 1.25rem;
  width: 24px;
  text-align: center;
}

/* Sidebar footer */
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  background-color: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.footer-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--color-text);
}

.footer-btn:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.website-btn {
  background-color: var(--color-surface);
}

.logout-btn {
  background-color: var(--color-surface);
}

.collapsed .btn-label {
  display: none;
}

/* Mobile styles */
.sidebar-overlay {
  display: none;
}

.mobile-menu-btn {
  display: none;
}

@media (max-width: 991px) {
  .sidebar {
    transform: translateX(-100%);
    width: 260px;
  }
  
  .sidebar.collapsed {
    transform: translateX(-100%);
    width: 260px;
  }
  
  .sidebar.mobile-visible {
    transform: translateX(0);
  }
  
  .collapse-toggle {
    display: none;
  }
  
  .mobile-close {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .sidebar-overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 30;
  }
  
  .mobile-menu-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 16px;
    left: 16px;
    width: 40px;
    height: 40px;
    background-color: var(--color-accent);
    color: white;
    border: none;
    border-radius: 8px;
    z-index: 20;
    cursor: pointer;
  }
  
  .mobile-menu-btn:focus {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sidebar {
    transition: none;
  }
  
  .nav-link {
    transition: none;
  }
  
  .collapse-toggle {
    transition: none;
  }
  
  .footer-btn {
    transition: none;
  }
}

/* Dark theme adjustments */
:root[data-theme='dark'] .sidebar {
  background-color: #1a1e24;
  border-right-color: #31363d;
}

:root[data-theme='dark'] .collapse-toggle:hover,
:root[data-theme='dark'] .footer-btn:hover,
:root[data-theme='dark'] .nav-link:hover {
  background-color: rgba(255, 255, 255, 0.05);
}
</style>