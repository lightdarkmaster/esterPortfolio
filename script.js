/* ==========================================================================
   SOPHIA. — Portfolio interactions
   Vanilla JS, ES6+. No dependencies.
   ========================================================================== */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ------------------------------------------------------------------
     Page loader
     ------------------------------------------------------------------ */
  function initLoader() {
    const loader = document.getElementById('loader');
    const fill = document.getElementById('loaderFill');
    if (!loader || !fill) return;

    let progress = 0;
    const tick = () => {
      progress += Math.random() * 18 + 8;
      if (progress >= 100) {
        progress = 100;
        fill.style.width = '100%';
        window.setTimeout(() => loader.classList.add('is-hidden'), 250);
        return;
      }
      fill.style.width = `${progress}%`;
      window.setTimeout(tick, 120);
    };

    // Kick off shortly after paint so the bar is visible.
    window.setTimeout(tick, 100);

    // Safety net: never let the loader block the page for more than 2.5s.
    window.setTimeout(() => loader.classList.add('is-hidden'), 2500);
  }

  /* ------------------------------------------------------------------
     Theme toggle (persisted + prefers-color-scheme aware)
     ------------------------------------------------------------------ */
  function initTheme() {
    const toggle = document.getElementById('themeToggle');
    const root = document.documentElement;
    const stored = localStorage.getItem('sophia-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const applyTheme = (theme) => {
      if (theme === 'dark') {
        root.setAttribute('data-theme', 'dark');
        toggle?.setAttribute('aria-pressed', 'true');
        toggle?.setAttribute('aria-label', 'Switch to light theme');
      } else {
        root.removeAttribute('data-theme');
        toggle?.setAttribute('aria-pressed', 'false');
        toggle?.setAttribute('aria-label', 'Switch to dark theme');
      }
    };

    applyTheme(stored || (systemPrefersDark ? 'dark' : 'light'));

    toggle?.addEventListener('click', () => {
      const isDark = root.getAttribute('data-theme') === 'dark';
      const next = isDark ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem('sophia-theme', next);
    });
  }

  /* ------------------------------------------------------------------
     Navigation: smooth scroll, active link, mobile menu
     ------------------------------------------------------------------ */
  function initNav() {
    const header = document.querySelector('.nav-wrap');
    const navLinks = document.querySelectorAll('[data-nav]');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const sections = document.querySelectorAll('main section[id]');
    const navAnchors = document.querySelectorAll('.nav-link');

    // Smooth scroll with header offset, and close mobile menu on click.
    navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (!targetId || !targetId.startsWith('#')) return;
        const target = document.querySelector(targetId);
        if (!target) return;
        e.preventDefault();

        const offset = 90;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });

        if (mobileMenu?.classList.contains('is-open')) {
          closeMobileMenu();
        }
      });
    });

    // Hamburger toggle
    const openMobileMenu = () => {
      mobileMenu.classList.add('is-open');
      hamburger.classList.add('is-open');
      hamburger.setAttribute('aria-expanded', 'true');
      hamburger.setAttribute('aria-label', 'Close menu');
    };
    const closeMobileMenu = () => {
      mobileMenu.classList.remove('is-open');
      hamburger.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Open menu');
    };

    hamburger?.addEventListener('click', () => {
      if (mobileMenu.classList.contains('is-open')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    // Active section indicator via IntersectionObserver
    if ('IntersectionObserver' in window && sections.length) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.getAttribute('id');
              navAnchors.forEach((a) => {
                a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
              });
            }
          });
        },
        { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
      );
      sections.forEach((section) => observer.observe(section));
    }

    // Scroll progress bar + back-to-top visibility
    const progressBar = document.getElementById('scrollProgress');
    const backToTop = document.getElementById('backToTop');

    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      if (progressBar) progressBar.style.width = `${pct}%`;
      if (backToTop) backToTop.classList.toggle('is-visible', scrollTop > 600);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    backToTop?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ------------------------------------------------------------------
     Custom cursor (desktop only)
     ------------------------------------------------------------------ */
  function initCursor() {
    if (isTouchDevice) return;

    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (!dot || !ring) return;

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let hasMoved = false;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
      if (!hasMoved) {
        hasMoved = true;
        document.body.classList.add('cursor-active');
      }
    });

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.left = `${ringX}px`;
      ring.style.top = `${ringY}px`;
      requestAnimationFrame(animateRing);
    };
    requestAnimationFrame(animateRing);

    const interactiveSelectors = 'a, button, .skill-card, .service-card, .project-card, input, textarea';
    document.querySelectorAll(interactiveSelectors).forEach((el) => {
      el.addEventListener('mouseenter', () => ring.classList.add('is-hovering'));
      el.addEventListener('mouseleave', () => ring.classList.remove('is-hovering'));
    });

    document.addEventListener('mouseleave', () => {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      if (hasMoved) {
        dot.style.opacity = '';
        ring.style.opacity = '';
      }
    });
  }

  /* ------------------------------------------------------------------
     Magnetic buttons
     ------------------------------------------------------------------ */
  function initMagnetic() {
    if (isTouchDevice || prefersReducedMotion) return;

    document.querySelectorAll('.magnetic').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.22}px, ${y * 0.3}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ------------------------------------------------------------------
     3D tilt on selected cards
     ------------------------------------------------------------------ */
  function initTilt() {
    if (isTouchDevice || prefersReducedMotion) return;

    document.querySelectorAll('.tilt').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        const rotateX = (-py * 6).toFixed(2);
        const rotateY = (px * 6).toFixed(2);
        card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ------------------------------------------------------------------
     Scroll reveal via IntersectionObserver
     ------------------------------------------------------------------ */
  function initReveal() {
    const targets = document.querySelectorAll(
      '.section-title, .section-sub, .stat, .info-card, .skill-group, .project-card, .timeline-item, .service-card, .testimonial-carousel, .contact-form, .contact-left'
    );
    targets.forEach((el) => el.classList.add('reveal'));

    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
      targets.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            const delay = (index % 4) * 80;
            window.setTimeout(() => entry.target.classList.add('is-visible'), delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );

    targets.forEach((el) => observer.observe(el));
  }

  /* ------------------------------------------------------------------
     Animated stat counters
     ------------------------------------------------------------------ */
  function initCounters() {
    const counters = document.querySelectorAll('.stat-num');
    if (!counters.length) return;

    const animateCounter = (el) => {
      const target = parseInt(el.getAttribute('data-count'), 10) || 0;
      const suffix = el.getAttribute('data-suffix') || '';
      if (prefersReducedMotion) {
        el.textContent = `${target}${suffix}`;
        return;
      }
      const duration = 1200;
      const start = performance.now();

      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = `${Math.round(eased * target)}${suffix}`;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      counters.forEach((el) => observer.observe(el));
    } else {
      counters.forEach(animateCounter);
    }
  }

  /* ------------------------------------------------------------------
     Testimonial carousel
     ------------------------------------------------------------------ */
  function initTestimonials() {
    const slides = Array.from(document.querySelectorAll('.testimonial-slide'));
    const dotsWrap = document.getElementById('testimonialDots');
    const prevBtn = document.getElementById('testimonialPrev');
    const nextBtn = document.getElementById('testimonialNext');
    const track = document.getElementById('testimonialTrack');
    if (!slides.length || !dotsWrap) return;

    let current = 0;
    let autoTimer = null;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);

    function render() {
      slides.forEach((slide, i) => {
        slide.classList.toggle('is-active', i === current);
        slide.setAttribute('aria-hidden', i === current ? 'false' : 'true');
      });
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === current));
    }

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      render();
      restartAuto();
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function restartAuto() {
      if (autoTimer) window.clearInterval(autoTimer);
      if (prefersReducedMotion) return;
      autoTimer = window.setInterval(next, 6000);
    }

    prevBtn?.addEventListener('click', prev);
    nextBtn?.addEventListener('click', next);

    // Swipe support
    let touchStartX = 0;
    track?.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    track?.addEventListener('touchend', (e) => {
      const delta = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 40) {
        delta < 0 ? next() : prev();
      }
    }, { passive: true });

    render();
    restartAuto();
  }

  /* ------------------------------------------------------------------
     Contact form validation + simulated submit
     ------------------------------------------------------------------ */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const submitBtn = document.getElementById('submitBtn');
    const successMsg = document.getElementById('formSuccess');

    const fields = {
      name: { el: document.getElementById('name'), error: document.getElementById('nameError') },
      email: { el: document.getElementById('email'), error: document.getElementById('emailError') },
      subject: { el: document.getElementById('subject'), error: document.getElementById('subjectError') },
      message: { el: document.getElementById('message'), error: document.getElementById('messageError') },
    };

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function setError(field, message) {
      field.el.closest('.form-row').classList.toggle('has-error', Boolean(message));
      field.error.textContent = message || '';
    }

    function validateField(key) {
      const field = fields[key];
      const value = field.el.value.trim();

      if (!value) {
        setError(field, 'This field is required.');
        return false;
      }
      if (key === 'email' && !emailPattern.test(value)) {
        setError(field, 'Please enter a valid email address.');
        return false;
      }
      if (key === 'message' && value.length < 10) {
        setError(field, 'Message should be at least 10 characters.');
        return false;
      }
      setError(field, '');
      return true;
    }

    Object.keys(fields).forEach((key) => {
      fields[key].el.addEventListener('blur', () => validateField(key));
      fields[key].el.addEventListener('input', () => {
        if (fields[key].el.closest('.form-row').classList.contains('has-error')) {
          validateField(key);
        }
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const allValid = Object.keys(fields)
        .map((key) => validateField(key))
        .every(Boolean);

      if (!allValid) return;

      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;
      successMsg.classList.remove('is-visible');
      successMsg.textContent = '';

      // Simulate a network request — no data leaves the browser.
      window.setTimeout(() => {
        submitBtn.classList.remove('is-loading');
        submitBtn.disabled = false;
        successMsg.textContent = "Thanks — your message has been sent. I'll reply soon.";
        successMsg.classList.add('is-visible');
        form.reset();
      }, 1100);
    });
  }

  /* ------------------------------------------------------------------
     Init
     ------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initTheme();
    initNav();
    initCursor();
    initMagnetic();
    initTilt();
    initReveal();
    initCounters();
    initTestimonials();
    initContactForm();
  });
})();