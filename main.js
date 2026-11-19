/* Bahia Turismo — interações (JS puro, sem dependências) */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var I18N = window.I18N;

  function t(key, fallback) {
    var value = I18N ? I18N.t(key) : "";
    return value || fallback;
  }

  /* ---------- header com fundo ao rolar ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- menu mobile ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var mobileNav = document.getElementById('menu-mobile');

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? t('a11y.menuClose', 'Fechar menu') : t('a11y.menuOpen', 'Abrir menu'));
    mobileNav.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    mobileNav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !mobileNav.hidden) {
        setMenu(false);
        toggle.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 860 && !mobileNav.hidden) setMenu(false);
    });

    document.addEventListener('languagechange', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-label', open ? t('a11y.menuClose', 'Fechar menu') : t('a11y.menuOpen', 'Abrir menu'));
    });
  }

  /* ---------- menu de passeios na navbar ---------- */
  var navDd = document.querySelector('[data-nav-dd]');
  if (navDd) {
    var navDdToggle = navDd.querySelector('.nav-dd-toggle');

    function setNavDd(open) {
      navDd.classList.toggle('is-open', open);
      navDdToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    var hoverSuppressed = false;

    navDdToggle.addEventListener('click', function () {
      var open = !navDd.classList.contains('is-open');
      hoverSuppressed = !open;
      setNavDd(open);
    });

    navDd.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('a')) setNavDd(false);
    });

    document.addEventListener('click', function (e) {
      if (!navDd.contains(e.target)) setNavDd(false);
    });

    var canHover = window.matchMedia('(hover: hover)').matches;
    navDd.addEventListener('mouseenter', function () {
      if (canHover && !hoverSuppressed) setNavDd(true);
    });
    navDd.addEventListener('mouseleave', function () {
      if (!canHover) return;
      hoverSuppressed = false;
      var active = document.activeElement;
      if (!active || active === navDdToggle || !navDd.contains(active)) setNavDd(false);
    });

    navDd.addEventListener('focusout', function (e) {
      if (e.relatedTarget && !navDd.contains(e.relatedTarget)) setNavDd(false);
    });

    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navDd.classList.contains('is-open')) {
        setNavDd(false);
        navDdToggle.focus();
      }
    });
  }

  /* ---------- reveal no scroll ---------- */
  var revealables = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ---------- filtro do catálogo ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('#tour-grid .tour'));
  var empty = document.querySelector('.filter-empty');
  var grid = document.getElementById('tour-grid');
  var label = document.createElement('p');
  var currentFilter = 'all';

  label.className = 'filter-count';
  label.setAttribute('aria-live', 'polite');
  if (grid) grid.parentNode.insertBefore(label, grid);

  function updateCount(visible) {
    var text = t(
      visible === 1 ? 'tours.count.one' : 'tours.count.other',
      visible === 1 ? '1 passeio' : visible + ' passeios'
    );
    label.textContent = text.replace('{n}', visible);
  }

  function applyFilter(filter) {
    currentFilter = filter;
    var visible = 0;
    cards.forEach(function (card) {
      var match = filter === 'all' || card.getAttribute('data-cat') === filter;
      card.classList.toggle('is-hidden', !match);
      if (match) visible++;
    });
    if (empty) empty.hidden = visible > 0;
    updateCount(visible);
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('is-active'); });
      chip.classList.add('is-active');
      applyFilter(chip.getAttribute('data-filter'));
    });
  });
  if (chips.length) applyFilter('all');

  document.addEventListener('languagechange', function () {
    if (chips.length) applyFilter(currentFilter);
  });

  /* ---------- slider do hero ---------- */
  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  if (slides.length > 1 && !reduceMotion) {
    var current = 0;
    var timer = null;

    function nextSlide() {
      slides[current].classList.remove('is-active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('is-active');
    }

    function startSlider() {
      if (timer) return;
      timer = window.setInterval(nextSlide, 6500);
    }

    function stopSlider() {
      if (!timer) return;
      window.clearInterval(timer);
      timer = null;
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopSlider();
      else startSlider();
    });
    startSlider();
  }

  /* ---------- ficha do passeio (dados do catálogo do cliente) ---------- */
  var tours = window.BT_TOURS || {};
  var tourModal = document.getElementById('tour-modal');

  if (tourModal && Object.keys(tours).length) {
    var tourTitle = document.getElementById('tour-modal-title');
    var tourMeta = document.getElementById('tour-modal-meta');
    var tourDesc = document.getElementById('tour-modal-desc');
    var tourIncluded = document.getElementById('tour-modal-included');
    var tourExcluded = document.getElementById('tour-modal-excluded');
    var tourBring = document.getElementById('tour-modal-bring');
    var tourPrice = document.getElementById('tour-modal-price');
    var tourCta = document.getElementById('tour-modal-cta');
    var tourNote = tourModal.querySelector('[data-detail-note]');
    var tourPanel = tourModal.querySelector('.tour-panel');
    var tourOpener = null;
    var tourKey = null;

    var LEVEL_KEYS = { 'Fácil': 'level.easy', 'Intermediário': 'level.medium', 'Difícil': 'level.hard' };

    function fillList(list, items) {
      if (!list) return;
      list.textContent = '';
      (items || []).forEach(function (item) {
        var li = document.createElement('li');
        li.textContent = item;
        list.appendChild(li);
      });
      var section = list.closest('section');
      if (section) section.hidden = !items || !items.length;
    }

    function renderTour() {
      var data = tours[tourKey];
      if (!data) return;

      tourTitle.textContent = t('tour.' + tourKey + '.title', tourKey);

      tourMeta.textContent = '';
      var metas = [
        t('detail.hours', '{n} horas').replace('{n}', data.hours),
        t(LEVEL_KEYS[data.level] || 'level.easy', data.level)
      ];
      if (data.min) metas.push(t('detail.min', 'mín. {n} pessoas').replace('{n}', data.min));
      metas.forEach(function (label) {
        var li = document.createElement('li');
        li.textContent = label;
        tourMeta.appendChild(li);
      });

      tourDesc.textContent = '';
      data.desc.forEach(function (paragraph) {
        var p = document.createElement('p');
        p.textContent = paragraph;
        tourDesc.appendChild(p);
      });

      fillList(tourIncluded, data.inclui);
      fillList(tourExcluded, data.naoInclui);
      fillList(tourBring, data.levar);

      tourPrice.textContent = 'R$ ' + data.price + ' ';
      var per = document.createElement('em');
      per.textContent = t('price.per', '/ pessoa');
      tourPrice.appendChild(per);

      if (tourCta) {
        tourCta.setAttribute('data-wa-name', 'tour.' + tourKey + '.title');
        tourCta.setAttribute('data-wa-price', data.price.split(',')[0]);
        if (I18N && I18N.buildWa) I18N.buildWa();
      }

      if (tourNote) tourNote.hidden = !I18N || I18N.current() === 'pt';
    }

    /* endereço próprio de cada ficha: #passeio-morro, #passeio-boipeba... */
    var HASH_PREFIX = '#passeio-';

    function tourFromHash() {
      var hash = window.location.hash || '';
      if (hash.indexOf(HASH_PREFIX) !== 0) return null;
      var key = hash.slice(HASH_PREFIX.length);
      return tours[key] ? key : null;
    }

    function setTourHash(key) {
      var hash = HASH_PREFIX + key;
      if (window.location.hash === hash) return;
      if (window.history.pushState) window.history.pushState({ tour: key }, '', hash);
      else window.location.hash = hash;
    }

    function clearTourHash() {
      if ((window.location.hash || '').indexOf(HASH_PREFIX) !== 0) return;
      if (window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      } else {
        window.location.hash = '';
      }
    }

    function openTour(key, trigger, fromHash) {
      if (!tours[key]) return;
      if (!fromHash) setTourHash(key);
      tourKey = key;
      tourOpener = trigger || null;
      renderTour();
      tourModal.hidden = false;
      document.body.style.overflow = 'hidden';
      var closeBtn = tourModal.querySelector('.tour-close');
      if (closeBtn) closeBtn.focus();
    }

    function closeTour(fromHash) {
      tourModal.hidden = true;
      document.body.style.overflow = '';
      if (tourOpener) tourOpener.focus();
      tourOpener = null;
      if (!fromHash) clearTourHash();
    }

    /* link direto, voltar/avançar do navegador e links da página */
    function syncTourFromHash() {
      var key = tourFromHash();
      if (key) {
        if (tourModal.hidden || tourKey !== key) openTour(key, null, true);
      } else if (!tourModal.hidden) {
        closeTour(true);
      }
    }

    window.addEventListener('hashchange', syncTourFromHash);
    window.addEventListener('popstate', syncTourFromHash);

    document.addEventListener('click', function (e) {
      var trigger = e.target.closest ? e.target.closest('[data-tour]') : null;
      if (trigger) {
        e.preventDefault();
        openTour(trigger.getAttribute('data-tour'), trigger);
        return;
      }
      if (e.target.closest && e.target.closest('[data-tour-close]') && !tourModal.hidden) closeTour();
    });

    tourPanel.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeTour();
      }
    });

    document.addEventListener('languagechange', function () {
      if (!tourModal.hidden && tourKey) renderTour();
    });

    syncTourFromHash();
  }

  /* ---------- ano no rodapé ---------- */
  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();
})();
