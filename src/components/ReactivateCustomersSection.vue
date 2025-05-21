<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';

// Mock data for the sales recovery chart with simplified points for smooth curve
const chartData = [
  { label: 'Старт', value: 38, x: 0 },
  { label: '', value: 33, x: 25 },
  { label: '3 мес', value: 45, x: 50 },
  { label: '', value: 60, x: 75 },
  { label: 'Сейчас', value: 65, x: 100 }
];

// Mock messages for the AI outreach examples
const outreachMessages = ref([
  {
    id: 1,
    text: 'Привет, Алексей! Давно не виделись. У нас появились новые модели, похожие на то, что вы искали в прошлый раз.',
    time: '14:25',
    visible: false
  },
  {
    id: 2,
    text: 'У нас новинка для вашего бизнеса: интеграция с 1С, которую вы спрашивали в июне. Можем показать демо?',
    time: '15:10',
    visible: false
  },
  {
    id: 3,
    text: 'Получилось применить скидку? Напомню, что она действует до конца недели 😊',
    time: '16:45',
    visible: false
  }
]);

// Tooltip state
const tooltipVisible = ref(false);
const tooltipPosition = ref({ x: 0, y: 0 });

// Animation control
const prefersReducedMotion = computed(() => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
});

// For line chart animation
const chartLineLength = ref(0);
const chartAnimationDone = ref(false);
const sectionVisible = ref(false);

// Create a smoother SVG path using Catmull-Rom spline
const smoothPath = computed(() => {
  const points = chartData.map(d => ({
    x: d.x,
    y: 100 - (d.value)
  }));

  if (points.length < 2) return '';

  let path = `M ${points[0].x},${points[0].y}`;
  
  for (let i = 0; i < points.length - 1; i++) {
    const x1 = points[i].x;
    const y1 = points[i].y;
    const x2 = points[i + 1].x;
    const y2 = points[i + 1].y;
    
    // Control points for smooth curve
    const cpx1 = x1 + (x2 - x1) / 3;
    const cpy1 = y1;
    const cpx2 = x1 + 2 * (x2 - x1) / 3;
    const cpy2 = y2;
    
    path += ` C ${cpx1},${cpy1} ${cpx2},${cpy2} ${x2},${y2}`;
  }
  
  return path;
});

// Create the area path for fill under the line
const areaPath = computed(() => {
  const linePath = smoothPath.value;
  const baseline = 100; // Bottom of chart
  const lastPoint = chartData[chartData.length - 1];
  const firstPoint = chartData[0];
  
  return `${linePath} L ${lastPoint.x},${baseline} L ${firstPoint.x},${baseline} Z`;
});

const handleShowTooltip = (e: MouseEvent, index: number) => {
  const chartContainer = document.querySelector('.chart-container');
  if (!chartContainer) return;
  
  const rect = chartContainer.getBoundingClientRect();
  const relativeX = e.clientX - rect.left;
  const relativeY = e.clientY - rect.top;
  
  tooltipPosition.value = { 
    x: relativeX,
    y: relativeY - 40 // Position above cursor
  };
  
  tooltipVisible.value = true;
};

const handleHideTooltip = () => {
  tooltipVisible.value = false;
};

onMounted(() => {
  // Initialize section visibility for animations
  setTimeout(() => {
    sectionVisible.value = true;
    
    // Skip animations if reduced motion is preferred
    if (prefersReducedMotion.value) {
      chartLineLength.value = 100;
      chartAnimationDone.value = true;
      outreachMessages.value = outreachMessages.value.map(m => ({ ...m, visible: true }));
      return;
    }
    
    // Animate chart line
    setTimeout(() => {
      chartLineLength.value = 100;
      
      // After chart animation completes
      setTimeout(() => {
        chartAnimationDone.value = true;
        
        // Staggered animation for messages
        outreachMessages.value.forEach((message, idx) => {
          setTimeout(() => {
            outreachMessages.value[idx].visible = true;
          }, 150 * idx);
        });
      }, 1000);
    }, 500);
  }, 100);
});

// Handler for CTA button
const handleStartOutreach = () => {
  // Scroll to pricing section
  const pricingSection = document.getElementById('pricing');
  if (pricingSection) {
    pricingSection.scrollIntoView({ behavior: prefersReducedMotion.value ? 'auto' : 'smooth' });
  }
};

// Handler for "View script example" link
const handleViewScript = () => {
  // This would navigate to a blog post, but we'll just console log for now
  console.log('Navigate to AI outreach script example');
  // In a real scenario, this would use router.push('/blog/ai-outreach')
};
</script>

