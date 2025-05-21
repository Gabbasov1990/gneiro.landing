<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { supabase } from '@/lib/supabase';
import { useIntersectionObserver } from '@vueuse/core';

interface CaseMetric {
  label: string;
  desc: string;
}

interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  hero_image: string;
  owner_name: string;
  owner_photo: string;
  metrics: CaseMetric[];
  views: number;
  published_at: string;
}

const caseStudies = ref<CaseStudy[]>([]);
const loading = ref(true);
const initialLoading = ref(true);
const error = ref<string | null>(null);
const hasMore = ref(true);
const currentPage = ref(0);
const pageSize = 9;
const loadMoreRef = ref<HTMLElement | null>(null);
const sortOrder = ref<'popular' | 'newest'>('popular');
const prefersReducedMotion = ref(false);

// Fetch case studies with pagination
const fetchCaseStudies = async (reset = false) => {
  try {
    // If reset is true, clear existing data and start from the first page
    if (reset) {
      caseStudies.value = [];
      currentPage.value = 0;
      hasMore.value = true;
      initialLoading.value = true;
    }

    // Don't fetch if there are no more items to load
    if (!hasMore.value && !reset) return;

    loading.value = true;
    
    // Build the query based on the sort order
    let query = supabase
      .from('cases')
      .select('*');
    
    if (sortOrder.value === 'popular') {
      query = query.order('views', { ascending: false });
    } else {
      query = query.order('published_at', { ascending: false });
    }
    
    query = query
      .range(currentPage.value * pageSize, (currentPage.value + 1) * pageSize - 1);
    
    const { data, error: err } = await query;
    
    if (err) throw new Error(err.message);
    
    if (data) {
      // Check if we've reached the end of the data
      if (data.length < pageSize) {
        hasMore.value = false;
      }
      
      // Add the new case studies to the list
      caseStudies.value = [...caseStudies.value, ...data.map(item => ({
        ...item,
        metrics: item.metrics as CaseMetric[]
      }))];
      
      // Increment the page counter
      currentPage.value += 1;
    }
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = 'Произошла ошибка при загрузке кейсов';
    }
    console.error('Error fetching case studies:', err);
  } finally {
    loading.value = false;
    initialLoading.value = false;
  }
};

// Set up infinite scroll using Intersection Observer
onMounted(() => {
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Initial load
  fetchCaseStudies();
  
  // Set up intersection observer for infinite scroll
  if (loadMoreRef.value) {
    const { stop } = useIntersectionObserver(
      loadMoreRef,
      ([{ isIntersecting }]) => {
        if (isIntersecting && !loading.value && hasMore.value) {
          fetchCaseStudies();
        }
      },
      { threshold: 0.5 }
    );
  }
});

// Watch for changes in sort order and reload data
watch(sortOrder, () => {
  fetchCaseStudies(true);
});

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU', { 
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

// Change sort order
const changeSortOrder = (order: 'popular' | 'newest') => {
  if (sortOrder.value !== order) {
    sortOrder.value = order;
  }
};
</script>

<template>
  <div class="cases-page">
    <!-- Hero section -->
    <section class="cases-hero">
      <div class="container">
        <h1 class="page-title">Истории клиентов Gneiro</h1>
        <p class="page-subtitle">Реальные цифры и скриншоты от наших пользователей</p>
      </div>
    </section>
    
    <!-- Filter bar -->
    <div class="filter-bar">
      <div class="container">
        <div class="sort-options">
          <button 
            class="sort-option" 
            :class="{ active: sortOrder === 'popular' }"
            @click="changeSortOrder('popular')"
          >
            <i class="pi pi-chart-line"></i>
            Популярные
          </button>
          <button 
            class="sort-option" 
            :class="{ active: sortOrder === 'newest' }"
            @click="changeSortOrder('newest')"
          >
            <i class="pi pi-calendar"></i>
            Новые
          </button>
        </div>
      </div>
    </div>
    
    <!-- Cases grid -->
    <section class="cases-grid-section">
      <div class="container">
        <!-- Loading state -->
        <div v-if="initialLoading" class="skeleton-grid">
          <div v-for="i in 9" :key="`skeleton-${i}`" class="case-card skeleton">
            <div class="skeleton-image"></div>
            <div class="skeleton-avatar"></div>
            <div class="skeleton-content">
              <div class="skeleton-title"></div>
              <div class="skeleton-text"></div>
            </div>
          </div>
        </div>
        
        <!-- Error state -->
        <div v-else-if="error" class="error-message">
          <p>{{ error }}</p>
          <button @click="fetchCaseStudies(true)" class="btn btn-primary">Попробовать снова</button>
        </div>
        
        <!-- Cases grid -->
        <div v-else class="cases-grid">
          <RouterLink
            v-for="(caseItem, index) in caseStudies"
            :key="caseItem.id"
            :to="`/cases/${caseItem.slug}`"
            class="case-card"
            :aria-label="`Кейс: ${caseItem.title}`"
          >
            <div class="card-content">
              <div class="cover-image-container">
                <img 
                  :src="caseItem.hero_image" 
                  :alt="`Кейс: ${caseItem.title}`" 
                  class="cover-image"
                  loading="lazy"
                />
              </div>
              
              <div class="case-details">
                <div class="owner-info">
                  <div class="avatar-container">
                    <img 
                      :src="caseItem.owner_photo" 
                      :alt="caseItem.owner_name" 
                      class="avatar-image"
                      loading="lazy"
                    />
                  </div>
                  <div class="owner-details">
                    <h3 class="owner-name">{{ caseItem.owner_name }}</h3>
                    <p class="publish-date">{{ formatDate(caseItem.published_at) }}</p>
                  </div>
                </div>
                
                <h2 class="case-title">{{ caseItem.title }}</h2>
                <p class="case-excerpt">{{ caseItem.excerpt }}</p>
                
                <div class="metrics-container">
                  <div 
                    v-for="(metric, mIndex) in caseItem.metrics.slice(0, 3)" 
                    :key="`${caseItem.id}-metric-${mIndex}`"
                    class="metric-badge"
                  >
                    <span class="metric-value">{{ metric.label }}</span>
                    <span class="metric-label">{{ metric.desc }}</span>
                  </div>
                </div>
                
                <div class="read-more">
                  <span class="read-more-text">Подробнее</span>
                  <i class="pi pi-arrow-right"></i>
                </div>
              </div>
            </div>
          </RouterLink>
        </div>
        
        <!-- Load more indicator -->
        <div v-if="hasMore" ref="loadMoreRef" class="load-more">
          <div v-if="loading && !initialLoading" class="loading-spinner">
            <i class="pi pi-spin pi-spinner"></i>
            <span>Загрузка...</span>
          </div>
        </div>
        
        <!-- No more content indicator -->
        <div v-else-if="!initialLoading && caseStudies.length > 0" class="no-more-content">
          <p>Показаны все кейсы</p>
        </div>
        
        <!-- Empty state -->
        <div v-else-if="!initialLoading && caseStudies.length === 0" class="empty-state">
          <i class="pi pi-folder-open"></i>
          <h2>Кейсы не найдены</h2>
          <p>Скоро здесь появятся новые истории успеха</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.cases-page {
  min-height: 100vh;
}

