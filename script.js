/* =========================================================
   Tángara Investment Readiness · V4 JavaScript
   - Header dinámico
   - Intersection Observer con stagger
   - Count-up de métricas
   - Parallax hero con requestAnimationFrame
   - Embudo SVG con animación de trazo
   - Acordeón FAQ accesible
   ========================================================= */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const header = document.querySelector('[data-header]');
const progress = document.querySelector('.scroll-progress');
const menuToggle = document.querySelector('[data-menu-toggle]');
const navLinks = document.querySelector('[data-nav-links]');

/* Header transparente al inicio y sólido después de 80px. */
function updateHeader() {
  const scrolled = window.scrollY > 80;
  header.classList.toggle('is-scrolled', scrolled);
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const value = total > 0 ? (window.scrollY / total) * 100 : 0;
  progress.style.width = `${value}%`;
}

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

/* Menú móvil con aria-expanded. */
menuToggle?.addEventListener('click', () => {
  const open = header.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(open));
});

navLinks?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    header.classList.remove('is-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

/* Animaciones por scroll: títulos, párrafos, tarjetas y bloques. */
const revealGroups = document.querySelectorAll('.reveal-group');
const revealItems = document.querySelectorAll('.reveal-item');

if (prefersReducedMotion) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const group = entry.target;
      const items = group.matches('.reveal-item') ? [group] : [...group.querySelectorAll('.reveal-item')];
      items.forEach((item, index) => {
        item.style.transitionDelay = `${index * 80}ms`;
        item.classList.add('is-visible');
      });
      revealObserver.unobserve(group);
    });
  }, { threshold: 0.15 });

  revealGroups.forEach((group) => revealObserver.observe(group));
  revealItems.forEach((item) => {
    if (!item.closest('.reveal-group')) revealObserver.observe(item);
  });
}

/* Count-up con easeOutExpo. Soporta prefijo, sufijo, decimales, separador y formato corto. */
function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function formatNumber(value, element) {
  const prefix = element.dataset.prefix || '';
  const suffix = element.dataset.suffix || '';
  const decimals = Number(element.dataset.decimals || 0);
  const separator = element.dataset.separator || '';
  const format = element.dataset.format || '';

  let displayValue;
  if (format === 'short' && value >= 1000) {
    displayValue = `${Math.round(value / 1000)}K`;
  } else if (decimals > 0) {
    displayValue = value.toFixed(decimals).replace('.', ',');
  } else {
    displayValue = Math.round(value).toString();
    if (separator) displayValue = displayValue.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  }
  return `${prefix}${displayValue}${suffix}`;
}

function animateNumber(element, duration = 1500) {
  if (element.dataset.animated === 'true') return;
  element.dataset.animated = 'true';

  const target = Number(element.dataset.count || 0);
  const start = performance.now();

  if (prefersReducedMotion) {
    element.textContent = formatNumber(target, element);
    return;
  }

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = easeOutExpo(progress);
    element.textContent = formatNumber(target * eased, element);
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('[data-count]').forEach((number) => animateNumber(number));
    countObserver.unobserve(entry.target);
  });
}, { threshold: 0.15 });

document.querySelectorAll('[data-count-section]').forEach((section) => countObserver.observe(section));

/* Parallax sutil en hero: 0.3x velocidad del scroll, con requestAnimationFrame. */
const parallaxItems = document.querySelectorAll('.parallax-item');
let ticking = false;

function updateParallax() {
  const y = window.scrollY;
  parallaxItems.forEach((item, index) => {
    const speed = 0.12 + index * 0.035;
    item.style.setProperty('--parallax-y', `${y * speed * -0.3}px`);
    item.style.transform = `translateY(var(--parallax-y)) ${item.classList.contains('hero-photo-a') ? 'rotate(4deg)' : item.classList.contains('hero-photo-b') ? 'rotate(-7deg)' : item.classList.contains('hero-photo-c') ? 'rotate(5deg)' : ''}`;
  });
  ticking = false;
}

if (!prefersReducedMotion) {
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
}

/* Puente tipográfico: dibuja líneas SVG al entrar al viewport. */
const bridgeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.querySelector('.bridge-graphic')?.classList.add('is-drawn');
    bridgeObserver.unobserve(entry.target);
  });
}, { threshold: 0.25 });

document.querySelectorAll('[data-bridge]').forEach((bridge) => bridgeObserver.observe(bridge));

/* Embudo: count-up secuencial y flechas con stroke-dasharray. */
const funnelSection = document.querySelector('[data-funnel]');
if (funnelSection) {
  const funnelObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || funnelSection.dataset.animated === 'true') return;
      funnelSection.dataset.animated = 'true';
      funnelSection.classList.add('is-drawn');
      const numbers = [...funnelSection.querySelectorAll('.funnel-number')];
      numbers.forEach((number, index) => {
        setTimeout(() => animateNumber(number, 1100), index * 420);
      });
      funnelObserver.unobserve(funnelSection);
    });
  }, { threshold: 0.15 });

  funnelObserver.observe(funnelSection);
}

/* Acordeón FAQ: abre/cierra sin dependencias. */
document.querySelectorAll('.faq-question').forEach((button) => {
  button.addEventListener('click', () => {
    const item = button.closest('.faq-item');
    const isOpen = item.classList.toggle('open');
    button.setAttribute('aria-expanded', String(isOpen));
  });
});
