/* ─────────────────────────────────────────
   Bridgeway Aero Tech — Main JavaScript
───────────────────────────────────────── */

(function() {
  'use strict';

  // ─── Nav scroll shadow ───
  const nav = document.getElementById('mainNav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });


  // ─── Mobile menu toggle ───
  const toggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('navMobile');

  toggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
  });

  // Close mobile menu on link click
  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });


  // ─── Scroll-reveal ───
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => revealObserver.observe(el));


  // ─── Active navigation highlighting ───
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { threshold: 0.3, rootMargin: '-72px 0px 0px 0px' });

  sections.forEach(section => sectionObserver.observe(section));


  // ─── Count-up animation for credential numbers ───
  function animateCountUp(el, target, suffix, duration) {
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (target - start) * eased);
      el.textContent = current + suffix;
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    requestAnimationFrame(update);
  }

  const credValues = document.querySelectorAll('[data-count-target]');
  if (credValues.length) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-count-target'), 10);
          const suffix = el.getAttribute('data-count-suffix') || '';
          animateCountUp(el, target, suffix, 1500);
          countObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    credValues.forEach(el => countObserver.observe(el));
  }


  // ─── Back-to-top button ───
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('visible', window.scrollY > window.innerHeight);
    }, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  // ─── Contact form: validation + submission ───
  // Set FORM_ENDPOINT to a form-handling URL (e.g. Formspree/Basin or a
  // self-hosted endpoint) to submit via fetch. While empty, the form falls
  // back to opening the visitor's email app with the message pre-filled,
  // and always confirms on-page so the lead path is never silent.
  const FORM_ENDPOINT = '';
  const CONTACT_EMAIL = 'info@bridgewayaerotech.com';

  const form = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  function setFieldError(field, message) {
    field.classList.add('input-invalid');
    field.setAttribute('aria-invalid', 'true');
    let err = field.parentElement.querySelector('.form-error');
    if (!err) {
      err = document.createElement('p');
      err.className = 'form-error';
      err.id = field.id + '-error';
      field.parentElement.appendChild(err);
    }
    err.textContent = message;
    field.setAttribute('aria-describedby', err.id);
  }

  function clearFieldError(field) {
    field.classList.remove('input-invalid');
    field.removeAttribute('aria-invalid');
    const err = field.parentElement.querySelector('.form-error');
    if (err) err.remove();
  }

  function showSuccess(title, text) {
    form.style.display = 'none';
    if (formSuccess) {
      formSuccess.querySelector('.form-success-title').textContent = title;
      formSuccess.querySelector('.form-success-text').textContent = text;
      formSuccess.classList.add('visible');
      formSuccess.setAttribute('tabindex', '-1');
      formSuccess.focus();
    }
  }

  if (form) {
    form.querySelectorAll('.form-input, .form-textarea').forEach(field => {
      field.addEventListener('input', () => clearFieldError(field));
    });

    form.addEventListener('submit', function(e) {
      e.preventDefault();

      // Honeypot check — if the hidden field is filled, it's a bot
      const honeypot = form.querySelector('[name="website"]');
      if (honeypot && honeypot.value) return;

      // Field validation with visible messages
      let firstInvalid = null;
      const labels = { fname: 'first name', lname: 'last name', email: 'email address', message: 'message' };
      form.querySelectorAll('[required]').forEach(field => {
        clearFieldError(field);
        const label = labels[field.id] || 'this field';
        if (!field.value.trim()) {
          setFieldError(field, 'Please enter your ' + label + '.');
          firstInvalid = firstInvalid || field;
        } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) {
          setFieldError(field, 'That email address doesn’t look complete — please check it.');
          firstInvalid = firstInvalid || field;
        }
      });
      if (firstInvalid) {
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      const data = new FormData(form);
      data.delete('website');

      if (FORM_ENDPOINT) {
        const submitBtn = form.querySelector('.form-submit');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
        fetch(FORM_ENDPOINT, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } })
          .then(res => {
            if (!res.ok) throw new Error('send failed');
            showSuccess('Message Sent', 'Thank you for reaching out. We typically respond within one business day.');
          })
          .catch(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
            setFieldError(form.querySelector('#message'),
              'We couldn’t send your message right now. Please email us directly at ' + CONTACT_EMAIL + '.');
          });
      } else {
        // No endpoint configured: open the visitor's email app pre-filled,
        // and confirm on-page with a direct-email fallback.
        const subject = 'Inquiry' + (data.get('inquiry_type') ? ' — ' + data.get('inquiry_type') : '') +
          ' from ' + data.get('first_name') + ' ' + data.get('last_name');
        const body = 'Name: ' + data.get('first_name') + ' ' + data.get('last_name') + '\n' +
          'Company: ' + (data.get('company') || '—') + '\n' +
          'Email: ' + data.get('email') + '\n' +
          'Inquiry type: ' + (data.get('inquiry_type') || 'General') + '\n\n' +
          data.get('message');
        window.location.href = 'mailto:' + CONTACT_EMAIL +
          '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
        showSuccess('Almost done — check your email app',
          'Your email app should now be open with your message ready to send. If it didn’t open, email us directly at ' + CONTACT_EMAIL + ' and we’ll respond within one business day.');
      }
    });
  }


  // ─── Dynamic copyright year ───
  const yearEl = document.querySelector('.footer-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }


  // ─── Insights: rendered from assets/blog/posts.json ───
  // The file is generated by the content pipeline on article approval.
  // Section and nav links stay hidden until at least one post exists.
  var INSIGHT_SECTIONS = { MRO: 'MRO & Maintenance', OPS_FINANCE: 'Operations & Finance', AI_TECH: 'AI & Technology' };

  function insightDateLabel(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return '';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function renderInsightCards(posts) {
    var section = document.getElementById('insights');
    var grid = document.getElementById('insightsGrid');
    if (!section || !grid || !posts.length) return;

    posts.slice(0, 3).forEach(function(post, i) {
      var card = document.createElement('article');
      card.className = 'insight-card reveal' + (i > 0 ? ' reveal-delay-' + i : '');

      var body = document.createElement('div');
      body.className = 'insight-card-body';

      var meta = document.createElement('p');
      meta.className = 'insight-meta';
      meta.textContent = (INSIGHT_SECTIONS[post.section] || 'Aviation') + '  ·  ' + insightDateLabel(post.published_at);

      var title = document.createElement('h3');
      title.className = 'insight-title';
      title.textContent = post.headline || '';

      var excerpt = document.createElement('p');
      excerpt.className = 'insight-excerpt';
      excerpt.textContent = post.summary || '';

      var link = document.createElement('a');
      link.className = 'insight-read';
      link.href = 'article.html?id=' + encodeURIComponent(post.id);
      link.textContent = 'Read Article  →';

      body.appendChild(meta);
      body.appendChild(title);
      body.appendChild(excerpt);
      body.appendChild(link);
      card.appendChild(body);
      grid.appendChild(card);
    });

    section.hidden = false;
    document.querySelectorAll('.nav-insights-link').forEach(function(li) { li.hidden = false; });
    grid.querySelectorAll('.reveal').forEach(function(el) { revealObserver.observe(el); });
  }

  fetch('assets/blog/posts.json')
    .then(function(res) { if (!res.ok) throw new Error('no posts'); return res.json(); })
    .then(function(data) { renderInsightCards(data.posts || []); })
    .catch(function() { /* no posts yet — section stays hidden */ });


  // ─── Gallery: hourly rotation, 25% swap ───
  // Displays 16 images from the manifest pool.
  // Every hour, 4 images (one group of 4) rotate out for fresh ones.
  // 16 slots are split into 4 groups of 4. Each group's "generation"
  // increments every 4 periods, staggered so only one group changes
  // per period — guaranteeing exactly 25% turnover each cycle.

  var GALLERY_DISPLAY = 16;
  var GALLERY_PERIOD_MS = 3600000; // 1 hour
  var GALLERY_MANIFEST_URL = 'assets/images/gallery/manifest.json';
  var GALLERY_IMG_BASE = 'assets/images/gallery/';
  var GALLERY_REF_DATE = new Date(2026, 2, 15).getTime(); // March 15, 2026

  function gallerySeededRandom(seed) {
    // Mulberry32 PRNG — deterministic from seed
    return function() {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function gallerySelectImages(pool, period) {
    if (pool.length <= GALLERY_DISPLAY) {
      // Pool is small — show everything, shuffled by period
      var rng = gallerySeededRandom(period * 9973);
      var arr = pool.slice();
      for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(rng() * (i + 1));
        var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
      }
      return arr;
    }

    // Pool > 16: deterministic rotation with 25% turnover
    var sorted = pool.slice().sort();
    var selected = [];
    var usedIndices = {};

    for (var group = 0; group < 4; group++) {
      // Each group's generation increments when it is that group's turn
      var gen = Math.floor((period + (4 - group)) / 4);
      for (var slot = 0; slot < 4; slot++) {
        // Deterministic pick using group, slot, generation as seed
        var rng2 = gallerySeededRandom(gen * 1000 + group * 100 + slot + 7);
        var idx;
        var attempts = 0;
        do {
          idx = Math.floor(rng2() * sorted.length);
          attempts++;
        } while (usedIndices[idx] && attempts < sorted.length * 3);
        usedIndices[idx] = true;
        selected.push(sorted[idx]);
      }
    }

    // Final shuffle so groups aren't visually clustered
    var rng3 = gallerySeededRandom(period * 3571);
    for (var k = selected.length - 1; k > 0; k--) {
      var m = Math.floor(rng3() * (k + 1));
      var t = selected[k]; selected[k] = selected[m]; selected[m] = t;
    }

    return selected;
  }

  function renderGallery(images) {
    var grid = document.getElementById('galleryGrid');
    if (!grid) return;
    grid.innerHTML = '';
    images.forEach(function(filename) {
      var item = document.createElement('div');
      item.className = 'gallery-item reveal';
      var img = document.createElement('img');
      img.src = GALLERY_IMG_BASE + filename;
      img.alt = filename.replace(/^\d+-/, '').replace(/\.jpg$/, '').replace(/-/g, ' ');
      img.loading = 'lazy';
      item.appendChild(img);
      item.addEventListener('click', function() { openLightbox(GALLERY_IMG_BASE + filename, img.alt); });
      grid.appendChild(item);
    });

    // Re-observe new elements for scroll-reveal
    grid.querySelectorAll('.reveal').forEach(function(el) { revealObserver.observe(el); });
  }

  // Lightbox
  function openLightbox(src, alt) {
    var lb = document.getElementById('galleryLightbox');
    if (!lb) {
      lb = document.createElement('div');
      lb.className = 'gallery-lightbox';
      lb.id = 'galleryLightbox';
      lb.innerHTML = '<button class="gallery-lightbox-close" aria-label="Close">&times;</button><img src="" alt="">';
      document.body.appendChild(lb);
      lb.addEventListener('click', function(e) {
        if (e.target === lb || e.target.classList.contains('gallery-lightbox-close')) {
          lb.classList.remove('active');
        }
      });
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') lb.classList.remove('active');
      });
    }
    lb.querySelector('img').src = src;
    lb.querySelector('img').alt = alt;
    lb.classList.add('active');
  }

  function loadGallery() {
    var grid = document.getElementById('galleryGrid');
    if (!grid) return;

    var period = Math.max(0, Math.floor((Date.now() - GALLERY_REF_DATE) / GALLERY_PERIOD_MS));

    fetch(GALLERY_MANIFEST_URL)
      .then(function(res) {
        if (!res.ok) throw new Error('Gallery manifest not found');
        return res.json();
      })
      .then(function(data) {
        var pool = data.images || data;
        if (!pool.length) return;
        var selection = gallerySelectImages(pool, period);
        renderGallery(selection);
      })
      .catch(function() {
        // Fallback: nothing to show
      });
  }

  loadGallery();

})();

// ── Cookie consent banner ──
(function() {
  const banner = document.getElementById('cookieBanner');
  const acceptBtn = document.getElementById('cookieAccept');
  if (!banner || !acceptBtn) return;

  if (!localStorage.getItem('bat_cookie_consent')) {
    banner.style.display = 'block';
  }

  acceptBtn.addEventListener('click', function() {
    localStorage.setItem('bat_cookie_consent', 'accepted');
    banner.style.display = 'none';
  });
})();

