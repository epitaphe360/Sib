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

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function partnerLogoCount(groups) {
    var total = 0;
    (groups || []).forEach(function (group) {
      (group.partners || []).forEach(function (partner) {
        if (partner.logoUrl) total += 1;
      });
    });
    return total;
  }

  function buildPartnerGroupHtml(group) {
    var partners = (group.partners || []).filter(function (p) {
      return p && String(p.name || '').trim();
    });
    if (!partners.length) return '';

    var cols = partners.length >= 2 ? 'two' : 'one';
    var isSponsor = String(group.label || '').toLowerCase().indexOf('sponsor') >= 0;
    var isDelegate = String(group.label || '').toLowerCase().indexOf('délégué') >= 0 || String(group.label || '').toLowerCase().indexOf('delegue') >= 0;
    var articleClass = 'partner-group';
    if (partners.length >= 2) articleClass += ' partner-group-wide';
    if (isSponsor) articleClass += ' partner-group-sponsor';
    if (isDelegate) articleClass += ' partner-group-delegate';

    var logos = partners
      .map(function (partner) {
        var name = escapeHtml(partner.name);
        var acronym = escapeHtml(partner.acronym || partner.name.slice(0, 3));
        if (partner.logoUrl) {
          return (
            '<figure><img src="' +
            escapeHtml(partner.logoUrl) +
            '" alt="' +
            name +
            '"></figure>'
          );
        }
        return (
          '<figure class="partner-text-tile"><span class="partner-acronym">' +
          acronym +
          '</span><small>' +
          name +
          '</small></figure>'
        );
      })
      .join('');

    return (
      '<article class="' +
      articleClass +
      '"><h3>' +
      escapeHtml(group.label || 'Partenaires') +
      '</h3><div class="partner-logos ' +
      cols +
      '">' +
      logos +
      '</div></article>'
    );
  }

  function applyPartners(payload) {
    if (!payload || typeof payload !== 'object') return;
    var grid = document.querySelector('.partners-grid');
    if (!grid) return;

    var displayMode = payload.displayMode === 'list' ? 'list' : 'banner';
    var bannerUrl = payload.bannerUrl ? String(payload.bannerUrl) : '';
    var groups = Array.isArray(payload.groups) ? payload.groups : [];
    var hasLogos = partnerLogoCount(groups) > 0;

    if (displayMode !== 'list' && bannerUrl && !hasLogos) {
      grid.innerHTML =
        '<article class="partner-group partner-group-wide partner-banner-only">' +
        '<img src="' +
        escapeHtml(bannerUrl) +
        '" alt="Partenaires et sponsors SIB 2026" class="partners-banner-img">' +
        '</article>';
      return;
    }

    var html = groups.map(buildPartnerGroupHtml).join('');
    if (html) {
      grid.innerHTML = html;
    }
  }

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
      return;
    }

    if (event.data.type === 'sib-home-v4-partners') {
      applyPartners(event.data.partners);
    }
  });

  window.sibHomeV4ApplyLanguage = applyLanguage;
})();
