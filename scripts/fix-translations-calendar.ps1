# Script de correction automatique des traductions pour PublicAvailabilityCalendar.tsx
# Date: 4 février 2026

$file = "src/components/calendar/PublicAvailabilityCalendar.tsx"

Write-Host "🔧 Correction des traductions dans $file..." -ForegroundColor Cyan

# Charger le contenu
$content = Get-Content $file -Raw -Encoding UTF8

# Remplacement des textes hardcodés
$replacements = @{
    "'Lieu SIB'" = "t('calendar.default_location')"
    "'Ouvrir'" = "t('actions.open')"
    "'Fermer'" = "t('actions.close')"
    "'Retirer'" = "t('actions.remove')"
    "'Aucun créneau'" = "t('calendar.no_slots')"
    "'Planifiez vos disponibilités pour ce jour'" = "t('calendar.plan_availability')"
    "'DÉTAILS'" = "t('calendar.details')"
    "'RÉSERVER'" = "t('calendar.book')"
    "'Aucune disponibilité définie'" = "t('calendar.no_availability')"
    "'Commencez à planifier vos rendez-vous pour les 3 jours de l''événement'" = "t('calendar.start_planning')"
    "'Créer mes disponibilités'" = "t('calendar.create_availability')"
    "'COMPLET'" = "t('calendar.full')"
    "'place restante'" = "t('calendar.no_spots_left')"
    "'places disponibles'" = "t('calendar.spots_available')"
    "'Aucune disponibilité pour le moment'" = "t('calendar.no_availability_yet')"
    "'Planifiez vos créneaux pour faciliter les prises de rendez-vous'" = "t('calendar.schedule_slots')"
    "'Voir mes créneaux passés'" = "t('calendar.view_past_slots')"
    "'Ajouter un nouveau créneau'" = "t('calendar.add_new_slot')"
    "'Grille'" = "t('calendar.grid_view')"
    "'Liste'" = "t('calendar.list_view')"
    "'Avril'" = "t('months.april')"
}

foreach ($key in $replacements.Keys) {
    $content = $content -replace [regex]::Escape($key), $replacements[$key]
}

# Sauvegarder
$content | Set-Content $file -Encoding UTF8 -NoNewline

Write-Host "✅ Corrections appliquées avec succès!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Résumé des remplacements:" -ForegroundColor Yellow
$replacements.Keys | ForEach-Object {
    Write-Host "   $_ → $($replacements[$_])" -ForegroundColor Gray
}