<template>
  <section id="reactivate-customers" class="reactivate-section" :class="{ 'visible': sectionVisible }">
    <div class="container">
      <div class="section-content">
        <!-- Left column: Info -->
        <div class="info-column">
          <h2 class="section-title">Оживите клиентов, которые забыли о вас</h2>
          <p class="section-subtitle">
            AI-агент запускает персональные рассылки — без спама и массовых шаблонов
          </p>
          
          <ul class="benefits-list">
            <li class="benefit-item">
              <div class="icon-wrapper">
                <i class="pi pi-send benefit-icon"></i>
              </div>
              <div class="benefit-text">
                <h3 class="benefit-title">Рассылка в 1 клик</h3>
                <p class="benefit-description">Загружайте CSV или синхронизируйте CRM</p>
              </div>
            </li>
            
            <li class="benefit-item">
              <div class="icon-wrapper">
                <i class="pi pi-comments benefit-icon"></i>
              </div>
              <div class="benefit-text">
                <h3 class="benefit-title">Персональные диалоги</h3>
                <p class="benefit-description">Каждое сообщение подбирается под историю клиента</p>
              </div>
            </li>
            
            <li class="benefit-item">
              <div class="icon-wrapper">
                <i class="pi pi-chart-line benefit-icon"></i>
              </div>
              <div class="benefit-text">
                <h3 class="benefit-title">+27 % повторных продаж</h3>
                <p class="benefit-description">Средний рост по 60 бизнесам (KZT-рынок)</p>
              </div>
            </li>
          </ul>
        </div>
        
        <!-- Right column: Dashboard -->
        <div class="dashboard-column">
          <figure class="dashboard-card">
            <div class="status-badge">Кампания запущена</div>
            
            <!-- Chart area -->
            <div class="chart-area">
              <div class="chart-title">Повторные продажи</div>
              
              <div class="chart-container" 
                   @mousemove="handleShowTooltip($event, 0)" 
                   @mouseleave="handleHideTooltip">
                <div v-if="tooltipVisible" class="chart-tooltip" :style="{
                  left: `${tooltipPosition.x}px`,
                  top: `${tooltipPosition.y}px`
                }">
                  Повторные продажи +27%
                </div>
                
                <svg class="chart" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <!-- Horizontal grid lines (dotted) -->
                  <line x1="0" y1="25" x2="100" y2="25" class="grid-line" />
                  <line x1="0" y1="50" x2="100" y2="50" class="grid-line" />
                  <line x1="0" y1="75" x2="100" y2="75" class="grid-line" />
                  <line x1="0" y1="100" x2="100" y2="100" class="grid-line" />
                  
                  <!-- Area fill under the line -->
                  <path
                    :d="areaPath"
                    class="chart-area-fill"
                    :style="`opacity: ${chartLineLength / 100 * 0.1}`"
                  />
                  
                  <!-- Smooth curve line -->
                  <path
                    :d="smoothPath"
                    class="chart-line"
                    :style="`stroke-dasharray: 200; stroke-dashoffset: ${200 - chartLineLength * 2}; opacity: 0.6;`"
                  />
                  
                  <!-- Growth indicator -->
                  <g :class="['growth-indicator', {'pulsing': chartAnimationDone && !prefersReducedMotion}]">
                    <circle cx="75" cy="35" r="4" class="indicator-dot" />
                  </g>
                </svg>
                
                <!-- X-axis labels -->
                <div class="chart-labels">
                  <span v-for="point in chartData" :key="point.x" 
                        v-show="point.label" 
                        :style="`left: ${point.x}%`">
                    {{ point.label }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Message examples -->
            <div class="messages-container">
              <div class="messages-title">Примеры персонализированных сообщений</div>
              
              <div class="message-list">
                <div v-for="message in outreachMessages" 
                     :key="message.id" 
                     class="message-item"
                     :class="{ 'fade-in': message.visible }">
                  <div class="message-content">{{ message.text }}</div>
                  <div class="message-info">
                    <span class="message-time">{{ message.time }}</span>
                    <span class="message-status">
                      <i class="pi pi-check-circle status-icon"></i>
                      Отправлено
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <figcaption class="dashboard-caption">
              Автоматически подбирается оптимальное время отправки сообщений для каждого клиента
            </figcaption>
          </figure>
        </div>
      </div>
      
      <!-- CTA buttons -->
      <div class="section-cta">
        <button @click="handleStartOutreach" class="btn btn-primary">Запустить рассылку</button>
        <button @click="handleViewScript" class="btn btn-outline">Смотреть пример скрипта</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.reactivate-section {
  padding: var(--space-16) 0;
  background-color: var(--color-bg);
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.reactivate-section.visible {
  opacity: 1;
  transform: translateY(0);
}

.section-content {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-8);
  margin-bottom: var(--space-8);
}

/* Left column styles */
.info-column {
  flex: 1;
  min-width: 300px;
  max-width: 52%;
}

.section-title {
  font-size: var(--fz-h2);
  margin-bottom: var(--space-4);
  line-height: 1.2;
}

.section-subtitle {
  font-size: var(--fz-body);
  color: var(--color-text-muted);
  margin-bottom: var(--space-6);
  max-width: 90%;
}

.benefits-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.benefit-item {
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
  align-items: flex-start;
}

.icon-wrapper {
  position: relative;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.benefit-icon {
  color: var(--color-accent);
  font-size: 1.5rem;
  position: relative;
  z-index: 2;
}

.icon-wrapper::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  background-color: var(--color-accent);
  opacity: 0.15;
  border-radius: 50%;
  filter: blur(5px);
  z-index: 1;
}

.benefit-text {
  flex: 1;
}

.benefit-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 var(--space-2);
}

