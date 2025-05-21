<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { RouterLink } from 'vue-router';
import { supabase } from '@/lib/supabase';

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
const error = ref<string | null>(null);
const prefersReducedMotion = ref(false);

// Load top 6 case studies by views
const fetchCaseStudies = async () => {
  try {
    loading.value = true;
    
    const { data, error: err } = await supabase
      .from('cases')
      .select('*')
      .order('views', { ascending: false })
      .limit(6);
    
    if (err) throw new Error(err.message);
    
    if (data) {
      caseStudies.value = data.map(item => ({
        ...item,
        metrics: item.metrics as CaseMetric[]
      }));
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
  }
};

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU', { 
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

// Get initials for avatar fallback
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Get positive or negative color styling for metrics
const getMetricStyle = (value: string): string => {
  if (value.includes('+') || value.includes('↑')) return 'positive';
  if (value.includes('-') || value.includes('↓')) return 'negative';
  return 'neutral';
};

// Check for reduced motion preference
onMounted(() => {
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  fetchCaseStudies();
});
</script>

<template>
  <section id="case-studies" class="case-studies-section">
    <div class="container">
      <h2 class="section-title">Реальные результаты наших клиентов</h2>
      
      <!-- Loading Skeleton -->
      <div v-if="loading" class="case-grid">
        <div v-for="i in 6" :key="`skeleton-${i}`" class="case-card skeleton">
          <div class="skeleton-image"></div>
          <div class="card-body">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-title"></div>
            <div class="skeleton-excerpt"></div>
            <div class="skeleton-metrics">
              <div class="skeleton-badge" v-for="j in 3" :key="`badge-${j}`"></div>
            </div>
            <div class="skeleton-cta"></div>
          </div>
        </div>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="error-message">
        <p>{{ error }}</p>
        <button @click="fetchCaseStudies" class="btn btn-outline">Попробовать снова</button>
      </div>
      
      <!-- Cases Grid -->
      <div v-else class="case-grid">
        <RouterLink
          v-for="(caseItem, index) in caseStudies"
          :key="caseItem.id"
          :to="`/cases/${caseItem.slug}`"
          class="case-card"
          :class="{ 'fade-in': true }"
          :style="{ 
            animationDelay: prefersReducedMotion ? '0ms' : `${index * 50}ms`
          }"
          role="link"
          :aria-label="`Кейс: ${caseItem.title} — подробнее`"
          itemscope
          itemtype="https://schema.org/Article"
        >
          <article class="card-content">
            <div class="cover-wrapper">
              <div class="cover-gradient"></div>
              <img 
                :src="caseItem.hero_image" 
                :alt="`Кейс: ${caseItem.title}`" 
                class="cover-image"
                loading="lazy"
                decoding="async"
                itemprop="image"
              />
            </div>
            
            <div class="card-body">
              <div class="card-header">
                <div class="avatar-wrapper">
                  <div v-if="!caseItem.owner_photo" class="avatar-initials" itemprop="author">
                    {{ getInitials(caseItem.owner_name) }}
                  </div>
                  <img 
                    v-else
                    :src="caseItem.owner_photo" 
                    :alt="caseItem.owner_name" 
                    class="avatar-image"
                    loading="lazy"
                    decoding="async"
                    itemprop="author"
                  />
                </div>
                <h3 class="author-name" itemprop="creator">{{ caseItem.owner_name }}</h3>
              </div>
              
              <h4 class="case-title" itemprop="headline">{{ caseItem.title }}</h4>
              <p class="case-excerpt" itemprop="description">{{ caseItem.excerpt }}</p>
              
              <div class="metrics-row">
                <div 
                  v-for="(metric, mIndex) in caseItem.metrics.slice(0, 3)" 
                  :key="`${caseItem.id}-metric-${mIndex}`"
                  class="metric-badge"
                  :class="getMetricStyle(metric.label)"
                >
                  <span class="metric-value">{{ metric.label }}</span>
                  <span class="metric-desc">{{ metric.desc }}</span>
                </div>
              </div>
              
              <div class="card-footer">
                <div class="read-more">
                  <span>Подробнее</span>
                  <i class="pi pi-arrow-right"></i>
                </div>
              </div>
            </div>
          </article>
        </RouterLink>
      </div>
      
      <!-- CTA Link -->
      <div class="view-all-cta">
        <RouterLink to="/cases" class="cta-link">
          <span>Смотреть все кейсы</span>
          <i class="pi pi-arrow-right"></i>
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.case-studies-section {
  padding: var(--space-16) 0;
  background-color: var(--color-surface);
}

.section-title {
  text-align: center;
  margin-bottom: var(--space-12);
  font-size: var(--fz-h2);
  color: var(--color-text);
}