.cases-hero {
  background-color: var(--color-surface);
  padding: var(--space-12) 0;
  text-align: center;
}

.page-title {
  font-size: var(--fz-h1);
  margin-bottom: var(--space-4);
  color: var(--color-text);
}

.page-subtitle {
  color: var(--color-text-muted);
  font-size: 1.25rem;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.4;
}

.filter-bar {
  background-color: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  padding: var(--space-4) 0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.sort-options {
  display: flex;
  gap: var(--space-4);
}

.sort-option {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: transparent;
  border: none;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--color-text-muted);
  transition: all 0.2s ease;
}

.sort-option.active,
.sort-option:hover {
  color: var(--color-accent);
  background-color: rgba(10, 132, 255, 0.1);
}

.cases-grid-section {
  padding: var(--space-8) 0 var(--space-16);
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-6);
}

.error-message {
  text-align: center;
  padding: var(--space-8);
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-6);
}

.cases-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-6);
}

.skeleton {
  height: 400px;
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  padding: var(--space-4);
  animation: pulse 1.5s infinite;
}

.skeleton-image {
  width: 100%;
  height: 180px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-4);
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.05);
  margin-bottom: var(--space-2);
}

.skeleton-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.skeleton-title {
  height: 24px;
  width: 90%;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: var(--radius-sm);
}

.skeleton-text {
  height: 16px;
  width: 70%;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: var(--radius-sm);
}

.case-card {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 2px solid transparent;
  text-decoration: none;
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.case-card:hover, .case-card:focus {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: var(--color-accent);
}

.card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.cover-image-container {
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.case-card:hover .cover-image {
  transform: scale(1.05);
}

.case-details {
  padding: var(--space-4);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.owner-info {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.avatar-container {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.owner-details {
  flex: 1;
}

.owner-name {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.2;
}

.publish-date {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin: 0;
}

.case-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: var(--space-2);
  line-height: 1.3;
}

.case-excerpt {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  margin-bottom: var(--space-4);
}

.metrics-container {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-bottom: var(--space-4);
  margin-top: auto;
}

.metric-badge {
  background-color: rgba(10, 132, 255, 0.1);
  border-radius: 100px;
  padding: 4px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 70px;
}

.metric-value {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--color-accent);
}

.metric-label {
  font-size: 0.7rem;
  color: var(--color-text-muted);
}

.read-more {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-accent);
  font-size: 0.9rem;
  font-weight: 500;
  margin-top: auto;
}

.read-more i {
  transition: transform 0.3s ease;
}

.case-card:hover .read-more i {
  transform: translateX(4px);
}

.load-more {
  text-align: center;
  padding: var(--space-8) 0;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-muted);
}

.no-more-content {
  text-align: center;
  padding: var(--space-8) 0;
  color: var(--color-text-muted);
  font-style: italic;
}

.empty-state {
  text-align: center;
  padding: var(--space-16);
  color: var(--color-text-muted);
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: var(--space-4);
}

.empty-state h2 {
  margin-bottom: var(--space-2);
  font-size: 1.5rem;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.8;
  }
}

/* Responsive styles */
@media (max-width: 768px) {
  .page-title {
    font-size: calc(var(--fz-h1) * 0.6);
  }
  
  .page-subtitle {
    font-size: 1rem;
  }
  
  .cases-grid {
    grid-template-columns: 1fr;
  }
}

/* Support for prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .case-card:hover, .case-card:focus {
    transform: none;
  }
  
  .case-card:hover .cover-image {
    transform: none;
  }
  
  .case-card:hover .read-more i {
    transform: none;
  }
  
  .skeleton {
    animation: none;
  }
}
</style>