.benefit-description {
  color: var(--color-text-muted);
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.4;
}

/* Right column styles */
.dashboard-column {
  flex: 1;
  min-width: 350px;
  max-width: 48%;
}

.dashboard-card {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: var(--space-6);
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  margin: 0; /* Reset default figure margin */
}

.dashboard-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.status-badge {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  background-color: var(--color-success, #32d74b);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 100px;
}

/* Chart styles */
.chart-area {
  margin-bottom: var(--space-6);
}

.chart-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: var(--space-4);
}

.chart-container {
  position: relative;
  height: 140px;
}

.chart {
  width: 100%;
  height: 100px;
}

.chart-line {
  fill: none;
  stroke: var(--color-accent);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: stroke-dashoffset 1s ease-in-out;
}

.chart-area-fill {
  fill: var(--color-accent);
}

.grid-line {
  stroke: var(--color-border);
  stroke-width: 1;
  stroke-dasharray: 2 2;
  opacity: 0.2;
}

.chart-labels {
  display: flex;
  position: relative;
  height: 20px;
  margin-top: 10px;
}

.chart-labels span {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.chart-tooltip {
  position: absolute;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 4px 8px;
  font-size: 0.75rem;
  pointer-events: none;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transform: translate(-50%, -100%);
  white-space: nowrap;
}

.growth-indicator {
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
}

.growth-indicator.pulsing .indicator-dot {
  fill: var(--color-accent);
  animation: pulse-scale 2s infinite;
}

.indicator-dot {
  fill: var(--color-accent);
}

/* Message examples */
.messages-container {
  margin-bottom: var(--space-4);
}

.messages-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: var(--space-4);
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.message-item {
  background-color: var(--color-bg);
  border-radius: var(--radius-md, 0.5rem);
  padding: var(--space-3);
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.message-item.fade-in {
  opacity: 1;
  transform: translateY(0);
}

.message-content {
  margin-bottom: var(--space-2);
  font-size: 0.95rem;
}

.message-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.message-time {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  font-weight: 300;
}

.message-status {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.7rem;
  color: var(--color-text-muted);
}

.status-icon {
  color: var(--color-success, #32d74b);
  opacity: 0.7;
}

.dashboard-caption {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  text-align: center;
  font-style: italic;
  margin-top: var(--space-4);
}

/* CTA section */
.section-cta {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
}

.btn {
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-sm);
  font-weight: 500;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-primary {
  background-color: var(--color-accent);
  color: white;
  min-width: 200px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-outline {
  background-color: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.btn-primary:hover {
  background-color: var(--color-accent-hover);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.btn-outline:hover {
  border-color: var(--color-text-muted);
  background-color: var(--color-surface);
  transform: translateY(-2px);
}

/* Animation keyframes */
@keyframes pulse-scale {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.2); opacity: 1; }
}

/* Responsive styles */
@media (max-width: 992px) {
  .section-content {
    flex-direction: column;
  }
  
  .info-column, .dashboard-column {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .chart-container {
    height: 120px;
  }
  
  .chart {
    height: 80px;
  }
}

@media (max-width: 480px) {
  .section-cta {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
    margin-left: auto;
    margin-right: auto;
  }
  
  .section-title {
    font-size: calc(var(--fz-h2) * 0.8);
  }
}

/* Support for prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .reactivate-section {
    opacity: 1;
    transform: none;
    transition: none;
  }
  
  .dashboard-card:hover {
    transform: none;
  }
  
  .message-item {
    opacity: 1;
    transform: none;
    transition: none;
  }
  
  .growth-indicator.pulsing .indicator-dot {
    animation: none;
  }
  
  .btn:hover {
    transform: none;
  }
  
  .chart-line {
    transition: none;
  }
}
</style>