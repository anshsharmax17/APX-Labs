/**
 * ============================================================
 *  Agency Landing Page — Main JavaScript
 *  Vanilla JS · No Dependencies · Modern APIs
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  /* --------------------------------------------------------
   *  Utility helpers
   * ------------------------------------------------------ */

  /** Debounce: collapse rapid calls into one trailing invocation. */
  const debounce = (fn, delay = 15) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  /** Ease-out quart curve for counter animation. */
  const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

  /** Safe querySelector shorthand — returns null when not found. */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* --------------------------------------------------------
   *  1. Loading Screen
   * ------------------------------------------------------ */

  const loaderWrapper = $('.loader-wrapper');

  if (loaderWrapper) {
    setTimeout(() => {
      loaderWrapper.style.opacity = '0';
      loaderWrapper.addEventListener('transitionend', () => {
        loaderWrapper.style.display = 'none';
      }, { once: true });
      // Fallback in case transitionend never fires (no CSS transition)
      setTimeout(() => { loaderWrapper.style.display = 'none'; }, 800);
      document.body.classList.add('loaded');
    }, 1500);
  } else {
    document.body.classList.add('loaded');
  }

  /* --------------------------------------------------------
   *  2. Scroll Progress Bar
   * ------------------------------------------------------ */

  const scrollProgress = $('.scroll-progress');

  const updateScrollProgress = () => {
    if (!scrollProgress) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? scrollTop / docHeight : 0;
    scrollProgress.style.transform = `scaleX(${progress})`;
  };

  /* --------------------------------------------------------
   *  3. Navbar Behavior
   * ------------------------------------------------------ */

  const navbar = $('.navbar');
  const hamburger = $('.hamburger');
  const navLinks = $('.nav-links');

  const handleNavbarScroll = () => {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 100);
  };

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Close mobile menu on link click
    $$('a', navLinks).forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }

  // Smooth-scroll for all nav links (and any '#' anchor)
  $$('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = $(targetId);
      if (!target) return;
      e.preventDefault();
      const navHeight = navbar ? navbar.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* --------------------------------------------------------
   *  4. Scroll Animations (IntersectionObserver)
   * ------------------------------------------------------ */

  const animatedSelectors = '.fade-up, .fade-down, .scale-in, .slide-left, .slide-right, .blur-reveal';

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = el.dataset.delay;
        if (delay) {
          el.style.transitionDelay = `${delay}ms`;
        }
        el.classList.add('visible');
        revealObserver.unobserve(el);
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
  );

  $$(animatedSelectors).forEach((el) => revealObserver.observe(el));

  /* --------------------------------------------------------
   *  5. Counter Animation
   * ------------------------------------------------------ */

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 2000; // ms
    let start = null;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.floor(easeOutQuart(progress) * target);
      el.textContent = value + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    };
    requestAnimationFrame(step);
  };

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );

  $$('.counter[data-target]').forEach((c) => counterObserver.observe(c));

  /* --------------------------------------------------------
   *  6. Mouse Parallax (Hero Orbs)
   * ------------------------------------------------------ */

  const hero = $('.hero');
  const orbs = hero ? $$('.orb', hero) : [];
  let mouseX = 0;
  let mouseY = 0;
  let orbAnimating = false;

  const moveOrbs = () => {
    orbs.forEach((orb, i) => {
      const speed = parseFloat(orb.dataset.speed) || (i + 1) * 0.02;
      const x = (mouseX - window.innerWidth / 2) * speed;
      const y = (mouseY - window.innerHeight / 2) * speed;
      orb.style.transform = `translate(${x}px, ${y}px)`;
    });
    orbAnimating = false;
  };

  if (hero && orbs.length) {
    hero.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!orbAnimating) {
        orbAnimating = true;
        requestAnimationFrame(moveOrbs);
      }
    });
  }

  /* --------------------------------------------------------
   *  7. Button Ripple Effect
   * ------------------------------------------------------ */

  $$('.btn-primary, .btn-secondary').forEach((btn) => {
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';

    btn.addEventListener('click', (e) => {
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');

      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

      Object.assign(ripple.style, {
        position: 'absolute',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.35)',
        transform: 'scale(0)',
        pointerEvents: 'none',
        animation: 'ripple-expand 600ms ease-out forwards',
      });

      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // Inject ripple keyframes once
  if (!$('#ripple-keyframes')) {
    const style = document.createElement('style');
    style.id = 'ripple-keyframes';
    style.textContent = `
      @keyframes ripple-expand {
        to { transform: scale(1); opacity: 0; }
      }`;
    document.head.appendChild(style);
  }

  /* --------------------------------------------------------
   *  8. Technology Tabs
   * ------------------------------------------------------ */

  const tabBtns = $$('.tab-btn');
  const techCategories = $$('.tech-category');

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;

      tabBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      techCategories.forEach((cat) => {
        const isMatch = cat.dataset.category === category || cat.id === category;
        cat.classList.toggle('active', isMatch);
        if (isMatch) {
          cat.style.animation = 'none';
          // Force reflow to restart animation
          void cat.offsetWidth;
          cat.style.animation = 'fadeTabIn 0.4s ease forwards';
        }
      });
    });
  });

  // Inject tab fade keyframes
  if (!$('#tab-keyframes')) {
    const style = document.createElement('style');
    style.id = 'tab-keyframes';
    style.textContent = `
      @keyframes fadeTabIn {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
      }`;
    document.head.appendChild(style);
  }

  /* --------------------------------------------------------
   *  9. FAQ Accordion
   * ------------------------------------------------------ */

  $$('.faq-question').forEach((question) => {
    question.addEventListener('click', () => {
      const parentItem = question.closest('.faq-item');
      if (!parentItem) return;
      const answer = parentItem.querySelector('.faq-answer');
      const isOpen = parentItem.classList.contains('active');

      // Close every other item first (accordion behavior)
      $$('.faq-item.active').forEach((item) => {
        if (item === parentItem) return;
        item.classList.remove('active');
        const otherAnswer = item.querySelector('.faq-answer');
        if (otherAnswer) otherAnswer.style.maxHeight = '0';
      });

      // Toggle current item
      parentItem.classList.toggle('active', !isOpen);
      if (answer) {
        answer.style.maxHeight = isOpen ? '0' : `${answer.scrollHeight}px`;
      }
    });
  });

  /* --------------------------------------------------------
   *  10. Contact Form
   * ------------------------------------------------------ */

  const contactForm = $('form#contact-form, .contact-form form, form[data-contact]');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Basic required-field validation
      const requiredFields = $$('[required]', contactForm);
      let isValid = true;

      requiredFields.forEach((field) => {
        if (!field.value.trim()) {
          isValid = false;
          field.classList.add('error');
          field.addEventListener('input', () => field.classList.remove('error'), { once: true });
        }
      });

      if (!isValid) return;

      // Show success message
      let successMsg = $('.form-success', contactForm.parentElement);
      if (!successMsg) {
        successMsg = document.createElement('div');
        successMsg.classList.add('form-success');
        successMsg.textContent = 'Message sent successfully!';
        Object.assign(successMsg.style, {
          padding: '1rem',
          marginTop: '1rem',
          borderRadius: '8px',
          background: 'rgba(99, 230, 190, 0.12)',
          color: '#63e6be',
          textAlign: 'center',
          opacity: '0',
          transition: 'opacity 0.4s ease',
        });
        contactForm.parentElement.appendChild(successMsg);
      }

      requestAnimationFrame(() => {
        successMsg.style.opacity = '1';
      });

      contactForm.reset();
      setTimeout(() => { successMsg.style.opacity = '0'; }, 4000);
    });
  }

  /* --------------------------------------------------------
   *  12. Card Tilt Effect
   * ------------------------------------------------------ */

  const tiltCards = $$('.service-card, .project-card');

  tiltCards.forEach((card) => {
    card.style.transition = 'transform 0.2s ease';

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateY = ((x - centerX) / centerX) * 6;   // ±6 deg
      const rotateX = ((centerY - y) / centerY) * 6;
      
      const isProjectCard = card.classList.contains('project-card');
      const translateY = isProjectCard ? -10 : -8;

      card.style.transform =
        `perspective(800px) translate3d(0, ${translateY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) translate3d(0, 0, 0) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    });
  });

  /* --------------------------------------------------------
   *  13. Active Nav Link Highlight
   * ------------------------------------------------------ */

  const sections = $$('section[id]');
  const navItems = $$('.nav-links a[href^="#"]');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navItems.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      });
    },
    { threshold: 0.3, rootMargin: '-20% 0px -60% 0px' }
  );

  sections.forEach((section) => sectionObserver.observe(section));

  /* --------------------------------------------------------
   *  14. Floating Orbs — Organic Drift Layer
   *  Adds subtle, random movement on top of any CSS animation.
   * ------------------------------------------------------ */

  const allOrbs = $$('.orb');

  const driftOrbs = () => {
    const time = Date.now() * 0.001; // seconds

    allOrbs.forEach((orb, i) => {
      const seed = i * 1.7;
      const dx = Math.sin(time * 0.4 + seed) * 8;
      const dy = Math.cos(time * 0.35 + seed) * 8;

      // Only apply drift when we are NOT inside the hero parallax path
      // (hero parallax sets transform directly, so skip those)
      if (!hero || !hero.contains(orb)) {
        orb.style.transform = `translate(${dx}px, ${dy}px)`;
      }
    });
    requestAnimationFrame(driftOrbs);
  };

  if (allOrbs.length) requestAnimationFrame(driftOrbs);

  /* --------------------------------------------------------
   *  15. Typed Text Effect (Hero Badge)
   * ------------------------------------------------------ */

  const heroBadge = $('.hero-badge, .hero .badge');

  if (heroBadge) {
    // Inject blinking cursor style
    if (!$('#cursor-keyframes')) {
      const style = document.createElement('style');
      style.id = 'cursor-keyframes';
      style.textContent = `
        @keyframes blink-cursor {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0; }
        }
        .typed-cursor {
          display: inline-block;
          width: 2px;
          height: 1em;
          background: currentColor;
          margin-left: 2px;
          vertical-align: text-bottom;
          animation: blink-cursor 0.8s step-end infinite;
        }`;
      document.head.appendChild(style);
    }

    const text = heroBadge.textContent;
    heroBadge.textContent = '';
    const cursor = document.createElement('span');
    cursor.classList.add('typed-cursor');
    heroBadge.appendChild(cursor);

    let charIndex = 0;
    const typeInterval = setInterval(() => {
      if (charIndex < text.length) {
        heroBadge.insertBefore(
          document.createTextNode(text[charIndex]),
          cursor
        );
        charIndex++;
      } else {
        clearInterval(typeInterval);
        // Remove cursor after a pause
        setTimeout(() => cursor.remove(), 2500);
      }
    }, 65);
  }

  /* --------------------------------------------------------
   *  Scroll event — debounced single handler
   * ------------------------------------------------------ */

  const onScroll = debounce(() => {
    updateScrollProgress();
    handleNavbarScroll();
  }, 10);

  window.addEventListener('scroll', onScroll, { passive: true });

  // Fire once on load so initial state is correct
  updateScrollProgress();
  handleNavbarScroll();

  /* --------------------------------------------------------
   *  16. Theme Toggle (Dark / Light)
   * ------------------------------------------------------ */

  const themeToggle = $('#themeToggle');

  /** Get the resolved theme: localStorage → system preference → 'dark' */
  const getPreferredTheme = () => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  };

  /** Apply theme to DOM and persist */
  const applyTheme = (theme, animate = true) => {
    const root = document.documentElement;

    if (animate) {
      root.classList.add('theme-transitioning');
      // Remove transition class after animation completes to avoid
      // interfering with other transitions (hover, scroll, etc.)
      setTimeout(() => root.classList.remove('theme-transitioning'), 400);
    }

    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  // Apply theme on load (without animation — FOUC script already set attribute)
  applyTheme(getPreferredTheme(), false);

  // Toggle handler
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next, true);
    });
  }

  // Listen for system preference changes (when no explicit user choice)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    // Only auto-switch if user hasn't made an explicit choice recently
    if (!localStorage.getItem('theme')) {
      applyTheme(e.matches ? 'dark' : 'light', true);
    }
  });

  // Pricing Card Selection (persistent selected state)
  const pricingCards = document.querySelectorAll('.pricing-card');
  pricingCards.forEach(card => {
    card.addEventListener('click', () => {
      pricingCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });
  });
});
