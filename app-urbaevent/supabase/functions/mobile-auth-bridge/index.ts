/**
 * Page pont HTTPS pour liens magiques mobile.
 * Supabase redirige ici avec #access_token=… puis on ouvre urbaevent://auth-callback
 */
const HTML = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Connexion UrbaEvent</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 24px; color: #1B365D; }
    .card { max-width: 420px; margin: 48px auto; background: #fff; border-radius: 12px; padding: 32px; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,.08); }
    h1 { font-size: 22px; margin: 0 0 12px; }
    p { color: #555; line-height: 1.5; }
    a.btn { display: inline-block; margin-top: 16px; background: #1B365D; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; }
    .spinner { width: 36px; height: 36px; border: 3px solid #e8ecf0; border-top-color: #1B365D; border-radius: 50%; animation: spin .8s linear infinite; margin: 0 auto 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="card" id="content">
    <div class="spinner"></div>
    <h1>Ouverture de UrbaEvent…</h1>
    <p>Veuillez patienter pendant la redirection vers l'application.</p>
  </div>
  <script>
    (function () {
      var hash = window.location.hash || '';
      var params = new URLSearchParams(window.location.search);
      var code = params.get('code');
      var error = params.get('error_description') || params.get('error');
      var card = document.getElementById('content');
      if (error) {
        card.innerHTML = '<h1>Erreur</h1><p>' + error + '</p><p>Demandez un nouveau lien depuis l\\'application UrbaEvent.</p>';
        return;
      }
      var target = 'urbaevent://auth-callback';
      if (hash) target += hash;
      else if (code) target += '?code=' + encodeURIComponent(code);
      else {
        card.innerHTML = '<h1>Lien invalide</h1><p>Ce lien est expiré ou incomplet. Demandez un nouveau lien depuis l\\'application UrbaEvent.</p>';
        return;
      }
      function showManualLink() {
        card.innerHTML = '<h1>Ouvrir UrbaEvent</h1><p>Si l\\'application ne s\\'ouvre pas, appuyez ci-dessous.</p><a class="btn" href="' + target + '">Ouvrir UrbaEvent</a>';
      }
      window.location.replace(target);
      setTimeout(showManualLink, 2000);
    })();
  </script>
</body>
</html>`;

Deno.serve((_req) => {
  const headers = new Headers();
  headers.set('content-type', 'text/html; charset=utf-8');
  headers.set('cache-control', 'no-store, no-cache, must-revalidate');
  headers.set('content-disposition', 'inline');
  headers.set('x-content-type-options', 'nosniff');
  return new Response(HTML, { status: 200, headers });
});
