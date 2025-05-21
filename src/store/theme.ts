import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  // Get initial theme from system preference or localStorage
  const getInitialTheme = (): 'light' | 'dark' => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const theme = ref<'light' | 'dark'>(getInitialTheme());

  // Toggle theme function
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
  };

  // Watch for changes and update localStorage and document
  watch(theme, (newTheme) => {
    localStorage.setItem('theme', newTheme);
    
    // Update document class for styling
    document.documentElement.setAttribute('data-theme', newTheme);
  }, { immediate: true });

  return {
    theme,
    toggleTheme
  };
});