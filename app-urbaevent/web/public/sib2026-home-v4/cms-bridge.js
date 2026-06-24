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

  window.addEventListener('message', function (event) {
    if (event.origin !== window.location.origin) return;
    if (!event.data || event.data.type !== 'sib-home-v4-images') return;
    applyImages(event.data.images);
  });
})();