/* Grid Layout */
.case-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: var(--sp-5);
  margin-bottom: var(--space-8);
}

/* Card Styling */
.case-card {
  background-color: var(--color-bg);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  border: 2px solid transparent;
  text-decoration: none;
  color: var(--color-text);
  display: block;
  height: 480px;
  opacity: 0;
  animation: fadeIn 0.4s forwards;
}

.case-card:hover, .case-card:focus {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border-color: var(--color-accent);
}

.card-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Cover Image */
.cover-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
}

.cover-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 25%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0));
  z-index: 1;
}

:root[data-theme='dark'] .cover-gradient {
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0));
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Card Body */
.card-body {
  padding: var(--space-4);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.avatar-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--color-bg);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-accent-subtle);
  color: var(--color-accent);
  font-weight: bold;
}

.author-name {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.case-title {
  font-size: clamp(1.25rem, 1vw + 1rem, 1.5rem);
  line-height: 1.3;
  margin: 0 0 var(--space-2);
  font-weight: 600;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 2.6em;
}

.case-excerpt {
  color: var(--color-text-muted);
  font-size: var(--step-0, 0.95rem);
  margin: 0 0 var(--space-4);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 2.8em;
}

/* Metrics Row */
.metrics-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
  margin-top: auto;
}

.metric-badge {
  background-color: rgba(var(--accent-rgb, 10, 132, 255), 0.08);
  border-radius: 100px;
  padding: 0.25rem 0.75rem;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  min-width: auto;
}

.metric-badge.positive {
  background-color: rgba(var(--success-rgb, 50, 215, 75), 0.08);
}

.metric-badge.negative {
  background-color: rgba(var(--danger-rgb, 255, 59, 48), 0.08);
}

.metric-value {
  font-weight: 700;
  font-size: var(--step--1, 0.9rem);
  color: var(--color-accent);
}

.metric-badge.positive .metric-value {
  color: var(--color-success, #32d74b);
}

.metric-badge.negative .metric-value {
  color: var(--color-danger, #ff3b30);
}

.metric-desc {
  font-size: 0.7rem;
  color: var(--color-text-muted);
}

/* Card Footer */
.card-footer {
  margin-top: auto;
}

.read-more {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-accent);
  font-size: 0.9rem;
  font-weight: 500;
}

.read-more i {
  transition: transform 0.2s ease;
}

.case-card:hover .read-more i {
  transform: translateX(2px);
}

/* CTA Link */
.view-all-cta {
  text-align: center;
  margin-top: var(--space-6);
}

.cta-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-accent);
  font-size: 1rem;
  font-weight: 500;
  text-decoration: none;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.cta-link:hover {
  text-decoration: underline;
}

.cta-link:hover i {
  transform: translateX(2px);
}

.cta-link:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* Skeletons */
.skeleton {
  background-color: var(--color-surface);
  animation: pulse 1.5s infinite;
}

.skeleton-image {
  width: 100%;
  aspect-ratio: 4 / 3;
  background-color: rgba(0, 0, 0, 0.05);
}

.card-body {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  flex: 1;
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.05);
  margin-bottom: var(--space-3);
}

.skeleton-title {
  height: 24px;
  width: 90%;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-2);
}

.skeleton-excerpt {
  height: 32px;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-4);
}

.skeleton-metrics {
  display: flex;
  gap: var(--space-2);
  margin: auto 0 var(--space-4) 0;
}

.skeleton-badge {
  height: 32px;
  width: 80px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 100px;
}

.skeleton-cta {
  height: 20px;
  width: 100px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: var(--radius-sm);
  margin-top: auto;
}

/* Error Message */
.error-message {
  text-align: center;
  padding: var(--space-8);
  background-color: var(--color-bg);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-8);
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.8;
  }
}

/* Responsive Styles */
@media (min-width: 1280px) {
  .case-grid {
    gap: var(--sp-5);
  }
}

@media (min-width: 768px) and (max-width: 1279px) {
  .case-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: var(--sp-4);
  }
}

@media (max-width: 767px) {
  .case-grid {
    grid-template-columns: 1fr;
    gap: var(--sp-4);
  }
  
  .case-card {
    height: auto;
    min-height: 480px;
  }
}

/* Support for prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .case-card {
    animation: none;
    opacity: 1;
    transform: none;
  }
  
  .case-card:hover, .case-card:focus {
    transform: none;
  }
  
  .case-card:hover .read-more i {
    transform: none;
  }
  
  .cta-link:hover i {
    transform: none;
  }
  
  .skeleton {
    animation: none;
  }
}

/* CSS Variables for dark mode support */
:root {
  --accent-rgb: 10, 132, 255;
  --success-rgb: 50, 215, 75;
  --danger-rgb: 255, 59, 48;
}
</style>