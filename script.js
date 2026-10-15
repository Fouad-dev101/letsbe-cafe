(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Preloader ---------- */
  function hidePreloader() {
    const pre = document.getElementById('preloader');
    if (!pre || pre.classList.contains('is-hidden')) return;
    pre.classList.add('is-hidden');
    setTimeout(() => pre.remove(), 1400);
  }
  window.addEventListener('load', () => setTimeout(hidePreloader, reduceMotion ? 0 : 900));
  setTimeout(hidePreloader, 3000); // safety

  /* ---------- Marquee duplicate ---------- */
  const track = document.getElementById('marqueeTrack');
  if (track) track.innerHTML += track.innerHTML;

  /* ---------- Nav scroll ---------- */
  const nav = document.getElementById('nav');
  let lastY = window.scrollY;
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 60);

    if (y > 400 && y > lastY + 6) nav.classList.add('is-hidden');
    else if (y < lastY - 6 || y < 200) nav.classList.remove('is-hidden');
    lastY = y;

    // Atmosphere parallax
    const atmosBg = document.getElementById('atmosBg');
    if (atmosBg && !reduceMotion) {
      const rect = atmosBg.parentElement.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
        atmosBg.style.transform = 'translate3d(0,' + ((progress - 0.5) * 90).toFixed(2) + 'px,0)';
      }
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');
  let menuOpen = false;

  function setMenu(open) {
    menuOpen = open;
    burger.classList.toggle('is-open', open);
    mobileMenu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (burger && mobileMenu) {
    burger.addEventListener('click', () => setMenu(!menuOpen));
    mobileMenu.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => setMenu(false))
    );
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && menuOpen) setMenu(false);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-in'));
  }

  /* ---------- Safety: force-reveal after 2.5s ---------- */
  setTimeout(() => {
    document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-in'));
  }, 2500);

  /* ---------- Menu tabs ---------- */
  const tabs = document.querySelectorAll('.menu__tab');
  const panels = document.querySelectorAll('.menu__panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.panel;
      tabs.forEach(t => {
        const active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', String(active));
      });
      panels.forEach(p => p.classList.toggle('is-active', p.id === 'panel-' + target));
    });

    tab.addEventListener('keydown', (e) => {
      const list = Array.from(tabs);
      const i = list.indexOf(tab);
      let next = null;
      if (e.key === 'ArrowRight') next = list[(i + 1) % list.length];
      if (e.key === 'ArrowLeft')  next = list[(i - 1 + list.length) % list.length];
      if (next) { e.preventDefault(); next.focus(); next.click(); }
    });
  });

  /* ---------- Smooth anchor scroll ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const navH = nav ? nav.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - (navH + 8);
      window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Image safety: keep images visible ---------- */
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', () => { img.style.display = 'none'; }, { once: true });

    if (!img.complete) {
      img.style.opacity = '0';
      img.addEventListener('load', () => {
        img.style.opacity = '1';
        img.style.transition = 'opacity .6s ease';
      }, { once: true });
      // Last-resort reveal
      setTimeout(() => { img.style.opacity = '1'; }, 4000);
    }
  });

})();