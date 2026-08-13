/* ==========================================================================
   LessBox – Frontend Logik
   Vanilla JavaScript, zero dependencies.
   Enthält: Lucide-Init, Mobile-Menü, Ersparnis-Rechner, FAQ-Accordion,
   Formular-Validierung.
   ========================================================================== */

(function () {
  'use strict';

  /* ---------- Init Lucide icons ---------- */
  function renderIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }
  renderIcons();

  /* ---------- Mobile menu ---------- */
  var menuToggle = document.getElementById('menu-toggle');
  var mobileMenu = document.getElementById('mobile-menu');
  var iconOpen = document.getElementById('menu-icon-open');
  var iconClose = document.getElementById('menu-icon-close');

  if (menuToggle && mobileMenu) {
    var setMenu = function (open) {
      mobileMenu.classList.toggle('hidden', !open);
      if (iconOpen) iconOpen.classList.toggle('hidden', open);
      if (iconClose) iconClose.classList.toggle('hidden', !open);
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    };

    menuToggle.addEventListener('click', function () {
      setMenu(mobileMenu.classList.contains('hidden'));
    });

    // Close mobile menu when a link is clicked
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
        setMenu(false);
        menuToggle.focus();
      }
    });
  }

  /* ---------- Savings Calculator ---------- */
  var slider = document.getElementById('pizza-slider');
  var sliderValue = document.getElementById('slider-value');
  var resMaterial = document.getElementById('result-material');
  var resMoney = document.getElementById('result-money');
  var resCo2 = document.getElementById('result-co2');

  // Assumptions (per pizza box, LessBox vs. classic box)
  var GRAMS_SAVED_PER_PIZZA = 30;   // ~30 g cardboard saved per delivered pizza (approx. 40% of a box)
  var COST_SAVED_PER_PIZZA = 0.06;  // ~6 cent saved per pizza in packaging cost
  var CO2_PER_KG_CARDBOARD = 0.94;  // ~0.94 kg CO2 saved per kg cardboard not produced

  var nfInt = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
  var nfEuro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

  function updateCalculator() {
    var perMonth = parseInt(slider.value, 10) || 0;
    var perYear = perMonth * 12;

    var materialKg = (perYear * GRAMS_SAVED_PER_PIZZA) / 1000;
    var money = perYear * COST_SAVED_PER_PIZZA;
    var co2 = materialKg * CO2_PER_KG_CARDBOARD;

    sliderValue.textContent = nfInt.format(perMonth);
    resMaterial.textContent = nfInt.format(materialKg) + ' kg';
    resMoney.textContent = nfEuro.format(money);
    resCo2.textContent = nfInt.format(co2) + ' kg';
  }

  if (slider) {
    slider.addEventListener('input', updateCalculator);
    updateCalculator();
  }

  /* ---------- FAQ accordion ---------- */
  var triggers = document.querySelectorAll('.faq-trigger');
  triggers.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      var chevron = btn.querySelector('.faq-chevron');

      // Close others (single-open accordion)
      triggers.forEach(function (other) {
        if (other !== btn) {
          other.setAttribute('aria-expanded', 'false');
          var op = document.getElementById(other.getAttribute('aria-controls'));
          if (op) op.classList.remove('open');
          var oc = other.querySelector('.faq-chevron');
          if (oc) oc.classList.remove('rotate-180');
        }
      });

      btn.setAttribute('aria-expanded', String(!expanded));
      if (panel) panel.classList.toggle('open', !expanded);
      if (chevron) chevron.classList.toggle('rotate-180', !expanded);
    });
  });

  /* ---------- Form validation & submit ---------- */
  var form = document.getElementById('sample-form');

  if (form) {
    var success = document.getElementById('form-success');
    var successDetail = document.getElementById('success-detail');

    var showError = function (id, msg) {
      var el = document.getElementById('err-' + id);
      var input = document.getElementById('f-' + id);
      if (el) { el.textContent = msg; el.classList.remove('hidden'); }
      if (input) { input.classList.add('border-red-500', 'ring-2', 'ring-red-500/30'); input.setAttribute('aria-invalid', 'true'); }
    };
    var clearError = function (id) {
      var el = document.getElementById('err-' + id);
      var input = document.getElementById('f-' + id);
      if (el) { el.textContent = ''; el.classList.add('hidden'); }
      if (input) { input.classList.remove('border-red-500', 'ring-2', 'ring-red-500/30'); input.removeAttribute('aria-invalid'); }
    };

    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      var firstInvalid = null;

      var fields = [
        { id: 'name', test: function (v) { return v.trim().length >= 2; }, msg: 'Bitte geben Sie Ihren Namen ein.' },
        { id: 'company', test: function (v) { return v.trim().length >= 2; }, msg: 'Bitte geben Sie Ihren Betrieb an.' },
        { id: 'street', test: function (v) { return v.trim().length >= 3; }, msg: 'Bitte geben Sie Straße & Hausnummer an.' },
        { id: 'city', test: function (v) { return v.trim().length >= 3; }, msg: 'Bitte geben Sie PLZ & Ort an.' },
        { id: 'email', test: function (v) { return EMAIL_RE.test(v.trim()); }, msg: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.' },
        { id: 'phone', test: function (v) { return v.replace(/[^0-9]/g, '').length >= 6; }, msg: 'Bitte geben Sie eine gültige Telefonnummer ein.' }
      ];

      fields.forEach(function (f) {
        var input = document.getElementById('f-' + f.id);
        if (f.test(input.value)) {
          clearError(f.id);
        } else {
          showError(f.id, f.msg);
          ok = false;
          if (!firstInvalid) firstInvalid = input;
        }
      });

      // Sizes checkboxes
      var checkedSizes = Array.prototype.slice.call(form.querySelectorAll('.size-checkbox:checked')).map(function (c) { return c.value; });
      var sizeErr = document.getElementById('err-sizes');
      if (checkedSizes.length === 0) {
        if (sizeErr) { sizeErr.textContent = 'Bitte wählen Sie mindestens eine Größe aus.'; sizeErr.classList.remove('hidden'); }
        ok = false;
        if (!firstInvalid) firstInvalid = form.querySelector('.size-checkbox');
      } else if (sizeErr) {
        sizeErr.textContent = '';
        sizeErr.classList.add('hidden');
      }

      if (!ok) {
        if (firstInvalid && typeof firstInvalid.focus === 'function') firstInvalid.focus();
        return;
      }

      // Success
      var name = document.getElementById('f-name').value.trim().split(' ')[0];
      if (successDetail) {
        successDetail.textContent = 'Wir senden Ihr Gratis-Musterpaket (' + checkedSizes.join(', ') + ') in Kürze los'
          + (name ? ', ' + name + '.' : '.');
      }
      form.reset();
      if (success) {
        success.classList.remove('hidden');
        success.classList.add('flex');
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      renderIcons();
    });

    // Clear field errors on input
    ['name', 'company', 'street', 'city', 'email', 'phone'].forEach(function (id) {
      var input = document.getElementById('f-' + id);
      if (input) input.addEventListener('input', function () { clearError(id); });
    });
    form.querySelectorAll('.size-checkbox').forEach(function (c) {
      c.addEventListener('change', function () {
        var sizeErr = document.getElementById('err-sizes');
        if (sizeErr && form.querySelector('.size-checkbox:checked')) { sizeErr.textContent = ''; sizeErr.classList.add('hidden'); }
      });
    });
  }

  // Re-render icons after everything (in case CDN loaded late)
  window.addEventListener('load', renderIcons);
})();
