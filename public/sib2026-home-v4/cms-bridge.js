(function () {
  var CSS_VARS = {
    home_v4_hero: '--v4-hero',
    home_v4_history_strip: '--v4-history',
    home_v4_ecosystem_globe: '--v4-globe',
    home_v4_legacy_people: '--v4-legacy',
    home_v4_universes_strip: '--v4-universes',
    home_v4_talks_stage: '--v4-talks',
    home_v4_quicklink_plan: '--v4-ql-plan',
    home_v4_quicklink_exposer: '--v4-ql-exposer',
    home_v4_quicklink_visiter: '--v4-ql-visiter',
  };

  var currentLang = 'fr';
  var textOverrides = {};
  var statOverrides = null;

  function applyImages(images) {
    if (!images || typeof images !== 'object') return;
    var root = document.documentElement;
    Object.keys(CSS_VARS).forEach(function (key) {
      var url = images[key];
      var cssVar = CSS_VARS[key];
      if (cssVar && url) {
        root.style.setProperty(cssVar, 'url("' + String(url).replace(/"/g, '\\"') + '")');
      }
    });
  }

  function applyStatOverrides(stats) {
    if (!Array.isArray(stats) || stats.length === 0) return;
    statOverrides = stats;
    var articles = document.querySelectorAll('.stats article strong');
    for (var i = 0; i < Math.min(stats.length, articles.length); i++) {
      if (stats[i]) articles[i].textContent = stats[i];
    }
  }

  function applyTextOverrides(overrides) {
    if (!overrides || typeof overrides !== 'object') return;
    textOverrides = overrides;
    applyLanguage(currentLang);
  }

  function applyLanguage(lang) {
    var dict = window.HOME_V4_I18N;
    if (!dict) return;

    var code = dict[lang] ? lang : 'fr';
    var strings = Object.assign({}, dict[code] || dict.fr, textOverrides);
    currentLang = code;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var val = strings[key];
      if (val == null) return;
      if (el.hasAttribute('data-i18n-html')) {
        el.innerHTML = val;
      } else {
        el.textContent = val;
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (strings[key] != null) {
        el.placeholder = strings[key];
      }
    });

    document.documentElement.lang = code;
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';

    var langBtn = document.querySelector('.lang');
    if (langBtn) {
      langBtn.textContent = code.toUpperCase() + '⌄';
    }

    if (statOverrides) {
      applyStatOverrides(statOverrides);
    }
  }

  window.addEventListener('message', function (event) {
    if (event.origin !== window.location.origin) return;
    if (!event.data || !event.data.type) return;

    if (event.data.type === 'sib-home-v4-images') {
      applyImages(event.data.images);
      return;
    }

    if (event.data.type === 'sib-home-v4-lang') {
      applyLanguage(event.data.lang || 'fr');
      return;
    }

    if (event.data.type === 'sib-home-v4-text-overrides') {
      applyTextOverrides(event.data.texts);
      return;
    }

    if (event.data.type === 'sib-home-v4-stat-overrides') {
      applyStatOverrides(event.data.stats);
    }
  });

  window.sibHomeV4ApplyLanguage = applyLanguage;
})();
