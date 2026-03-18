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


  // ─── Contact form validation with honeypot ───
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function(e) {
      // Honeypot check — if the hidden field is filled, it's a bot
      const honeypot = form.querySelector('[name="website"]');
      if (honeypot && honeypot.value) {
        e.preventDefault();
        return;
      }

      // Required field validation
      const required = form.querySelectorAll('[required]');
      let valid = true;
      required.forEach(field => {
        if (!field.value.trim()) {
          field.style.borderColor = '#c0392b';
          valid = false;
        } else {
          field.style.borderColor = '';
        }
      });

      if (!valid) {
        e.preventDefault();
        // Show inline error instead of alert
        const firstInvalid = form.querySelector('[required]:invalid, [style*="c0392b"]');
        if (firstInvalid) {
          firstInvalid.focus();
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
  }


  // ─── Dynamic copyright year ───
  const yearEl = document.querySelector('.footer-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }


  // ─── News Feed: auto-refresh with 24-hour localStorage cache ───
  const NEWS_CACHE_KEY = 'bat_news_cache';
  const NEWS_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in ms
  const NEWS_API_URL = ''; // Configure when aggregator app is ready

  const insightsGrid = document.getElementById('insightsGrid');

  function createSkeletonCard() {
    const card = document.createElement('div');
    card.className = 'insight-skeleton';
    card.innerHTML =
      '<div class="insight-skeleton-img"></div>' +
      '<div class="insight-skeleton-body">' +
        '<div class="insight-skeleton-line"></div>' +
        '<div class="insight-skeleton-line"></div>' +
        '<div class="insight-skeleton-line"></div>' +
        '<div class="insight-skeleton-line"></div>' +
        '<div class="insight-skeleton-line"></div>' +
      '</div>';
    return card;
  }

  function showSkeletons() {
    if (!insightsGrid) return;
    insightsGrid.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      insightsGrid.appendChild(createSkeletonCard());
    }
  }

  function renderInsights(articles) {
    if (!insightsGrid || !articles || !articles.length) return;
    insightsGrid.innerHTML = '';
    articles.slice(0, 3).forEach(function(article) {
      const card = document.createElement('article');
      card.className = 'insight-card reveal visible';
      card.innerHTML =
        '<img src="' + (article.image || 'assets/images/insights/article-01.jpg') + '" alt="" class="insight-card-img" loading="lazy">' +
        '<div class="insight-card-body">' +
          '<p class="insight-meta">' + (article.category || 'Aviation') + ' &nbsp;&middot;&nbsp; ' + (article.date || '') + '</p>' +
          '<h3 class="insight-title">' + (article.title || '') + '</h3>' +
          '<p class="insight-excerpt">' + (article.excerpt || '') + '</p>' +
          '<a href="' + (article.url || '#') + '" class="insight-read" target="_blank" rel="noopener">Read Article &nbsp;&rarr;</a>' +
        '</div>';
      insightsGrid.appendChild(card);
    });
  }

  function fetchAndCacheInsights() {
    showSkeletons();
    fetch(NEWS_API_URL)
      .then(function(res) {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(function(data) {
        var articles = data.articles || data;
        localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify({
          articles: articles,
          timestamp: Date.now()
        }));
        renderInsights(articles);
      })
      .catch(function() {
        // On error, try to fall back to stale cache
        var cached = localStorage.getItem(NEWS_CACHE_KEY);
        if (cached) {
          renderInsights(JSON.parse(cached).articles);
        } else {
          // Restore static HTML fallback — reload page section
          // (the static cards are gone, so just clear skeletons)
          if (insightsGrid) insightsGrid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--muted);font-size:.9rem;padding:3rem 0;">News feed unavailable. Please check back later.</p>';
        }
      });
  }

  function loadInsights() {
    if (!insightsGrid || !NEWS_API_URL) return; // No API configured — keep static cards
    var cached = localStorage.getItem(NEWS_CACHE_KEY);
    if (cached) {
      try {
        var data = JSON.parse(cached);
        if (Date.now() - data.timestamp < NEWS_CACHE_TTL) {
          renderInsights(data.articles);
          return;
        }
      } catch(e) {
        localStorage.removeItem(NEWS_CACHE_KEY);
      }
    }
    fetchAndCacheInsights();
  }

  loadInsights();


  // ─── Blog Feed: "Thoughts from Our Advisory" weekly post ───
  // Reads from assets/blog/latest.json (auto-uploaded by content pipeline)
  // Caches in localStorage for 1 hour to reduce re-fetches during session
  const BLOG_CACHE_KEY = 'bat_blog_cache';
  const BLOG_CACHE_TTL = 60 * 60 * 1000; // 1 hour
  const BLOG_JSON_URL = 'assets/blog/latest.json';

  function renderBlogPost(post) {
    var title = document.getElementById('blogTitle');
    var meta = document.getElementById('blogMeta');
    var excerpt = document.getElementById('blogExcerpt');
    var author = document.getElementById('blogAuthor');
    var authorRole = document.getElementById('blogAuthorRole');
    var img = document.getElementById('blogImg');
    var readLink = document.getElementById('blogReadLink');
    var linkedIn = document.getElementById('blogLinkedIn');
    var instagram = document.getElementById('blogInstagram');

    if (title) title.textContent = post.headline || '';
    if (meta) meta.innerHTML = (post.category || '') + ' &nbsp;&middot;&nbsp; ' + (post.date || '');
    if (excerpt) excerpt.textContent = post.excerpt || '';
    if (author) author.textContent = post.author || '';
    if (authorRole) authorRole.textContent = post.authorRole || '';
    if (img && post.image) img.src = post.image;
    if (readLink && post.articleUrl) readLink.href = post.articleUrl;
    if (linkedIn && post.linkedinUrl) linkedIn.href = post.linkedinUrl;
    if (instagram && post.instagramUrl) instagram.href = post.instagramUrl;
  }

  function loadBlogPost() {
    var blogEl = document.getElementById('blogFeatured');
    if (!blogEl) return;

    // Check cache
    var cached = localStorage.getItem(BLOG_CACHE_KEY);
    if (cached) {
      try {
        var data = JSON.parse(cached);
        if (Date.now() - data.timestamp < BLOG_CACHE_TTL) {
          renderBlogPost(data.post);
          return;
        }
      } catch(e) {
        localStorage.removeItem(BLOG_CACHE_KEY);
      }
    }

    // Fetch latest
    fetch(BLOG_JSON_URL)
      .then(function(res) {
        if (!res.ok) throw new Error('Blog fetch failed');
        return res.json();
      })
      .then(function(data) {
        if (data.posts && data.posts.length > 0) {
          var post = data.posts[0];
          localStorage.setItem(BLOG_CACHE_KEY, JSON.stringify({
            post: post,
            timestamp: Date.now()
          }));
          renderBlogPost(post);
        }
      })
      .catch(function() {
        // Keep static HTML content as fallback — no action needed
      });
  }

  loadBlogPost();


  // ─── Gallery: 15-day rotation, 25% swap ───
  // Displays 16 images from the manifest pool.
  // Every 15 days, 4 images (one group of 4) rotate out for fresh ones.
  // 16 slots are split into 4 groups of 4. Each group's "generation"
  // increments every 4 periods (60 days), staggered so only one group
  // changes per period — guaranteeing exactly 25% turnover each cycle.

  var GALLERY_DISPLAY = 16;
  var GALLERY_PERIOD_DAYS = 15;
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

    var daysSinceRef = Math.floor((Date.now() - GALLERY_REF_DATE) / (GALLERY_PERIOD_DAYS * 86400000));
    var period = Math.max(0, daysSinceRef);

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

// ── Blog feed loader ──
async function loadBlogFeed() {
  try {
    const response = await fetch('/api/blog/posts.json');
    if (!response.ok) return;
    const posts = await response.json();
    const grid = document.getElementById('insightsGrid');
    if (!posts.length || !grid) return;

    grid.innerHTML = posts.slice(0, 3).map((post, i) => `
      <article class="insight-card reveal ${i > 0 ? 'reveal-delay-' + i : ''}">
        <div class="insight-card-body">
          <p class="insight-meta">${post.category} &nbsp;·&nbsp; ${post.date}</p>
          <h3 class="insight-title">${post.title}</h3>
          <p class="insight-excerpt">${post.excerpt}</p>
          <a href="${post.url}" class="insight-read">Read Article &nbsp;→</a>
        </div>
      </article>
    `).join('');
  } catch (e) {
    // Silently fail — placeholder content remains
  }
}

window.addEventListener('load', loadBlogFeed);
