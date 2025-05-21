/**
 * Throttle function to limit the rate at which a function can be called
 * @param func The function to throttle
 * @param limit The time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastFunc: ReturnType<typeof setTimeout> | undefined;
  let lastRan: number = 0;
  
  return function(this: any, ...args: Parameters<T>): void {
    if (!inThrottle) {
      func.apply(this, args);
      lastRan = Date.now();
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    } else {
      clearTimeout(lastFunc);
      
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func.apply(this, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

/**
 * Debounce function to delay execution until after a specified time has passed
 * @param func The function to debounce
 * @param delay The delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  
  return function(this: any, ...args: Parameters<T>): void {
    clearTimeout(timer);
    
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

/**
 * Format number with comma separators
 * @param num The number to format
 * @returns Formatted string
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

/**
 * Format date to locale string
 * @param dateString Date string to format
 * @param locale Locale to use (defaults to ru-RU)
 * @returns Formatted date string
 */
export function formatDate(dateString: string, locale = 'ru-RU'): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale, { 
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

/**
 * Get initials from name
 * @param name Full name
 * @returns Initials (up to 2 characters)
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

/**
 * Check if user prefers reduced motion
 * @returns Boolean indicating preference
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Smooth scroll to element with offset
 * @param elementId ID of the element to scroll to
 * @param offset Offset in pixels (default: 80px for header)
 */
export function scrollToElement(elementId: string, offset = 80): void {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - offset;
  
  window.scrollTo({
    top: offsetPosition,
    behavior: prefersReducedMotion() ? 'auto' : 'smooth'
  });
}

/**
 * Generate a skeleton array for loading state
 * @param count Number of skeleton items
 * @returns Array of skeleton items with unique IDs
 */
export function createSkeletonArray(count: number): Array<{ id: string }> {
  return Array.from({ length: count }, (_, index) => ({
    id: `skeleton-${index}`
  }));
}

/**
 * Get random number between min and max (inclusive)
 * @param min Minimum value
 * @param max Maximum value 
 * @returns Random number
 */
export function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Detect touch device
 * @returns Boolean indicating if device has touch capability
 */
export function isTouchDevice(): boolean {
  return (('ontouchstart' in window) ||
     (navigator.maxTouchPoints > 0));
}