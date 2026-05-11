with open('src/components/layout/Header.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Salon
c = c.replace(
    "  const salonMenuItems = [\n"
    "    { name: t('salon.presentation'), href: ROUTES.PRESENTATION, description: t('salon.presentation_desc') },\n"
    "    { name: t('salon.nouveautes'), href: ROUTES.NOUVEAUTES, description: t('salon.nouveautes_desc') },\n"
    "    { name: t('salon.secteurs'), href: ROUTES.SECTEURS, description: t('salon.secteurs_desc') },\n"
    "    { name: t('salon.editions'), href: ROUTES.EDITIONS, description: t('salon.editions_desc') },\n"
    "    { name: t('salon.telechargements'), href: ROUTES.TELECHARGEMENTS, description: t('salon.telechargements_desc') },\n"
    "  ];",
    "  const salonMenuItems = [\n"
    "    navIsVisible('salon.presentation') && { name: t('salon.presentation'), href: ROUTES.PRESENTATION, description: t('salon.presentation_desc') },\n"
    "    navIsVisible('salon.nouveautes')   && { name: t('salon.nouveautes'), href: ROUTES.NOUVEAUTES, description: t('salon.nouveautes_desc') },\n"
    "    navIsVisible('salon.secteurs')     && { name: t('salon.secteurs'), href: ROUTES.SECTEURS, description: t('salon.secteurs_desc') },\n"
    "    navIsVisible('salon.editions')     && { name: t('salon.editions'), href: ROUTES.EDITIONS, description: t('salon.editions_desc') },\n"
    "    navIsVisible('salon.telechargements') && { name: t('salon.telechargements'), href: ROUTES.TELECHARGEMENTS, description: t('salon.telechargements_desc') },\n"
    "  ].filter(Boolean) as { name: string; href: string; description: string }[];"
)

# Exposer
c = c.replace(
    "  const exposerMenuItems = [\n"
    "    { name: t('exposer.pourquoi'), href: ROUTES.POURQUOI_EXPOSER, description: t('exposer.pourquoi_desc') },\n"
    "    { name: t('exposer.espaces'), href: ROUTES.ESPACES_SIB, description: t('exposer.espaces_desc') },\n"
    "    { name: t('exposer.reserver'), href: ROUTES.REGISTER_EXHIBITOR, description: t('exposer.reserver_desc') },\n"
    "    { name: t('exposer.annuaire'), href: ROUTES.EXHIBITORS, description: t('exposer.annuaire_desc') },\n"
    "  ];",
    "  const exposerMenuItems = [\n"
    "    navIsVisible('exposer.pourquoi') && { name: t('exposer.pourquoi'), href: ROUTES.POURQUOI_EXPOSER, description: t('exposer.pourquoi_desc') },\n"
    "    navIsVisible('exposer.espaces')  && { name: t('exposer.espaces'), href: ROUTES.ESPACES_SIB, description: t('exposer.espaces_desc') },\n"
    "    navIsVisible('exposer.reserver') && { name: t('exposer.reserver'), href: ROUTES.REGISTER_EXHIBITOR, description: t('exposer.reserver_desc') },\n"
    "    navIsVisible('exposer.annuaire') && { name: t('exposer.annuaire'), href: ROUTES.EXHIBITORS, description: t('exposer.annuaire_desc') },\n"
    "  ].filter(Boolean) as { name: string; href: string; description: string }[];"
)

# Visiter
c = c.replace(
    "  const visiterMenuItems = [\n"
    "    { name: t('visiter.pourquoi'), href: ROUTES.POURQUOI_VISITER, description: t('visiter.pourquoi_desc') },\n"
    "    { name: t('visiter.infos'), href: ROUTES.INFOS_PRATIQUES, description: t('visiter.infos_desc') },\n"
    "    { name: t('visiter.badge'), href: ROUTES.REGISTER_VISITOR, description: t('visiter.badge_desc') },\n"
    "    { name: t('visiter.vip'), href: ROUTES.VISITOR_VIP_REGISTRATION, description: t('visiter.vip_desc') },\n"
    "  ];",
    "  const visiterMenuItems = [\n"
    "    navIsVisible('visiter.pourquoi') && { name: t('visiter.pourquoi'), href: ROUTES.POURQUOI_VISITER, description: t('visiter.pourquoi_desc') },\n"
    "    navIsVisible('visiter.infos')    && { name: t('visiter.infos'), href: ROUTES.INFOS_PRATIQUES, description: t('visiter.infos_desc') },\n"
    "    navIsVisible('visiter.badge')    && { name: t('visiter.badge'), href: ROUTES.REGISTER_VISITOR, description: t('visiter.badge_desc') },\n"
    "    navIsVisible('visiter.vip')      && { name: t('visiter.vip'), href: ROUTES.VISITOR_VIP_REGISTRATION, description: t('visiter.vip_desc') },\n"
    "  ].filter(Boolean) as { name: string; href: string; description: string }[];"
)

# Sponsors
c = c.replace(
    "  const sponsorsMenuItems = [\n"
    "    { name: t('sponsors.devenir'), href: ROUTES.PARTNER_SUBSCRIPTION, description: t('sponsors.devenir_desc') },\n"
    "    { name: t('sponsors.annuaire'), href: ROUTES.PARTNERS, description: t('sponsors.annuaire_desc') },\n"
    "  ];",
    "  const sponsorsMenuItems = [\n"
    "    navIsVisible('sponsors.devenir')  && { name: t('sponsors.devenir'), href: ROUTES.PARTNER_SUBSCRIPTION, description: t('sponsors.devenir_desc') },\n"
    "    navIsVisible('sponsors.annuaire') && { name: t('sponsors.annuaire'), href: ROUTES.PARTNERS, description: t('sponsors.annuaire_desc') },\n"
    "  ].filter(Boolean) as { name: string; href: string; description: string }[];"
)

# Programme dropdown (dans le JSX)
old_prog = (
    "                  <Link to={ROUTES.EVENTS} className=\"flex items-start px-4 py-3 hover:bg-slate-50 transition-colors\">\n"
    "                    <div>\n"
    "                      <div className=\"font-semibold text-slate-900\">{t('nav.programme')}</div>\n"
    "                      <div className=\"text-xs text-slate-500\">{t('nav.programme_desc')}</div>\n"
    "                    </div>\n"
    "                  </Link>\n"
    "                  <Link to={ROUTES.SPEAKERS} className=\"flex items-start px-4 py-3 hover:bg-slate-50 transition-colors\">\n"
    "                    <div>\n"
    "                      <div className=\"font-semibold text-slate-900\">{t('visiter.speakers')}</div>\n"
    "                      <div className=\"text-xs text-slate-500\">{t('visiter.speakers_desc')}</div>\n"
    "                    </div>\n"
    "                  </Link>"
)
new_prog = (
    "                  {navIsVisible('programme.programme') && (\n"
    "                  <Link to={ROUTES.EVENTS} className=\"flex items-start px-4 py-3 hover:bg-slate-50 transition-colors\">\n"
    "                    <div>\n"
    "                      <div className=\"font-semibold text-slate-900\">{t('nav.programme')}</div>\n"
    "                      <div className=\"text-xs text-slate-500\">{t('nav.programme_desc')}</div>\n"
    "                    </div>\n"
    "                  </Link>\n"
    "                  )}\n"
    "                  {navIsVisible('programme.intervenants') && (\n"
    "                  <Link to={ROUTES.SPEAKERS} className=\"flex items-start px-4 py-3 hover:bg-slate-50 transition-colors\">\n"
    "                    <div>\n"
    "                      <div className=\"font-semibold text-slate-900\">{t('visiter.speakers')}</div>\n"
    "                      <div className=\"text-xs text-slate-500\">{t('visiter.speakers_desc')}</div>\n"
    "                    </div>\n"
    "                  </Link>\n"
    "                  )}"
)
if old_prog in c:
    c = c.replace(old_prog, new_prog)
    print("Programme JSX: OK")
else:
    print("Programme JSX: NON TROUVE (verifier manuellement)")

# Medias: le filtrage se fait déjà via mediaVisible, ajouter navIsVisible par item
# Les mediaMenuItems sont construits via tableau conditionnel, on ajoute navIsVisible
old_media = (
    "  const mediaMenuItems = mediaVisible ? [\n"
    "    { name: t('media.webinars'), href: ROUTES.WEBINARS, description: t('media.webinars_desc'), icon: Video },\n"
    "    { name: t('media.podcasts'), href: ROUTES.PODCASTS, description: t('media.podcasts_desc'), icon: Mic },\n"
    "    { name: t('media.capsules'), href: ROUTES.CAPSULES_INSIDE, description: t('media.capsules_desc'), icon: Play },\n"
    "    { name: t('media.live_studio'), href: ROUTES.LIVE_STUDIO, description: t('media.live_studio_desc'), icon: Video },\n"
    "    { name: t('media.best_moments'), href: ROUTES.BEST_MOMENTS, description: t('media.best_moments_desc'), icon: Play },\n"
    "    { name: t('media.testimonials'), href: ROUTES.TESTIMONIALS, description: t('media.testimonials_desc'), icon: Video },\n"
    "    { name: t('media.library'), href: ROUTES.MEDIA_LIBRARY, description: t('media.library_desc'), icon: Play },\n"
    "  ] : [];"
)
new_media = (
    "  const mediaMenuItems = mediaVisible ? [\n"
    "    navIsVisible('medias.webinars')     && { name: t('media.webinars'), href: ROUTES.WEBINARS, description: t('media.webinars_desc'), icon: Video },\n"
    "    navIsVisible('medias.podcasts')     && { name: t('media.podcasts'), href: ROUTES.PODCASTS, description: t('media.podcasts_desc'), icon: Mic },\n"
    "    navIsVisible('medias.capsules')     && { name: t('media.capsules'), href: ROUTES.CAPSULES_INSIDE, description: t('media.capsules_desc'), icon: Play },\n"
    "    navIsVisible('medias.live_studio')  && { name: t('media.live_studio'), href: ROUTES.LIVE_STUDIO, description: t('media.live_studio_desc'), icon: Video },\n"
    "    navIsVisible('medias.best_moments') && { name: t('media.best_moments'), href: ROUTES.BEST_MOMENTS, description: t('media.best_moments_desc'), icon: Play },\n"
    "    navIsVisible('medias.testimonials') && { name: t('media.testimonials'), href: ROUTES.TESTIMONIALS, description: t('media.testimonials_desc'), icon: Video },\n"
    "    navIsVisible('medias.library')      && { name: t('media.library'), href: ROUTES.MEDIA_LIBRARY, description: t('media.library_desc'), icon: Play },\n"
    "  ].filter(Boolean) as { name: string; href: string; description: string; icon: React.FC<{ className?: string }> }[] : [];"
)
if old_media in c:
    c = c.replace(old_media, new_media)
    print("Media items: OK")
else:
    print("Media items: NON TROUVE")

with open('src/components/layout/Header.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

count = c.count('filter(Boolean)')
print(f"filter(Boolean) total: {count}")
salon_ok = "navIsVisible('salon.presentation')" in c
print(f"Salon filtrage: {salon_ok}")
