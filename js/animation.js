/* =========================================================
   RITEE - animation.js
   On-scroll reveal (IntersectionObserver), count-up numbers
   and a thin scroll-progress bar.
   - No HTML changes needed: classes are added from the config below.
   - Needs css/animation.css
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) return; // everything simply stays visible

  var root = document.documentElement;

  /* ---------------------------------------------------------
     CONFIG
     sel   : css selector
     t     : up | down | left (comes from left) | right (comes from right) | zoom | pop | line
     base  : start offset in ms (choreography inside one batch)
     step  : extra ms between siblings of the same selector (stagger)
     dur   : duration in ms
     count : selector of a number inside the element to count up
     --------------------------------------------------------- */
  var G = [
    /* HERO (plays on load) */
    { sel: '.hero-logo', t: 'down', base: 100 },
    { sel: '.hero-tag', t: 'up', base: 250 },
    { sel: '.hero h1', t: 'up', base: 380 },
    { sel: '.hero-content p', t: 'up', base: 510 },
    { sel: '.hero-content .btn-apply', t: 'up', base: 640 },
    { sel: '.hero-photo', t: 'right', base: 300, dur: 1000 },
    { sel: '.legacy-card', t: 'left', base: 800, count: 'strong' },
    { sel: '.float-pill', t: 'pop', base: 950, step: 160 },
    { sel: '.mentor-card', t: 'right', base: 1250 },

    /* WHY RITEE */
    { sel: '.why-head .section-pill', t: 'up' },
    { sel: '.why-head h2', t: 'up', base: 100 },
    { sel: '.why-head p', t: 'up', base: 200 },
    { sel: '.why-row', t: 'up', step: 90 },

    /* PROGRAMMES */
    { sel: '.prog-head .section-pill', t: 'up' },
    { sel: '.prog-head h2', t: 'up', base: 100 },
    { sel: '.prog-head p', t: 'up', base: 200 },
    { sel: '.prog-card', t: 'up', step: 150, dur: 900 },

    /* CAREERS */
    { sel: '.career-img', t: 'left', dur: 1000 },
    { sel: '.career-content .section-pill', t: 'up', base: 100 },
    { sel: '.career-content h2', t: 'up', base: 200 },
    { sel: '.career-content .career-line', t: 'line', base: 320 },
    { sel: '.career-intro', t: 'up', base: 400 },
    { sel: '.career-list li', t: 'up', base: 480, step: 90 },
    { sel: '.career-content .btn-apply', t: 'up', base: 760 },

    /* RECRUITERS */
    { sel: '.rec-head .section-pill', t: 'up' },
    { sel: '.rec-head h2', t: 'up', base: 100 },
    { sel: '.rec-head p', t: 'up', base: 200 },
    { sel: '.rec-card', t: 'zoom', step: 110 },

    /* WHAT MAKES RITEE STAND OUT */
    { sel: '.stand-section .section-pill', t: 'up' },
    { sel: '.stand-section h2', t: 'up', base: 100 },
    { sel: '.stand-section .career-line', t: 'line', base: 220 },
    { sel: '.stand-intro', t: 'up', base: 300 },
    { sel: '.stand-section .btn-apply', t: 'up', base: 420 },
    { sel: '.stand-timeline li', t: 'right', base: 150, step: 170, count: 'strong' },

    /* TESTIMONIALS */
    { sel: '.testi-head .section-pill', t: 'up' },
    { sel: '.testi-head h2', t: 'up', base: 100 },
    { sel: '.testi-head p', t: 'up', base: 200 },
    { sel: '.testi-card', t: 'up', step: 140, dur: 900 },

    /* ADMISSION PROCESS */
    { sel: '.adm-head .section-pill', t: 'up' },
    { sel: '.adm-head h2', t: 'up', base: 100 },
    { sel: '.adm-head p', t: 'up', base: 200 },
    { sel: '.adm-step', t: 'up', step: 140, dur: 900 },
    { sel: '.adm-cta .btn-apply', t: 'up' },

    /* FAQ */
    { sel: '.faq-intro .section-pill', t: 'up' },
    { sel: '.faq-intro h2', t: 'up', base: 100 },
    { sel: '.faq-intro .career-line', t: 'line', base: 220 },
    { sel: '.faq-intro p', t: 'up', base: 300 },
    { sel: '.faq-intro .btn-apply', t: 'up', base: 420 },
    { sel: '.faq-item', t: 'up', base: 100, step: 90 },

    /* CTA + FOOTER */
    { sel: '.cta-section .section-pill', t: 'up' },
    { sel: '.cta-section h2', t: 'up', base: 100 },
    { sel: '.cta-section p', t: 'up', base: 200 },
    { sel: '.cta-actions .btn-apply', t: 'up', base: 320 },
    { sel: '.cta-actions .btn-outline-pill', t: 'up', base: 420 },
    { sel: '.site-footer p', t: 'up', base: 100 }
  ];

  /* ---------------------------------------------------------
     Observer
     --------------------------------------------------------- */
  var io = new IntersectionObserver(onIntersect, {
    threshold: 0.1,
    rootMargin: '0px 0px 0px 0px'
  });

  function onIntersect(entries) {
    // reveal what is visible now, and what was already scrolled past (page reloaded mid-way)
    var vis = entries.filter(function (e) {
      return e.isIntersecting || e.boundingClientRect.top < 0;
    });
    if (!vis.length) return;

    // keep DOM order so the stagger always runs top-to-bottom / left-to-right
    vis.sort(function (a, b) {
      return a.target.compareDocumentPosition(b.target) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });

    var minBase = Math.min.apply(
      null,
      vis.map(function (e) {
        return +e.target.dataset.base;
      })
    );
    var counters = {};

    vis.forEach(function (e) {
      var el = e.target;
      var g = el.dataset.grp;
      counters[g] = counters[g] || 0;
      var delay = +el.dataset.base - minBase + counters[g] * +el.dataset.step;
      counters[g]++;

      if (e.isIntersecting) {
        el.style.setProperty('--delay', delay + 'ms');
      } else {
        el.classList.add('anim-instant'); // already above the viewport: no animation
      }
      el.classList.add('in-view');
      io.unobserve(el);

      if (el._count) countUp(el._count, e.isIntersecting ? delay + 450 : 0);
    });
  }

  /* ---------------------------------------------------------
     Count-up numbers (keeps "+" and other text around the number)
     --------------------------------------------------------- */
  function prepCount(el, inner) {
    var node = el.querySelector(inner);
    if (!node) return;
    var m = node.textContent.match(/\d+/);
    if (!m) return;
    node._to = parseInt(m[0], 10);
    node._tpl = node.textContent;
    node.textContent = node._tpl.replace(/\d+/, '0');
    el._count = node;
  }

  function countUp(node, wait) {
    var dur = 1500;
    setTimeout(function () {
      var start = null;
      function frame(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        node.textContent = node._tpl.replace(/\d+/, Math.round(node._to * eased));
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }, wait);
  }

  /* ---------------------------------------------------------
     Init
     --------------------------------------------------------- */
  root.classList.add('anim-ready');

  G.forEach(function (g, gi) {
    document.querySelectorAll(g.sel).forEach(function (el) {
      if (el.classList.contains('anim')) return; // never register twice
      el.classList.add('anim', 'anim-' + (g.t || 'up'));
      el.dataset.grp = gi;
      el.dataset.base = g.base || 0;
      el.dataset.step = g.step || 0;
      if (g.dur) el.style.setProperty('--dur', g.dur + 'ms');
      if (g.count) prepCount(el, g.count);
      io.observe(el);
    });
  });

  /* ---------------------------------------------------------
     Scroll progress bar
     --------------------------------------------------------- */
  var bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  var ticking = false;
  function updateBar() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? window.scrollY / h : 0;
    bar.style.transform = 'scaleX(' + Math.min(Math.max(p, 0), 1) + ')';
    ticking = false;
  }
  window.addEventListener(
    'scroll',
    function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateBar);
      }
    },
    { passive: true }
  );
  updateBar();
})();