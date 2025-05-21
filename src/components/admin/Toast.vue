<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useAdminStore } from '@/store/admin';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

const adminStore = useAdminStore();
const toast = useToast();

// Display toast notifications when notifications change
watch(
  () => adminStore.notifications, 
  (notifications) => {
    // Display each notification as a toast
    notifications.forEach(notification => {
      toast.add({
        severity: notification.type,
        summary: notification.message,
        detail: notification.detail,
        life: notification.timeout || 5000
      });
    });
    
    // Clear notifications after displaying them
    adminStore.notifications.forEach(notification => {
      adminStore.removeNotification(notification.id);
    });
  }, 
  { deep: true }
);
</script>

<template>
  <Toast position="top-right" />
</template>